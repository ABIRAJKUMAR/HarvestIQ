"""
HarvestIQ - Computational Experiments & Sensitivity Parameter Sweep Runner
Executes systematic simulation sweeps across biological and market parameters.
Outputs real CSVs and visualization plots to docs/experiment_results/computational_experiments/.

CLASSIFICATION:
Category A: Computational Experiments (Simulation Sweeps)
Used strictly to explore model behavior and map decision response surfaces.
"""

import os
import sys
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# Ensure backend root is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.services.spoilage_model import spoilage_model
from app.services.monte_carlo import monte_carlo_engine
from app.services.efv_calculator import efv_calculator

OUTPUT_DIR = os.path.join(os.path.dirname(BASE_DIR), "docs", "experiment_results", "computational_experiments")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def run_temperature_maturity_sweep():
    """Sweep 1: Temperature (15C-45C) across all 4 maturity stages."""
    print("Running Sweep 1: Temperature vs Spoilage Kinetics...")
    temperatures = np.linspace(15.0, 45.0, 31)
    stages = ["Immature", "Optimal", "Ripe", "Overripe"]
    rows = []

    for temp in temperatures:
        for stage in stages:
            res = spoilage_model.calculate_spoilage_rate(
                crop="Tomato",
                maturity_stage=stage,
                temperature_c=temp,
                relative_humidity_pct=80.0,
                storage_days=1.0,
                transport_hours=6.0
            )
            rows.append({
                "temperature_c": round(temp, 1),
                "maturity_stage": stage,
                "spoilage_rate_fraction": round(res["spoilage_rate"], 4),
                "spoilage_pct": res["spoilage_pct"],
                "effective_k": res["effective_k"],
                "shelf_life_days": res["estimated_shelf_life_days"],
                "experiment_category": "COMPUTATIONAL_SWEEP",
                "underlying_law": "Arrhenius Respiration Kinetics (Q10=2.15)"
            })

    df = pd.DataFrame(rows)
    csv_path = os.path.join(OUTPUT_DIR, "temperature_maturity_sweep.csv")
    df.to_csv(csv_path, index=False)
    print(f"Saved: {csv_path}")

    # Generate Plot
    plt.figure(figsize=(8, 5))
    for stage in stages:
        sub = df[df["maturity_stage"] == stage]
        plt.plot(sub["temperature_c"], sub["spoilage_pct"], label=f"{stage} Stage", linewidth=2)

    plt.title("Computational Sweep: Temperature vs Spoilage Rate (%) for Tomato (48h Corridor)")
    plt.xlabel("Ambient Temperature (°C)")
    plt.ylabel("Spoilage Loss (%)")
    plt.grid(True, alpha=0.3)
    plt.legend()
    plt.tight_layout()
    plot_path = os.path.join(OUTPUT_DIR, "temperature_kinetics_plot.png")
    plt.savefig(plot_path, dpi=200)
    plt.close()
    print(f"Saved plot: {plot_path}")

