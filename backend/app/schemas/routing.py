"""
HarvestIQ - Multi-Mandi Routing & Logistics Schemas
Defines request and response structures for OSRM-based dynamic route optimization,
transit delay variance, and market price arbitrage.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class MandiLocation(BaseModel):
    mandi_id: str = Field(..., description="Unique identifier for the wholesale APMC Mandi")
    name: str = Field(..., description="Name of the Mandi")
    state: str = Field(..., description="State where Mandi is located")
    latitude: float = Field(..., description="Mandi latitude")
    longitude: float = Field(..., description="Mandi longitude")
    current_modal_price_per_kg: float = Field(..., description="Current live or modal market price (INR/kg)")
    daily_price_volatility_sigma: float = Field(..., description="Historical daily volatility coefficient")
    market_cess_pct: float = Field(default=1.5, description="APMC market cess / trader fee percentage")

class FarmOrigin(BaseModel):
    name: str = Field(default="Farm Gate Origin", description="Origin name or village")
    latitude: float = Field(..., description="Farm latitude")
    longitude: float = Field(..., description="Farm longitude")
    region: str = Field(default="Coimbatore Rural", description="Agro-climatic region")

class MultiMandiCompareRequest(BaseModel):
    farm_origin: FarmOrigin
    crop: str = Field(default="Tomato", description="Crop name (Tomato, Onion, Potato, Mango)")
    maturity_stage: str = Field(default="Optimal", description="Maturity stage (Immature, Optimal, Ripe, Overripe)")
    quantity_kg: float = Field(default=5000.0, ge=100.0, description="Harvest batch volume in kg")
    temperature_c: float = Field(default=32.0, ge=5.0, le=55.0, description="Ambient transit temperature")
    relative_humidity_pct: float = Field(default=75.0, ge=10.0, le=100.0, description="Ambient relative humidity")
    is_refrigerated_transit: bool = Field(default=False, description="Whether refrigerated reefer truck is used")
    include_transit_breakdown_risk: bool = Field(default=True, description="Account for road breakdown scenarios in Monte Carlo")
    road_congestion_factor: float = Field(default=1.15, ge=0.8, le=2.5, description="Traffic congestion multiplier")
    simulation_seed: Optional[int] = Field(default=42, description="Random seed for reproducible Monte Carlo runs")

class MandiRouteResult(BaseModel):
    mandi_id: str
    mandi_name: str
    state: str
    distance_km: float
    estimated_transit_hours: float
    expected_spoilage_pct: float
    expected_spoilage_p95_pct: float
    breakdown_risk_pct: float
    gross_market_revenue_inr: float
    logistics_cost_inr: float
    market_cess_inr: float
    salvage_revenue_inr: float
    net_expected_farmer_value_inr: float
    efv_p05_inr: float
    efv_p95_inr: float
    arbitrage_spread_vs_local_inr: float
    is_optimal_market: bool
    route_risk_tier: str
    recommendation_note: str

class MultiMandiCompareResponse(BaseModel):
    crop: str
    quantity_kg: float
    farm_origin: FarmOrigin
    optimal_mandi_id: str
    optimal_mandi_name: str
    max_net_efv_inr: float
    local_baseline_efv_inr: float
    arbitrage_gain_inr: float
    evaluated_mandis: List[MandiRouteResult]
    routing_engine: str
    timestamp: str
