"""
HarvestIQ - IoT Telemetry & Cold-Chain Stream Schemas
Defines data structures for MQTT/Webhook streaming sensor packets from in-transit GPS/temperature loggers.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class IoTTelemetryPacket(BaseModel):
    device_id: str = Field(..., description="Unique IoT logger hardware device ID (e.g. TRUCK-TN45-0921)")
    lot_id: str = Field(..., description="Harvest lot tracking code")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="UTC timestamp of sensor reading")
    temperature_c: float = Field(..., ge=-20.0, le=70.0, description="Ambient / container internal temperature in degC")
    relative_humidity_pct: float = Field(..., ge=0.0, le=100.0, description="Ambient / container relative humidity percentage")
    latitude: Optional[float] = Field(default=None, description="GPS Latitude")
    longitude: Optional[float] = Field(default=None, description="GPS Longitude")
    vibration_g_force: Optional[float] = Field(default=0.15, ge=0.0, le=15.0, description="Peak acceleration / road shock in G")
    cooling_unit_active: bool = Field(default=False, description="Whether active refrigeration is functioning")
    battery_level_pct: Optional[float] = Field(default=95.0, ge=0.0, le=100.0, description="Sensor battery percentage")

class IoTBatchTelemetryRequest(BaseModel):
    device_id: str
    lot_id: str
    crop: str = Field(default="Tomato", description="Crop type (Tomato, Onion, Potato, Mango)")
    maturity_stage: str = Field(default="Optimal", description="Maturity stage")
    quantity_kg: float = Field(default=5000.0, ge=10.0, description="Total batch quantity")
    is_cold_chain: bool = Field(default=False, description="Whether shipment was scheduled as refrigerated cold chain")
    packets: List[IoTTelemetryPacket] = Field(..., min_length=1, description="Sequential stream of sensor packets")

class ShipmentStatusResponse(BaseModel):
    lot_id: str
    device_id: str
    crop: str
    quantity_kg: float
    total_transit_elapsed_hours: float
    total_packets_received: int
    current_temperature_c: float
    current_relative_humidity_pct: float
    avg_temperature_c: float
    max_temperature_c: float
    min_temperature_c: float
    thermal_abuse_minutes: float
    cold_chain_breached: bool
    accumulated_spoilage_pct: float
    remaining_shelf_life_hours: float
    estimated_damage_pct: float
    current_alert_level: str  # NORMAL, WARNING, THERMAL_BREACH, CRITICAL_SPOILAGE
    operational_action_required: str
    recent_readings: List[Dict[str, Any]]
    last_updated_utc: str
