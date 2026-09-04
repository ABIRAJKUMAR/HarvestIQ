import unittest
from app.services.efv_calculator import efv_calculator

class TestEFVCalculator(unittest.TestCase):
    def test_no_double_counting_spoilage(self):
        """
        Verify that spoilage only destroys physical volume and is NOT subtracted twice.
        When spoilage is 1.0 (100% loss), gross revenue must be EXACTLY zero.
        """
        res_zero_spoilage = efv_calculator.calculate_efv_single(
            quantity_kg=1000.0, spoilage_rate=0.0, market_price_per_kg=20.0,
            transit_distance_km=100.0, storage_duration_days=1.0, harvest_cost_per_kg=2.50
        )
        res_full_spoilage = efv_calculator.calculate_efv_single(
            quantity_kg=1000.0, spoilage_rate=1.0, market_price_per_kg=20.0,
            transit_distance_km=100.0, storage_duration_days=1.0, harvest_cost_per_kg=2.50
        )
        
        # When 100% spoiled, usable kg is 0 and gross revenue is 0
        self.assertEqual(res_full_spoilage["usable_kg"], 0.0)
        self.assertEqual(res_full_spoilage["gross_revenue_inr"], 0.0)
        
        # Net EFV should be exactly negative total costs (logistics + harvest)
        expected_loss = -(res_full_spoilage["total_logistics_inr"] + res_full_spoilage["harvest_cost_inr"])
        self.assertAlmostEqual(res_full_spoilage["net_efv_inr"], expected_loss, places=1)
        
        # Sound + Damaged kg must equal usable kg
        self.assertAlmostEqual(
            res_zero_spoilage["sound_kg"] + res_zero_spoilage["damaged_kg"],
            res_zero_spoilage["usable_kg"],
            places=2
        )

    def test_salvage_value_contribution(self):
        """Mechanically damaged produce should yield salvage value rather than being treated as 100% loss."""
        res = efv_calculator.calculate_efv_single(
            quantity_kg=1000.0, spoilage_rate=0.10, market_price_per_kg=25.0,
            transit_distance_km=200.0, storage_duration_days=2.0
        )
        self.assertGreater(res["damaged_kg"], 0.0)
        self.assertGreater(res["gross_revenue_inr"], 0.0)

if __name__ == "__main__":
    unittest.main()
