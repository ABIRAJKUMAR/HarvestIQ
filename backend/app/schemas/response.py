"""
HarvestIQ - Pydantic Response Schemas
Structured, fully-typed output contracts including outcome intervals, recommendation reliability, and data provenance.
"""

from typing import List, Optional, Literal, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class OutcomeInterval(BaseModel):
    mean: float = Field(..., description="Expected simulated farmer value (INR)")
    median: float = Field(..., description="50th percentile outcome (INR)")
    p05: float = Field(..., description="5th percentile conservative downside (INR)")
    p95: float = Field(..., description="95th percentile upside outcome (INR)")
    prob_loss: float = Field(..., description="Probability of negative net farmer value (0.0 to 1.0)")

class SpoilageMetrics(BaseModel):
    mean_rate: float = Field(..., description="Expected spoilage rate fraction (0.0 to 1.0)")
    p95_rate: float = Field(..., description="95th percentile extreme spoilage rate fraction")
    effective_k: float = Field(..., description="Effective degradation rate constant (1/day)")
    estimated_shelf_life_days: float = Field(..., description="Estimated remaining ambient shelf life (days)")

class HarvestTimingOption(BaseModel):
    timing_label: Literal["Day 0 (Immediate)", "Day 3 (Delayed)", "Day 7 (Extended)"]
    delay_days: int
    efv_mean: float
    efv_p05: float
    efv_p95: float
    spoilage_mean: float
    prob_loss: float
    recommendation: str

class MarketOptionComparison(BaseModel):
    option_name: Literal["Direct Processing Unit", "Local Mandi / Deferred Sale"]
    efv_mean: float
    net_margin_inr: float
    advantage_pct: float
    recommendation_note: str

class ScenarioResult(BaseModel):
    scenario_name: Literal["Normal Operating Conditions", "High Spoilage Risk (Heat/Delay)", "Market Risk (Price Crash)"]
    decision: str
    efv_mean: float
    spoilage_mean: float
    key_vulnerability: str

class SensitivityFactor(BaseModel):
    parameter_name: str
    base_value: float
    low_efv: float
    high_efv: float
    swing_inr: float
    rank: int

class TippingPoint(BaseModel):
    parameter_name: str
    current_value: float
    unit: str
    critical_threshold: float
    delta_to_flip: float
    target_decision: str
    explanation: str

class DataProvenanceItem(BaseModel):
    field: str
    source_name: str
    data_status: Literal["REAL_DATA", "LITERATURE_DERIVED", "ASSUMPTION", "SYNTHETIC_DEMO"]
    confidence_penalty: float
    citation_or_note: str

class AnalysisResponse(BaseModel):
    id: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Core Decision
    decision: Literal["BUY_NOW", "WAIT", "REJECT", "CHANGE_OPTION"]
    decision_badge: str
    recommendation_reliability: float = Field(..., ge=0.0, le=100.0, description="Reliability score (0-100%)")
    
    # Uncertainty & Spoilage Metrics
    outcome_interval: OutcomeInterval
    spoilage_metrics: SpoilageMetrics
    
    # Scenario, Timing & Market Comparisons
    timing_comparisons: List[HarvestTimingOption]
    market_options: List[MarketOptionComparison]
    scenario_simulations: List[ScenarioResult]
    
    # Explainability & Sensitivity
    sensitivity_tornado: List[SensitivityFactor]
    tipping_points: List[TippingPoint]
    explanation: str
    
    # Data Provenance & Traceability
    data_source: Literal["live", "cached", "demo"]
    data_provenance: List[DataProvenanceItem]
    missing_fields: List[str]
    
    # Reproducibility Metadata
    simulation_seed: Optional[int]
    model_version: str
    parameter_version: str
