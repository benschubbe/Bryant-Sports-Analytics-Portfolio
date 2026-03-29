# BioGuardian: Autonomous Biological Firewall

**Clinical Intelligence Infrastructure** | Built by Yconic | 2026 Inter-Collegiate AI Hackathon

**North Star:** Close the 4.3-day median ADE detection gap to same-day for chronically medicated patients.

---

## Running the Demo

```bash
python demo.py
```

Runs the complete four-agent pipeline for Sarah's statin ADE scenario. Produces a SOAP-structured Physician Brief with lab panels, openFDA drug flags, multi-stream Pearson correlation signals with Bonferroni correction, compliance validation against 47 FDA rules, and a sealed SHA-256 audit chain. Full JSON written to `demo_output.json`.

```bash
python demo.py --patient PT-CUSTOM --drug Simvastatin --dose 40mg
```

## What's Built and Working

### The Four-Agent Pipeline (`pipeline.py`)

Standalone sequential pipeline. One function call runs all four agents and returns a complete Physician Brief.

| Agent | File | What It Does |
|-------|------|-------------|
| **The Scribe** | `lab_parser.py` + `vector_store.py` | Parses lab text into LOINC-coded JSON via 20-entry reference table with embedded vector store RAG grounding |
| **The Pharmacist** | `openfda_client.py` | Live HTTP queries to `api.fda.gov/drug/event.json`, CK-personalised risk scoring, cached fallback |
| **The Correlation Engine** | `correlation_engine.py` | Multi-stream pharmacovigilance analysis: Pearson r, Welch's t-test, Cohen's d, post-dose windowed detection, Bonferroni correction |
| **The Compliance Auditor** | `auditor/engine.py` + `rules.yaml` | 47 deterministic predicate rules (FDA GW 2016), non-LLM, SHA-256 audit chain |

### Correlation Engine (Deep Feature)

The statistical core applies six pharmacovigilance-grade methods to individual-patient biometric data:

| Method | Implementation | What It Detects |
|--------|---------------|----------------|
| Pearson r + Fisher CI | `np.corrcoef`, arctanh transform | Correlation strength with 95% confidence bounds |
| Welch's t-test | Unequal-variance t-statistic | Baseline-to-observation distribution shift after drug initiation |
| Cohen's d | Pooled-SD effect size | Clinical significance (d >= 0.5 actionable, beyond statistical significance) |
| Post-dose window | In-window vs out-window comparison | The specific 4-hour HRV depression pattern in statin myopathy |
| Bonferroni correction | alpha / n_tests | Family-wise error control across 3 biometrics x 3 analyses |
| Z-score deviation | (x - baseline_mean) / baseline_std | Per-reading anomaly tracking against baseline period |

Demo output for Sarah's scenario:
- HRV baseline 37.3 -> 33.4ms (-10.5%, Cohen's d=-1.48, Welch p<0.0001)
- HRV post-dose window: 32.1 vs 35.0ms (-8.3%, d=-0.86)
- Sleep 452 -> 410min (-9.4%, d=-1.84, Welch p=0.003)
- Glucose 87.8 -> 92.3mg/dL (+5.2%, d=1.68, Welch p=0.001)
- All 3 correlations survive Bonferroni correction at alpha=0.0056

### Other Components

| Component | File | What It Does |
|-----------|------|-------------|
| MCP Tool Schemas | `mcp_server.py` | Typed JSON Schema input/output contracts for all 4 agents, validation, plugin registration |
| Embedded Vector Store | `vector_store.py` | NumPy cosine similarity with 20 LOINC clinical reference embeddings |
| Pydantic Schemas | `models.py` | Frozen v2 models with validators (LOINC format, p < 0.05, window >= 72h) |
| SHA-256 Audit Chain | `auditor/engine.py` | Linked append-only log with integrity verification |
| SQLite Persistence | `database.py` | WAL mode, parameterised queries, telemetry + simulation history |
| gRPC Telemetry Gateway | `server.js` + `normalizer.js` | Streaming biometric ingestion with FHIR R4/LOINC normalization |
| Mock Telemetry Producer | `mock_producer.js` | Sarah's 11-day ADE trajectory with Box-Muller Gaussian noise, 3 modes |
| React Dashboard | `App.tsx` + 7 components | 3D Neural Soma, SOAP Physician Brief renderer, audit chain viewer |
| Metabolic Simulation | `metabolic_engine.py` | Bergman glucose-insulin kinetics with statin/metformin PD |
| Shared Utilities | `utils.py` | `utcnow()`, `sha256_json()` — deduplicated across all modules |

### Privacy

All processing runs locally. No PHI transmitted externally.
- SHA-256 audit chain logs every agent action on-device
- Agents communicate via typed MCP tool schemas with no shared memory

### Compliance

47 deterministic predicate rules (non-LLM) in 8 categories:
- Diagnostic claims (8) | Treatment claims (8) | Prescription modification (6)
- Wellness framing (8) | Professional consultation (5) | Data integrity (6)
- Privacy (2) | Scope (4)

Every PASS carries the auditor version hash. Every BLOCK carries the specific rule code.

## Testing

```bash
# 129 tests across 4 suites — all passing
python -m pytest src/orchestration/tests/ -v

# Individual suites
python -m pytest src/orchestration/tests/test_pipeline.py -v      # 10 — end-to-end pipeline proof
python -m pytest src/orchestration/tests/test_auditor.py -v        # 74 — compliance rules + audit chain
python -m pytest src/orchestration/tests/test_correlation.py -v    # 31 — Pearson, Welch, Cohen's d, Bonferroni, multi-stream
python -m pytest src/orchestration/tests/test_vector_store.py -v   # 14 — vector store + MCP server
```

## Stack

| Layer | Technology | File |
|-------|-----------|------|
| Pipeline | Sequential (Python) | `pipeline.py` |
| Agent Contracts | MCP JSON Schema | `mcp_server.py` |
| Vector Store | NumPy embedded | `vector_store.py` |
| Statistics | NumPy (Pearson, Welch, Cohen's d) | `correlation_engine.py` |
| Drug Data | openFDA FAERS API | `openfda_client.py` |
| Lab Parsing | Regex + LOINC table | `lab_parser.py` |
| Compliance | Predicate logic (YAML) | `auditor/engine.py` + `rules.yaml` |
| Persistence | SQLite (WAL) | `database.py` |
| Telemetry | Node.js + gRPC | `server.js` + `normalizer.js` |
| Frontend | React + TypeScript + Three.js | `App.tsx` + components |
| Simulation | Python + NumPy | `metabolic_engine.py` |

---

*Built for the 2026 Inter-Collegiate AI Hackathon by Yconic.*
