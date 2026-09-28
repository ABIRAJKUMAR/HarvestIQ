# HarvestIQ — Review 2 Project Progress Report

**Project Title:** HarvestIQ — Risk-Aware Harvest Timing & Market Option Simulator  
**Track:** #software  
**Project Category:** Agri-Tech / Post-Harvest Logistics / Decision Support Systems  
**Evaluation Milestone:** Review 2 (Requirement: 35% Review 2 Scope / 70% Cumulative Completion)  
**Current Completion Status:** 70% Completed (Live Telemetry Ingestion, Dynamic OSRM Multi-Mandi Routing, Containerization & CI/CD)  
**Evaluation Standard:** Agentic AI Review Ready (100% Verifiable Codebase, 30/30 Passing Tests, Dockerized & CI/CD Validated)

---

## Executive Summary & Milestone Progress (70% Cumulative Completion)

HarvestIQ tackles a multibillion-rupee post-harvest vulnerability: **agricultural procurement units and smallholder farmers make harvest timing and logistics decisions using static price heuristics without estimating temperature-dependent biological spoilage and transit delay risks.**

Building directly upon the **100% score (35/35 marks)** achieved in Review 1, this **Review 2 submission advances the project from 35% to 70% cumulative completion**. All three specific improvement areas highlighted in the Review 1 AI evaluation report have been fully engineered, mathematically validated, and verified through an expanded automated test suite (30/30 tests passing).

| Milestone Phase | Scope Description | Scope % | Status |
|---|---|---|---|
| **Phase 1 (Review 1)** | Core Theoretical Models (Arrhenius Kinetics, Volatility, EFV), Seeded Monte Carlo ($N=1,000$), Missing-Data Resilience & Prototype UI | 35% | **COMPLETED ✅ (35/35 Marks)** |
| **Phase 2 (Review 2)** | **Containerization (Docker), GitHub Actions CI/CD, Dynamic OSRM Multi-Mandi Routing, Transit Breakdown Variances & Real-Time IoT Telemetry Stream** | **35%** | **COMPLETED ✅ (70% Cumulative)** |
| **Phase 3 (Final Viva)** | Field Calibration with Local FPO Cooperatives, Offline Progressive Web App (PWA), Voice Guidance (Tamil/English) & Viva Defense | 30% | Final Stage (30% Scope) ⏳ |

---

## 1. Review 1 Evaluator Feedback Closure Matrix

In Review 1, the evaluator commended HarvestIQ for *scientific rigor in parameter provenance*, *vectorized Monte Carlo reproducibility*, *graceful missing-data degradation*, and *baseline benchmarking*. The evaluator outlined **three specific action items for Review 2**, all of which are 100% resolved in this submission:

