from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
import uuid

class LabPanel(BaseModel):
    id: str = Field(default_factory=lambda: f"LAB-{uuid.uuid4().hex[:8]}")
    loinc_code: str = Field(..., description="Standard LOINC code for the lab observation")
    display_name: str = Field(..., description="Human-readable name of the test")
    value: float
    unit: str
    reference_range: str
    date: datetime
    source_pdf_hash: str
    flag: Optional[str] = None # e.g., "H" for High, "L" for Low

class BiometricStream(BaseModel):
    metric_type: str = Field(..., description="e.g., HRV, BloodGlucose, HeartRate")
    value: float
    timestamp: datetime
    device_id: str
    source: str = "HealthKit"

class ProtocolEvent(BaseModel):
    substance: str = Field(..., description="The medication or intervention name")
    dose: str
    frequency: str
    start_date: datetime
    route: str = "Oral"
    status: str = "active"

class AnomalySignal(BaseModel):
    signal_id: str = Field(default_factory=lambda: f"SIG-{uuid.uuid4().hex[:6]}")
    metric: str
    delta_pct: float
    confidence: float = Field(..., ge=0, le=1)
    correlated_event: Optional[str]
    window_hours: int
    severity: str = "medium" # low, medium, high, critical

class PhysicianBrief(BaseModel):
    brief_id: str = Field(default_factory=lambda: f"SOAP-{uuid.uuid4().hex[:8]}")
    generated_at: datetime = Field(default_factory=datetime.now)
    patient_id: str
    clinical_summary: str
    signals: List[AnomalySignal]
    lab_alerts: List[str]
    contraindications: List[str]
    recommendations: List[str]
    compliance_gate_passed: bool
    version: str = "1.0.0"

class AgentState(BaseModel):
    """
    The state object passed between agents in the BioGuardian LangGraph swarm.
    """
    patient_id: str
    lab_panels: List[LabPanel] = []
    biometrics: List[BiometricStream] = []
    protocol: Optional[ProtocolEvent] = None
    signals: List[AnomalySignal] = []
    contraindications: List[str] = []
    agent_logs: List[Dict[str, Any]] = []
    brief: Optional[PhysicianBrief] = None
    compliance_status: bool = False
    metadata: Dict[str, Any] = {}
