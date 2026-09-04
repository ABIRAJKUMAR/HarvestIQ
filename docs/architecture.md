# HarvestIQ — System Architecture & Viva Defense Guide

An explainable, modular decision-support system built for an individual college semester project (Sem-5, C28).

---

## 1. High-Level Architectural Philosophy

HarvestIQ is structured as a **Modular Monolith** rather than microservices or distributed systems. This design was chosen specifically for:
1. **Explainability**: Every calculation step (from weather inputs to Monte Carlo distributions and decision outputs) has clear, traceable data flow.
2. **Zero Black-Box Logic**: No opaque deep learning or uninterpretable neural networks.
3. **Resilience & Offline Autonomy**: If live external APIs (NASA POWER, Agmarknet) fail during a viva demonstration, the system seamlessly degrades to cached seasonal norms or local synthetic test datasets.

```
HarvestIQ Data Flow & Execution Pipeline:

[User Input / UI Presets]
       │
       ▼
[Data Layer Service]
  ├── NASA POWER API (Live Agroclimatology) ──► Fallback: 10-Yr Monthly Climatology
  └── Agmarknet API (Mandi Benchmark Series) ──► Fallback: APMC 7-Day Modal Snapshot
       │
       ▼
[Missing-Data & Reliability Handler]
  └── Calculates Recommendation Reliability (0–100%) and logs data provenance
       │
       ▼
[Analytical Modeling Engines]
  ├── Spoilage Kinetics Model: S(t) = 1 - exp(-k_eff * t_total) [Arrhenius respiration]
  ├── Market Price Simulator: Empirical historical volatility delta sampling
  └── EFV Calculator: Gross Realized Revenue - Logistics Costs - Harvest Cost (No double-counting)
       │
       ▼
[Monte Carlo Simulation Engine]
  └── N=1,000 stochastic iterations with reproducible random seed (np.random.default_rng)
       │
       ▼
[Decision & Sensitivity Engine]
  ├── Centralized Deterministic Decision Rules (app/config.py)
  ├── One-at-a-Time (OAT) Sensitivity Engine (Tornado ranking)
  └── Rule-Based Natural Language Generator (Plain-language review defense text)
       │
       ▼
[Presentation & Persistence]
  ├── Bilingual React Dashboard (English + தமிழ்) with accessible icon+text pairing
  ├── SQLite Audit Database (`analysis_records` table)
  └── Baseline Discrepancy & Parameter Sweep Viewers
```

---

## 2. Directory Structure & Component Responsibilities

```
HarvestIQ/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI entry point, CORS middleware, table initialization
│   │   ├── config.py                   # Centralized parameter definitions, thresholds & citations
│   │   ├── models/
│   │   │   ├── database.py             # SQLite engine & sessionmaker
│   │   │   └── analysis_record.py      # ORM schema storing simulation inputs, seeds & provenance
│   │   ├── schemas/
│   │   │   ├── request.py              # Pydantic input validation (Crop, Weather, Logistics)
│   │   │   ├── response.py             # Typed responses (Intervals, Reliability, Scenarios)
│   │   │   └── baseline.py             # Baseline comparison schemas
│   │   ├── services/
│   │   │   ├── weather_service.py      # NASA POWER API client + 10-yr climatology fallback
│   │   │   ├── market_service.py       # Agmarknet modal price client + APMC snapshot fallback
│   │   │   ├── spoilage_model.py       # Arrhenius-based kinetic quality degradation
│   │   │   ├── price_model.py          # Empirical historical volatility sampler
│   │   │   ├── monte_carlo.py          # Stochastic simulation engine with reproducible seed
│   │   │   ├── efv_calculator.py       # Consistent non-double-counting EFV equations
│   │   │   ├── decision_engine.py      # Rule-based decision logic using config thresholds
│   │   │   ├── sensitivity_engine.py   # OAT parameter sensitivity & decision tipping points
│   │   │   ├── missing_data_handler.py # Missing field detection & reliability penalty scoring
│   │   │   ├── baseline_comparator.py  # Fixed-price heuristic baseline vs HarvestIQ
│   │   │   └── explanation_generator.py# Deterministic template-based explainability (No LLM)
│   │   └── api/
│   │       ├── routes_analyze.py       # POST /api/analyze (Full simulator pipeline)
│   │       ├── routes_baseline.py      # POST /api/baseline-compare
│   │       ├── routes_data.py          # GET /api/crops, GET /api/regions, GET /api/data-sources
│   │       └── routes_history.py       # GET /api/history, GET /api/history/{id}
│   ├── data/                           # Seed datasets & static fallback snapshots
│   ├── tests/                          # 20 automated unit, invariant & API tests
│   └── scripts/
│       └── run_computational_experiments.py # Automated parameter sweeps (outputs CSVs & plots)
└── frontend/
    └── src/
        ├── api/client.ts               # Typed Axios client
        ├── context/LanguageContext.tsx  # English + Tamil bilingual provider
        ├── locales/                    # Static JSON translation dictionaries
        ├── components/                 # Reusable UI widgets (Tornado, Timing Curve, Reliability)
        └── views/                      # Simulator, Baseline, Sweeps, History views
```

---

## 3. How to Defend This in Your Viva Review

### Q1: "Why didn't you use a neural network or deep learning for spoilage prediction?"
> **Answer:** *"In agricultural procurement and food processing, biological shelf-life degradation follows well-established kinetic laws (Arrhenius temperature-respiration acceleration and ethylene-induced firmness loss). A deep neural network would be an uninterpretable black box requiring thousands of destructive sensor readings that commercial packhouses do not possess. Our kinetic model ($Q_{10} = 2.15$, $T_{\text{ref}} = 20^\circ\text{C}$) is literature-backed (Kader 2002, USDA Handbook 66), computationally lightweight (<5ms), and provides clear physical explanations for why high ambient temperatures accelerate rotting."*

### Q2: "How does the system ensure robustness when internet connectivity or APIs fail?"
> **Answer:** *"The data layer implements a 3-tier fallback chain: Live API $\rightarrow$ Verified 7-day / 10-year Cached Benchmark $\rightarrow$ Local Demo Data. Whenever a fallback is activated, the system applies an explicit confidence penalty (e.g. -15% for climatology, -20% for snapshot prices), surfacing a Recommendation Reliability banner in the UI so the procurement officer knows the uncertainty level."*

### Q3: "How does your decision engine choose between BUY_NOW, WAIT, and REJECT?"
> **Answer:** *"All decision thresholds are centralized in `app/config.py`. The decision engine evaluates Monte Carlo statistical distributions:
> 1. `REJECT` if the 95th percentile spoilage exceeds 85%, expected net profit is below ₹500, or loss probability exceeds 40%.
> 2. `WAIT` if delayed harvest (Day 3 or Day 7) provides at least a ₹1,200 advantage over Day 0 while keeping spoilage risk below 35%.
> 3. `CHANGE_OPTION` if local Mandi spot sale provides at least a 12% arbitrage advantage over direct processing.
> 4. Otherwise, `BUY_NOW` to lock in immediate safe value."*
