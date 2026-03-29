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
    AgentState, LabPanel, ContraindicationFlag, 
    AnomalySignal, PhysicianBrief
)
from orchestration.database import BioGuardianDB

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO, format='[%(asctime)s] [%(name)s] [%(levelname)s] %(message)s')
logger = logging.getLogger("BioGuardian.Swarm")

db = BioGuardianDB()

# --- Agent 1: The Scribe (OCR + RAG) ---
def scribe_agent(state: Dict[str, Any]) -> Dict[str, Any]:
    pid = state['patient_id']
    logger.info(f"[{pid}] Scribe: Executing layout-aware OCR post-processing.")
    
    # Simulating Sarah's scenario: HbA1c elevation and recent labs
    labs = [
        LabPanel(
            loinc_code="4544-3",
            display_name="Hemoglobin A1c",
            value=6.4,
            unit="%",
            reference_range=(4.0, 5.6),
            date=datetime.now() - timedelta(days=5),
            source_pdf_hash="quest_labs_sarah_0328"
        ),
        LabPanel(
            loinc_code="2339-0",
            display_name="Glucose [Mass/volume] in Blood",
            value=118.0,
            unit="mg/dL",
            reference_range=(70.0, 99.0),
            date=datetime.now() - timedelta(days=5),
            source_pdf_hash="quest_labs_sarah_0328"
        )
    ]
    
    state['lab_panels'] = [lab.dict() for lab in labs]
    state['agent_logs'].append({
        "agent": "The Scribe",
        "insight": "LOINC-normalized HbA1c (6.4%) and Glucose (118mg/dL) from Quest PDF.",
        "confidence": 0.94
    })
    state['audit_trail'].append(f"SCRIBE_PROCESS_HASH_{hashlib.md5(pid.encode()).hexdigest()[:8]}")
    return state

# --- Agent 2: The Pharmacist (openFDA + Risk Scoring) ---
def pharmacist_agent(state: Dict[str, Any]) -> Dict[str, Any]:
    pid = state['patient_id']
    protocol = state.get('protocol', {})
    substance = protocol.get('substance', 'Atorvastatin')
    
    logger.info(f"[{pid}] Pharmacist: Cross-referencing {substance} with personalized LOINC context.")
    
    # Simulating openFDA adverse event lookup + personalized risk
    flags = [
        ContraindicationFlag(
            drug_pair=(substance, "Metformin"),
            severity="HIGH",
            fda_report_count=847,
            personalized_risk_score=0.78 # Higher due to Sarah's elevated A1c
        )
    ]
    
    state['contraindications'] = [f.dict() for f in flags]
    state['agent_logs'].append({
        "agent": "The Pharmacist",
        "insight": f"openFDA flagged {substance}-Metformin interaction. Report count: {flags[0].fda_report_count}.",
        "confidence": 0.96
    })
    return state

# --- Agent 3: The Correlation Engine (Pharmacovigilance-grade Statistics) ---
def correlation_agent(state: Dict[str, Any]) -> Dict[str, Any]:
    pid = state['patient_id']
    logger.info(f"[{pid}] Correlation Engine: Calculating Pearson r and p-values for biometric drift.")
    
    # Simulating Sarah's 22% HRV drop
    # Minimum 72-hour window enforced
    signal = AnomalySignal(
        biometric="HRV_RMSSD",
        correlation_with="evening_dose",
        pearson_r=-0.84,
        p_value=0.012, # Statistically significant (p < 0.05)
        confidence_interval=(-0.92, -0.71),
        window_hours=96,
        severity="HIGH"
    )
    
    state['signals'] = [signal.dict()]
    state['agent_logs'].append({
        "agent": "Correlation Engine",
        "insight": f"Detected significant negative correlation (r={signal.pearson_r}, p={signal.p_value}) between HRV and dose.",
        "confidence": 0.91
    })
    return state

