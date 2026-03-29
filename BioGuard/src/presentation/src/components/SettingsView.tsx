import React from 'react';
import { Settings as SettingsIcon, Database, Globe, Shield, Cpu, CheckCircle2, XCircle } from 'lucide-react';

interface SettingsViewProps {
  apiBaseUrl: string;
  wsUrl: string;
  demoMode: boolean;
}

const SettingsView: React.FC<SettingsViewProps> = ({ apiBaseUrl, wsUrl, demoMode }) => {
  return (
    <div className="SettingsView-Container">
      <h2 className="View-Title"><SettingsIcon size={24} /> System Configuration</h2>

      <div className="Settings-Grid">
        <div className="Card Settings-Card">
          <h3><Globe size={18} /> API & Connectivity</h3>
          <div className="Setting-Item">
            <label>Pipeline API</label>
            <input type="text" value={apiBaseUrl} disabled />
            <span className="Setting-Help">
              {demoMode
                ? 'Backend unreachable — running in demo mode with pre-computed results.'
                : 'Connected to pipeline server. All 4 routes active.'}
            </span>
          </div>
          <div className="Setting-Item">
            <label>Telemetry WebSocket</label>
            <input type="text" value={wsUrl} disabled />
            <span className="Setting-Help">
              {demoMode
                ? 'WebSocket not connected — biometric telemetry uses demo data.'
                : 'Streaming biometric data via Socket.IO.'}
            </span>
          </div>
          <div className="Setting-Item">
            <label>Mode</label>
            <input type="text" value={demoMode ? 'Demo (pre-computed data)' : 'Live (server connected)'} disabled />
          </div>
        </div>

        <div className="Card Settings-Card">
          <h3><Shield size={18} /> Privacy & Compliance</h3>
          <div className="Setting-Item">
            <label>Privacy Mode</label>
            <input type="text" value="Topology-Based (Zero PHI Transmitted)" disabled />
            <span className="Setting-Help">No central server stores health data. All analysis is local.</span>
          </div>
          <div className="Setting-Item">
            <label>Compliance Engine</label>
            <input type="text" value="FDA-GW-2016-V47 (47 predicate rules)" disabled />
            <span className="Setting-Help">Deterministic non-LLM gate with word-boundary regex, negation detection, and severity-weighted blocking.</span>
          </div>
          <div className="Setting-Item">
            <label>Audit Chain</label>
            <input type="text" value="SHA-256 Linked (Integrity-Verifiable)" disabled />
            <span className="Setting-Help">Every agent action is hashed and linked. Tamper detection built in.</span>
          </div>
        </div>

        <div className="Card Settings-Card">
          <h3><Database size={18} /> Storage & Data</h3>
          <div className="Setting-Item">
            <label>Persistence</label>
            <input type="text" value="SQLite (WAL Mode, Parameterised Queries)" disabled />
          </div>
          <div className="Setting-Item">
            <label>Vector Store</label>
            <input type="text" value="NumPy Embedded (20 LOINC Reference Embeddings)" disabled />
            <span className="Setting-Help">Cosine similarity retrieval for lab value grounding.</span>
          </div>
        </div>

        <div className="Card Settings-Card">
          <h3><Cpu size={18} /> Pipeline Architecture</h3>
          <div className="Setting-Item">
            <label>Orchestration</label>
            <input type="text" value="Sequential 4-Agent Pipeline (Python)" disabled />
            <span className="Setting-Help">Scribe → Pharmacist → Correlation Engine → Compliance Auditor</span>
          </div>
          <div className="Setting-Item">
            <label>Agent Contracts</label>
            <input type="text" value="MCP JSON Schema (4 typed tool definitions)" disabled />
            <span className="Setting-Help">Hot-swappable agent interfaces with input validation.</span>
          </div>
          <div className="Setting-Item">
            <label>Statistics</label>
            <input type="text" value="NumPy (Pearson, Welch t-test, Cohen's d, Bonferroni)" disabled />
            <span className="Setting-Help">Pharmacovigilance-grade multi-stream analysis.</span>
          </div>
        </div>
      </div>

      <div className="System-Status Card">
        <h3>Service Status</h3>
        <div className="Heartbeat-Grid">
          <div className="Heartbeat-Item">
            {demoMode ? <XCircle size={14} className="danger-text" /> : <CheckCircle2 size={14} className="success-text" />}
            <span className="Service-Name">Pipeline API (Flask)</span>
          </div>
          <div className="Heartbeat-Item">
            {demoMode ? <XCircle size={14} className="danger-text" /> : <CheckCircle2 size={14} className="success-text" />}
            <span className="Service-Name">Telemetry Gateway (gRPC)</span>
          </div>
          <div className="Heartbeat-Item">
            <CheckCircle2 size={14} className="success-text" />
            <span className="Service-Name">Compliance Engine (47 rules)</span>
          </div>
          <div className="Heartbeat-Item">
            <CheckCircle2 size={14} className="success-text" />
            <span className="Service-Name">Vector Store (20 embeddings)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
