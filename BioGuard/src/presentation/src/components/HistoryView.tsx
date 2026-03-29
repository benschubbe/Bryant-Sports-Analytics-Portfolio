import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History as HistoryIcon, Activity, FlaskConical } from 'lucide-react';
import moment from 'moment';

interface TelemetryEntry {
  timestamp: string;
  marker_type: string;
  value: number;
  source?: string;
}

interface SimulationEntry {
  timestamp: string;
  scenario_name: string;
  report: any[];
}

interface HistoryViewProps {
  patientId: string;
  apiBaseUrl: string;
  demoMode: boolean;
}

const DEMO_TELEMETRY: TelemetryEntry[] = [
  { timestamp: new Date(Date.now() - 3600000).toISOString(), marker_type: "Hemoglobin A1c", value: 6.4, source: "Quest Labs PDF" },
  { timestamp: new Date(Date.now() - 3500000).toISOString(), marker_type: "Total Cholesterol", value: 224.0, source: "Quest Labs PDF" },
  { timestamp: new Date(Date.now() - 3400000).toISOString(), marker_type: "Creatine Kinase (CK)", value: 190.0, source: "Quest Labs PDF" },
  { timestamp: new Date(Date.now() - 3300000).toISOString(), marker_type: "Fasting Glucose", value: 96.0, source: "Quest Labs PDF" },
  { timestamp: new Date(Date.now() - 3200000).toISOString(), marker_type: "ALT (SGPT)", value: 32.0, source: "Quest Labs PDF" },
  { timestamp: new Date(Date.now() - 1800000).toISOString(), marker_type: "HRV_RMSSD", value: 33.4, source: "Mock HealthKit" },
  { timestamp: new Date(Date.now() - 1700000).toISOString(), marker_type: "SLEEP_ANALYSIS", value: 410.0, source: "Mock HealthKit" },
  { timestamp: new Date(Date.now() - 1600000).toISOString(), marker_type: "BLOOD_GLUCOSE", value: 92.3, source: "Mock HealthKit" },
];

const DEMO_SIMULATIONS: SimulationEntry[] = [
  {
    timestamp: new Date(Date.now() - 600000).toISOString(),
    scenario_name: "Atorvastatin",
    report: [
      { agent: "The Scribe", message: "5 panels normalised, 2 abnormal" },
      { agent: "The Pharmacist", message: "847 FAERS reports, HIGH severity" },
      { agent: "The Correlation Engine", message: "HRV r=-0.84, p=0.001" },
      { agent: "The Compliance Auditor", message: "PASSED — 47 rules, 0 violations" },
    ]
  }
];

const HistoryView: React.FC<HistoryViewProps> = ({ patientId, apiBaseUrl, demoMode }) => {
  const [telemetry, setTelemetry] = useState<TelemetryEntry[]>([]);
  const [simulations, setSimulations] = useState<SimulationEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(demoMode);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      if (demoMode) {
        setTelemetry(DEMO_TELEMETRY);
        setSimulations(DEMO_SIMULATIONS);
        setIsDemo(true);
        setIsLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${apiBaseUrl}/v1/twin/history/${patientId}`, { timeout: 5000 });
        setTelemetry(response.data.telemetry || []);
        setSimulations(response.data.simulations || []);
        setIsDemo(false);
      } catch {
        setTelemetry(DEMO_TELEMETRY);
        setSimulations(DEMO_SIMULATIONS);
        setIsDemo(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (patientId) fetchHistory();
  }, [patientId, apiBaseUrl, demoMode]);

  if (isLoading) return <div className="LoadingState">Loading history...</div>;

  return (
    <div className="HistoryView-Container">
      <h2 className="View-Title"><HistoryIcon size={24} /> Patient History {isDemo && <span style={{fontSize:'12px',color:'#8b949e'}}>(Demo Data)</span>}</h2>

      <div className="History-Timeline">
        {telemetry.length > 0 && (
          <div className="Timeline-Section">
            <h3>Telemetry ({telemetry.length} readings)</h3>
            {telemetry.map((entry, index) => (
              <div key={`t-${index}`} className="History-Entry telemetry-entry">
                <div className="Entry-Icon"><Activity size={18} /></div>
                <div className="Entry-Content">
                  <span className="Entry-Timestamp">{moment(entry.timestamp).format('MMM D, YYYY HH:mm:ss')}</span>
                  <p><strong>{entry.marker_type}:</strong> {entry.value.toFixed(2)} <span className="Entry-Source">({entry.source || 'N/A'})</span></p>
                </div>
              </div>
            ))}
          </div>
        )}

        {simulations.length > 0 && (
          <div className="Timeline-Section">
            <h3>Simulation Rehearsals ({simulations.length})</h3>
            {simulations.map((entry, index) => (
              <div key={`s-${index}`} className="History-Entry simulation-entry">
                <div className="Entry-Icon"><FlaskConical size={18} /></div>
                <div className="Entry-Content">
                  <span className="Entry-Timestamp">{moment(entry.timestamp).format('MMM D, YYYY HH:mm:ss')}</span>
                  <p><strong>Scenario:</strong> {entry.scenario_name}</p>
                  <div className="Simulation-Report-Summary">
                    {entry.report.map((item: any, i: number) => (
                      <p key={`r-${i}`} className="Report-Item">
                        <span className="Agent-Badge">{item.agent}</span>: {item.message}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {telemetry.length === 0 && simulations.length === 0 && (
          <div className="EmptyState">No historical data. Run a simulation to generate history.</div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
