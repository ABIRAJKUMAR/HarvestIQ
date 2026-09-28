"""
HarvestIQ - Dynamic OSRM Multi-Mandi Routing & Logistics Engine
Calculates real-world road distances, transit durations, transit delay variances,
and economic price arbitrage across competing wholesale agricultural markets (APMCs).
"""

import math
import httpx
from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional
import numpy as np

from app.schemas.routing import (
    MandiLocation,
    FarmOrigin,
    MultiMandiCompareRequest,
    MandiRouteResult,
    MultiMandiCompareResponse,
)
from app.services.spoilage_model import spoilage_model
from app.services.efv_calculator import efv_calculator
from app.config import LOGISTICS_CONFIG, SPOILAGE_PARAMETERS

# Benchmark Wholesale Mandis Database
SUPPORTED_MANDIS: List[Dict[str, Any]] = [
    {
        "mandi_id": "MANDI_DINDIGUL",
        "name": "Dindigul APMC Market",
        "state": "Tamil Nadu",
        "latitude": 10.3673,
        "longitude": 77.9803,
        "current_modal_price_per_kg": 26.50,
        "daily_price_volatility_sigma": 0.16,
        "market_cess_pct": 1.0,
        "road_type": "National_Highway"
    },
    {
        "mandi_id": "MANDI_ODDANCHATRAM",
        "name": "Oddanchatram Vegetable Market",
        "state": "Tamil Nadu",
        "latitude": 10.4862,
        "longitude": 77.7473,
        "current_modal_price_per_kg": 25.00,
        "daily_price_volatility_sigma": 0.14,
        "market_cess_pct": 1.0,
        "road_type": "State_Highway"
    },
    {
        "mandi_id": "MANDI_MADURAI",
        "name": "Madurai Mattuthavani APMC",
        "state": "Tamil Nadu",
        "latitude": 9.9391,
        "longitude": 78.1565,
        "current_modal_price_per_kg": 27.20,
        "daily_price_volatility_sigma": 0.15,
        "market_cess_pct": 1.2,
        "road_type": "National_Highway"
    },
    {
        "mandi_id": "MANDI_KOYAMBEDU",
        "name": "Chennai Koyambedu Wholesale Complex",
        "state": "Tamil Nadu",
        "latitude": 13.0694,
        "longitude": 80.1948,
        "current_modal_price_per_kg": 34.00,
        "daily_price_volatility_sigma": 0.20,
        "market_cess_pct": 2.0,
        "road_type": "Four_Lane_Expressway"
    },
    {
        "mandi_id": "MANDI_KOLAR",
        "name": "Kolar APMC (Asia Tomato Hub)",
        "state": "Karnataka",
        "latitude": 13.1367,
        "longitude": 78.1340,
        "current_modal_price_per_kg": 31.50,
        "daily_price_volatility_sigma": 0.19,
        "market_cess_pct": 1.5,
        "road_type": "National_Highway"
    },
    {
        "mandi_id": "MANDI_BANGALORE",
        "name": "Bangalore Yeshwanthpur APMC",
        "state": "Karnataka",
        "latitude": 13.0238,
        "longitude": 77.5501,
        "current_modal_price_per_kg": 32.80,
        "daily_price_volatility_sigma": 0.18,
        "market_cess_pct": 1.5,
        "road_type": "Four_Lane_Expressway"
    },
    {
        "mandi_id": "MANDI_LASALGAON",
        "name": "Lasalgaon APMC (Onion Benchmark)",
        "state": "Maharashtra",
        "latitude": 20.1472,
        "longitude": 74.2267,
        "current_modal_price_per_kg": 30.50,
        "daily_price_volatility_sigma": 0.24,
        "market_cess_pct": 1.0,
        "road_type": "National_Highway"
    }
]

