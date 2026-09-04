import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.services.baseline_comparator import baseline_comparator

class TestBaselineComparator(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_baseline_discrepancy_identification(self):
        """Baseline must detect when cheap lots suffer catastrophic heat/overripe rotting."""
        response = baseline_comparator.run_comparison(
            crop="Tomato",
            sample_lots_count=10,
            fixed_price_threshold_inr=22.0,
            simulation_seed=42
        )
        self.assertEqual(response.total_lots_evaluated, 10)
        self.assertGreater(response.discrepancy_count, 0)
        self.assertGreater(response.total_baseline_spoilage_loss_inr, 0.0)
        self.assertGreater(response.total_harvestiq_value_saved_inr, 0.0)

    def test_baseline_api_endpoint(self):
        payload = {
            "crop": "Tomato",
            "sample_lots_count": 8,
            "fixed_price_threshold_inr": 23.0,
            "simulation_seed": 100
        }
        res = self.client.post("/api/baseline-compare", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["total_lots_evaluated"], 8)
        self.assertIn("lots", data)
        self.assertIn("methodology_summary", data)

if __name__ == "__main__":
    unittest.main()
