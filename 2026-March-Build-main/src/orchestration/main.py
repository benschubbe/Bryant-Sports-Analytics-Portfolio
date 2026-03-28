import sys
import os
import json
import random
import logging
import hashlib
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

from langgraph.graph import StateGraph, END
from flask import Flask, request, jsonify
from flask_cors import CORS

# --- Module Path Configuration ---
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from orchestration.models import (
    AgentState, LabPanel, BiometricStream, ProtocolEvent, 
    AnomalySignal, PhysicianBrief
)
from orchestration.database import BioGuardianDB

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO, format='[%(asctime)s] [%(name)s] [%(levelname)s] %(message)s')
logger = logging.getLogger("BioGuardian.Orchestrator")

db = BioGuardianDB()

# --- Utility Logic for Agents ---

def simulate_loinc_normalization(raw_text: str) -> List[LabPanel]:
    """
    Simulates OCR + RAG logic for the Scribe Agent.
    In production, this would use a vision model (e.g. Llama-3-Vision) 
    and a vector store like LanceDB for LOINC mappings.
    """
    # Mock result for the hackathon demo
    return [
        LabPanel(
            loinc_code="4544-3",
            display_name="Hemoglobin A1c",
            value=6.2,
            unit="%",
            reference_range="4.0-5.6",
            date=datetime.now() - timedelta(days=14),
            source_pdf_hash=hashlib.sha256(raw_text.encode()).hexdigest(),
            flag="H"
        ),
        LabPanel(
            loinc_code="2339-0",
            display_name="Glucose [Mass/volume] in Blood",
            value=115.0,
            unit="mg/dL",
            reference_range="70-99",
            date=datetime.now() - timedelta(days=14),
            source_pdf_hash=hashlib.sha256(raw_text.encode()).hexdigest(),
            flag="H"
        )
    ]

# --- Agent 1: The Scribe ---
def scribe_agent(state: Dict[str, Any]) -> Dict[str, Any]:
    pid = state['patient_id']
    logger.info(f"[{pid}] Scribe: Executing PDF OCR and LOINC normalization.")
    
    # 1. Simulate OCR processing
    raw_lab_text = "Patient Report: HbA1c 6.2%, Glucose 115 mg/dL. Date: 2026-03-14"
    
    # 2. Map to structured objects
    labs = simulate_loinc_normalization(raw_lab_text)
    
    state['lab_panels'] = [lab.dict() for lab in labs]
    state['agent_logs'].append({
        "agent": "The Scribe",
        "insight": f"Successfully parsed {len(labs)} lab results. HbA1c ({labs[0].value}%) is elevated.",
        "confidence": 0.98
    })
    return state

# --- Agent 2: The Pharmacist ---
def pharmacist_agent(state: Dict[str, Any]) -> Dict[str, Any]:
    pid = state['patient_id']
    protocol = state.get('protocol')
    if not protocol:
        return state
    
    substance = protocol.get('substance', 'Unknown')
    logger.info(f"[{pid}] Pharmacist: Screening {substance} against genomic risk and drug-drug interactions.")
    
    # Simulate openFDA + local genomic database call
    contraindications = []
    
    # Scenario-based logic for demo
    if "lisinopril" in substance.lower():
        # Cross-reference with (mocked) genomic risk score from Scribe's data context
        contraindications.append("Pharmacogenomic Alert: ACEI-Related Angioedema risk profile (High).")
        contraindications.append("Correlation Alert: Elevated HbA1c may modulate renal clearance.")
        
    if "metformin" in substance.lower():
        contraindications.append("Dose Optimization: Patient baseline glucose (115mg/dL) suggests protocol alignment.")

    state['contraindications'] = contraindications
    state['agent_logs'].append({
        "agent": "The Pharmacist",
        "insight": f"Screened {substance}. Identified {len(contraindications)} relevant contraindications/alerts.",
        "confidence": 0.96
    })
    return state

# --- Agent 3: The Correlation Engine ---
def correlation_engine_agent(state: Dict[str, Any]) -> Dict[str, Any]:
    pid = state['patient_id']
    logger.info(f"[{pid}] Correlation Engine: Analyzing biometric streams for statistical anomalies.")
    
    # Simulate time-series anomaly detection on HealthKit data
    # Logic: Look for metric delta specifically in the window after protocol start
    
    signals = []
    
    # Example: HRV drop
    hrv_signal = AnomalySignal(
        metric="HRV",
        delta_pct=-22.5,
        confidence=0.91,
        correlated_event=f"Initial dose of {state.get('protocol', {}).get('substance', 'intervention')}",
        window_hours=4,
        severity="high"
    )
    signals.append(hrv_signal)
    
    # Example: Sleep volatility
    sleep_signal = AnomalySignal(
        metric="Deep Sleep Duration",
        delta_pct=-15.0,
        confidence=0.82,
        correlated_event="Night-time dose",
        window_hours=8,
        severity="medium"
    )
    signals.append(sleep_signal)

    state['signals'] = [s.dict() for s in signals]
    state['agent_logs'].append({
        "agent": "Correlation Engine",
        "insight": f"Significant {signals[0].metric} drop ({signals[0].delta_pct}%) detected with 91% confidence post-dose.",
        "confidence": 0.91
    })
    return state