class RoutingService:
    def __init__(self):
        self.osrm_base_url = "http://router.project-osrm.org/route/v1/driving"
        self.timeout_seconds = 2.5
        # Commercial freight rate
        self.freight_per_tonne_km = LOGISTICS_CONFIG.get("FREIGHT_COST_PER_TONNE_KM_INR", 12.0)
        self.vibration_damage_rate = LOGISTICS_CONFIG.get("TRANSIT_VIBRATION_DAMAGE_RATE_PER_100KM", 0.025)

    def get_supported_mandis(self) -> List[Dict[str, Any]]:
        return SUPPORTED_MANDIS

    def calculate_haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Computes great-circle distance between two GPS coordinates in km."""
        r = 6371.0  # Earth radius in km
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)
        
        a = (math.sin(delta_phi / 2.0) ** 2 +
             math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return r * c

    def get_route_distance_and_time(
        self,
        origin_lat: float,
        origin_lon: float,
        dest_lat: float,
        dest_lon: float,
        congestion_factor: float = 1.15
    ) -> Tuple[float, float, str]:
        """
        Calculates road network distance (km) and estimated transit hours.
        Tries OSRM API first, degrades gracefully to high-precision Haversine + road winding curvature.
        """
        # Try live OSRM
        try:
            url = f"{self.osrm_base_url}/{origin_lon},{origin_lat};{dest_lon},{dest_lat}?overview=false"
            with httpx.Client(timeout=self.timeout_seconds) as client:
                resp = client.get(url)
                if resp.status_code == 200:
                    data = resp.json()
                    if "routes" in data and len(data["routes"]) > 0:
                        route = data["routes"][0]
                        distance_km = round(route["distance"] / 1000.0, 1)
                        # OSRM duration is in seconds
                        duration_hours = round((route["duration"] / 3600.0) * congestion_factor, 2)
                        return distance_km, max(0.5, duration_hours), "OSRM_Live_Routing"
        except Exception:
            pass  # Fallback to calibrated road model

        # Fallback: Empirical Indian road network winding factor (1.28x Haversine distance)
        haversine_km = self.calculate_haversine_distance(origin_lat, origin_lon, dest_lat, dest_lon)
        road_winding_factor = 1.28
        road_distance_km = round(haversine_km * road_winding_factor, 1)
        
        # Commercial freight truck average speed profile (40 km/h accounting for toll gates & rural roads)
        commercial_truck_speed_kmh = 42.0
        transit_hours = round((road_distance_km / commercial_truck_speed_kmh) * congestion_factor, 2)
        return max(5.0, road_distance_km), max(0.5, transit_hours), "Calibrated_Winding_Model_Fallback"

    def compare_multi_mandi_options(self, req: MultiMandiCompareRequest) -> MultiMandiCompareResponse:
        """
        Evaluates and ranks alternative destination mandis for a given crop lot.
        Accounts for road distance, transit spoilage kinetics, fuel/freight tariffs,
        cess fees, and transit breakdown delay variances in a Monte Carlo loop.
        """
        rng = np.random.default_rng(req.simulation_seed if req.simulation_seed is not None else 42)
        evaluated_results: List[MandiRouteResult] = []
        
        # Base crop price adjustment for selected crop
        crop_name = req.crop
        crop_base_price = SPOILAGE_PARAMETERS["CROPS"].get(crop_name, {}).get("base_market_price_per_kg", 25.0)

        for mandi in SUPPORTED_MANDIS:
            # 1. Get route distance & baseline transit duration
            distance_km, base_hours, engine_used = self.get_route_distance_and_time(
                origin_lat=req.farm_origin.latitude,
                origin_lon=req.farm_origin.longitude,
                dest_lat=mandi["latitude"],
                dest_lon=mandi["longitude"],
                congestion_factor=req.road_congestion_factor
            )

            # 2. Transit breakdown and delay variance modeling
            # Breakdown probability scales slightly with distance: 2% base + 0.5% per 100km
            breakdown_prob = 0.02 + min(0.06, (distance_km / 100.0) * 0.005)
            
            # Monte Carlo transit hours sampling: lognormal road delay + breakdown shocks
            num_samples = 1000
            # Lognormal congestion jitter: mean 1.0, sigma 0.18
            delay_multipliers = rng.lognormal(mean=0.0, sigma=0.18, size=num_samples)
            sim_transit_hours = base_hours * delay_multipliers
            
            if req.include_transit_breakdown_risk:
                # Bernoulli trial for breakdown
                breakdown_occurred = rng.random(size=num_samples) < breakdown_prob
                # Add 4 to 10 hours for vehicle repair/towing if breakdown occurs
                breakdown_delays = rng.uniform(4.0, 10.0, size=num_samples) * breakdown_occurred
                sim_transit_hours += breakdown_delays

            # 3. Spoilage Kinetics during Transit
            # Effective transit temperature
            if req.is_refrigerated_transit:
                transit_temp = np.full(num_samples, 10.0)
            else:
                transit_temp = rng.normal(loc=req.temperature_c, scale=1.5, size=num_samples)
                transit_temp = np.clip(transit_temp, 5.0, 55.0)

            # Calculate Arrhenius decay
            transit_days_array = sim_transit_hours / 24.0
            t_ref = spoilage_model.t_ref
            q10 = spoilage_model.q10
            beta_rh = spoilage_model.beta_rh
            crop_params = spoilage_model.crop_params.get(crop_name, spoilage_model.crop_params["Tomato"])
            k0 = crop_params["k0"]
            rh_opt = crop_params["rh_opt"]
            m_stage = spoilage_model.maturity_params.get(req.maturity_stage, spoilage_model.maturity_params["Optimal"])["multiplier"]
            
            temp_factors = np.power(q10, (transit_temp - t_ref) / 10.0)
            excess_rh = max(0.0, req.relative_humidity_pct - rh_opt)
            rh_factor = 1.0 + (beta_rh * excess_rh / 100.0)
            k_eff = k0 * temp_factors * rh_factor * m_stage
            
            spoilage_samples = 1.0 - np.exp(- k_eff * transit_days_array)
            spoilage_samples = np.clip(spoilage_samples, 0.0, 1.0)
            
            # 4. Market Price Simulation for Target Mandi
            mandi_price_baseline = mandi["current_modal_price_per_kg"]
            # Price volatility
            volatility = mandi["daily_price_volatility_sigma"]
            price_shocks = rng.normal(0.0, volatility * np.sqrt(transit_days_array), size=num_samples)
            sim_prices = mandi_price_baseline * (1.0 + price_shocks)
            sim_prices = np.clip(sim_prices, mandi_price_baseline * 0.3, mandi_price_baseline * 2.2)

            # 5. Financial Accounting (EFV Vectorized)
            # Volume breakdown
            usable_qty = req.quantity_kg * (1.0 - spoilage_samples)
            # Mechanical vibration damage
            vibration_pct = min(0.15, (distance_km / 100.0) * self.vibration_damage_rate)
            sound_qty = usable_qty * (1.0 - vibration_pct)
            damaged_qty = usable_qty * vibration_pct

            # Revenue
            gross_sound_rev = sound_qty * sim_prices
            salvage_rev = damaged_qty * (sim_prices * 0.40)
            gross_revenue = gross_sound_rev + salvage_rev

            # Logistics & Tariffs
            tonnes = req.quantity_kg / 1000.0
            logistics_cost = tonnes * distance_km * self.freight_per_tonne_km
            if req.is_refrigerated_transit:
                logistics_cost *= 1.45  # 45% premium for reefer truck
            
            mandi_cess = gross_revenue * (mandi["market_cess_pct"] / 100.0)
            net_efv_samples = gross_revenue - logistics_cost - mandi_cess

            # Statistics
            mean_net_efv = float(np.mean(net_efv_samples))
            p05_efv = float(np.percentile(net_efv_samples, 5))
            p95_efv = float(np.percentile(net_efv_samples, 95))
            mean_spoilage = float(np.mean(spoilage_samples))
            p95_spoilage = float(np.percentile(spoilage_samples, 95))
            mean_gross_rev = float(np.mean(gross_revenue))
            mean_salvage = float(np.mean(salvage_rev))
            mean_cess = float(np.mean(mandi_cess))

            # Risk tiering
            if p95_spoilage > 0.25 or distance_km > 350:
                risk_tier = "HIGH_LOGISTICS_RISK"
            elif distance_km > 150 or mean_spoilage > 0.10:
                risk_tier = "MODERATE_RISK"
            else:
                risk_tier = "LOW_RISK"

            evaluated_results.append(MandiRouteResult(
                mandi_id=mandi["mandi_id"],
                mandi_name=mandi["name"],
                state=mandi["state"],
                distance_km=distance_km,
                estimated_transit_hours=base_hours,
                expected_spoilage_pct=round(mean_spoilage * 100.0, 2),
                expected_spoilage_p95_pct=round(p95_spoilage * 100.0, 2),
                breakdown_risk_pct=round(breakdown_prob * 100.0, 1),
                gross_market_revenue_inr=round(mean_gross_rev, 2),
                logistics_cost_inr=round(logistics_cost, 2),
                market_cess_inr=round(mean_cess, 2),
                salvage_revenue_inr=round(mean_salvage, 2),
                net_expected_farmer_value_inr=round(mean_net_efv, 2),
                efv_p05_inr=round(p05_efv, 2),
                efv_p95_inr=round(p95_efv, 2),
                arbitrage_spread_vs_local_inr=0.0,  # Computed below
                is_optimal_market=False,
                route_risk_tier=risk_tier,
                recommendation_note=""
            ))

        # Sort by Net Expected Farmer Value descending
        evaluated_results.sort(key=lambda x: x.net_expected_farmer_value_inr, reverse=True)
        
        # Identify local baseline (closest mandi by distance)
        closest_mandi = min(evaluated_results, key=lambda x: x.distance_km)
        local_baseline_efv = closest_mandi.net_expected_farmer_value_inr

        # Optimal market is the one with highest net EFV
        optimal_mandi = evaluated_results[0]
        optimal_mandi.is_optimal_market = True

        for res in evaluated_results:
            res.arbitrage_spread_vs_local_inr = round(res.net_expected_farmer_value_inr - local_baseline_efv, 2)
            if res.mandi_id == optimal_mandi.mandi_id:
                if res.mandi_id == closest_mandi.mandi_id:
                    res.recommendation_note = "OPTIMAL: Closest local market maximizes return by minimizing transit decay & transport tariffs."
                else:
                    res.recommendation_note = f"OPTIMAL ARBITRAGE: Superior wholesale price in {res.mandi_name} (+₹{res.arbitrage_spread_vs_local_inr:,.0f}) outweighs freight and transit spoilage."
            elif res.arbitrage_spread_vs_local_inr < -2000.0:
                res.recommendation_note = "SUB-OPTIMAL: High transport cost and long road transit decay erode selling price advantage."
            else:
                res.recommendation_note = "VIABLE SECONDARY: Comparable net returns after freight deductions."

        arbitrage_gain = round(optimal_mandi.net_expected_farmer_value_inr - local_baseline_efv, 2)

        return MultiMandiCompareResponse(
            crop=crop_name,
            quantity_kg=req.quantity_kg,
            farm_origin=req.farm_origin,
            optimal_mandi_id=optimal_mandi.mandi_id,
            optimal_mandi_name=optimal_mandi.mandi_name,
            max_net_efv_inr=optimal_mandi.net_expected_farmer_value_inr,
            local_baseline_efv_inr=local_baseline_efv,
            arbitrage_gain_inr=arbitrage_gain,
            evaluated_mandis=evaluated_results,
            routing_engine="OSRM_Multi_Mandi_Arbitrage_v2.0",
            timestamp=datetime.utcnow().isoformat()
        )

routing_service = RoutingService()
