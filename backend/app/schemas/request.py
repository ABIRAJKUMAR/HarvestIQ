"""
HarvestIQ - Pydantic Request Schemas
Validates user inputs with strict bounds and edge case guards.
"""

from typing import Optional, Literal
from pydantic import BaseModel, Field, field_validator

class AnalysisRequest(BaseModel):
    crop: str = Field(..., description="Crop name (e.g. Tomato, Onion, Potato, Mango)")
    maturity_stage: Literal["Immature", "Optimal", "Ripe", "Overripe"] = Field(
        "Optimal", description="Visual maturity grade of crop lot"
    )
    quantity_kg: float = Field(..., gt=0, description="Total lot weight in kilograms (must be positive)")
    region: str = Field("Dindigul_TN", description="Agricultural procurement location")
    
    # Optional weather inputs (if omitted, fetched from NASA POWER / Climatology)
    temperature_c: Optional[float] = Field(None, ge=-10.0, le=60.0, description="Ambient temperature in Celsius")
    relative_humidity_pct: Optional[float] = Field(None, ge=0.0, le=100.0, description="Ambient relative humidity (%)")
    
    # Optional price input (if omitted, fetched from Agmarknet / Mandi Snapshot)
    market_price_per_kg: Optional[float] = Field(None, gt=0.0, description="Benchmark spot price (INR/kg)")
    
    # Logistics and Holding Parameters
    storage_duration_days: float = Field(1.0, ge=0.0, le=30.0, description="Days stored in ambient/packhouse before processing")
    transport_duration_hours: float = Field(6.0, ge=0.0, le=72.0, description="Transit hours from farm/mandi to processing unit")
    transit_distance_km: float = Field(100.0, ge=0.0, le=2000.0, description="Transit distance in kilometers")
    
    # Simulation and Reproducibility Controls
    simulation_seed: Optional[int] = Field(42, description="Random seed for reproducible Monte Carlo simulation")
    mc_iterations: Optional[int] = Field(1000, ge=100, le=10000, description="Number of stochastic simulation iterations")
    force_data_source: Optional[Literal["live", "cached", "demo"]] = Field(
        None, description="Force fallback tier for live review testing"
    )

    @field_validator("crop")
    @classmethod
    def validate_crop(cls, v: str) -> str:
        valid_crops = ["Tomato", "Onion", "Potato", "Mango"]
        capitalized = v.capitalize()
        if capitalized not in valid_crops:
            raise ValueError(f"Crop '{v}' not supported. Must be one of: {', '.join(valid_crops)}")
        return capitalized

class BaselineCompareRequest(BaseModel):
    crop: str = Field("Tomato")
    sample_lots_count: int = Field(10, ge=3, le=50, description="Number of representative lots to benchmark")
    fixed_price_threshold_inr: float = Field(22.0, gt=0, description="Baseline fixed procurement price threshold")
    simulation_seed: Optional[int] = Field(42)
