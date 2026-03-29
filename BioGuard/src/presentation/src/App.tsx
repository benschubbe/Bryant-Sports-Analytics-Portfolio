import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, ContactShadows, Environment } from '@react-three/drei';
import {
  Activity,
  ShieldCheck,
  Zap,
  Settings as SettingsIcon,
  Lock,
  Cpu,
  History as HistoryIcon,
  Play,
  Shield
} from 'lucide-react';
import TwinModel from './components/TwinModel';
import MetabolicChart from './components/MetabolicChart';
import HistoryView from './components/HistoryView';
import ScenarioView from './components/ScenarioView';
import SettingsView from './components/SettingsView';
import PhysicianBriefView from './components/PhysicianBriefView';
import AuditTrailView from './components/AuditTrailView';
import CsvUpload, { BiometricReading } from './components/CsvUpload';
import './App.css';

// --- Environment Configuration ---
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:50052';

// --- Demo fallback data (used when backend is unreachable, e.g. Vercel) ---
const DEMO_BRIEF = {
  brief_id: "BG-DEMO0001",
  generated_at: new Date().toISOString(),
  patient_summary: "Patient PT-2026-DEMO. Biometric correlation detected following initiation of Atorvastatin 20mg.",
  lab_flags: [
    { loinc_code: "4544-3", display_name: "Hemoglobin A1c", value: 6.4, unit: "%", reference_range: { low: 4.0, high: 5.6 }, status: "final" },
    { loinc_code: "2093-3", display_name: "Total Cholesterol", value: 224.0, unit: "mg/dL", reference_range: { low: 125.0, high: 200.0 }, status: "final" },
    { loinc_code: "2157-6", display_name: "Creatine Kinase (CK)", value: 190.0, unit: "U/L", reference_range: { low: 22.0, high: 198.0 }, status: "final" },
    { loinc_code: "2339-0", display_name: "Fasting Glucose", value: 96.0, unit: "mg/dL", reference_range: { low: 70.0, high: 100.0 }, status: "final" },
    { loinc_code: "1742-6", display_name: "ALT (SGPT)", value: 32.0, unit: "U/L", reference_range: { low: 7.0, high: 56.0 }, status: "final" },
  ],
  drug_flags: [
    { drug_pair: { primary: "Atorvastatin", interactant: "Metformin" }, severity: "HIGH", fda_report_count: 847, personalized_risk_score: 0.71 },
    { drug_pair: { primary: "Atorvastatin", interactant: "Magnesium" }, severity: "MEDIUM", fda_report_count: 124, personalized_risk_score: 0.41 },
  ],
  anomaly_signals: [
    { biometric: "HRV_RMSSD", protocol_event: "evening_dose", pearson_r: -0.84, p_value: 0.001, confidence_interval: { lower: -0.92, upper: -0.71 }, window_hours: 96, severity: "HIGH" },
    { biometric: "SLEEP_ANALYSIS", protocol_event: "evening_dose", pearson_r: -0.88, p_value: 0.001, confidence_interval: { lower: -0.97, upper: -0.62 }, window_hours: 96, severity: "HIGH" },
    { biometric: "BLOOD_GLUCOSE", protocol_event: "evening_dose", pearson_r: 0.78, p_value: 0.001, confidence_interval: { lower: 0.37, upper: 0.94 }, window_hours: 96, severity: "MEDIUM" },
  ],
  soap_note: "S: Patient reports initiation of Atorvastatin 20mg alongside existing protocol.\nO: HRV_RMSSD correlation r=-0.84 (p=0.0010, 95% CI [-0.92, -0.71]) over 96h window. Baseline shifts: HRV 37.3->33.4ms (-10.5%, d=-1.48); Sleep 452->410min (-9.4%, d=-1.84); Glucose 87.8->92.3mg/dL (+5.2%, d=1.68). Post-dose window: HRV [0-4h] 32.1 vs 35.0ms (-8.3%, d=-0.86).\nA: Multi-stream pharmacovigilance analysis with Bonferroni correction (alpha=0.0056). Correlation flagged for physician review.\nP: Discuss findings with care team. Professional consultation strongly recommended.",
  audit_hash: "c961bb4884e3e185bd2b1abf90712eaa334c89355dbc4da3e2a9a0c6935cd103",
  compliance_version: "FDA-GW-2016-V47",
};

