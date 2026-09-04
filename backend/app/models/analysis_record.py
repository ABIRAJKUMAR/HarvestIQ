"""
HarvestIQ - Analysis Record ORM Model
Stores complete simulation audit trail, including reproducibility seed and data provenance.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, Text, JSON
from app.models.database import Base

class AnalysisRecord(Base):
    __tablename__ = "analysis_records"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Core Inputs
    crop = Column(String(50), nullable=False)
    maturity_stage = Column(String(50), nullable=False)
    quantity_kg = Column(Float, nullable=False)
    region = Column(String(100), nullable=False)
    temperature_c = Column(Float, nullable=False)
    relative_humidity_pct = Column(Float, nullable=False)
    market_price_per_kg = Column(Float, nullable=False)
    storage_duration_days = Column(Float, nullable=False)
    transport_duration_hours = Column(Float, nullable=False)
    
    # Core Outputs & Decision
    decision = Column(String(50), nullable=False)
    recommendation_reliability = Column(Float, nullable=False)
    
    # Simulated Outcome Interval
    efv_mean = Column(Float, nullable=False)
    efv_median = Column(Float, nullable=False)
    efv_p05 = Column(Float, nullable=False)
    efv_p95 = Column(Float, nullable=False)
    prob_loss = Column(Float, nullable=False)
    
    # Spoilage Metrics
    spoilage_mean = Column(Float, nullable=False)
    spoilage_p95 = Column(Float, nullable=False)
    
    # Explainability & Audit Metadata
    explanation = Column(Text, nullable=False)
    data_source = Column(String(20), nullable=False)  # "live" | "cached" | "demo"
    simulation_seed = Column(Integer, nullable=True)
    model_version = Column(String(20), nullable=False)
    parameter_version = Column(String(20), nullable=False)
    
    # Detailed JSON Payloads
    provenance_json = Column(JSON, nullable=True)
    full_result_json = Column(JSON, nullable=True)
