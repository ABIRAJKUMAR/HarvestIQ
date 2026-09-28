"""
HarvestIQ - Monte Carlo Stochastic Simulation Engine
Executes N=1,000 iterations with configurable seed for strict scientific reproducibility.
"""

import numpy as np
from typing import Dict, Any, Optional
from app.services.spoilage_model import spoilage_model
from app.services.price_model import price_model
from app.services.efv_calculator import efv_calculator

class MonteCarloEngine:
    def run_simulation(
        self,
        crop: str,
        maturity_stage: str,
        quantity_kg: float,
        temperature_c: float,
        relative_humidity_pct: float,
        market_price_per_kg: float,
        storage_days: float = 1.0,
        transport_hours: float = 6.0,
        transit_distance_km: float = 100.0,
        delay_days: int = 0,
        is_cold_storage: bool = False,
        include_breakdown_scenario: bool = True,
        breakdown_probability: float = 0.04,
        num_iterations: int = 1000,
        simulation_seed: Optional[int] = 42
    ) -> Dict[str, Any]:
        """
        Runs stochastic Monte Carlo simulation across weather fluctuations,
        realistic transit delay variances (road conditions, vehicle breakdown scenarios), and price movements.
        """
        rng = np.random.default_rng(simulation_seed if simulation_seed is not None else 42)
        
        # 1. Stochastic temperature variation (ambient weather uncertainty ~ +/- 2 degC)
        temp_samples = rng.normal(loc=temperature_c, scale=1.5, size=num_iterations)
        temp_samples = np.clip(temp_samples, a_min=5.0, a_max=55.0)
        
        # 2. Stochastic transit delay variation (Log-normal road condition / traffic dispersion)
        # Log-normal distribution prevents negative transit times and models right-skewed traffic bottlenecks
        road_delay_multipliers = rng.lognormal(mean=0.0, sigma=0.18, size=num_iterations)
        transit_hour_samples = transport_hours * road_delay_multipliers
        
        # Vehicle breakdown scenario modeling (e.g., flat tire, radiator overheating, mechanical delay)
        if include_breakdown_scenario and breakdown_probability > 0.0:
            breakdown_occurs = rng.random(size=num_iterations) < breakdown_probability
            # Breakdown adds 3.5 to 8.5 hours of delay
            breakdown_delays = rng.uniform(3.5, 8.5, size=num_iterations) * breakdown_occurs
            transit_hour_samples += breakdown_delays

        transit_hour_samples = np.clip(transit_hour_samples, a_min=1.0, a_max=72.0)
        
        # 3. Total effective exposure days (including harvest delay)
        total_time_days = delay_days + storage_days + (transit_hour_samples / 24.0)
        
        # If cold storage option is used, temperature is reduced to 10 degC
        if is_cold_storage:
            effective_temps = np.full(num_iterations, 10.0)
        else:
            effective_temps = temp_samples
            
        # 4. Calculate spoilage rate array
        # Vectorized Arrhenius rate calculation
        t_ref = spoilage_model.t_ref
        q10 = spoilage_model.q10
        beta_rh = spoilage_model.beta_rh
        
        crop_data = spoilage_model.crop_params.get(crop, spoilage_model.crop_params["Tomato"])
        k0 = crop_data["k0"]
        rh_opt = crop_data["rh_opt"]
        
        m_stage = spoilage_model.maturity_params.get(maturity_stage, spoilage_model.maturity_params["Optimal"])["multiplier"]
        
        temp_factors = np.power(q10, (effective_temps - t_ref) / 10.0)
        excess_rh = max(0.0, relative_humidity_pct - rh_opt)
        rh_factor = 1.0 + (beta_rh * excess_rh / 100.0)
        
        k_eff_samples = k0 * temp_factors * rh_factor * m_stage
        spoilage_rate_samples = 1.0 - np.exp(- k_eff_samples * total_time_days)
        spoilage_rate_samples = np.clip(spoilage_rate_samples, 0.0, 1.0)
        
        # 5. Stochastic price simulation
        price_samples = price_model.sample_price_trajectory(
            crop=crop,
            base_price_per_kg=market_price_per_kg,
            horizon_days=max(1, delay_days + int(storage_days)),
            num_samples=num_iterations,
            rng=rng
        )
        
        # 6. Vectorized EFV calculation (Zero Double-Counting)
        efv_array = efv_calculator.calculate_efv_vectorized(
            quantity_kg=quantity_kg,
            spoilage_rates=spoilage_rate_samples,
            market_prices=price_samples,
            transit_distance_km=transit_distance_km,
            storage_duration_days=storage_days + delay_days,
            is_cold_storage=is_cold_storage
        )
        
        # 7. Statistical Aggregations
        efv_mean = float(np.mean(efv_array))
        efv_median = float(np.median(efv_array))
        efv_p05 = float(np.percentile(efv_array, 5))
        efv_p95 = float(np.percentile(efv_array, 95))
        prob_loss = float(np.mean(efv_array < 0.0))
        
        spoilage_mean = float(np.mean(spoilage_rate_samples))
        spoilage_p95 = float(np.percentile(spoilage_rate_samples, 95))
        
        return {
            "efv_mean": round(efv_mean, 2),
            "efv_median": round(efv_median, 2),
            "efv_p05": round(efv_p05, 2),
            "efv_p95": round(efv_p95, 2),
            "prob_loss": round(prob_loss, 4),
            "spoilage_mean": round(spoilage_mean, 4),
            "spoilage_p95": round(spoilage_p95, 4),
            "spoilage_pct_mean": round(spoilage_mean * 100.0, 2),
            "spoilage_pct_p95": round(spoilage_p95 * 100.0, 2),
            "effective_k_mean": round(float(np.mean(k_eff_samples)), 4),
            "price_simulated_mean": round(float(np.mean(price_samples)), 2),
            "num_iterations": num_iterations,
            "simulation_seed": simulation_seed
        }

monte_carlo_engine = MonteCarloEngine()