const DEMO_REPORT = [
  { agent: "The Scribe", message: "LOINC normalised 5 panels. Abnormal: 2 — HbA1c=6.4% (HIGH), Cholesterol=224.0mg/dL (HIGH)", confidence: 0.94, timestamp: new Date().toISOString() },
  { agent: "The Pharmacist", message: "openFDA FAERS: 847 reports for Atorvastatin x Metformin (HIGH). Personalised risk 71%. CK within range.", confidence: 0.96, timestamp: new Date().toISOString() },
  { agent: "The Correlation Engine", message: "Multi-stream analysis: 3 biometrics, 9 tests, Bonferroni alpha=0.0056. HRV baseline 37.3->33.4ms (-10.5%, d=-1.48). Post-dose window HRV -8.3% (d=-0.86).", confidence: 0.91, timestamp: new Date().toISOString() },
  { agent: "The Compliance Auditor", message: "Safe Harbor: PASSED. FDA-GW-2016-V47 — 47 rules, 0 violations. Audit chain sealed (4 entries, integrity=VERIFIED).", confidence: 1.0, timestamp: new Date().toISOString() },
];

const DEMO_RECOMMENDATIONS = [
  { type: "Clinical", priority: "HIGH", action: "Review HRV_RMSSD correlation with evening_dose (96h window).", evidence: "r=-0.84, p=0.001, CI [-0.92, -0.71]. Baseline shift: -10.5% (Cohen's d=-1.48)" },
  { type: "Clinical", priority: "HIGH", action: "Review SLEEP_ANALYSIS degradation post-dose.", evidence: "r=-0.88, p=0.001. Baseline: 452->410min (-9.4%, d=-1.84)" },
  { type: "Pharmacological", priority: "HIGH", action: "Atorvastatin x Metformin (847 FAERS reports).", evidence: "Personalised risk: 71%" },
  { type: "Compliance", priority: "LOW", action: "Safe Harbor validated — FDA-GW-2016-V47 (47 rules passed).", evidence: "Audit chain: c961bb48..." },
];

const DEMO_AUDIT = [
  "a1b2c3d4e5f6789012345678901234567890123456789012345678901234abcd",
  "b2c3d4e5f6789012345678901234567890123456789012345678901234abcde",
  "c3d4e5f6789012345678901234567890123456789012345678901234abcdef",
  "d4e5f6789012345678901234567890123456789012345678901234abcdef01",
];

interface Recommendation { type: string; priority: string; action: string; evidence: string; }

