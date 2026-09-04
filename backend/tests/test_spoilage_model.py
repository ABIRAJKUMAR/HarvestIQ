import unittest
from app.services.spoilage_model import spoilage_model

class TestSpoilageModel(unittest.TestCase):
    def test_temperature_monotonicity(self):
        """Higher ambient temperatures must strictly accelerate spoilage (Arrhenius law)."""
        res_cool = spoilage_model.calculate_spoilage_rate(
            crop="Tomato", maturity_stage="Optimal", temperature_c=18.0,
            relative_humidity_pct=85.0, storage_days=2.0, transport_hours=6.0
        )
        res_warm = spoilage_model.calculate_spoilage_rate(
            crop="Tomato", maturity_stage="Optimal", temperature_c=28.0,
            relative_humidity_pct=85.0, storage_days=2.0, transport_hours=6.0
        )
        res_hot = spoilage_model.calculate_spoilage_rate(
            crop="Tomato", maturity_stage="Optimal", temperature_c=38.0,
            relative_humidity_pct=85.0, storage_days=2.0, transport_hours=6.0
        )
        self.assertLess(res_cool["spoilage_rate"], res_warm["spoilage_rate"])
        self.assertLess(res_warm["spoilage_rate"], res_hot["spoilage_rate"])

    def test_exposure_time_monotonicity(self):
        """Longer storage/transit times must strictly increase cumulative spoilage."""
        res_1day = spoilage_model.calculate_spoilage_rate(
            crop="Tomato", maturity_stage="Optimal", temperature_c=25.0,
            relative_humidity_pct=85.0, storage_days=1.0, transport_hours=6.0
        )
        res_4days = spoilage_model.calculate_spoilage_rate(
            crop="Tomato", maturity_stage="Optimal", temperature_c=25.0,
            relative_humidity_pct=85.0, storage_days=4.0, transport_hours=6.0
        )
        res_7days = spoilage_model.calculate_spoilage_rate(
            crop="Tomato", maturity_stage="Optimal", temperature_c=25.0,
            relative_humidity_pct=85.0, storage_days=7.0, transport_hours=6.0
        )
        self.assertLess(res_1day["spoilage_rate"], res_4days["spoilage_rate"])
        self.assertLess(res_4days["spoilage_rate"], res_7days["spoilage_rate"])

    def test_maturity_acceleration(self):
        """Overripe fruit must spoil significantly faster than immature fruit."""
        res_immature = spoilage_model.calculate_spoilage_rate(
            crop="Tomato", maturity_stage="Immature", temperature_c=25.0,
            relative_humidity_pct=85.0, storage_days=3.0, transport_hours=6.0
        )
        res_overripe = spoilage_model.calculate_spoilage_rate(
            crop="Tomato", maturity_stage="Overripe", temperature_c=25.0,
            relative_humidity_pct=85.0, storage_days=3.0, transport_hours=6.0
        )
        self.assertLess(res_immature["spoilage_rate"], res_overripe["spoilage_rate"])

    def test_bounds(self):
        """Spoilage rate must always stay strictly within [0.0, 1.0]."""
        res_extreme = spoilage_model.calculate_spoilage_rate(
            crop="Mango", maturity_stage="Overripe", temperature_c=50.0,
            relative_humidity_pct=100.0, storage_days=30.0, transport_hours=72.0
        )
        self.assertGreaterEqual(res_extreme["spoilage_rate"], 0.0)
        self.assertLessEqual(res_extreme["spoilage_rate"], 1.0)

if __name__ == "__main__":
    unittest.main()
