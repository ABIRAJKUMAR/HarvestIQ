"""
HarvestIQ - Central Configuration & Parameter Registry
All numerical parameters, thresholds, and operational assumptions are centralized here.

PARAMETER PROVENANCE CLASSIFICATION:
1. Literature-Backed: Verified from published postharvest literature (UC Davis, USDA, FAO, ICAR).
2. Assumed - Needs Calibration: Initial engineering design assumptions.
3. Calibrated from Data: Fitted against prototype test curves.
4. User-Configurable: Dynamically adjustable in simulation requests.
"""

from pathlib import Path
from typing import Dict, Any
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

class Settings(BaseSettings):
    APP_NAME: str = "HarvestIQ - Risk-Aware Harvest Timing & Market Option Simulator"
    MODEL_VERSION: str = "1.0.0"
    PARAMETER_VERSION: str = "1.0.0"
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/harvest_iq.db"
    
    # External API Configuration
    NASA_POWER_BASE_URL: str = "https://power.larc.nasa.gov/api/temporal/daily/point"
    AGMARKNET_DATA_URL: str = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
    API_TIMEOUT_SECONDS: int = 5
    
    # Local Fallback Data Files
    WEATHER_CLIMATOLOGY_FILE: Path = DATA_DIR / "regional_weather_climatology.json"
    MANDI_PRICES_FILE: Path = DATA_DIR / "mandi_price_snapshots.json"
    SPOILAGE_CALIBRATION_FILE: Path = DATA_DIR / "spoilage_calibration_data.csv"
    
    # Monte Carlo Defaults
    DEFAULT_MONTE_CARLO_ITERATIONS: int = 1000
    DEFAULT_SIMULATION_SEED: int = 42

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# ==============================================================================
# 1. SPOILAGE KINETICS PARAMETERS (Explicit Provenance)
# ==============================================================================
# Model formula: S(t) = 1 - exp(- k_eff * (t_storage + t_transit))
# k_eff = k0 * Q10^((T - T_ref)/10) * (1 + beta_RH * max(0, RH - RH_opt)/100) * M_stage

SPOILAGE_PARAMETERS: Dict[str, Any] = {
    "REFERENCE_TEMPERATURE_C": {
        "value": 20.0,
        "unit": "degC",
        "status": "LITERATURE_BACKED",
        "citation": "FAO Postharvest Assessment Series; Wills et al. (2007)",
        "calibration_needed": False
    },
    "Q10_RESPIRATION_COEFFICIENT": {
        "value": 2.15,
        "range": (2.0, 2.5),
        "unit": "dimensionless",
        "status": "LITERATURE_BACKED",
        "citation": "Kader, A. A. (2002), Postharvest Technology of Horticultural Crops, UC Davis",
        "calibration_needed": False
    },
    "EXCESS_HUMIDITY_COEFFICIENT_BETA": {
        "value": 0.50,
        "unit": "dimensionless",
        "status": "ASSUMED — NEEDS CALIBRATION",
        "citation": "Design assumption for moisture-induced fungal/bacterial decay acceleration",
        "calibration_needed": True
    },
    "CROPS": {
        "Tomato": {
            "k0": 0.082,  # 1/day (~7-10 day shelf life at 20C)
            "rh_opt": 90.0,
            "status": "LITERATURE_BACKED",
            "citation": "USDA Agricultural Handbook No. 66",
            "daily_volatility_sigma": 0.18,
            "base_market_price_per_kg": 24.50
        },
        "Onion": {
            "k0": 0.014,  # 1/day (~60-90 day shelf life under curing at 20C, 65% RH)
            "rh_opt": 65.0,
            "status": "LITERATURE_BACKED",
            "citation": "ICAR-Directorate of Onion and Garlic Research, India",
            "daily_volatility_sigma": 0.12,
            "base_market_price_per_kg": 28.00
        },
        "Potato": {
            "k0": 0.011,  # 1/day (~90-120 day dormancy under shade)
            "rh_opt": 85.0,
            "status": "LITERATURE_BACKED",
            "citation": "CPRI Shimla Postharvest Guidelines",
            "daily_volatility_sigma": 0.08,
            "base_market_price_per_kg": 18.50
        },
        "Mango": {
            "k0": 0.095,  # 1/day (~5-8 day ripening at 20C)
            "rh_opt": 85.0,
            "status": "LITERATURE_BACKED",
            "citation": "FAO Agricultural Services Bulletin 151",
            "daily_volatility_sigma": 0.22,
            "base_market_price_per_kg": 42.00
        }
    },
    "MATURITY_STAGE_MULTIPLIERS": {
        "Immature": {"multiplier": 0.70, "status": "LITERATURE_GUIDED", "citation": "Lower ethylene production (Kader 2002)"},
        "Optimal": {"multiplier": 1.00, "status": "LITERATURE_BACKED", "citation": "Commercial harvest standard baseline"},
        "Ripe": {"multiplier": 1.45, "status": "LITERATURE_GUIDED", "citation": "Accelerated respiration and softening (Kader 2002)"},
        "Overripe": {"multiplier": 2.30, "status": "ASSUMED — NEEDS CALIBRATION", "citation": "Senescence and rapid cell wall breakdown"}
    }
}