type AppView = 'dashboard' | 'history' | 'scenarios' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [patientName, setPatientName] = useState('Patient Alpha');
  const [patientId, setPatientId] = useState('PT-2026-ALPHA');
  const [bioState, setBioState] = useState({ glucose: 100, source: 'Ready' });
  const [chartData, setChartData] = useState<{time: string, value: number}[]>([]);
  const [resilience, setResilience] = useState(94.2);
  const [simResults, setSimResults] = useState<any[]>([]);
  const [brief, setBrief] = useState<any>(null);
  const [auditTrail, setAuditTrail] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    { type: 'Status', priority: 'Low', action: 'Firewall Active', evidence: 'Topology-based privacy: ON | Zero PHI transmitted' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState('Atorvastatin');
  const [dosage, setDosage] = useState(20);
  const [demoMode, setDemoMode] = useState(false);
  const [uploadedData, setUploadedData] = useState<BiometricReading[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const handleCsvLoaded = (readings: BiometricReading[]) => {
    setUploadedData(readings);
    // Feed readings into the chart
    const glucoseReadings = readings.filter(r => r.type === 'BLOOD_GLUCOSE');
    const hrvReadings = readings.filter(r => r.type === 'HRV_RMSSD');
    const chartSource = glucoseReadings.length > 0 ? glucoseReadings : hrvReadings;
    if (chartSource.length > 0) {
      setChartData(chartSource.slice(-20).map(r => ({
        time: new Date(r.timestamp).toLocaleTimeString(),
        value: r.value,
      })));
      setBioState(prev => ({
        ...prev,
        glucose: chartSource[chartSource.length - 1].value,
        source: `CSV Import (${readings.length} readings)`,
      }));
    }
  };

  useEffect(() => {
    try {
      socketRef.current = io(WS_URL, { timeout: 3000, reconnectionAttempts: 2 });
      socketRef.current.on('telemetry:update', (data: any) => {
        setBioState(prev => ({ ...prev, glucose: data.value, source: 'Telemetry Active' }));
        setChartData(prev => [...prev, { time: new Date().toLocaleTimeString(), value: data.value }].slice(-20));
      });
      socketRef.current.on('connect_error', () => { setDemoMode(true); });
    } catch { setDemoMode(true); }
    return () => { socketRef.current?.disconnect(); };
  }, []);

  const triggerRehearsal = async () => {
    setIsLoading(true);
    setSimResults([]);
    setBrief(null);
    setAuditTrail([]);
    try {
      const response = await axios.post(`${API_BASE_URL}/v1/simulation/rehearse`, {
        patient_id: patientId,
        intervention: { substance: selectedDrug, dose: `${dosage}mg` },
      }, { timeout: 10000 });

      setSimResults(response.data.report);
      setBrief(response.data.brief);
      setAuditTrail(response.data.audit_trail);
      setResilience(Number((response.data.resilience * 100).toFixed(1)));
      setRecommendations(response.data.recommendations);
      setBioState(prev => ({ ...prev, source: 'ADE Signal Detected' }));
      setDemoMode(false);
    } catch (err) {
      // Backend unreachable — use demo data so the UI always works
      console.warn("Backend unreachable, using demo data:", err);
      setDemoMode(true);
      setSimResults(DEMO_REPORT);
      setBrief(DEMO_BRIEF);
      setAuditTrail(DEMO_AUDIT);
      setResilience(89.0);
      setRecommendations(DEMO_RECOMMENDATIONS);
      setBioState(prev => ({ ...prev, source: 'Demo Mode — ADE Signal Detected' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App premium-theme">
      <nav className="Sidebar">
        <div className="Logo">
          <ShieldCheck size={32} color="#58a6ff" />
          <span>BioGuardian</span>
        </div>
        <div className="Nav-Items">
          <div className={`Nav-Item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}><Activity size={20} /> Dashboard</div>
          <div className={`Nav-Item ${currentView === 'history' ? 'active' : ''}`} onClick={() => setCurrentView('history')}><HistoryIcon size={20} /> History</div>
          <div className={`Nav-Item ${currentView === 'scenarios' ? 'active' : ''}`} onClick={() => setCurrentView('scenarios')}><Zap size={20} /> Protocols</div>
          <div className={`Nav-Item ${currentView === 'settings' ? 'active' : ''}`} onClick={() => setCurrentView('settings')}><SettingsIcon size={20} /> System</div>
        </div>
        <div className="Privacy-Indicator">
          <Lock size={14} />
          <span>{demoMode ? 'DEMO MODE' : 'LOCAL_ONLY'}</span>
        </div>
      </nav>

      <main className="Main-Content">
        <header className="Top-Bar">
          <div className="Header-Left">
            <h1>Autonomous Biological Firewall</h1>
            <span className="Patient-Badge">{patientName} ({patientId}) | {bioState.source}{demoMode ? ' [Demo]' : ''}</span>
          </div>
          <div className="Header-Right">
            {currentView === 'dashboard' && (
              <button className={`Rehearse-Btn ${isLoading ? 'loading' : ''}`} onClick={triggerRehearsal} disabled={isLoading}>
                {isLoading ? 'The Swarm is Reasoning...' : <><Play size={16} fill="currentColor"/> Execute Swarm</>}
              </button>
            )}
          </div>
        </header>

        {currentView === 'dashboard' && (
          <section className="Dashboard-Grid">
            <div className="Card Visualizer-Card">
              <div className="Card-Header">
                <div className="Title-Group">
                  <Cpu size={18} />
                  <h3>Neural Soma Visualizer</h3>
                </div>
                <span className="Live-Tag">{demoMode ? 'DEMO' : 'SYNCED'}</span>
              </div>
              <div className="Visualizer-Container">
                <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
                  <TwinModel glucose={bioState.glucose} resilience={resilience} />
                  <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                  <OrbitControls enableZoom={false} />
                  <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
                  <Environment preset="night" />
                </Canvas>
              </div>
            </div>

            <div className="Stats-Column">
              <div className="Card Stat-Card highlight-blue">
                <div className="Stat-Icon"><Activity size={24} /></div>
                <div className="Stat-Info">
                  <label>Current Glucose</label>
                  <div className="Value-Group">
                    <span className="Value">{bioState.glucose.toFixed(1)}</span>
                    <span className="Unit">mg/dL</span>
                  </div>
                </div>
              </div>

              <div className="Card Stat-Card highlight-green">
                <div className="Stat-Icon"><ShieldCheck size={24} /></div>
                <div className="Stat-Info">
                  <label>Biological Integrity</label>
                  <div className="Value-Group">
                    <span className="Value">{resilience}%</span>
                  </div>
                </div>
              </div>

              <div className="Card Controls-Card">
                <div className="Card-Header">
                  <h3>Protocol Event Input</h3>
                </div>
                <div className="Control-Groups">
                  <div className="Group">
                    <label>Patient ID</label>
                    <input type="text" value={patientId} onChange={(e) => { setPatientId(e.target.value); setPatientName(e.target.value); }} />
                  </div>
                  <div className="Group">
                    <label>Substance</label>
                    <select value={selectedDrug} onChange={(e) => setSelectedDrug(e.target.value)}>
                      <option value="Atorvastatin">Atorvastatin (Statin)</option>
                      <option value="Simvastatin">Simvastatin (Statin)</option>
                      <option value="Rosuvastatin">Rosuvastatin (Statin)</option>
                      <option value="Metformin">Metformin (Biguanide)</option>
                      <option value="Lisinopril">Lisinopril (ACE Inhibitor)</option>
                      <option value="Magnesium">Magnesium (Supplement)</option>
                    </select>
                  </div>
                  <div className="Group">
                    <label>Dose (mg)</label>
                    <input type="number" value={dosage} onChange={(e) => setDosage(Number(e.target.value))} />
                  </div>
                </div>
              </div>
            </div>

            <div className="Card Chart-Card">
              <div className="Card-Header">
                <h3>Biometric Drift (Pearson r Analysis)</h3>
              </div>
              <MetabolicChart data={chartData} />
            </div>

            <CsvUpload onDataLoaded={handleCsvLoaded} />

            <div className="Card Recommendations-Card">
              <div className="Card-Header">
                <h3>Firewall Status</h3>
              </div>
              <div className="Rec-List">
                {recommendations.map((rec, i) => (
                  <div key={i} className={`Rec-Item ${rec.type.toLowerCase()}`}>
                    <div className="Rec-Meta">{rec.type} | {rec.priority.toUpperCase()}</div>
                    <div className="Rec-Body">{rec.action}</div>
                    <div className="Rec-Footer">{rec.evidence}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="Card Console-Card">
              <div className="Card-Header">
                <h3>Agent Swarm Reasoning Trace</h3>
              </div>
              <div className="Console-Output">
                {simResults.length > 0 ? simResults.map((result: any, i: number) => (
                  <div key={i} className="Console-Log">
                    <span className="Agent-Name">[{result.agent}]</span>
                    <span className="Agent-Message">{result.message}</span>
                    {result.confidence && <span className="Agent-Confidence"> ({(result.confidence * 100).toFixed(0)}%)</span>}
                  </div>
                )) : (
                  <div className="Empty-State">Standby. Press "Execute Swarm" to run the pipeline.</div>
                )}
              </div>
            </div>

            {brief && (
              <div style={{ gridColumn: 'span 2' }}>
                <PhysicianBriefView brief={brief} />
              </div>
            )}

            {auditTrail.length > 0 && (
              <div style={{ gridColumn: 'span 1' }}>
                <AuditTrailView hashes={auditTrail} />
              </div>
            )}
          </section>
        )}

        {currentView === 'history' && <HistoryView patientId={patientId} apiBaseUrl={API_BASE_URL} demoMode={demoMode} />}
        {currentView === 'scenarios' && <ScenarioView />}
        {currentView === 'settings' && <SettingsView apiBaseUrl={API_BASE_URL} wsUrl={WS_URL} demoMode={demoMode} />}
      </main>
    </div>
  );
}

export default App;
