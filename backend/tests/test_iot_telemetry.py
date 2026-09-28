import unittest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from app.main import app
from app.services.iot_telemetry_service import iot_telemetry_service
from app.schemas.iot import IoTTelemetryPacket, IoTBatchTelemetryRequest

class TestIoTTelemetry(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_single_packet_ingestion(self):
        """Single packet ingestion should initialize shipment tracker and return valid status."""
        packet = IoTTelemetryPacket(
            device_id="TEST-DEV-001",
            lot_id="TEST-LOT-001",
            timestamp=datetime.utcnow(),
            temperature_c=22.0,
            relative_humidity_pct=85.0,
            latitude=11.0168,
            longitude=76.9558,
            vibration_g_force=0.15,
            cooling_unit_active=True
        )
        status = iot_telemetry_service.ingest_single_packet(
            packet=packet,
            crop="Tomato",
            maturity_stage="Optimal",
            quantity_kg=3000.0,
            is_cold_chain=True
        )
        self.assertEqual(status.lot_id, "TEST-LOT-001")
        self.assertEqual(status.current_temperature_c, 22.0)
        self.assertGreater(status.remaining_shelf_life_hours, 0.0)

    def test_dynamic_arrhenius_integration_over_time(self):
        """Streaming higher temperature packets must increase accumulated spoilage rate monotonically."""
        lot_id = "TEST-LOT-ACCUM-002"
        device_id = "DEV-002"
        base_time = datetime(2026, 9, 28, 8, 0, 0)
        
        # Ingest first packet (cool)
        p1 = IoTTelemetryPacket(
            device_id=device_id,
            lot_id=lot_id,
            timestamp=base_time,
            temperature_c=18.0,
            relative_humidity_pct=85.0
        )
        s1 = iot_telemetry_service.ingest_single_packet(p1, crop="Tomato", maturity_stage="Optimal")

        # Ingest second packet 3 hours later at 38 degC (heatwave shock)
        p2 = IoTTelemetryPacket(
            device_id=device_id,
            lot_id=lot_id,
            timestamp=base_time + timedelta(hours=3),
            temperature_c=38.0,
            relative_humidity_pct=65.0
        )
        s2 = iot_telemetry_service.ingest_single_packet(p2, crop="Tomato", maturity_stage="Optimal")

        self.assertGreater(s2.accumulated_spoilage_pct, s1.accumulated_spoilage_pct)
        self.assertEqual(s2.total_packets_received, 2)

    def test_cold_chain_breach_detection(self):
        """Prolonged thermal abuse in cold chain (>14 degC) must trigger cold_chain_breached flag and alert."""
        lot_id = "TEST-LOT-COLD-FAIL-003"
        device_id = "REEFER-DEV-003"
        base_time = datetime(2026, 9, 28, 10, 0, 0)
        
        # Batch of 4 readings spanning 2 hours with temperature at 28 degC in a cold-chain shipment
        packets = [
            IoTTelemetryPacket(
                device_id=device_id,
                lot_id=lot_id,
                timestamp=base_time + timedelta(minutes=i*30),
                temperature_c=28.0,
                relative_humidity_pct=70.0,
                cooling_unit_active=False
            )
            for i in range(4)
        ]
        batch_req = IoTBatchTelemetryRequest(
            device_id=device_id,
            lot_id=lot_id,
            crop="Tomato",
            maturity_stage="Ripe",
            quantity_kg=5000.0,
            is_cold_chain=True,
            packets=packets
        )
        status = iot_telemetry_service.ingest_batch(batch_req)
        self.assertTrue(status.cold_chain_breached)
        self.assertIn(status.current_alert_level, ["THERMAL_BREACH", "WARNING", "CRITICAL_SPOILAGE"])

    def test_iot_api_endpoints(self):
        """Test API endpoints for active shipments and real-time streaming."""
        # Check active shipments endpoint
        resp_active = self.client.get("/api/iot/active-shipments")
        self.assertEqual(resp_active.status_code, 200)
        shipments = resp_active.json()
        self.assertIsInstance(shipments, list)
        self.assertGreater(len(shipments), 0)

        # Query specific seeded demo shipment
        demo_lot = shipments[0]["lot_id"]
        resp_status = self.client.get(f"/api/iot/shipments/{demo_lot}")
        self.assertEqual(resp_status.status_code, 200)
        self.assertEqual(resp_status.json()["lot_id"], demo_lot)

if __name__ == "__main__":
    unittest.main()
