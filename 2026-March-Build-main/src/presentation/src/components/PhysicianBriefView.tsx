import React from 'react';
import { 
  FileText, 
  Activity, 
  ShieldCheck, 
  AlertOctagon, 
  TrendingDown, 
  BarChart3,
  Search,
  Lock
} from 'lucide-react';
import moment from 'moment';

interface LabPanel {
  loinc_code: string;
  display_name: string;
  value: number;
  unit: string;
  reference_range: [number, number];
  flag?: string;
}

interface ContraindicationFlag {
  drug_pair: [string, string];
  severity: string;
  fda_report_count: number;
  personalized_risk_score: number;
}

interface AnomalySignal {
  biometric: string;
  correlation_with: string;
  pearson_r: number;
  p_value: number;
  confidence_interval: [number, number];
  window_hours: number;
}

interface PhysicianBriefData {
  brief_id: string;
  generated_at: string;
  patient_summary: string;
  lab_flags: LabPanel[];
  drug_flags: ContraindicationFlag[];
  anomaly_signals: AnomalySignal[];
  soap_note: string;
  audit_hash: string;
  compliance_version: string;
}

interface Props {
  brief: PhysicianBriefData;
}

const PhysicianBriefView: React.FC<Props> = ({ brief }) => {
  if (!brief) return null;

  return (
    <div className="PhysicianBrief-Container Card premium-border clinical-theme">
      {/* 1. Header & Compliance Proof */}
      <div className="Brief-Header">
        <div className="Header-Left">
          <div className="Service-Identity">
            <ShieldCheck size={20} className="accent-blue" />
            <span className="brand-label">BioGuardian | Autonomous Swarm Analysis</span>
          </div>
          <h2>Clinical Discussion Brief</h2>
        </div>
        <div className="Header-Right">
          <div className="Audit-Proof">
            <Lock size={12} />
            <code>Audit Hash: {brief.audit_hash.substring(0, 12)}...</code>
          </div>
          <div className="Compliance-Badge passed">
            {brief.compliance_version} Validated
          </div>
        </div>
      </div>

      <div className="Brief-Grid">
        {/* 2. Patient Summary & Lab Evidence */}
        <div className="Section Summary-Section">
          <label><Search size={14} /> Patient & Lab Evidence</label>
          <p className="summary-text">{brief.patient_summary}</p>
          <div className="Lab-Grid">
            {brief.lab_flags.map((lab, i) => (
              <div key={i} className="Lab-Mini-Card">
                <span className="lab-name">{lab.display_name}</span>
                <span className="lab-value highlight-warning">{lab.value}{lab.unit}</span>
                <span className="lab-ref">Ref: {lab.reference_range[0]}-{lab.reference_range[1]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Pharmacovigilance Signals (openFDA) */}
        <div className="Section Drug-Section">
          <label><AlertOctagon size={14} /> Personalized Contraindications</label>
          {brief.drug_flags.map((flag, i) => (
            <div key={i} className={`Drug-Alert-Card ${flag.severity.toLowerCase()}`}>
              <div className="Alert-Title">
                <strong>{flag.drug_pair[0]} ↔ {flag.drug_pair[1]}</strong>
                <span className="severity-tag">{flag.severity}</span>
              </div>
              <div className="Alert-Metrics">
                <span>FDA ICSR Reports: {flag.fda_report_count}</span>
                <span>Personalized Risk: {(flag.personalized_risk_score * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* 4. Statistical Correlation (Correlation Engine) */}
        <div className="Section Correlation-Section">
          <label><BarChart3 size={14} /> Statistical Anomaly Detection</label>
          {brief.anomaly_signals.map((sig, i) => (
            <div key={i} className="Correlation-Card">
              <div className="Corr-Header">
                <TrendingDown size={18} className="danger-text" />
                <strong>{sig.biometric} Correlation</strong>
              </div>
              <div className="Stats-Line">
                <div className="Stat">
                  <span className="label">Pearson r</span>
                  <span className="value">{sig.pearson_r.toFixed(2)}</span>
                </div>
                <div className="Stat">
                  <span className="label">p-value</span>
                  <span className="value highlight-danger">{sig.p_value}</span>
                </div>
                <div className="Stat">
                  <span className="label">Window</span>
                  <span className="value">{sig.window_hours}h</span>
                </div>
              </div>
              <div className="Context-Tag">Correlated to: {sig.correlation_with}</div>
            </div>
          ))}
        </div>

        {/* 5. SOAP Discussion Note */}
        <div className="Section SOAP-Section">
          <label><FileText size={14} /> SOAP Discussion Structure (EHR Compatible)</label>
          <pre className="soap-content">{brief.soap_note}</pre>
        </div>
      </div>

      <div className="Brief-Footer">
        <div className="Footer-Meta">
          <span>ID: {brief.brief_id}</span>
          <span>Generated: {moment(brief.generated_at).format('YYYY-MM-DD HH:mm:ss Z')}</span>
        </div>
        <p className="legal-disclaimer">
          PRIVATE & ON-DEVICE: This report was generated by Sarah's local BioGuardian swarm. No data was transmitted. 
          For professional clinical discussion only.
        </p>
      </div>
    </div>
  );
};

export default PhysicianBriefView;