def run_storage_duration_sweep():
    """Sweep 2: Storage duration (0 to 7 days) under 28C ambient condition."""
    print("Running Sweep 2: Storage Duration vs Expected Farmer Value...")
    storage_days_range = np.linspace(0.0, 7.0, 15)
    stages = ["Optimal", "Ripe"]
    rows = []

    for days in storage_days_range:
        for stage in stages:
            sim = monte_carlo_engine.run_simulation(
                crop="Tomato",
                maturity_stage=stage,
                quantity_kg=1000.0,
                temperature_c=28.0,
                relative_humidity_pct=80.0,
                market_price_per_kg=24.0,
                storage_days=days,
                transport_hours=6.0,
                transit_distance_km=100.0,
                delay_days=0,
                num_iterations=500,
                simulation_seed=42
            )
            rows.append({
                "storage_days": round(days, 2),
                "maturity_stage": stage,
                "efv_mean_inr": sim["efv_mean"],
                "efv_p05_inr": sim["efv_p05"],
                "efv_p95_inr": sim["efv_p95"],
                "spoilage_pct_mean": sim["spoilage_pct_mean"],
                "prob_loss": sim["prob_loss"],
                "experiment_category": "COMPUTATIONAL_SWEEP"
            })

    df = pd.DataFrame(rows)
    csv_path = os.path.join(OUTPUT_DIR, "storage_decay_sweep.csv")
    df.to_csv(csv_path, index=False)
    print(f"Saved: {csv_path}")

    # Generate Plot
    plt.figure(figsize=(8, 5))
    for stage in stages:
        sub = df[df["maturity_stage"] == stage]
        plt.plot(sub["storage_days"], sub["efv_mean_inr"], label=f"EFV ({stage})", linewidth=2.5)

    plt.axhline(0, color='red', linestyle='--', alpha=0.7, label='Zero Profit Line')
    plt.title("Computational Sweep: Ambient Storage Duration vs Net EFV (Tomato, 28°C)")
    plt.xlabel("Packhouse Ambient Storage (Days)")
    plt.ylabel("Expected Farmer Value (INR)")
    plt.grid(True, alpha=0.3)
    plt.legend()
    plt.tight_layout()
    plot_path = os.path.join(OUTPUT_DIR, "storage_decay_plot.png")
    plt.savefig(plot_path, dpi=200)
    plt.close()
    print(f"Saved plot: {plot_path}")

def run_price_volatility_decision_sweep():
    """Sweep 3: Price volatility vs decision boundaries."""
    print("Running Sweep 3: Market Price Sensitivity & Decision Transitions...")
    price_multipliers = np.linspace(0.40, 1.60, 25)
    base_price = 24.0
    rows = []

    for mult in price_multipliers:
        price = base_price * mult
        sim = monte_carlo_engine.run_simulation(
            crop="Tomato",
            maturity_stage="Optimal",
            quantity_kg=1000.0,
            temperature_c=26.0,
            relative_humidity_pct=75.0,
            market_price_per_kg=price,
            storage_days=1.0,
            transport_hours=6.0,
            transit_distance_km=100.0,
            simulation_seed=42
        )
        
        # Decision boundary check
        decision = "BUY_NOW"
        if sim["prob_loss"] > 0.40 or sim["efv_mean"] < 500.0:
            decision = "REJECT"
            
        rows.append({
            "price_multiplier": round(mult, 2),
            "spot_price_inr": round(price, 2),
            "efv_mean_inr": sim["efv_mean"],
            "efv_p05_inr": sim["efv_p05"],
            "efv_p95_inr": sim["efv_p95"],
            "prob_loss": sim["prob_loss"],
            "decision": decision,
            "experiment_category": "COMPUTATIONAL_SWEEP"
        })

    df = pd.DataFrame(rows)
    csv_path = os.path.join(OUTPUT_DIR, "market_price_sensitivity_sweep.csv")
    df.to_csv(csv_path, index=False)
    print(f"Saved: {csv_path}")

    # Generate Plot
    plt.figure(figsize=(8, 5))
    plt.plot(df["spot_price_inr"], df["efv_mean_inr"], color='#0d9488', linewidth=2.5, label='Mean EFV')
    plt.fill_between(df["spot_price_inr"], df["efv_p05_inr"], df["efv_p95_inr"], color='#0d9488', alpha=0.2, label='90% Outcome Interval')
    plt.axhline(0, color='red', linestyle='--', label='Loss Boundary')
    plt.title("Computational Sweep: Market Spot Price vs Expected Farmer Value Distribution")
    plt.xlabel("Market Spot Price (₹/kg)")
    plt.ylabel("Net Expected Farmer Value (₹)")
    plt.grid(True, alpha=0.3)
    plt.legend()
    plt.tight_layout()
    plot_path = os.path.join(OUTPUT_DIR, "market_decision_surface.png")
    plt.savefig(plot_path, dpi=200)
    plt.close()
    print(f"Saved plot: {plot_path}")

if __name__ == "__main__":
    print("=== Running HarvestIQ Computational Experiments ===")
    run_temperature_maturity_sweep()
    run_storage_duration_sweep()
    run_price_volatility_decision_sweep()
    print("=== All computational experiments completed successfully ===")
