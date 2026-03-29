import React, { useState } from 'react';
import { Zap, Save, FolderOpen, PlusCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Scenario {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters: { [key: string]: any };
}

const ScenarioView: React.FC = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      id: 'scenario-statin-ade',
      name: "Statin ADE Detection",
      description: "Atorvastatin 20mg + Metformin + Magnesium supplement. 11-day trajectory: HRV degrades 22% in 4h post-dose window, sleep efficiency falls 18%, fasting glucose creeps +8 mg/dL. The primary demo scenario.",
      category: "ADE Detection",
      parameters: {
        patient_id: 'PT-2026-ALPHA',
        substance: 'Atorvastatin',
        dose: '20mg',
        concurrent_medications: ['Metformin 1000mg', 'Magnesium 400mg'],
        observation_window: '96h',
        expected_signals: 'HRV -22%, Sleep -18%, Glucose +8mg/dL',
      },
    },
    {
      id: 'scenario-dose-escalation',
      name: "Statin Dose Escalation",
      description: "Simvastatin escalated from 20mg to 40mg. Tests whether doubling the dose produces a proportional increase in HRV depression and CK elevation risk.",
      category: "ADE Detection",
      parameters: {
        patient_id: 'PT-2026-ALPHA',
        substance: 'Simvastatin',
        dose: '40mg',
        prior_dose: '20mg',
        monitoring_focus: 'CK levels, HRV delta from prior dose',
      },
    },
    {
      id: 'scenario-ace-inhibitor',
      name: "ACE Inhibitor Initiation",
      description: "Lisinopril 10mg added to existing Metformin protocol. Monitors for ACE-inhibitor-specific ADEs: dry cough onset, hyperkalemia risk, and hemodynamic-metabolic cross-talk effects.",
      category: "Drug Initiation",
      parameters: {
        patient_id: 'PT-2026-ALPHA',
        substance: 'Lisinopril',
        dose: '10mg',
        concurrent_medications: ['Metformin 1000mg'],
        monitoring_focus: 'Potassium levels, cough onset, blood pressure',
      },
    },
    {
      id: 'scenario-supplement-interaction',
      name: "Supplement-Drug Interaction",
      description: "Patient adds Magnesium 400mg supplement alongside existing statin. Tests for magnesium-statin interaction effects on muscle recovery and CK levels.",
      category: "Interaction Check",
      parameters: {
        patient_id: 'PT-2026-ALPHA',
        substance: 'Magnesium',
        dose: '400mg',
        concurrent_medications: ['Atorvastatin 20mg', 'Metformin 1000mg'],
        monitoring_focus: 'CK modulation, sleep quality, muscle symptoms',
      },
    },
    {
      id: 'scenario-compliance-block',
      name: "Compliance Auditor Block Demo",
      description: "Intentional output containing diagnostic language to demonstrate the Compliance Auditor catching and blocking a violation. The block is scripted as the demo's most impressive moment.",
      category: "Compliance",
      parameters: {
        test_type: 'intentional_block',
        forbidden_output: 'Your statin is causing reduced HRV',
        expected_rule: 'GW-024 (NO_DEFINITIVE_CAUSATION)',
        expected_result: 'BLOCKED',
      },
    },
    {
      id: 'scenario-negation-pass',
      name: "Negation Detection Demo",
      description: "Tests that the compliance engine correctly handles negated forbidden patterns. 'This system does not diagnose' should PASS, while 'We diagnose your condition' should BLOCK.",
      category: "Compliance",
      parameters: {
        pass_text: 'This system does not diagnose any condition',
        block_text: 'We diagnose your condition',
        expected_rule: 'GW-001 (NO_DIAGNOSTIC_CLAIM)',
        feature_tested: 'Word-boundary regex + negation detection',
      },
    },
    {
      id: 'scenario-multi-stream',
      name: "Multi-Stream Bonferroni Analysis",
      description: "Full pharmacovigilance analysis across HRV, sleep, and glucose with Bonferroni correction for 9 independent tests. Demonstrates that signals must survive alpha=0.0056 to be reported.",
      category: "Statistics",
      parameters: {
        biometrics: ['HRV_RMSSD', 'SLEEP_ANALYSIS', 'BLOOD_GLUCOSE'],
        tests_per_stream: 3,
        total_tests: 9,
        bonferroni_alpha: 0.0056,
        methods: ['Pearson r', "Welch's t-test", "Cohen's d"],
      },
    },
    {
      id: 'scenario-baseline',
      name: "Healthy Baseline (Control)",
      description: "Steady-state healthy ranges with no drug intervention. Used to establish baseline biometric patterns for comparison. All markers should remain within reference ranges.",
      category: "Control",
      parameters: {
        patient_id: 'PT-2026-CTRL',
        substance: 'None',
        expected_signals: 'None (all within normal)',
        duration: '72h',
      },
    },
  ]);

  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newParams, setNewParams] = useState('{ "substance": "Metformin", "dose": "500mg" }');
  const [newCategory, setNewCategory] = useState('ADE Detection');

  const handleAdd = () => {
    if (!newName.trim()) return;
    try {
      const params = JSON.parse(newParams);
      setScenarios([...scenarios, {
        id: `scenario-${Date.now()}`,
        name: newName,
        description: newDesc,
        category: newCategory,
        parameters: params,
      }]);
      setNewName('');
      setNewDesc('');
      setNewParams('{}');
    } catch {
      alert('Invalid JSON for parameters.');
    }
  };

  const categories = Array.from(new Set(scenarios.map(s => s.category)));

  return (
    <div className="ScenarioView-Container">
      <h2 className="View-Title"><Zap size={24} /> Protocol Scenarios ({scenarios.length})</h2>

      <div className="Scenario-Creation-Panel Card">
        <h3>Create New Scenario</h3>
        <div className="Input-Group">
          <label>Name</label>
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., Rosuvastatin High-Dose" />
        </div>
        <div className="Input-Group">
          <label>Category</label>
          <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
            <option value="ADE Detection">ADE Detection</option>
            <option value="Drug Initiation">Drug Initiation</option>
            <option value="Interaction Check">Interaction Check</option>
            <option value="Compliance">Compliance</option>
            <option value="Statistics">Statistics</option>
            <option value="Control">Control</option>
          </select>
        </div>
        <div className="Input-Group">
          <label>Description</label>
          <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Describe the clinical scenario..." />
        </div>
        <div className="Input-Group">
          <label>Parameters (JSON)</label>
          <textarea value={newParams} onChange={(e) => setNewParams(e.target.value)} rows={3} />
        </div>
        <button className="Action-Btn primary" onClick={handleAdd}><PlusCircle size={16} /> Add Scenario</button>
      </div>

      {categories.map(cat => (
        <div key={cat} className="Scenario-List-Panel Card">
          <h3>{cat} ({scenarios.filter(s => s.category === cat).length})</h3>
          <div className="Scenario-List">
            {scenarios.filter(s => s.category === cat).map((scenario) => (
              <div key={scenario.id} className="Scenario-Card">
                <h4>{scenario.name}</h4>
                <p className="Scenario-Description">{scenario.description}</p>
                <ul className="Scenario-Params">
                  {Object.entries(scenario.parameters).map(([key, value]) => (
                    <li key={key}><strong>{key}:</strong> {JSON.stringify(value)}</li>
                  ))}
                </ul>
                <div className="Scenario-Actions">
                  <button className="Action-Btn secondary"><FolderOpen size={16} /> Load</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScenarioView;
