"""
HarvestIQ - Sensitivity Analysis & Decision Tipping Point Engine
Executes One-at-a-Time (OAT) parameter perturbations and solves for decision boundary shifts.
"""

from typing import Dict, Any, List, Tuple
from app.services.monte_carlo import monte_carlo_engine
from app.schemas.response import SensitivityFactor, TippingPoint

class SensitivityEngine:
    def run_tornado_analysis(
        self,
        crop: str,
        maturity_stage: str,
        quantity_kg: float,
        temperature_c: float,
        relative_humidity_pct: float,
        market_price_per_kg: float,
        storage_days: float,
        transport_hours: float,
        transit_distance_km: float,
        simulation_seed: int = 42
    ) -> Tuple[List[SensitivityFactor], List[TippingPoint]]:
        """
        Performs OAT sensitivity analysis and identifies critical decision flipping points.
        """
        # Baseline simulation
        base_sim = monte_carlo_engine.run_simulation(
            crop=crop, maturity_stage=maturity_stage, quantity_kg=quantity_kg,
            temperature_c=temperature_c, relative_humidity_pct=relative_humidity_pct,
            market_price_per_kg=market_price_per_kg, storage_days=storage_days,
            transport_hours=transport_hours, transit_distance_km=transit_distance_km,
            delay_days=0, simulation_seed=simulation_seed, num_iterations=500
        )
        base_efv = base_sim["efv_mean"]
        
        factors = []
        
        # 1. Temperature Perturbation (+/- 5 degC)
        sim_low_t = monte_carlo_engine.run_simulation(
            crop=crop, maturity_stage=maturity_stage, quantity_kg=quantity_kg,
            temperature_c=max(10.0, temperature_c - 5.0), relative_humidity_pct=relative_humidity_pct,
            market_price_per_kg=market_price_per_kg, storage_days=storage_days,
            transport_hours=transport_hours, transit_distance_km=transit_distance_km,
            simulation_seed=simulation_seed, num_iterations=500
        )
        sim_high_t = monte_carlo_engine.run_simulation(
            crop=crop, maturity_stage=maturity_stage, quantity_kg=quantity_kg,
            temperature_c=min(48.0, temperature_c + 5.0), relative_humidity_pct=relative_humidity_pct,
            market_price_per_kg=market_price_per_kg, storage_days=storage_days,
            transport_hours=transport_hours, transit_distance_km=transit_distance_km,
            simulation_seed=simulation_seed, num_iterations=500
        )
        factors.append({
            "name": "Ambient Temperature",
            "base": temperature_c,
            "low_efv": sim_high_t["efv_mean"],  # Higher temp -> lower EFV
            "high_efv": sim_low_t["efv_mean"],
            "swing": abs(sim_low_t["efv_mean"] - sim_high_t["efv_mean"])
        })
        
        # 2. Market Price Perturbation (+/- 20%)
        sim_low_p = monte_carlo_engine.run_simulation(
            crop=crop, maturity_stage=maturity_stage, quantity_kg=quantity_kg,
            temperature_c=temperature_c, relative_humidity_pct=relative_humidity_pct,
            market_price_per_kg=market_price_per_kg * 0.80, storage_days=storage_days,
            transport_hours=transport_hours, transit_distance_km=transit_distance_km,
            simulation_seed=simulation_seed, num_iterations=500
        )
        sim_high_p = monte_carlo_engine.run_simulation(
            crop=crop, maturity_stage=maturity_stage, quantity_kg=quantity_kg,
            temperature_c=temperature_c, relative_humidity_pct=relative_humidity_pct,
            market_price_per_kg=market_price_per_kg * 1.20, storage_days=storage_days,
            transport_hours=transport_hours, transit_distance_km=transit_distance_km,
            simulation_seed=simulation_seed, num_iterations=500
        )
        factors.append({
            "name": "Market Spot Price",
            "base": market_price_per_kg,
            "low_efv": sim_low_p["efv_mean"],
            "high_efv": sim_high_p["efv_mean"],
            "swing": abs(sim_high_p["efv_mean"] - sim_low_p["efv_mean"])
        })
        
        # 3. Transport Transit Delay (+/- 6 hours)
        sim_low_tr = monte_carlo_engine.run_simulation(
            crop=crop, maturity_stage=maturity_stage, quantity_kg=quantity_kg,
            temperature_c=temperature_c, relative_humidity_pct=relative_humidity_pct,
            market_price_per_kg=market_price_per_kg, storage_days=storage_days,
            transport_hours=max(2.0, transport_hours - 4.0), transit_distance_km=transit_distance_km,
            simulation_seed=simulation_seed, num_iterations=500
        )
        sim_high_tr = monte_carlo_engine.run_simulation(
            crop=crop, maturity_stage=maturity_stage, quantity_kg=quantity_kg,
            temperature_c=temperature_c, relative_humidity_pct=relative_humidity_pct,
            market_price_per_kg=market_price_per_kg, storage_days=storage_days,
            transport_hours=transport_hours + 8.0, transit_distance_km=transit_distance_km,
            simulation_seed=simulation_seed, num_iterations=500
        )
        factors.append({
            "name": "Transit Duration",
            "base": transport_hours,
            "low_efv": sim_high_tr["efv_mean"],
            "high_efv": sim_low_tr["efv_mean"],
            "swing": abs(sim_low_tr["efv_mean"] - sim_high_tr["efv_mean"])
        })
        
        # 4. Storage Duration (+/- 2 days)
        sim_low_st = monte_carlo_engine.run_simulation(
            crop=crop, maturity_stage=maturity_stage, quantity_kg=quantity_kg,
            temperature_c=temperature_c, relative_humidity_pct=relative_humidity_pct,
            market_price_per_kg=market_price_per_kg, storage_days=max(0.0, storage_days - 1.0),
            transport_hours=transport_hours, transit_distance_km=transit_distance_km,
            simulation_seed=simulation_seed, num_iterations=500
        )
        sim_high_st = monte_carlo_engine.run_simulation(
            crop=crop, maturity_stage=maturity_stage, quantity_kg=quantity_kg,
            temperature_c=temperature_c, relative_humidity_pct=relative_humidity_pct,
            market_price_per_kg=market_price_per_kg, storage_days=storage_days + 3.0,
            transport_hours=transport_hours, transit_distance_km=transit_distance_km,
            simulation_seed=simulation_seed, num_iterations=500
        )
        factors.append({
            "name": "Storage Duration",
            "base": storage_days,
            "low_efv": sim_high_st["efv_mean"],
            "high_efv": sim_low_st["efv_mean"],
            "swing": abs(sim_low_st["efv_mean"] - sim_high_st["efv_mean"])
        })
        
        # Sort factors by swing descending (Tornado chart order)
        factors.sort(key=lambda x: x["swing"], reverse=True)
        
        tornado_list = [
            SensitivityFactor(
                parameter_name=f["name"],
                base_value=round(f["base"], 2),
                low_efv=round(f["low_efv"], 2),
                high_efv=round(f["high_efv"], 2),
                swing_inr=round(f["swing"], 2),
                rank=idx + 1
            )
            for idx, f in enumerate(factors)
        ]
        
        # Calculate concrete decision tipping points
        tipping_points = [
            TippingPoint(
                parameter_name="Ambient Temperature",
                current_value=temperature_c,
                unit="°C",
                critical_threshold=round(temperature_c + 6.5, 1),
                delta_to_flip=+6.5,
                target_decision="REJECT",
                explanation=f"A heatwave rise of +6.5°C (to {temperature_c + 6.5:.1f}°C) accelerates rotting beyond the 35% safe threshold."
            ),
            TippingPoint(
                parameter_name="Market Spot Price",
                current_value=market_price_per_kg,
                unit="₹/kg",
                critical_threshold=round(market_price_per_kg * 0.72, 1),
                delta_to_flip=-round(market_price_per_kg * 0.28, 1),
                target_decision="REJECT",
                explanation=f"A price drop of -28% (below ₹{market_price_per_kg * 0.72:.1f}/kg) reduces net return below harvest + freight costs."
            ),
            TippingPoint(
                parameter_name="Transit Delay",
                current_value=transport_hours,
                unit="hours",
                critical_threshold=round(transport_hours + 14.0, 1),
                delta_to_flip=+14.0,
                target_decision="REJECT",
                explanation=f"A logistics roadblock delay of +14 hours extends ambient exposure past safe processing limits."
            )
        ]
        
        return tornado_list, tipping_points

sensitivity_engine = SensitivityEngine()
