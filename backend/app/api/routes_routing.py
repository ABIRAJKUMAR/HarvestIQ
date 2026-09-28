"""
HarvestIQ - Multi-Mandi Routing & Logistics API Endpoints
Provides OSRM route calculations, breakdown variance assessments, and market arbitrage.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any

from app.schemas.routing import (
    MultiMandiCompareRequest,
    MultiMandiCompareResponse,
)
from app.services.routing_service import routing_service

router = APIRouter(prefix="/api/routing", tags=["Multi-Mandi Logistics"])

@router.get("/mandis", response_model=List[Dict[str, Any]])
def get_supported_mandis():
    """Returns database of supported wholesale APMC Mandis with coordinates and live baseline prices."""
    return routing_service.get_supported_mandis()

@router.post("/multi-mandi-compare", response_model=MultiMandiCompareResponse)
def compare_mandi_routes(request: MultiMandiCompareRequest):
    """
    Evaluates and ranks alternative destination APMC Mandis against origin farm coordinates.
    Considers road distance, freight tariff, Arrhenius in-transit spoilage, breakdown shocks, and APMC cess.
    """
    try:
        response = routing_service.compare_multi_mandi_options(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Routing optimization failed: {str(e)}")
