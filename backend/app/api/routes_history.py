"""
HarvestIQ - History & Audit API Routes
Retrieves previous simulation runs, decisions, outcome intervals, and provenance records.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.database import get_db
from app.models.analysis_record import AnalysisRecord

router = APIRouter(prefix="/api/history", tags=["History"])

@router.get("")
def get_history(limit: int = 50, db: Session = Depends(get_db)):
    """Fetches list of historical simulation records ordered by timestamp descending."""
    records = db.query(AnalysisRecord).order_by(AnalysisRecord.created_at.desc()).limit(limit).all()
    return [
        {
            "id": r.id,
            "created_at": r.created_at,
            "crop": r.crop,
            "maturity_stage": r.maturity_stage,
            "quantity_kg": r.quantity_kg,
            "region": r.region,
            "temperature_c": r.temperature_c,
            "market_price_per_kg": r.market_price_per_kg,
            "decision": r.decision,
            "recommendation_reliability": r.recommendation_reliability,
            "efv_mean": r.efv_mean,
            "efv_p05": r.efv_p05,
            "efv_p95": r.efv_p95,
            "spoilage_mean": r.spoilage_mean,
            "data_source": r.data_source,
            "simulation_seed": r.simulation_seed
        }
        for r in records
    ]

@router.get("/{record_id}")
def get_history_detail(record_id: int, db: Session = Depends(get_db)):
    """Fetches complete audit record including full scenario breakdown and provenance JSON."""
    record = db.query(AnalysisRecord).filter(AnalysisRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Analysis record not found")
        
    return {
        "id": record.id,
        "created_at": record.created_at,
        "crop": record.crop,
        "maturity_stage": record.maturity_stage,
        "quantity_kg": record.quantity_kg,
        "region": record.region,
        "temperature_c": record.temperature_c,
        "relative_humidity_pct": record.relative_humidity_pct,
        "market_price_per_kg": record.market_price_per_kg,
        "storage_duration_days": record.storage_duration_days,
        "transport_duration_hours": record.transport_duration_hours,
        "decision": record.decision,
        "recommendation_reliability": record.recommendation_reliability,
        "efv_mean": record.efv_mean,
        "efv_median": record.efv_median,
        "efv_p05": record.efv_p05,
        "efv_p95": record.efv_p95,
        "prob_loss": record.prob_loss,
        "spoilage_mean": record.spoilage_mean,
        "spoilage_p95": record.spoilage_p95,
        "explanation": record.explanation,
        "data_source": record.data_source,
        "simulation_seed": record.simulation_seed,
        "model_version": record.model_version,
        "parameter_version": record.parameter_version,
        "provenance": record.provenance_json,
        "full_results": record.full_result_json
    }
