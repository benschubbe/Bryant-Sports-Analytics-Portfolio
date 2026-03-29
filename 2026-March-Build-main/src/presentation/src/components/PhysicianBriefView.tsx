import React from 'react';
import { 
  FileText, 
  AlertCircle, 
  Activity, 
  Zap, 
  ShieldCheck, 
  Clock,
  User,
  Info
} from 'lucide-react';
import moment from 'moment';

interface AnomalySignal {
  metric: string;
  delta_pct: number;
  confidence: number;
  correlated_event: string;
  window_hours: number;
  severity: string;
}

interface PhysicianBriefData {
  brief_id: string;
  generated_at: string;
  patient_id: string;
  clinical_summary: string;
  signals: AnomalySignal[];
  lab_alerts: string[];
  contraindications: string[];
  recommendations: string[];
  compliance_gate_passed: boolean;
  version: string;
}

interface Props {
  brief: PhysicianBriefData;
}

const PhysicianBriefView: React.FC<Props> = ({ brief }) => {
  if (!brief) return null;

  return (
    <div className="PhysicianBrief-Container Card premium-border">
      <div className="Brief-Header">
        <div className="Header-Left">
          <FileText className="brief-icon" size={24} />
          <h2>Physician Discussion Brief <span className="version-tag">v{brief.version}</span></h2>
        </div>
        <div className={`Compliance-Badge ${brief.compliance_gate_passed ? 'passed' : 'failed'}`}>
          <ShieldCheck size={14} />
          {brief.compliance_gate_passed ? 'FDA General Wellness Validated' : 'Compliance Hold'}
        </div>
      </div>

      <div className="Brief-Meta-Grid">
        <div className="Meta-Item">
          <User size={14} />
          <span>Patient: {brief.patient_id}</span>
        </div>
        <div className="Meta-Item">
          <Clock size={14} />
          <span>Generated: {moment(brief.generated_at).format('MMM D, HH:mm')}</span>
        </div>
        <div className="Meta-Item">
          <Info size={14} />
          <span>Ref: {brief.brief_id}</span>
        </div>
      </div>

      <div className="Brief-Section">
        <label>Clinical Synthesis</label>
        <p className="clinical-text">{brief.clinical_summary}</p>
      </div>

      <div className="Brief-Two-Col">
        <div className="Col">
          <label><Activity size={14} /> Correlation Signals</label>
          <div className="Signal-List">
            {brief.signals.map((s, i) => (
              <div key={i} className={`Signal-Card ${s.severity}`}>
                <div className="Signal-Main">
                  <span className="metric">{s.metric}</span>
                  <span className="delta">{s.delta_pct > 0 ? '+' : ''}{s.delta_pct}%</span>
                </div>
                <div className="Signal-Context">
                  Correlated to {s.correlated_event} (Window: {s.window_hours}h)
                </div>
                <div className="Confidence-Bar">
                  <div className="fill" style={{ width: `${s.confidence * 100}%` }}></div>
                  <span className="label">Confidence: {(s.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="Col">
          <label><AlertCircle size={14} /> Critical Alerts</label>
          <div className="Alert-Group">
            {brief.lab_alerts.map((a, i) => (
              <div key={i} className="Alert-Item lab">
                <span className="bullet"></span> {a}
              </div>
            ))}
            {brief.contraindications.map((c, i) => (
              <div key={i} className="Alert-Item contra">
                <span className="bullet"></span> {c}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="Brief-Section recommendations">
        <label><Zap size={14} /> Discussion Recommendations</label>
        <ul>
          {brief.recommendations.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      <div className="Brief-Footer">
        <p>CONFIDENTIAL • For professional discussion purposes only. Not for self-diagnosis.</p>
      </div>
    </div>
  );
};

export default PhysicianBriefView;