# --- Agent 4: The Compliance Auditor ---
def compliance_auditor_agent(state: Dict[str, Any]) -> Dict[str, Any]:
    pid = state['patient_id']
    logger.info(f"[{pid}] Compliance Auditor: Performing deterministic safety gate validation.")
    
    # Rule-based gate: ensure no diagnostic or curative claims
    # This is a strict filter before clinical presentation
    restricted_phrases = ["diagnose", "cure", "treat", "prescribe", "disease", "healed"]
    
    # Check logs for violations
    violation = False
    for log in state['agent_logs']:
        if any(phrase in log['insight'].lower() for phrase in restricted_phrases):
            violation = True
            break
            
    # Assemble the final Physician Brief (SOAP-adjacent)
    lab_alerts = [f"Abnormal {l['display_name']}: {l['value']} {l['unit']}" for l in state['lab_panels'] if l.get('flag')]
    
    brief = PhysicianBrief(
        patient_id=pid,
        clinical_summary=f"BioGuardian detected a correlation between {state.get('protocol', {}).get('substance')} administration and biometric shifts. Baseline metrics show mild metabolic elevation.",
        signals=[AnomalySignal(**s) for s in state['signals']],
        lab_alerts=lab_alerts,
        contraindications=state['contraindications'],
        recommendations=[
            "Review HRV/Sleep correlation with patient during next consult.",
            "Assess genomic sensitivity to current ACEI protocol.",
            "Verify glucose stability trends via real-time stream."
        ],
        compliance_gate_passed=not violation
    )
    
    state['brief'] = brief.dict()
    state['compliance_status'] = not violation
    
    state['agent_logs'].append({
        "agent": "Compliance Auditor",
        "insight": f"Audit complete. Compliance Gate: {'PASSED' if not violation else 'FAILED'}. Brief version {brief.version} generated.",
        "confidence": 1.0
    })
    
    return state

# --- LangGraph Definition ---

def build_firewall_graph():
    workflow = StateGraph(dict) # State is passed as a dict for LangGraph simplicity
    
    workflow.add_node("scribe", scribe_agent)
    workflow.add_node("pharmacist", pharmacist_agent)
    workflow.add_node("correlation", correlation_engine_agent)
    workflow.add_node("compliance", compliance_auditor_agent)
    
    workflow.set_entry_point("scribe")
    workflow.add_edge("scribe", "pharmacist")
    workflow.add_edge("pharmacist", "correlation")
    workflow.add_edge("correlation", "compliance")
    workflow.add_edge("compliance", END)
    
    return workflow.compile()

app_firewall = build_firewall_graph()

# --- Server Layer ---

server = Flask(__name__)
CORS(server)

@server.route('/v1/simulation/rehearse', methods=['POST'])
def handle_rehearsal():
    """
    Main entry point for the 'Biological Dry Run'.
    """
    try:
        req_data = request.get_json()
        pid = req_data.get('patient_id', 'PT-2026-ALPHA')
        
        # Build Protocol from request
        intervention = req_data.get('intervention', {})
        protocol = ProtocolEvent(
            substance=intervention.get('drug', 'Lisinopril'),
            dose=str(intervention.get('dose', '10mg')),
            frequency="QD",
            start_date=datetime.now(),
            route="Oral"
        )
        
        initial_state = {
            "patient_id": pid,
            "lab_panels": [],
            "biometrics": [],
            "protocol": protocol.dict(),
            "signals": [],
            "contraindications": [],
            "agent_logs": [],
            "brief": None,
            "compliance_status": False
        }
        
        logger.info(f"Triggering Swarm for patient {pid} - protocol: {protocol.substance}")
        final_state = app_firewall.invoke(initial_state)
        
        # Persist the brief in history
        db.save_simulation(pid, f"Swarm Assessment: {protocol.substance}", final_state['agent_logs'])
        
        # Format response for the premium dashboard
        return jsonify({
            "status": "success",
            "report": final_state['agent_logs'],
            "brief": final_state['brief'],
            "resilience": 0.92 if final_state['compliance_status'] else 0.4,
            "surgical_risk": 0.04,
            "recommendations": [
                {"type": "Safety", "priority": "High", "action": r, "logic": "Swarm synthesis"} 
                for r in final_state['brief']['recommendations']
            ],
            "compliance_passed": final_state['compliance_status']
        })
        
    except Exception as e:
        logger.error(f"Internal Swarm Error: {e}", exc_info=True)
        return jsonify({"status": "error", "message": "The Swarm encountered an error."}), 500

@server.route('/v1/simulation/sync', methods=['POST'])
def handle_sync():
    return jsonify({"status": "synced"}), 200

@server.route('/v1/twin/history/<patient_id>', methods=['GET'])
def handle_history(patient_id: str):
    return jsonify(db.get_history(patient_id))

if __name__ == "__main__":
    logger.info("BioGuardian Cerebellum (Autonomous Swarm) Starting...")
    server.run(port=8000, debug=False)
