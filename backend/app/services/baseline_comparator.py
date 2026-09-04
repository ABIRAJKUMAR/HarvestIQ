"""
HarvestIQ - Baseline Comparison Service
Compares the traditional fixed-price threshold heuristic against the Risk-Aware HarvestIQ Simulator.
"""

import numpy as np
from typing import List, Dict, Any, Tuple
from app.services.spoilage_model import spoilage_model
from app.services.monte_carlo import monte_carlo_engine
from app.services.decision_engine import decision_engine
from app.schemas.baseline import BaselineDiscrepancyItem, BaselineCompareResponse

class BaselineComparatorService:
    def run_comparison(
        self,
        crop: str = "Tomato",
        sample_lots_count: int = 10,
        fixed_price_threshold_inr: float = 22.0,
        simulation_seed: int = 42
    ) -> BaselineCompareResponse:
        """
        Runs batch comparison across synthetic representative harvest lots.
        Demonstrates where baseline heuristic fails (e.g., buying cheap lots that rot in transit).
        """
        rng = np.random.default_rng(simulation_seed)
        
        # Representative lot characteristics
        maturity_stages = ["Immature", "Optimal", "Optimal", "Ripe", "Overripe", "Optimal", "Ripe", "Immature", "Optimal", "Overripe"]
        temps = [22.0, 26.0, 36.0, 32.0, 38.0, 24.0, 35.0, 20.0, 28.0, 40.0]
        storage_days_list = [1.0, 2.0, 3.0, 2.0, 4.0, 1.0, 3.0, 1.0, 2.0, 5.0]
        market_prices = [20.50, 21.50, 19.00, 23.50, 18.00, 24.00, 21.00, 25.00, 21.80, 17.50]
        
        lots_evaluated: List[BaselineDiscrepancyItem] = []
        total_baseline_spoilage_loss = 0.0
        total_value_saved = 0.0
        discrepancy_count = 0
        
        for i in range(sample_lots_count):
            idx = i % len(maturity_stages)
            maturity = maturity_stages[idx]
            temp = temps[idx]
            storage_days = storage_days_list[idx]
            price = market_prices[idx]
            quantity_kg = 1000.0  # 1 tonne standard lot
            
            # 1. Baseline Decision: Simple Price Threshold Rule
            # "Buy if price <= threshold, otherwise REJECT"
            baseline_decision = "BUY" if price <= fixed_price_threshold_inr else "REJECT"
            
            # 2. HarvestIQ Simulator Decision
            sim_res = monte_carlo_engine.run_simulation(
                crop=crop,
                maturity_stage=maturity,
                quantity_kg=quantity_kg,
                temperature_c=temp,
                relative_humidity_pct=80.0,
                market_price_per_kg=price,
                storage_days=storage_days,
                transport_hours=8.0,
                transit_distance_km=120.0,
                delay_days=0,
                num_iterations=500,
                simulation_seed=simulation_seed + i
            )
            
            sim_day3 = monte_carlo_engine.run_simulation(
                crop=crop, maturity_stage=maturity, quantity_kg=quantity_kg,
                temperature_c=temp, relative_humidity_pct=80.0, market_price_per_kg=price,
                storage_days=storage_days, transport_hours=8.0, transit_distance_km=120.0,
                delay_days=3, num_iterations=500, simulation_seed=simulation_seed + i + 100
            )
            
            decision, badge, meta = decision_engine.evaluate_decision(
                efv_day0=sim_res["efv_mean"],
                efv_day3=sim_day3["efv_mean"],
                efv_day7=0.0,
                spoilage_mean_day0=sim_res["spoilage_mean"],
                spoilage_p95_day0=sim_res["spoilage_p95"],
                prob_loss_day0=sim_res["prob_loss"],
                efv_mandi_option=sim_res["efv_mean"] * 1.02,
                reliability_score=90.0
            )
            
            spoilage_pct = sim_res["spoilage_pct_mean"]
            realized_baseline_loss = 0.0
            value_saved = 0.0
            is_discrepant = False
            reason = "Consensus decision between baseline and HarvestIQ."
            
            # Analyze Discrepancy Scenarios
            if baseline_decision == "BUY" and decision == "REJECT":
                is_discrepant = True
                discrepancy_count += 1
                # Baseline bought a lot that rots in storage/transit
                realized_baseline_loss = quantity_kg * price * (spoilage_pct / 100.0) + (quantity_kg * 2.50)  # + harvest/freight loss
                total_baseline_spoilage_loss += realized_baseline_loss
                value_saved = realized_baseline_loss
                total_value_saved += value_saved
                reason = f"CRITICAL FAILURE IN BASELINE: Baseline bought cheap lot (₹{price:.2f}/kg) but high heat ({temp}°C) and maturity ('{maturity}') caused {spoilage_pct:.1f}% spoilage loss."
                
            elif baseline_decision == "REJECT" and decision == "BUY_NOW":
                is_discrepant = True
                discrepancy_count += 1
                # Baseline rejected due to price slightly above threshold, but high quality/low temp secured safe profit
                missed_profit = sim_res["efv_mean"]
                value_saved = missed_profit
                total_value_saved += value_saved
                reason = f"MISSED OPPORTUNITY BY BASELINE: Baseline rejected price ₹{price:.2f} > ₹{fixed_price_threshold_inr:.2f}, but low ambient temp ({temp}°C) ensures {spoilage_pct:.1f}% low spoilage and ₹{missed_profit:,.0f} net profit."
                
            elif baseline_decision == "BUY" and decision == "WAIT":
                is_discrepant = True
                discrepancy_count += 1
                added_delay_value = max(0.0, sim_day3["efv_mean"] - sim_res["efv_mean"])
                value_saved = added_delay_value
                total_value_saved += value_saved
                reason = f"TIMING OPTIMIZATION: Baseline bought immediately; HarvestIQ recommended 3-day delay to capture +₹{added_delay_value:,.0f} price appreciation."
                
            lots_evaluated.append(BaselineDiscrepancyItem(
                lot_id=i + 1,
                crop=crop,
                maturity_stage=maturity,
                temperature_c=temp,
                storage_days=storage_days,
                market_price_inr=price,
                baseline_decision=baseline_decision,
                harvestiq_decision=decision,
                is_discrepant=is_discrepant,
                spoilage_rate_pct=round(spoilage_pct, 1),
                realized_loss_baseline_inr=round(realized_baseline_loss, 2),
                economic_value_saved_inr=round(value_saved, 2),
                discrepancy_reason=reason
            ))
            
        discrepancy_rate = (discrepancy_count / sample_lots_count) * 100.0
        
        summary = (
            f"Across {sample_lots_count} representative procurement lots, the traditional fixed-price baseline "
            f"disagreed with the Risk-Aware HarvestIQ Simulator in {discrepancy_count} lots ({discrepancy_rate:.1f}% discrepancy rate). "
            f"The baseline incurred ₹{total_baseline_spoilage_loss:,.0f} in preventable rotting losses by buying cheap lots in high ambient heat. "
            f"By incorporating Arrhenius spoilage kinetics and Monte Carlo risk modeling, HarvestIQ prevented ₹{total_value_saved:,.0f} in combined losses."
        )
        
        return BaselineCompareResponse(
            total_lots_evaluated=sample_lots_count,
            discrepancy_count=discrepancy_count,
            discrepancy_rate_pct=round(discrepancy_rate, 1),
            total_baseline_spoilage_loss_inr=round(total_baseline_spoilage_loss, 2),
            total_harvestiq_value_saved_inr=round(total_value_saved, 2),
            lots=lots_evaluated,
            methodology_summary=summary
        )

baseline_comparator = BaselineComparatorService()
