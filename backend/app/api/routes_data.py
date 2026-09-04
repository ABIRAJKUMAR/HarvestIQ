"""
HarvestIQ - Reference Data & Metadata API Routes
Provides supported crops, regions, and data provenance registries.
"""

from fastapi import APIRouter
from app.config import SPOILAGE_PARAMETERS, DECISION_CONFIG, RELIABILITY_PENALTIES, settings

router = APIRouter(prefix="/api", tags=["Reference Data"])

@router.get("/crops")
def get_supported_crops():
    """Returns list of supported crops with baseline parameters and literature citations."""
    crops_data = []
    for crop_name, details in SPOILAGE_PARAMETERS["CROPS"].items():
        crops_data.append({
            "name": crop_name,
            "k0_base": details["k0"],
            "rh_opt_pct": details["rh_opt"],
            "volatility_sigma": details["daily_volatility_sigma"],
            "base_market_price_inr": details["base_market_price_per_kg"],
            "provenance_status": details["status"],
            "citation": details["citation"]
        })
    return {
        "supported_crops": crops_data,
        "maturity_stages": list(SPOILAGE_PARAMETERS["MATURITY_STAGE_MULTIPLIERS"].keys())
    }

@router.get("/regions")
def get_supported_regions():
    """Returns agricultural procurement hubs."""
    return {
        "regions": [
            {"id": "Dindigul_TN", "name": "Dindigul (Tamil Nadu)", "state": "Tamil Nadu", "lat": 10.3673, "lon": 77.9803},
            {"id": "Kolar_KA", "name": "Kolar (Karnataka)", "state": "Karnataka", "lat": 13.1367, "lon": 78.1291},
            {"id": "Nashik_MH", "name": "Nashik (Maharashtra)", "state": "Maharashtra", "lat": 19.9975, "lon": 73.7898}
        ]
    }

@router.get("/data-sources")
def get_data_sources():
    """Returns official registry of data provenance and model configuration."""
    return {
        "app_name": settings.APP_NAME,
        "model_version": settings.MODEL_VERSION,
        "parameter_version": settings.PARAMETER_VERSION,
        "parameters": SPOILAGE_PARAMETERS,
        "decision_thresholds": DECISION_CONFIG,
        "reliability_penalties": RELIABILITY_PENALTIES
    }
