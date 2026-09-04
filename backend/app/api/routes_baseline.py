"""
HarvestIQ - Baseline Comparison API Routes (/api/baseline-compare)
Executes side-by-side evaluation between the fixed-price heuristic baseline and HarvestIQ.
"""

from fastapi import APIRouter
from app.schemas.baseline import BaselineCompareRequest, BaselineCompareResponse
from app.services.baseline_comparator import baseline_comparator

router = APIRouter(prefix="/api", tags=["Baseline Evaluation"])

@router.post("/baseline-compare", response_model=BaselineCompareResponse)
def compare_with_baseline(request: BaselineCompareRequest):
    """
    Evaluates a sample batch of procurement lots under both the Fixed-Price Heuristic Baseline
    and the proposed HarvestIQ Simulator, highlighting costly baseline blindspots.
    """
    return baseline_comparator.run_comparison(
        crop=request.crop,
        sample_lots_count=request.sample_lots_count,
        fixed_price_threshold_inr=request.fixed_price_threshold_inr,
        simulation_seed=request.simulation_seed or 42
    )