| Review 1 Evaluator Feedback / Improvement Area | Implemented Technical Solution in Review 2 | Verification Artifact / Code Reference |
|---|---|---|
| **1. Docker & CI/CD Pipelines:**<br>*"Ensure Docker configurations and CI/CD pipelines (GitHub Actions) are fully integrated to deploy the staging environment continuously."* | • Created production multi-stage `Dockerfile` (Python 3.12 slim, non-root user).<br>• Created multi-stage frontend `Dockerfile` with Nginx reverse proxy.<br>• Engineered unified `docker-compose.yml` with health checks.<br>• Configured `.github/workflows/ci.yml` running Python 3.11/3.12 test matrices, Node 20 builds, and Docker image validation. | • [`backend/Dockerfile`](file:///a:/HarvestIQ/backend/Dockerfile)<br>• [`frontend/Dockerfile`](file:///a:/HarvestIQ/frontend/Dockerfile)<br>• [`docker-compose.yml`](file:///a:/HarvestIQ/docker-compose.yml)<br>• [`.github/workflows/ci.yml`](file:///a:/HarvestIQ/.github/workflows/ci.yml) |
| **2. Dynamic OSRM Routing & Transit Delay Variance:**<br>*"Account for realistic transit delay variances (road conditions and vehicle breakdown scenarios) inside the Monte Carlo loop."* | • Engineered `RoutingService` supporting 7 benchmark APMC mandis with live OSRM routing and calibrated road winding models.<br>• Formulated log-normal road congestion dispersion $\Delta t_{\text{road}} \sim \text{LogNormal}(0, 0.18^2)$.<br>• Incorporated vehicle breakdown shock scenarios ($p_{\text{breakdown}} = 4\%$, $+3.5\text{--}8.5\text{h}$ delay) directly inside the vectorized Monte Carlo loop.<br>• Built multi-mandi arbitrage ranking maximizing Net EFV after road freight, tolls, and transit decay. | • [`backend/app/services/routing_service.py`](file:///a:/HarvestIQ/backend/app/services/routing_service.py)<br>• [`backend/app/services/monte_carlo.py`](file:///a:/HarvestIQ/backend/app/services/monte_carlo.py)<br>• [`backend/app/api/routes_routing.py`](file:///a:/HarvestIQ/backend/app/api/routes_routing.py)<br>• [`backend/tests/test_routing_engine.py`](file:///a:/HarvestIQ/backend/tests/test_routing_engine.py) |
| **3. Structured IoT Telemetry Ingestion:**<br>*"Begin structuring the schema for planned MQTT/webhook IoT telemetry ingestion to ensure seamless streaming of temperature/humidity logs into the in-transit spoilage model."* | • Created Pydantic schemas for `IoTTelemetryPacket` and `IoTBatchTelemetryRequest`.<br>• Developed `IoTShipmentTracker` computing discrete numerical integrals of Arrhenius kinetics over streaming sensor intervals.<br>• Implemented real-time cold chain breach detection ($T > 14^\circ\text{C}$ threshold alerts) and dynamic remaining shelf-life estimation.<br>• Built streaming REST endpoints `/api/iot/telemetry/stream` and `/api/iot/active-shipments`. | • [`backend/app/schemas/iot.py`](file:///a:/HarvestIQ/backend/app/schemas/iot.py)<br>• [`backend/app/services/iot_telemetry_service.py`](file:///a:/HarvestIQ/backend/app/services/iot_telemetry_service.py)<br>• [`backend/app/api/routes_iot.py`](file:///a:/HarvestIQ/backend/app/api/routes_iot.py)<br>• [`backend/tests/test_iot_telemetry.py`](file:///a:/HarvestIQ/backend/tests/test_iot_telemetry.py) |

---

## 2. Review 2 System Architecture & Component Breakdown

```
HarvestIQ Phase 2 End-to-End System Architecture (70% Milestone):

┌────────────────────────────────────────────────────────────────────────────────────────┐
│                         Presentation & Client Layer (React 18 + TS)                    │
│   • Bilingual English/Tamil Dashboard      • Interactive Tornado Sensitivity Engine   │
│   • Multi-Mandi Route Arbitrage Viewer     • Live In-Transit IoT Telemetry Visualizer  │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ HTTP REST / WebSocket Bridge
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│                             FastAPI API Gateway (Port 8000)                             │
│   /api/analyze  •  /api/baseline-compare  •  /api/routing/*  •  /api/iot/*  •  /health │
└───────┬───────────────────────────┬───────────────────────────┬────────────────────────┘
        │                           │                           │
┌───────▼─────────────────┐ ┌───────▼─────────────────┐ ┌───────▼────────────────────────┐
│  Phase 1 Analytics Core │ │  Phase 2 Routing Engine │ │  Phase 2 Live IoT Telemetry    │
│  • Arrhenius Kinetics   │ │  • OSRM Road Distance   │ │  • MQTT / Webhook Ingestion    │
│  • EFV Accounting       │ │  • Winding Topography   │ │  • Numerical Arrhenius Integral│
│  • Seeded Monte Carlo   │ │  • Delay LogNormal Dist │ │  • Cold-Chain Breach Detector  │
│  • Sensitivity Tornado  │ │  • Breakdown Shock Sim  │ │  • Real-Time Shelf-Life Calc   │
│  • Reliability Scoring  │ │  • Net EFV Arbitrage    │ │  • Anomaly & Heatwave Alerts   │
└───────┬─────────────────┘ └───────┬─────────────────┘ └───────┬────────────────────────┘
        │                           │                           │
┌───────▼───────────────────────────▼───────────────────────────▼────────────────────────┐
│                   Data Persistence, Continuous Ingestion & CI/CD                       │
│  • SQLite Audit Trail Ledger               • 90-Day Rolling Agmarknet Time-Series      │
│  • Multi-Stage Docker Containerization     • GitHub Actions Automated Test Pipeline    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Module Breakdown & New Components Created in Phase 2

| Module / Service | File Path | Phase | Key Responsibilities & Implementations |
|---|---|---|---|
| **Multi-Mandi Routing Engine** | [`backend/app/services/routing_service.py`](file:///a:/HarvestIQ/backend/app/services/routing_service.py) | **Phase 2** | Integrates OSRM driving routes with empirical road winding factors ($1.28 \times d_{\text{haversine}}$); computes road transit tariffs, APMC cess rates, and Net EFV arbitrage across 7 major South Indian agricultural mandis. |
| **Transit Breakdown Variance in Monte Carlo** | [`backend/app/services/monte_carlo.py`](file:///a:/HarvestIQ/backend/app/services/monte_carlo.py) | **Phase 2** | Samples stochastic transit hours from log-normal road congestion distribution; incorporates Bernoulli vehicle breakdown shocks ($p=4\%$) adding $3.5\text{--}8.5\text{h}$ unexpected thermal exposure. |
| **Real-Time IoT Telemetry Streamer** | [`backend/app/services/iot_telemetry_service.py`](file:///a:/HarvestIQ/backend/app/services/iot_telemetry_service.py) | **Phase 2** | Ingests live telemetry packets (GPS, $T, RH$, shock G-force); evaluates numerical time-slice integral of Arrhenius decay; detects cold chain refrigeration failure and computes remaining shelf-life. |
| **Continuous Agmarknet Time-Series Service** | [`backend/app/services/agmarknet_service.py`](file:///a:/HarvestIQ/backend/app/services/agmarknet_service.py) | **Phase 2** | Maintains 90-day rolling daily modal price time series; calculates dynamic annualized volatility ($\sigma_{\text{dyn}}$) and 7-day vs 30-day moving averages for trend classification. |
| **Routing & IoT API Controllers** | [`backend/app/api/routes_routing.py`](file:///a:/HarvestIQ/backend/app/api/routes_routing.py)<br>[`backend/app/api/routes_iot.py`](file:///a:/HarvestIQ/backend/app/api/routes_iot.py) | **Phase 2** | Exposes REST endpoints for `/api/routing/multi-mandi-compare`, `/api/iot/telemetry/stream`, `/api/iot/shipments/{lot_id}`, and `/api/iot/active-shipments`. |
| **Docker Multi-Stage Configurations** | [`backend/Dockerfile`](file:///a:/HarvestIQ/backend/Dockerfile)<br>[`frontend/Dockerfile`](file:///a:/HarvestIQ/frontend/Dockerfile)<br>[`docker-compose.yml`](file:///a:/HarvestIQ/docker-compose.yml) | **Phase 2** | Multi-stage builder/runner images with non-root security, Nginx SPA reverse proxying, health checks, and single-command local/staging deployment. |
| **GitHub Actions CI/CD Pipeline** | [`.github/workflows/ci.yml`](file:///a:/HarvestIQ/.github/workflows/ci.yml) | **Phase 2** | Continuous integration running unit/integration test matrices on Python 3.11 and 3.12, TypeScript frontend compilation, and automated Docker build verification. |
| **Core Kinetics & EFV Calculator** | [`backend/app/services/spoilage_model.py`](file:///a:/HarvestIQ/backend/app/services/spoilage_model.py)<br>[`backend/app/services/efv_calculator.py`](file:///a:/HarvestIQ/backend/app/services/efv_calculator.py) | Phase 1 | Temperature-adjusted Arrhenius decay ($Q_{10}=2.15$), strict zero double-counting EFV financial model with mechanical damage salvage recovery ($\gamma=0.40$). |

---

## 3. Mathematical & Algorithmic Formulations (Phase 2 Additions)

### A. Real-Time Dynamic Numerical Integral of Spoilage Kinetics
For streaming IoT telemetry loggers transmitting non-uniform time-series packets $\{(t_0, T_0, RH_0), (t_1, T_1, RH_1), \dots, (t_M, T_M, RH_M)\}$, the cumulative biological degradation is computed via numerical Riemann integration over discrete time intervals $\Delta t_i = t_i - t_{i-1}$:

$$k_{\text{eff}}(T_i, RH_i) = k_0 \times Q_{10}^{\frac{T_i - T_{\text{ref}}}{10}} \times \left(1 + \beta_{\text{RH}} \frac{\max(0, RH_i - RH_{\text{opt}})}{100}\right) \times M_{\text{stage}}$$

$$S_{\text{accumulated}}(t_M) = 1 - \exp\left( - \sum_{i=1}^{M} k_{\text{eff}}(T_i, RH_i) \cdot \Delta t_i \right)$$

### B. Stochastic Transit Delay & Vehicle Breakdown Simulation
Inside the Monte Carlo engine, transit exposure time $t_{\text{transit}}$ is modeled as a compound stochastic variable:

$$t_{\text{transit}} = t_{\text{base}} \times e^{\mathcal{N}(0, \sigma_{\text{delay}}^2)} + B \cdot U(t_{\text{min\_breakdown}}, t_{\text{max\_breakdown}})$$

Where:
- $t_{\text{base}}$ is the estimated OSRM travel duration.
- $e^{\mathcal{N}(0, 0.18^2)}$ captures right-skewed road traffic bottlenecks and toll queue variances without generating unphysical negative transit times.
- $B \sim \text{Bernoulli}(p_{\text{breakdown}})$ is a shock variable with $p_{\text{breakdown}} = 0.02 + 0.005 \times \frac{d_{\text{km}}}{100}$.
- $U(3.5, 8.5)$ represents the random repair/towing duration in hours if a breakdown occurs.

### C. Multi-Mandi Economic Arbitrage Formulation
For each prospective destination mandi $j \in \{1, \dots, K\}$, the Net Expected Farmer Value is computed by subtracting location-specific road logistics costs, APMC market cess fees, and transit decay loss:

$$\text{Net EFV}_j = \underbrace{\left( Q \cdot (1 - S_j) \cdot (1 - D_{\text{vibe}, j}) \cdot P_j \right)}_{\text{Sound Produce Revenue}} + \underbrace{\left( Q \cdot (1 - S_j) \cdot D_{\text{vibe}, j} \cdot \gamma P_j \right)}_{\text{Salvage Revenue}} - \underbrace{\left( \frac{Q}{1000} \cdot d_j \cdot C_{\text{freight}} \right)}_{\text{Freight Logistics Cost}} - \underbrace{\left( \text{GrossRev}_j \cdot \tau_{\text{cess}, j} \right)}_{\text{APMC Market Cess}}$$

$$\text{Arbitrage Gain} = \max_{j} \left( \text{Net EFV}_j \right) - \text{Net EFV}_{\text{local\_baseline}}$$

### D. Dynamic Historical Volatility ($\sigma_{\text{dyn}}$)
Computed continuously over rolling 30-day logarithmic returns from daily APMC modal prices:

$$r_t = \ln\left(\frac{P_t}{P_{t-1}}\right), \quad \sigma_{\text{daily}} = \sqrt{\frac{1}{N-1} \sum_{t=1}^N (r_t - \bar{r})^2}, \quad \sigma_{\text{annualized}} = \sigma_{\text{daily}} \times \sqrt{365}$$

---

## 4. Verifiable Test Suite (30/30 Tests Passing — 100% Pass Rate)

The automated test suite has been expanded from 20 to **30 comprehensive unit, integration, and invariant tests**, covering all Phase 1 foundations and Phase 2 additions:

```
Ran 30 tests in 17.300s
STATUS: ALL 30 TESTS PASSING (OK)
```

| # | Test Module & Name | Invariant / Property Verified | Status |
|---|---|---|---|
| **Phase 2 Tests (New)** | | | |
| 1 | `test_routing_engine.test_haversine_distance_calculation` | Geodesic coordinate calculation matches known geographic benchmarks ($\pm 5\%$). | **PASS ✅** |
| 2 | `test_routing_engine.test_multi_mandi_compare_service` | Evaluates 7 mandis, correctly identifies optimal arbitrage market with positive Net EFV. | **PASS ✅** |
| 3 | `test_routing_engine.test_transit_breakdown_scenario_increases_delay` | Enabling breakdown shocks strictly increases 95th percentile transit spoilage risk. | **PASS ✅** |
| 4 | `test_routing_engine.test_routing_api_endpoints` | `GET /api/routing/mandis` and `POST /api/routing/multi-mandi-compare` return HTTP 200 with schema. | **PASS ✅** |
| 5 | `test_iot_telemetry.test_single_packet_ingestion` | Ingests single telemetry reading, initializes device tracker, and computes remaining shelf-life. | **PASS ✅** |
| 6 | `test_iot_telemetry.test_dynamic_arrhenius_integration_over_time` | Ingestion of elevated temperature stream monotonically increases cumulative decay. | **PASS ✅** |
| 7 | `test_iot_telemetry.test_cold_chain_breach_detection` | Prolonged thermal abuse ($>14^\circ\text{C}$ for $>20\text{min}$) triggers `cold_chain_breached` and alert. | **PASS ✅** |
| 8 | `test_iot_telemetry.test_iot_api_endpoints` | `GET /api/iot/active-shipments` and `GET /api/iot/shipments/{lot_id}` return live health logs. | **PASS ✅** |
| 9 | `test_agmarknet_service.test_price_series_retrieval` | Ingests and returns 30-day valid daily modal price series for target mandi. | **PASS ✅** |
| 10 | `test_agmarknet_service.test_dynamic_volatility_calculation` | Computes daily $\sigma$, annualized volatility, 7d/30d moving averages, and trend direction. | **PASS ✅** |
| **Phase 1 Tests (Maintained)** | | | |
| 11 | `test_spoilage_model.test_temperature_monotonicity` | Higher ambient temperature strictly accelerates degradation ($\partial S / \partial T > 0$). | **PASS ✅** |
| 12 | `test_spoilage_model.test_exposure_time_monotonicity` | Longer exposure time strictly increases cumulative spoilage ($\partial S / \partial t > 0$). | **PASS ✅** |
| 13 | `test_spoilage_model.test_maturity_acceleration` | Overripe fruit spoils significantly faster than optimal or immature fruit. | **PASS ✅** |
| 14 | `test_spoilage_model.test_bounds` | Spoilage rate is strictly bounded within $[0.0, 1.0]$ across all extreme boundary conditions. | **PASS ✅** |
| 15 | `test_efv_calculator.test_no_double_counting_spoilage` | Spoilage only destroys physical volume; zero double-deduction in revenue calculations. | **PASS ✅** |
| 16 | `test_efv_calculator.test_salvage_value_contribution` | Mechanically bruised produce yields salvage processing value ($\gamma = 0.40$). | **PASS ✅** |
| 17 | `test_monte_carlo.test_interval_ordering` | Percentile hierarchy strictly holds: $P_{05} \le \text{Median} \le P_{95}$. | **PASS ✅** |
| 18 | `test_monte_carlo.test_seed_reproducibility` | Identical random seed (`seed=42`) outputs bitwise identical statistical figures. | **PASS ✅** |
| 19 | `test_missing_data.test_edge_case_1_missing_weather` | Missing weather triggers 10-year climatology fallback with $-15\%$ reliability penalty. | **PASS ✅** |
| 20 | `test_missing_data.test_edge_case_2_missing_price` | Missing spot price triggers 7-day APMC snapshot with $-20\%$ reliability penalty. | **PASS ✅** |
| 21 | `test_missing_data.test_edge_case_3_invalid_negative_quantity` | Invalid negative quantity triggers strict HTTP 422 Unprocessable Entity error. | **PASS ✅** |
| 22 | `test_missing_data.test_edge_case_4_extreme_spoilage_forces_reject` | 48°C heatwave + overripe fruit + transit delay triggers defensive `REJECT`. | **PASS ✅** |
| 23 | `test_missing_data.test_edge_case_5_market_crash_shock` | Price crash below harvest and logistics cost triggers `REJECT` due to negative margin. | **PASS ✅** |
| 24 | `test_missing_data.test_edge_case_6_external_api_failure` | External network outage seamlessly degrades to cached demo data tier. | **PASS ✅** |
| 25 | `test_baseline.test_baseline_discrepancy_identification` | Successfully detects lots where traditional buyers purchase rotting produce. | **PASS ✅** |
| 26 | `test_baseline.test_baseline_api_endpoint` | `POST /api/baseline-compare` returns complete 10-lot benchmark results. | **PASS ✅** |
| 27 | `test_api_endpoints.test_health_check` | Server health check `GET /api/health` returns status `healthy` with Phase 2 module flags. | **PASS ✅** |
| 28 | `test_api_endpoints.test_get_crops_and_regions` | Reference data endpoints return supported crops and agro-climatic zones. | **PASS ✅** |
| 29 | `test_api_endpoints.test_full_analyze_pipeline` | `POST /api/analyze` end-to-end simulation returns valid recommendation schema. | **PASS ✅** |
| 30 | `test_api_endpoints.test_history_logging` | Simulation executions persist to SQLite with unique run ID, seed, and timestamps. | **PASS ✅** |

---

## 5. Summary of Key Git Commits & Provenance

```
* 9bfd258 Update: Enhance and verify Parameter Provenance Registry in Review 1 Report
* afcbbf3 HarvestIQ: Review 1 Milestone Submission (35% Completed)
* [Review 2 Additions]:
  - Feat: Dynamic OSRM Multi-Mandi Routing Engine with road winding curvature and APMC arbitrage
  - Feat: Vehicle breakdown scenarios & lognormal delay dispersion inside Monte Carlo simulation
  - Feat: Real-time IoT Telemetry streaming ingestion & dynamic Arrhenius numerical integrator
  - Feat: Automated 90-day Agmarknet time-series ingestion & dynamic volatility calculation
  - Infra: Multi-stage Dockerfiles (FastAPI backend + Nginx React frontend) & docker-compose
  - Infra: GitHub Actions CI/CD workflow testing Python 3.11/3.12 matrices and container builds
  - Tests: Expanded test suite from 20 to 30 tests (100% passing across all edge cases)
```

---

## 6. Final Phase Roadmap (Phase 3 — Remaining 30% Scope)

To achieve 100% completion for the Final Viva Defense:

```
[ Phase 1: Review 1 (35%) ] ──► [ Phase 2: Review 2 (70%) ] ──► [ Phase 3: Final Viva (100%) ]
        COMPLETED ✅                     COMPLETED ✅                      FINAL SCOPE ⏳
• Spoilage Kinetics Engine     • Dynamic OSRM Routing Engine   • Field Trials with Local FPOs
• Seeded Monte Carlo (N=1000)  • Breakdown Shock Modeling      • Offline PWA Mobile App
• Missing Data Resilience      • Real-Time IoT Telemetry       • Tamil Voice Guidance (Speech API)
• Bilingual Prototype UI       • Docker & GitHub Actions CI/CD • Examiner Defense Package
```

| Final Phase Task | Technical Implementation Plan | Target Milestone |
|---|---|---|
| **1. Empirical Field Calibration with FPOs** | Partner with a local packhouse/FPO in Coimbatore/Dindigul to calibrate transit vibration coefficient ($D_{\text{transit}}$) and excess humidity acceleration ($\beta_{\text{RH}}$) using physical logger recordings. | Phase 3 (Viva) |
| **2. Offline Progressive Web App (PWA)** | Implement Service Workers and WebAssembly client-side simulation for offline field use on Android mobile devices. | Phase 3 (Viva) |
| **3. Spoken Voice Guidance (Tamil/English)** | Integrate Web Speech API to provide audio synthesis of recommendations for low-literacy farmers. | Phase 3 (Viva) |
| **4. Viva Defense Deliverables** | Finalize formal architectural report, video walkthrough demo, and examiner presentation slide deck. | Phase 3 (Viva) |

---

## 7. Submission Verification Checklist

- [x] **Review 1 Evaluator Feedback Addressed:** All 3 recommendations (Docker CI/CD, OSRM transit delay variance, IoT telemetry schema) fully implemented and tested.
- [x] **Automated Test Suite:** **30/30 Passing Tests** (`python backend/tests/run_tests.py`).
- [x] **Production Frontend Build:** Compiled cleanly with zero errors (`npm run build`).
- [x] **Containerization:** Production multi-stage `Dockerfile` and `docker-compose.yml` configured.
- [x] **CI/CD Integration:** GitHub Actions workflow (`.github/workflows/ci.yml`) configured for automated multi-version Python testing and Docker builds.
- [x] **Cumulative Completion Status:** Declared at **70% cumulative completion** (35% Phase 2 scope).
- [x] **Public GitHub Repository:** Maintained in public mode.

**GitHub Repository Link:**  
`https://github.com/ABIRAJKUMAR/HarvestIQ` *(Public Mode)*
