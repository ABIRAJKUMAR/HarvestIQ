import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.services.missing_data_handler import missing_data_handler

class TestEdgeCasesAndMissingData(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_edge_case_1_missing_weather(self):
        """When user provides no weather, system uses cached climatology and deducts 15% reliability."""
        payload = {
            "crop": "Tomato",
            "quantity_kg": 1000.0,
            "region": "Dindigul_TN",
            "market_price_per_kg": 24.0
            # temperature_c and relative_humidity_pct omitted
        }
        res = self.client.post("/api/analyze", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertLess(data["recommendation_reliability"], 100.0)
        self.assertTrue(any("Climatology" in f for f in data["missing_fields"]))

    def test_edge_case_2_missing_price(self):
        """When price is omitted, system falls back to 7-day APMC snapshot and applies penalty."""
        payload = {
            "crop": "Onion",
            "quantity_kg": 1000.0,
            "region": "Nashik_MH",
            "temperature_c": 25.0,
            "relative_humidity_pct": 60.0
            # market_price_per_kg omitted
        }
        res = self.client.post("/api/analyze", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertLess(data["recommendation_reliability"], 100.0)
        self.assertTrue(any("APMC" in f or "Market" in f for f in data["missing_fields"]))

    def test_edge_case_3_invalid_negative_quantity(self):
        """Invalid negative quantity input must trigger strict 422 HTTP validation error."""
        payload = {
            "crop": "Tomato",
            "quantity_kg": -500.0,
            "region": "Dindigul_TN"
        }
        res = self.client.post("/api/analyze", json=payload)
        self.assertEqual(res.status_code, 422)

    def test_edge_case_4_extreme_spoilage_forces_reject(self):
        """Extreme heatwave (48°C) + overripe fruit + 5-day delay must trigger REJECT."""
        payload = {
            "crop": "Tomato",
            "maturity_stage": "Overripe",
            "quantity_kg": 1000.0,
            "region": "Dindigul_TN",
            "temperature_c": 46.0,
            "relative_humidity_pct": 95.0,
            "market_price_per_kg": 24.0,
            "storage_duration_days": 4.0,
            "transport_duration_hours": 18.0
        }
        res = self.client.post("/api/analyze", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["decision"], "REJECT")
        self.assertGreaterEqual(data["spoilage_metrics"]["p95_rate"], 0.80)

    def test_edge_case_5_market_crash_shock(self):
        """Severe price crash (₹5/kg) below harvest + transit cost must trigger REJECT due to negative margin."""
        payload = {
            "crop": "Tomato",
            "maturity_stage": "Optimal",
            "quantity_kg": 1000.0,
            "region": "Dindigul_TN",
            "temperature_c": 22.0,
            "relative_humidity_pct": 70.0,
            "market_price_per_kg": 3.00,  # Below harvest cost of ₹2.50 + ₹1.20 freight
            "transit_distance_km": 150.0
        }
        res = self.client.post("/api/analyze", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["decision"], "REJECT")
        self.assertGreater(data["outcome_interval"]["prob_loss"], 0.40)

    def test_edge_case_6_external_api_failure_graceful_degradation(self):
        """Forced 'demo' tier must return valid analysis marked with data_source='demo'."""
        payload = {
            "crop": "Potato",
            "quantity_kg": 1500.0,
            "region": "Kolar_KA",
            "force_data_source": "demo"
        }
        res = self.client.post("/api/analyze", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["data_source"], "demo")
        self.assertIn("SYNTHETIC_DEMO", [p["data_status"] for p in data["data_provenance"]])

if __name__ == "__main__":
    unittest.main()
