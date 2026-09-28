import unittest
from app.services.agmarknet_service import agmarknet_service

class TestAgmarknetService(unittest.TestCase):
    def test_price_series_retrieval(self):
        """Price series must return 30 daily records with positive prices."""
        series = agmarknet_service.get_price_series("Tomato", "MANDI_DINDIGUL", days=30)
        self.assertEqual(len(series), 30)
        for item in series:
            self.assertIn("date", item)
            self.assertGreater(item["modal_price_per_kg"], 0.0)
            self.assertGreaterEqual(item["max_price_per_kg"], item["min_price_per_kg"])

    def test_dynamic_volatility_calculation(self):
        """Dynamic volatility must return statistical properties and valid trend classification."""
        stats = agmarknet_service.calculate_dynamic_volatility("Tomato", "MANDI_DINDIGUL", window_days=30)
        self.assertEqual(stats["crop"], "Tomato")
        self.assertGreater(stats["daily_volatility_sigma"], 0.0)
        self.assertGreater(stats["annualized_volatility_pct"], 0.0)
        self.assertIn(stats["trend_direction"], ["BULLISH_UPWARD", "BEARISH_DOWNWARD", "STABLE"])
        self.assertGreater(stats["current_spot_price"], 0.0)
        self.assertGreater(stats["moving_average_7d"], 0.0)

if __name__ == "__main__":
    unittest.main()