# ==============================================================================
# 2. LOGISTICS & DAMAGE ASSUMPTIONS (Explicitly Classified)
# ==============================================================================
LOGISTICS_CONFIG: Dict[str, Any] = {
    "TRANSIT_VIBRATION_DAMAGE_RATE_PER_100KM": 0.025,  # 2.5% loss per 100km (Assumed - Needs Calibration)
    "HANDLING_SHOCK_LOSS_RATE": 0.020,                 # 2.0% loss during loading/unloading (Assumed)
    "FREIGHT_COST_PER_TONNE_KM_INR": 12.00,            # ₹12/tonne-km (Commercial benchmark)
    "COLD_STORAGE_COST_PER_KG_DAY_INR": 0.06,          # ₹1.80/kg/month ~ ₹0.06/kg/day (NHB benchmark)
    "SALVAGE_VALUE_DISCOUNT_FACTOR": 0.40              # Damaged produce recovers 40% of market value
}

# ==============================================================================
# 3. DECISION ENGINE THRESHOLDS (Initial Design Assumptions)
# ==============================================================================
DECISION_CONFIG: Dict[str, Any] = {
    "EXTREME_SPOILAGE_P95_THRESHOLD": 0.85,      # If 95th percentile spoilage > 85% -> REJECT
    "MEAN_SPOILAGE_REJECT_THRESHOLD": 0.60,      # If mean spoilage rate > 60% -> REJECT
    "MIN_PROFIT_HURDLE_INR": 500.0,              # Minimum positive EFV required to avoid REJECT
    "WAIT_MIN_ADVANTAGE_INR": 1200.0,            # Delayed EFV must beat Day 0 by at least ₹1200
    "WAIT_MAX_PROB_LOSS": 0.15,                  # Do not recommend WAIT if probability of loss > 15%
    "WAIT_MAX_SPOILAGE_P95": 0.35,               # Do not recommend WAIT if 95th percentile spoilage > 35%
    "CHANGE_OPTION_MIN_ADVANTAGE_PCT": 0.12,     # Mandi option must beat Direct Processing by > 12%
    "MIN_RELIABILITY_FOR_STRONG_REC": 60.0       # If reliability < 60%, append CAUTION flag
}

# ==============================================================================
# 4. RECOMMENDATION RELIABILITY PENALTIES (Documented Policy Deductions)
# ==============================================================================
RELIABILITY_PENALTIES: Dict[str, float] = {
    "MISSING_LIVE_WEATHER": 15.0,    # Deduct 15% when using regional monthly climatology
    "MISSING_LIVE_MARKET": 20.0,     # Deduct 20% when using cached mandi price snapshot
    "ESTIMATED_MATURITY": 15.0,      # Deduct 15% if maturity stage is unverified
    "ESTIMATED_LOGISTICS": 10.0,     # Deduct 10% if transit/storage duration is guessed
    "HIGH_SPREAD_PENALTY": 10.0      # Deduct 10% if outcome distribution spread is very wide
}
