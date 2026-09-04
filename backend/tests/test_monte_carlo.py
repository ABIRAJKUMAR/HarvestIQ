import unittest
from app.services.monte_carlo import monte_carlo_engine

class TestMonteCarlo(unittest.TestCase):
    def test_seed_reproducibility(self):
        """Identical simulation seed must produce identical statistical outputs."""
        sim1 = monte_carlo_engine.run_simulation(
            crop="Tomato", maturity_stage="Optimal", quantity_kg=1000.0,
            temperature_c=25.0, relative_humidity_pct=80.0, market_price_per_kg=24.0,
            storage_days=1.0, transport_hours=6.0, simulation_seed=12345
        )
        sim2 = monte_carlo_engine.run_simulation(
            crop="Tomato", maturity_stage="Optimal", quantity_kg=1000.0,
            temperature_c=25.0, relative_humidity_pct=80.0, market_price_per_kg=24.0,
            storage_days=1.0, transport_hours=6.0, simulation_seed=12345
        )
        self.assertEqual(sim1["efv_mean"], sim2["efv_mean"])
        self.assertEqual(sim1["efv_median"], sim2["efv_median"])
        self.assertEqual(sim1["efv_p05"], sim2["efv_p05"])
        self.assertEqual(sim1["efv_p95"], sim2["efv_p95"])
        self.assertEqual(sim1["spoilage_mean"], sim2["spoilage_mean"])

    def test_interval_ordering(self):
        """Percentile hierarchy must strictly hold: p05 <= median <= p95."""
        sim = monte_carlo_engine.run_simulation(
            crop="Tomato", maturity_stage="Optimal", quantity_kg=1000.0,
            temperature_c=28.0, relative_humidity_pct=85.0, market_price_per_kg=25.0,
            storage_days=2.0, transport_hours=8.0, simulation_seed=42
        )
        self.assertLessEqual(sim["efv_p05"], sim["efv_median"])
        self.assertLessEqual(sim["efv_median"], sim["efv_p95"])

if __name__ == "__main__":
    unittest.main()
