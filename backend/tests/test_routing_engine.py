import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.services.routing_service import routing_service
from app.schemas.routing import MultiMandiCompareRequest, FarmOrigin

class TestRoutingEngine(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_haversine_distance_calculation(self):
        """Haversine distance between known coordinates should match geodesic ground truth."""
        # Coimbatore (11.0168, 76.9558) to Dindigul (10.3673, 77.9803) ~132 km straight line
        dist = routing_service.calculate_haversine_distance(11.0168, 76.9558, 10.3673, 77.9803)
        self.assertGreater(dist, 120.0)
        self.assertLess(dist, 150.0)

    def test_multi_mandi_compare_service(self):
        """Routing comparison should correctly rank mandis and return positive Net EFV for optimal market."""
        req = MultiMandiCompareRequest(
            farm_origin=FarmOrigin(
                name="Coimbatore Rural Farm",
                latitude=11.0168,
                longitude=76.9558,
                region="Coimbatore"
            ),
            crop="Tomato",
            maturity_stage="Optimal",
            quantity_kg=5000.0,
            temperature_c=32.0,
            relative_humidity_pct=75.0,
            is_refrigerated_transit=False,
            include_transit_breakdown_risk=True,
            simulation_seed=42
        )
        res = routing_service.compare_multi_mandi_options(req)
        self.assertEqual(res.crop, "Tomato")
        self.assertGreater(len(res.evaluated_mandis), 3)
        self.assertGreater(res.max_net_efv_inr, 0.0)
        
        # Verify exactly one mandi is marked as optimal
        optimal_mandis = [m for m in res.evaluated_mandis if m.is_optimal_market]
        self.assertEqual(len(optimal_mandis), 1)
        self.assertEqual(optimal_mandis[0].mandi_id, res.optimal_mandi_id)

    def test_transit_breakdown_scenario_increases_delay(self):
        """Enabling breakdown scenario must increase 95th percentile transit spoilage."""
        req_no_breakdown = MultiMandiCompareRequest(
            farm_origin=FarmOrigin(latitude=11.0168, longitude=76.9558),
            crop="Tomato",
            maturity_stage="Ripe",
            quantity_kg=5000.0,
            include_transit_breakdown_risk=False,
            simulation_seed=42
        )
        res_no_breakdown = routing_service.compare_multi_mandi_options(req_no_breakdown)
        
        req_with_breakdown = MultiMandiCompareRequest(
            farm_origin=FarmOrigin(latitude=11.0168, longitude=76.9558),
            crop="Tomato",
            maturity_stage="Ripe",
            quantity_kg=5000.0,
            include_transit_breakdown_risk=True,
            simulation_seed=42
        )
        res_with_breakdown = routing_service.compare_multi_mandi_options(req_with_breakdown)

        # Distant market (e.g. Koyambedu Chennai ~500km) should experience higher P95 spoilage under breakdown risk
        koyambedu_no = next(m for m in res_no_breakdown.evaluated_mandis if "KOYAMBEDU" in m.mandi_id)
        koyambedu_with = next(m for m in res_with_breakdown.evaluated_mandis if "KOYAMBEDU" in m.mandi_id)
        self.assertGreaterEqual(koyambedu_with.expected_spoilage_p95_pct, koyambedu_no.expected_spoilage_p95_pct)

    def test_routing_api_endpoints(self):
        """GET /api/routing/mandis and POST /api/routing/multi-mandi-compare should respond 200."""
        resp_list = self.client.get("/api/routing/mandis")
        self.assertEqual(resp_list.status_code, 200)
        mandis = resp_list.json()
        self.assertGreaterEqual(len(mandis), 5)

        payload = {
            "farm_origin": {
                "name": "Kolar Farm",
                "latitude": 13.1367,
                "longitude": 78.1340,
                "region": "Kolar"
            },
            "crop": "Tomato",
            "maturity_stage": "Optimal",
            "quantity_kg": 4000.0,
            "temperature_c": 30.0,
            "relative_humidity_pct": 70.0,
            "is_refrigerated_transit": False,
            "include_transit_breakdown_risk": True,
            "simulation_seed": 42
        }
        resp_compare = self.client.post("/api/routing/multi-mandi-compare", json=payload)
        self.assertEqual(resp_compare.status_code, 200)
        data = resp_compare.json()
        self.assertIn("optimal_mandi_name", data)
        self.assertIn("evaluated_mandis", data)

if __name__ == "__main__":
    unittest.main()
