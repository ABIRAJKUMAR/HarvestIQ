"""
HarvestIQ - Real-Time IoT Telemetry & In-Transit Spoilage Engine
Processes live MQTT / Webhook streaming packets from vehicle GPS/temperature loggers,
dynamically integrating Arrhenius spoilage kinetics and detecting cold chain breaches.
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import numpy as np

from app.schemas.iot import (
    IoTTelemetryPacket,
    IoTBatchTelemetryRequest,
    ShipmentStatusResponse,
)
from app.services.spoilage_model import spoilage_model
from app.config import SPOILAGE_PARAMETERS, LOGISTICS_CONFIG

class IoTShipmentTracker:
    def __init__(self, lot_id: str, device_id: str, crop: str = "Tomato", maturity_stage: str = "Optimal", quantity_kg: float = 5000.0, is_cold_chain: bool = False):
        self.lot_id = lot_id
        self.device_id = device_id
        self.crop = crop
        self.maturity_stage = maturity_stage
        self.quantity_kg = quantity_kg
        self.is_cold_chain = is_cold_chain
        self.packets: List[IoTTelemetryPacket] = []
        self.created_at = datetime.utcnow()
        self.accumulated_integral_k_dt: float = 0.0
        self.thermal_abuse_minutes: float = 0.0

    def add_packet(self, packet: IoTTelemetryPacket):
        self.packets.append(packet)
        # Sort chronologically
        self.packets.sort(key=lambda p: p.timestamp)
        self._recalculate_spoilage_stream()

    def add_batch(self, new_packets: List[IoTTelemetryPacket]):
        self.packets.extend(new_packets)
        self.packets.sort(key=lambda p: p.timestamp)
        self._recalculate_spoilage_stream()

    def _recalculate_spoilage_stream(self):
        """
        Integrates dynamic Arrhenius decay across discrete sensor time-steps:
        S(t_M) = 1 - exp( - sum_{i=1}^M k_eff(T_i, RH_i) * delta_t_i )
        """
        if not self.packets:
            self.accumulated_integral_k_dt = 0.0
            self.thermal_abuse_minutes = 0.0
            return

        crop_params = spoilage_model.crop_params.get(self.crop, spoilage_model.crop_params["Tomato"])
        k0 = crop_params["k0"]
        rh_opt = crop_params["rh_opt"]
        t_ref = spoilage_model.t_ref
        q10 = spoilage_model.q10
        beta_rh = spoilage_model.beta_rh
        m_stage = spoilage_model.maturity_params.get(self.maturity_stage, spoilage_model.maturity_params["Optimal"])["multiplier"]

        integral_sum = 0.0
        thermal_abuse_sec = 0.0

        for i in range(len(self.packets)):
            curr = self.packets[i]
            
            # Check thermal abuse in cold chain (T > 14 degC)
            if self.is_cold_chain and curr.temperature_c > 14.0:
                if i > 0:
                    dt_sec = max(1.0, (curr.timestamp - self.packets[i-1].timestamp).total_seconds())
                    thermal_abuse_sec += min(dt_sec, 3600.0 * 2)  # Cap outlier gap at 2h
                else:
                    thermal_abuse_sec += 60.0

            # Time step calculation
            if i == 0:
                # First interval assumption (15 minutes baseline or 0.25h)
                dt_days = 0.25 / 24.0
            else:
                prev = self.packets[i - 1]
                dt_seconds = (curr.timestamp - prev.timestamp).total_seconds()
                # Bound dt between 10 seconds and 4 hours to avoid corrupt gaps
                dt_seconds = max(10.0, min(14400.0, dt_seconds))
                dt_days = dt_seconds / 86400.0

            # Calculate instantaneous k_eff
            temp_factor = math_pow_safe(q10, (curr.temperature_c - t_ref) / 10.0)
            excess_rh = max(0.0, curr.relative_humidity_pct - rh_opt)
            rh_factor = 1.0 + (beta_rh * excess_rh / 100.0)
            k_eff_inst = k0 * temp_factor * rh_factor * m_stage

            integral_sum += k_eff_inst * dt_days

        self.accumulated_integral_k_dt = integral_sum
        self.thermal_abuse_minutes = round(thermal_abuse_sec / 60.0, 1)

    def get_status_summary(self) -> ShipmentStatusResponse:
        if not self.packets:
            return ShipmentStatusResponse(
                lot_id=self.lot_id,
                device_id=self.device_id,
                crop=self.crop,
                quantity_kg=self.quantity_kg,
                total_transit_elapsed_hours=0.0,
                total_packets_received=0,
                current_temperature_c=25.0,
                current_relative_humidity_pct=70.0,
                avg_temperature_c=25.0,
                max_temperature_c=25.0,
                min_temperature_c=25.0,
                thermal_abuse_minutes=0.0,
                cold_chain_breached=False,
                accumulated_spoilage_pct=0.0,
                remaining_shelf_life_hours=120.0,
                estimated_damage_pct=0.0,
                current_alert_level="NORMAL",
                operational_action_required="Awaiting first sensor transmission.",
                recent_readings=[],
                last_updated_utc=datetime.utcnow().isoformat()
            )

        temps = [p.temperature_c for p in self.packets]
        rhs = [p.relative_humidity_pct for p in self.packets]
        vibs = [p.vibration_g_force or 0.1 for p in self.packets]
        latest = self.packets[-1]

        # Duration
        start_time = self.packets[0].timestamp
        end_time = self.packets[-1].timestamp
        elapsed_hours = round(max(0.1, (end_time - start_time).total_seconds() / 3600.0), 2)

        # Spoilage rate
        spoilage_rate = 1.0 - np.exp(- self.accumulated_integral_k_dt)
        spoilage_rate = float(np.clip(spoilage_rate, 0.0, 1.0))
        spoilage_pct = round(spoilage_rate * 100.0, 2)

        # Mechanical vibration loss estimation
        avg_vib = float(np.mean(vibs))
        vibration_damage_pct = round(min(12.0, avg_vib * 2.5 * (elapsed_hours / 4.0)), 2)

        # Cold chain breach check
        cold_chain_breached = self.is_cold_chain and (self.thermal_abuse_minutes > 20.0 or max(temps) > 16.0)

        # Remaining shelf life (hours until 20% spoilage at latest ambient temp)
        crop_params = spoilage_model.crop_params.get(self.crop, spoilage_model.crop_params["Tomato"])
        k0 = crop_params["k0"]
        m_stage = spoilage_model.maturity_params.get(self.maturity_stage, spoilage_model.maturity_params["Optimal"])["multiplier"]
        curr_k_eff = k0 * math_pow_safe(spoilage_model.q10, (latest.temperature_c - 20.0) / 10.0) * m_stage
        
        # S_rem = 1 - exp(-k * t) => t_rem = -ln(1 - 0.20) / k_eff
        if curr_k_eff > 0.001:
            shelf_life_days = max(0.2, ( - np.log(max(0.01, 1.0 - 0.20)) ) / curr_k_eff)
            remaining_shelf_life_hours = round(shelf_life_days * 24.0 * (1.0 - spoilage_rate), 1)
        else:
            remaining_shelf_life_hours = 120.0

        # Alert level determination
        if spoilage_pct > 20.0:
            alert_level = "CRITICAL_SPOILAGE"
            action = "CRITICAL: Produce spoilage exceeds 20%. Immediately divert to nearest local processor or cold facility to avoid total economic write-off."
        elif cold_chain_breached:
            alert_level = "THERMAL_BREACH"
            action = "URGENT ALERT: Cold chain failure detected (>14°C for sustained period). Check refrigeration unit and accelerate unloading."
        elif spoilage_pct > 8.0:
            alert_level = "WARNING"
            action = "CAUTION: Accelerated respiration observed due to elevated transit temperatures. Prioritize fast-track mandi auction upon arrival."
        else:
            alert_level = "NORMAL"
            action = "OPTIMAL: Transit parameters are within safe biological preservation boundaries."

        # Format recent readings
        recent_readings = [
            {
                "timestamp": p.timestamp.isoformat(),
                "temp_c": p.temperature_c,
                "rh_pct": p.relative_humidity_pct,
                "lat": p.latitude,
                "lon": p.longitude,
                "vib_g": p.vibration_g_force,
                "cooling": p.cooling_unit_active
            }
            for p in self.packets[-10:]
        ]

        return ShipmentStatusResponse(
            lot_id=self.lot_id,
            device_id=self.device_id,
            crop=self.crop,
            quantity_kg=self.quantity_kg,
            total_transit_elapsed_hours=elapsed_hours,
            total_packets_received=len(self.packets),
            current_temperature_c=latest.temperature_c,
            current_relative_humidity_pct=latest.relative_humidity_pct,
            avg_temperature_c=round(float(np.mean(temps)), 1),
            max_temperature_c=round(float(np.max(temps)), 1),
            min_temperature_c=round(float(np.min(temps)), 1),
            thermal_abuse_minutes=self.thermal_abuse_minutes,
            cold_chain_breached=cold_chain_breached,
            accumulated_spoilage_pct=spoilage_pct,
            remaining_shelf_life_hours=remaining_shelf_life_hours,
            estimated_damage_pct=vibration_damage_pct,
            current_alert_level=alert_level,
            operational_action_required=action,
            recent_readings=recent_readings,
            last_updated_utc=latest.timestamp.isoformat()
        )

def math_pow_safe(base: float, exp: float) -> float:
    exp_clipped = max(-5.0, min(5.0, exp))
    return float(np.power(base, exp_clipped))

class IoTTelemetryService:
    def __init__(self):
        self._shipments: Dict[str, IoTShipmentTracker] = {}
        # Seed an initial demo shipment for testing and immediate evaluation
        self._seed_demo_shipments()

    def _seed_demo_shipments(self):
        lot_id = "LOT-2026-TN-TOMATO-881"
        device_id = "TRUCK-TN45-0921"
        tracker = IoTShipmentTracker(
            lot_id=lot_id,
            device_id=device_id,
            crop="Tomato",
            maturity_stage="Ripe",
            quantity_kg=6000.0,
            is_cold_chain=False
        )
        # Add 6 simulated hourly sensor packets
        base_time = datetime(2026, 9, 28, 6, 0, 0)
        demo_temps = [24.0, 26.5, 31.0, 35.5, 37.0, 38.2]
        demo_rhs = [85.0, 80.0, 72.0, 68.0, 65.0, 63.0]
        demo_lats = [11.0168, 11.2340, 11.4500, 11.7800, 12.1200, 12.4500]
        demo_lons = [76.9558, 77.1200, 77.3400, 77.6700, 78.0100, 78.4500]

        for i in range(len(demo_temps)):
            tracker.add_packet(IoTTelemetryPacket(
                device_id=device_id,
                lot_id=lot_id,
                timestamp=datetime.fromtimestamp(base_time.timestamp() + i * 3600),
                temperature_c=demo_temps[i],
                relative_humidity_pct=demo_rhs[i],
                latitude=demo_lats[i],
                longitude=demo_lons[i],
                vibration_g_force=0.18 + (i * 0.04),
                cooling_unit_active=False
            ))
        self._shipments[lot_id] = tracker

    def ingest_single_packet(
        self,
        packet: IoTTelemetryPacket,
        crop: str = "Tomato",
        maturity_stage: str = "Optimal",
        quantity_kg: float = 5000.0,
        is_cold_chain: bool = False
    ) -> ShipmentStatusResponse:
        if packet.lot_id not in self._shipments:
            self._shipments[packet.lot_id] = IoTShipmentTracker(
                lot_id=packet.lot_id,
                device_id=packet.device_id,
                crop=crop,
                maturity_stage=maturity_stage,
                quantity_kg=quantity_kg,
                is_cold_chain=is_cold_chain
            )
        tracker = self._shipments[packet.lot_id]
        tracker.add_packet(packet)
        return tracker.get_status_summary()

    def ingest_batch(self, batch_req: IoTBatchTelemetryRequest) -> ShipmentStatusResponse:
        if batch_req.lot_id not in self._shipments:
            self._shipments[batch_req.lot_id] = IoTShipmentTracker(
                lot_id=batch_req.lot_id,
                device_id=batch_req.device_id,
                crop=batch_req.crop,
                maturity_stage=batch_req.maturity_stage,
                quantity_kg=batch_req.quantity_kg,
                is_cold_chain=batch_req.is_cold_chain
            )
        tracker = self._shipments[batch_req.lot_id]
        tracker.add_batch(batch_req.packets)
        return tracker.get_status_summary()

    def get_shipment_status(self, lot_id: str) -> Optional[ShipmentStatusResponse]:
        if lot_id in self._shipments:
            return self._shipments[lot_id].get_status_summary()
        return None

    def list_active_shipments(self) -> List[ShipmentStatusResponse]:
        return [tracker.get_status_summary() for tracker in self._shipments.values()]

iot_telemetry_service = IoTTelemetryService()