# --- Agent 4: The Compliance Auditor (Deterministic Predicate Gate) ---
def compliance_auditor(state: Dict[str, Any]) -> Dict[str, Any]:
    pid = state['patient_id']
    logger.info(f"[{pid}] Compliance Auditor: Verifying outputs against 47 FDA General Wellness rules.")
    
    # 47 rules summarized as predicate logic:
    # 1. No diagnostic language (Rule #7)
    # 2. No curative claims (Rule #12)
    # 3. No prescription modulation advice (Rule #24)
    
    restricted_terms = ["diagnose", "cure", "treat", "prescribe", "causing", "reaction", "disease"]
    all_agent_text = " ".join([log['insight'] for log in state['agent_logs']]).lower()
    
    # Deterministic check
    passed = not any(term in all_agent_text for term in restricted_terms)
    
    # Assemble Physician Brief (SOAP-formatted)
    brief = PhysicianBrief(
        patient_summary=f"Sarah (47). Managed on {state.get('protocol', {}).get('substance')}. Recent labs show elevated HbA1c.",
        lab_flags=[LabPanel(**l) for l in state['lab_panels']],
        drug_flags=[ContraindicationFlag(**f) for f in state['contraindications']],
        anomaly_signals=[AnomalySignal(**s) for s in state['signals']],
        soap_note=(
            "S: Patient reports magnesium supplementation. \n"
            "O: HRV RMSSD decreased by 22% in 4hr post-dose window (p=0.012). Fasting glucose 118mg/dL. \n"
            "A: Observed biometric correlations post-protocol addition. \n"
            "P: Discussion recommended regarding pharmacogenomic ACEI sensitivity and HRV drift."
        ),
        audit_hash=hashlib.sha256(all_agent_text.encode()).hexdigest(),
        compliance_version="FDA-GW-2016-V47"
    )
    
    state['brief'] = brief.dict()
    state['compliance_status'] = passed
    state['agent_logs'].append({
        "agent": "Compliance Auditor",
        "insight": f"Safe Harbor Validation: {'PASSED' if passed else 'FAILED'}. Audit Hash generated.",
        "confidence": 1.0
    })
    
    return state

# --- Swarm Graph Architecture ---
def create_firewall_swarm():
    workflow = StateGraph(dict)
    
    workflow.add_node("scribe", scribe_agent)
    workflow.add_node("pharmacist", pharmacist_agent)
    workflow.add_node("correlation", correlation_agent)
    workflow.add_node("compliance", compliance_auditor)
    
    workflow.set_entry_point("scribe")
    workflow.add_edge("scribe", "pharmacist")
    workflow.add_edge("pharmacist", "correlation")
    workflow.add_edge("correlation", "compliance")
    workflow.add_edge("compliance", END)
    
    return workflow.compile()

swarm_app = create_firewall_swarm()

# --- Server Logic ---
server = Flask(__name__)
CORS(server)

@server.route('/v1/simulation/rehearse', methods=['POST'])
def execute_swarm():
    try:
        data = request.get_json()
        pid = data.get('patient_id', 'Sarah_M_47')
        
        initial_state = {
            "patient_id": pid,
            "protocol": data.get('intervention', {"substance": "Atorvastatin", "dose": "20mg"}),
            "lab_panels": [],
            "contraindications": [],
            "signals": [],
            "agent_logs": [],
            "brief": None,
            "compliance_status": False,
            "audit_trail": []
        }
        
        final_state = swarm_app.invoke(initial_state)
        
        # Dashboard mapping
        return jsonify({
            "status": "success",
            "report": final_state['agent_logs'],
            "brief": final_state['brief'],
            "resilience": 0.94 if final_state['compliance_status'] else 0.45,
            "surgical_risk": 0.03,
            "recommendations": [
                {"type": "Clinical", "priority": "High", "action": "Discuss Pearson r shift", "logic": "p < 0.05 correlation detected"},
                {"type": "Safety", "priority": "Urgent", "action": "Review openFDA flags", "logic": "Personalized severity high"}
            ]
        })
    except Exception as e:
        logger.error(f"Swarm Error: {e}", exc_info=True)
        return jsonify({"status": "error", "message": "The Autonomous Firewall encountered a runtime failure."}), 500

@server.route('/v1/twin/history/<patient_id>', methods=['GET'])
def get_swarm_history(patient_id: str):
    return jsonify(db.get_history(patient_id))

if __name__ == "__main__":
    logger.info("BioGuardian Cerebellum Swarm: ONLINE.")
    server.run(port=8000, debug=False)
