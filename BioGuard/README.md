# BioGuardian: Autonomous Biological Firewall

**Clinical Intelligence Infrastructure** | Built by Yconic | 2026 Inter-Collegiate AI Hackathon

---

## Running

```bash
# CLI demo — full pipeline, prints Physician Brief
python demo.py

# HTTP server — Flask API on port 8000
cd src && python -m orchestration.pipeline

# Frontend — React dashboard
cd src/presentation && npm start

# Tests — 120 passing across 4 suites
python -m pytest src/orchestration/tests/ -v
```

## What's Built

### Backend: Four-Agent Pipeline (`pipeline.py`)

| Agent | File | What It Does |
|-------|------|-------------|
| **The Scribe** | `lab_parser.py` + `vector_store.py` | Text-to-LOINC normalization with 20-entry reference table and embedded vector store RAG |
| **The Pharmacist** | `openfda_client.py` | Live HTTP queries to api.fda.gov with CK-personalised risk scoring and cached fallback |
| **The Correlation Engine** | `correlation_engine.py` | Multi-stream Pearson r, Welch's t-test, Cohen's d, post-dose window detection, Bonferroni correction |
| **The Compliance Auditor** | `auditor/engine.py` + `rules.yaml` | 47 predicate rules, word-boundary regex, negation detection, sentence-level context, severity-weighted blocking |

### Backend: Supporting Infrastructure

| Component | File | What It Does |
|-----------|------|-------------|
| Flask API | `pipeline.py` | 4 routes: /v1/simulation/rehearse, /v1/twin/history, /v1/health, /v1/mcp/tools |
| MCP Server | `mcp_server.py` | JSON Schema input/output contracts for all 4 agents with validation |
| Vector Store | `vector_store.py` | NumPy cosine similarity, 20 LOINC clinical reference embeddings |
| Audit Chain | `auditor/engine.py` | SHA-256 linked, integrity-verifiable, tamper-detecting |
| Database | `database.py` | SQLite WAL, parameterised queries |
| Shared Utils | `utils.py` | `utcnow()`, `sha256_json()`, `sha256_bytes()` |
| gRPC Gateway | `server.js` + `normalizer.js` | Streaming telemetry with FHIR R4/LOINC normalization |
| Mock Producer | `mock_producer.js` | 11-day ADE trajectory, Box-Muller noise, 3 modes |
| Metabolic Sim | `metabolic_engine.py` | Bergman glucose-insulin model, statin/metformin PD |

### Frontend: Health Dashboard (`App.tsx`)

| Feature | File | What It Does |
|---------|------|-------------|
| CSV Import | `CsvUpload.tsx` | 3 upload zones (sleep, activity, health). 90+ column mappings for Garmin/Apple/Fitbit. Thousand-separator handling. Auto-unit conversion |
| Health Assessment | `healthAssessment.ts` | 4-system clinical report (Sleep Architecture, Cardiovascular, Recovery, Activity). A-F grading. Overtraining detection. 20+ literature citations |
| Cross-Metric Analysis | `analysis.ts` | Pairwise Pearson correlation, lagged cross-correlation (day N → day N+1), trend breakpoint detection, narrative insights |
| Action Checklist | `ActionChecklist.tsx` | Swipeable recommendation cards with checkoff tracking and progress bar |
| Metric Cards | `App.tsx` | 20 metric types across 4 categories with trend %, anomaly flags, mini charts |
| Motivation | `App.tsx` | Health score (0-100) with 4-tier messaging (great/good/nudge/urgent) |

### Compliance Engine (Deep Feature)

The auditor implements 8 techniques beyond simple substring matching:
1. **Word-boundary regex** — "undiagnosed" doesn't trigger "diagnose"
2. **Negation detection** — "does not diagnose" is suppressed
3. **Sentence-level context** — reports the exact offending sentence
4. **Severity-weighted blocking** — CRITICAL blocks immediately, MEDIUM warns
5. **Suggested alternatives** — 16-entry map with compliant rewrites
6. **explain_violation() API** — diagnostic tool per rule
7. **Per-rule RuleResult** — 47 individual pass/fail with pattern and context
8. **Pre-compiled regex** — compiled once at init, not per-validation

### Correlation Engine (Deep Feature)

6 statistical methods applied to individual patient data:
- Pearson r with Fisher z-transform 95% CI
- Welch's t-test for baseline vs observation period comparison
- Cohen's d for clinical significance (d >= 0.5 = actionable)
- Post-dose 4-hour window detection for statin myopathy
- Bonferroni correction across 9 independent tests
- Multi-stream report (HRV + Sleep + Glucose simultaneously)

## Testing

```
120 tests across 4 suites:
  test_pipeline.py      — 10 end-to-end pipeline tests
  test_auditor.py       — 65 compliance tests (word boundary, negation, context, severity)
  test_correlation.py   — 31 statistical tests (Pearson, Welch, Cohen's d, Bonferroni)
  test_vector_store.py  — 14 vector store + MCP tests
```

## Stack

| Layer | File | Technology |
|-------|------|-----------|
| Pipeline + API | `pipeline.py` | Sequential Python + Flask |
| Agent Contracts | `mcp_server.py` | MCP JSON Schema |
| Vector Store | `vector_store.py` | NumPy embedded |
| Statistics | `correlation_engine.py` | NumPy (Pearson, Welch, Cohen's d) |
| Drug Data | `openfda_client.py` | openFDA FAERS API |
| Lab Parsing | `lab_parser.py` | Regex + LOINC table |
| Compliance | `auditor/engine.py` | Predicate logic (YAML) |
| Persistence | `database.py` | SQLite (WAL) |
| Telemetry | `server.js` | Node.js + gRPC |
| Dashboard | `App.tsx` | React + TypeScript + Recharts |
| Health Analysis | `healthAssessment.ts` | Multi-system clinical grading |
| Cross-Metric | `analysis.ts` | Pairwise correlation + lag |
| Simulation | `metabolic_engine.py` | Bergman model + statin PD |

---

*Built for the 2026 Inter-Collegiate AI Hackathon by Yconic.*
