from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal, Tuple
from datetime import datetime
import uuid

class LabPanel(BaseModel):
    loinc_code: str
    display_name: str
    value: float
    unit: str
    reference_range: Tuple[float, float]
    date: datetime
    source_pdf_hash: str
    status: str = "final"

class ContraindicationFlag(BaseModel):
    drug_pair: Tuple[str, str]
    severity: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    fda_report_count: int
    personalized_risk_score: float  # cross-referenced against patient's LOINC markers

class AnomalySignal(BaseModel):
    biometric: str
    correlation_with: str  # protocol event (e.g., "evening_dose")
    pearson_r: float
    p_value: float          # suppressed if > 0.05
    confidence_interval: Tuple[float, float]
    window_hours: int       # minimum 72
    severity: str = "medium"

class PhysicianBrief(BaseModel):
    brief_id: str = Field(default_factory=lambda: f"BG-{uuid.uuid4().hex[:8].upper()}")
    generated_at: datetime = Field(default_factory=datetime.now)
    patient_summary: str
    lab_flags: List[LabPanel]
    drug_flags: List[ContraindicationFlag]
    anomaly_signals: List[AnomalySignal]
    soap_note: str
    audit_hash: str
    compliance_version: str = "FDA-GW-2016-V47"

class AgentState(BaseModel):
    """
    The state object passed between agents in the BioGuardian LangGraph swarm.
    Strictly follows the MCP tool schema.
    """
    patient_id: str
    raw_lab_input: Optional[str] = None
    lab_panels: List[LabPanel] = []
    protocol: Dict[str, Any] = {}
    contraindications: List[ContraindicationFlag] = []
    signals: List[AnomalySignal] = []
    agent_logs: List[Dict[str, Any]] = []
    brief: Optional[PhysicianBrief] = None
    compliance_status: bool = False
    audit_trail: List[str] = []
