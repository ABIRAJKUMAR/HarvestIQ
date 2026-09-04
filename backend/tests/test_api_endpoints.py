import unittest
from fastapi.testclient import TestClient
from app.main import app

class TestAPIEndpoints(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_check(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertIn("model_version", data)
        self.assertTrue(data["offline_ready"])

    def test_get_crops_and_regions(self):
        res_crops = self.client.get("/api/crops")
        self.assertEqual(res_crops.status_code, 200)
        self.assertIn("supported_crops", res_crops.json())
        
        res_regions = self.client.get("/api/regions")
        self.assertEqual(res_regions.status_code, 200)
        self.assertIn("regions", res_regions.json())

    def test_full_analyze_pipeline(self):
        payload = {
            "crop": "Tomato",
            "maturity_stage": "Optimal",
            "quantity_kg": 1500.0,
            "region": "Dindigul_TN",
            "temperature_c": 28.0,
            "relative_humidity_pct": 80.0,
            "market_price_per_kg": 24.0,
            "storage_duration_days": 1.0,
            "transport_duration_hours": 6.0,
            "transit_distance_km": 120.0,
            "simulation_seed": 42
        }
        response = self.client.post("/api/analyze", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify structure
        self.assertIn(data["decision"], ["BUY_NOW", "WAIT", "REJECT", "CHANGE_OPTION"])
        self.assertIn("recommendation_reliability", data)
        self.assertIn("outcome_interval", data)
        self.assertIn("spoilage_metrics", data)
        self.assertIn("timing_comparisons", data)
        self.assertIn("market_options", data)
        self.assertIn("scenario_simulations", data)
        self.assertIn("sensitivity_tornado", data)
        self.assertIn("tipping_points", data)
        self.assertIn("data_provenance", data)
        
        # Verify interval logic
        interval = data["outcome_interval"]
        self.assertLessEqual(interval["p05"], interval["median"])
        self.assertLessEqual(interval["median"], interval["p95"])
        
        # Verify 3 scenarios present
        self.assertEqual(len(data["scenario_simulations"]), 3)
        
        # Verify 3 timing options present
        self.assertEqual(len(data["timing_comparisons"]), 3)

    def test_history_logging(self):
        # Run an analysis
        payload = {
            "crop": "Onion",
            "maturity_stage": "Optimal",
            "quantity_kg": 2000.0,
            "region": "Nashik_MH"
        }
        self.client.post("/api/analyze", json=payload)
        
        # Fetch history
        res_history = self.client.get("/api/history")
        self.assertEqual(res_history.status_code, 200)
        history_items = res_history.json()
        self.assertGreater(len(history_items), 0)
        
        # Fetch detail of first record
        record_id = history_items[0]["id"]
        res_detail = self.client.get(f"/api/history/{record_id}")
        self.assertEqual(res_detail.status_code, 200)
        detail = res_detail.json()
        self.assertEqual(detail["id"], record_id)
        self.assertIn("provenance", detail)

if __name__ == "__main__":
    unittest.main()
