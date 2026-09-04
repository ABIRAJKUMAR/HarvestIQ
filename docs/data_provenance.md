# Data Provenance & Attribution Matrix

This document lists every external data source, dataset, and assumption used across the HarvestIQ simulator.

---

## 1. Data Provenance Summary Table

| Field Name | Source / Provider | Dataset Identifier | Data Classification | Update Frequency | Offline Fallback Mechanism |
|---|---|---|---|---|---|
| **Ambient Temperature ($T$) & Relative Humidity ($RH$)** | NASA POWER API (Prediction of Worldwide Energy Resources) | Hourly/Daily Agroclimatology (T2M, RH2M) | **REAL DATA** (Satellite / Modern-Era Retrospective Analysis) | Live on request (cached in-memory) | Level 2: 10-Year Regional Monthly Climatology (`regional_weather_climatology.json`) |
| **Wholesale Modal Spot Prices** | Agmarknet / Ministry of Agriculture (data.gov.in) | APMC Daily Market Arrivals & Modal Price Bulletins | **REAL DATA** (Benchmark snapshot) | Daily APMC publish | Level 2: 7-Day APMC Modal Snapshot (`mandi_price_snapshots.json`) |
| **Produce Respiration Quotient ($Q_{10}$)** | UC Davis Postharvest Technology Center | Kader, A. A. (2002), ANR Pub 3311 | **LITERATURE-DERIVED** | Static published constant | Built-in constant ($Q_{10} = 2.15$) |
| **Base Degradation Rate Constants ($k_0$)** | USDA Handbook 66 & ICAR-DOGR | Commercial Storage of Horticultural Crops | **LITERATURE-DERIVED** | Static published constants | Built-in constants in `app/config.py` |
| **Excess Humidity Acceleration ($\beta_{\text{RH}}$)** | HarvestIQ Initial Design Parameter | Moisture Decay Multiplier | **ASSUMED — NEEDS CALIBRATION** | Static design assumption | Built-in constant ($\beta_{\text{RH}} = 0.50$) |
| **Transit Vibration Bruise Rate ($D_{\text{transit}}$)** | CIPHET-ICAR Survey Range Synthesis | Post-Harvest Mechanical Loss Range | **ASSUMED — NEEDS CALIBRATION** | Static design assumption | Built-in constant ($2.5\% / 100\text{km}$) |
| **Handling Shock Loss ($D_{\text{handling}}$)** | Packhouse Observation Heuristic | Loading / Unloading Impact Injury | **ASSUMED — NEEDS CALIBRATION** | Static design assumption | Built-in constant ($2.0\%$) |
| **Synthetic Shelf-Life Calibration Set** | Deterministic Code Generator | `spoilage_calibration_data.csv` | **SYNTHETIC / DEMO DATA** | Development only | Stored with explicit disclaimer header |

---

## 2. Mandatory Disclaimer Headers

Every synthetic/demo dataset in the repository begins with the following header:

```csv
# DATA STATUS: SYNTHETIC / DEMO DATA
# NOT VERIFIED FIELD DATA
# USED FOR PROTOTYPE TESTING / MODEL DEVELOPMENT
```
