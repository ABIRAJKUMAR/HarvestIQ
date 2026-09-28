"""
HarvestIQ - IoT Telemetry & Cold Chain Stream API Endpoints
Provides MQTT/Webhook packet ingestion, live cold-chain breach detection, and in-transit spoilage tracking.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional

from app.schemas.iot import (
    IoTTelemetryPacket,
    IoTBatchTelemetryRequest,
    ShipmentStatusResponse,
)
from app.services.iot_telemetry_service import iot_telemetry_service

router = APIRouter(prefix="/api/iot", tags=["IoT Telemetry"])

@router.post("/telemetry/stream", response_model=ShipmentStatusResponse)
def stream_single_packet(
    packet: IoTTelemetryPacket,
    crop: str = Query(default="Tomato"),
    maturity_stage: str = Query(default="Optimal"),
    quantity_kg: float = Query(default=5000.0),
    is_cold_chain: bool = Query(default=False)
):
    """
    Ingests an individual real-time sensor packet (temperature, humidity, vibration, GPS)
    from an active vehicle IoT logger, dynamically updating the integrated spoilage rate.
    """
    try:
        return iot_telemetry_service.ingest_single_packet(
            packet=packet,
            crop=crop,
            maturity_stage=maturity_stage,
            quantity_kg=quantity_kg,
            is_cold_chain=is_cold_chain
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to ingest telemetry packet: {str(e)}")

@router.post("/telemetry/batch", response_model=ShipmentStatusResponse)
def stream_batch_packets(request: IoTBatchTelemetryRequest):
    """
    Ingests a chronological batch of sensor logs (e.g. from MQTT broker bulk sync or offline data logger upload).
    """
    try:
        return iot_telemetry_service.ingest_batch(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to ingest batch telemetry: {str(e)}")

@router.get("/shipments/{lot_id}", response_model=ShipmentStatusResponse)
def get_shipment_status(lot_id: str):
    """
    Fetches real-time cumulative degradation, thermal abuse minutes, and alert level for a specific harvest lot.
    """
    status = iot_telemetry_service.get_shipment_status(lot_id)
    if not status:
        raise HTTPException(status_code=404, detail=f"Shipment lot '{lot_id}' not found.")
    return status

@router.get("/active-shipments", response_model=List[ShipmentStatusResponse])
def list_active_shipments():
    """
    Lists all active in-transit tracked shipments with live health statuses.
    """
    return iot_telemetry_service.list_active_shipments()
