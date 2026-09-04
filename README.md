# HarvestIQ — Risk-Aware Harvest Timing & Market Option Simulator

**Individual College Semester Project (Sem-5, C28)**  
*Developed for formal academic review and viva defense.*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://www.python.org)
[![Tests](https://img.shields.io/badge/Tests-20%2F20%20Passing-success)](file:///a:/HarvestIQ/backend/tests)

---

## 1. Official Problem Statement

> **"A food-processing unit purchasing crops with variable quality. The organisation needs a solution because price and harvest timing decisions are made without estimating spoilage risk. Take ownership of a problem faced by a food-processing unit purchasing crops with variable quality: price and harvest timing decisions are made without estimating spoilage risk. Build a harvest timing and market option simulator incorporating spoilage risk, include edge cases and operational failure handling, use crop maturity, weather, price scenarios, storage and transport time, ensure it must quantify uncertainty and missing-data limitations, and substantiate expected farmer value after spoilage and market risk. Run at least three operating scenarios, perform sensitivity analysis, and show which assumptions change the decision. Include accessibility, language and explainability checks with representative users. Create a baseline, an end-to-end working prototype, at least three edge or failure cases, a measurable experiment using crop maturity, weather, price scenarios, storage and transport time, and a short user or stakeholder validation. Deliverables: scenario definition; baseline method; implemented solution; usability walkthrough; edge-case tests; performance results; ethics note; deployment checklist. Must quantify uncertainty and missing-data limitations. Expected farmer value after spoilage and market risk; include baseline, target, measured result and error analysis."**

---

## 2. System Architecture & Core Pipeline

HarvestIQ is built as a **Modular Monolith** with zero black-box models. Every step is mathematically explainable in a viva defense:

```
[User Input & Presets]
          │
          ▼
[Data Layer Service] (NASA POWER API Weather + Mandi Market Prices)
  ↳ Seamless Fallback: Live ──► 10-Yr Climatology / 7-Day APMC Snapshot ──► Demo Data
          │
          ▼
[Missing-Data & Reliability Handler] (Calculates 0–100% Recommendation Reliability Score)
          │
          ▼
[Analytical Modeling Engines]
  ├── 1. Spoilage Kinetics Model: Arrhenius quality decay S(t) = 1 - exp(-k_eff * t)
  ├── 2. Historical-Volatility Price Simulator: Empirical APMC Mandi sampling
  └── 3. EFV Calculator: Zero double-counting of spoilage
          │
          ▼
[Monte Carlo Simulation Engine] (N=1,000 runs, Seed Reproducibility, 5th-95th Percentiles)
          │
          ▼
[Centralized Decision & Sensitivity Engine] (app/config.py)
  ├── BUY_NOW / WAIT / REJECT / CHANGE_OPTION Policy Rules
  ├── One-at-a-Time (OAT) Sensitivity Tornado & Critical Decision Tipping Points
  └── Rule-Based Natural Language Generator (No LLM Hallucinations)
          │
          ▼
[Bilingual React UI & SQLite Audit Database] (English + தமிழ், Icon+Text Risk Pairing)
```

---

## 3. Parameter Provenance & Data Strategy (Academic Defense Standard)

All parameters are strictly categorized to maintain complete academic honesty:
- **Literature-Backed (with citations):** Respiration quotient $Q_{10} = 2.15$ (*Kader 2002, UC Davis*), reference temperature $T_{\text{ref}} = 20^\circ\text{C}$ (*FAO*), base storage constants $k_0$ (*USDA Handbook 66 & ICAR-DOGR*).
- **Assumed Initial Parameters (`ASSUMED — NEEDS CALIBRATION`):** Excess humidity coefficient ($\beta_{\text{RH}} = 0.50$), transit vibration damage ($2.5\% / 100\text{km}$), handling drop loss ($2.0\%$).
- **Real Public Datasets:** NASA POWER Agroclimatology & Agmarknet APMC modal wholesale price series.
- **Computational Experiments:** Parameter sweeps exploring sensitivity surfaces (not claimed as field observations).

*Full details in [`docs/PARAMETER_SOURCES.md`](file:///a:/HarvestIQ/docs/PARAMETER_SOURCES.md) and [`docs/data_provenance.md`](file:///a:/HarvestIQ/docs/data_provenance.md).*

---

## 4. Key Features & Deliverables

1. **Harvest Timing Simulation:** Compares Day 0 (Immediate), Day 3 (Delayed), and Day 7 (Extended) to balance price appreciation against biological rotting.
2. **Market Options Evaluation:** Evaluates Direct Processing Unit Procurement vs. Local APMC Mandi Spot Sale.
3. **3 Operating Scenarios:** Normal Operating Conditions, High Spoilage Risk (Heatwave/Delay), and Market Risk (Price Crash).
4. **Separation of Outcome Interval vs. Reliability:**
   - *Outcome Distribution:* Expected EFV, Median, 5th–95th percentile confidence band, and Probability of Loss.
   - *Recommendation Reliability (0–100%):* Explicit score based on input completeness and external data tier.
5. **6+ Tested Edge Cases:** One-click presets for missing weather, missing price, invalid negative inputs, extreme heatwave ($>85\%$ spoilage), price crash shocks, and API degradation.
6. **Baseline Method Benchmark:** Side-by-side comparison against the traditional fixed-price threshold heuristic, demonstrating a **40% discrepancy rate** and ₹15,400+ in saved rotting losses.
7. **Bilingual Accessibility:** English + Tamil ($\text{தமிழ்}$) static localization; icon + text pairing accessible for color blindness.

---

## 5. Quickstart & Local Setup

### Prerequisites
- Python 3.12 (64-bit)
- Node.js v20+ & npm

### Backend Setup
```bash
cd backend
# Create virtual environment
python -m venv .venv
# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run automated tests (20/20 passing)
python tests/run_tests.py

# Run computational experiments (generates CSVs and plots)
python scripts/run_computational_experiments.py

# Start FastAPI backend
uvicorn app.main:app --reload --port 8000
```
Backend API will be live at `http://localhost:8000` (API Docs at `http://localhost:8000/docs`).

### Frontend Setup
```bash
cd frontend
npm install
npm run build
npm run dev -- --port 5173
```
Frontend UI will be live at `http://localhost:5173`.

---

## 6. Verification & Automated Test Suite

Run the full automated test suite from the backend directory:
```bash
python backend/tests/run_tests.py
```

### Test Coverage (20 Tests):
- **`test_spoilage_model.py`:** Temperature monotonicity ($\frac{\partial S}{\partial T} > 0$), exposure duration monotonicity, maturity acceleration, bounds check ($S \in [0, 1]$).
- **`test_efv_calculator.py`:** Zero double-counting verification (when spoilage=100%, gross revenue=0), salvage value recovery.
- **`test_monte_carlo.py`:** Random seed reproducibility, percentile ordering ($p05 \le \text{median} \le p95$).
- **`test_decision_engine.py`:** Extreme spoilage safeguard, hurdle margins, option arbitrage.
- **`test_missing_data.py`:** Missing weather/price fallback penalties, negative quantity validation, 6 edge cases.
- **`test_baseline.py`:** Discrepancy calculation, baseline loss identification.
- **`test_api_endpoints.py`:** End-to-end `/api/analyze`, reference data, and SQLite history persistence.

---

## 7. Documentation Index

- [`docs/architecture.md`](file:///a:/HarvestIQ/docs/architecture.md): System architecture & viva defense guide.
- [`docs/model.md`](file:///a:/HarvestIQ/docs/model.md): Mathematical modeling, kinetics equations, and reproducibility.
- [`docs/PARAMETER_SOURCES.md`](file:///a:/HarvestIQ/docs/PARAMETER_SOURCES.md): Parameter classification and literature citations.
- [`docs/decision_engine.md`](file:///a:/HarvestIQ/docs/decision_engine.md): Configurable thresholds and decision logic tree.
- [`docs/baseline_methodology.md`](file:///a:/HarvestIQ/docs/baseline_methodology.md): Baseline limitations and comparative evaluation results.
- [`docs/ethics_and_limitations.md`](file:///a:/HarvestIQ/docs/ethics_and_limitations.md): Ethical responsibilities and technical limitations.
- [`docs/data_provenance.md`](file:///a:/HarvestIQ/docs/data_provenance.md): Real, synthetic, and assumed data attribution matrix.
- [`docs/deployment_checklist.md`](file:///a:/HarvestIQ/docs/deployment_checklist.md): Production hosting and pre-flight checklist.
- [`docs/experiment_results/computational_experiments/`](file:///a:/HarvestIQ/docs/experiment_results/computational_experiments/): Generated parameter sweep CSVs and visualization plots.
