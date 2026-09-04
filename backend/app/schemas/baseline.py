"""
HarvestIQ - Baseline Comparison Schemas
Defines comparison data structures between fixed-price heuristic baseline and HarvestIQ.
"""

from typing import List, Literal, Optional
from pydantic import BaseModel, Field

class BaselineCompareRequest(BaseModel):
    crop: str = Field("Tomato", description="Crop commodity name")
    sample_lots_count: int = Field(10, ge=3, le=50, description="Number of representative lots to benchmark")
    fixed_price_threshold_inr: float = Field(22.0, gt=0, description="Baseline fixed procurement price threshold")
    simulation_seed: Optional[int] = Field(42, description="Random seed for deterministic comparison")

class BaselineDiscrepancyItem(BaseModel):
    lot_id: int
    crop: str
    maturity_stage: str
    temperature_c: float
    storage_days: float
    market_price_inr: float
    baseline_decision: Literal["BUY", "REJECT"]
    harvestiq_decision: Literal["BUY_NOW", "WAIT", "REJECT", "CHANGE_OPTION"]
    is_discrepant: bool
    spoilage_rate_pct: float
    realized_loss_baseline_inr: float
    economic_value_saved_inr: float
    discrepancy_reason: str

class BaselineCompareResponse(BaseModel):
    total_lots_evaluated: int
    discrepancy_count: int
    discrepancy_rate_pct: float
    total_baseline_spoilage_loss_inr: float
    total_harvestiq_value_saved_inr: float
    lots: List[BaselineDiscrepancyItem]
    methodology_summary: str
