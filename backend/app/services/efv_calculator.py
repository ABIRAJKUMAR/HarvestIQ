"""
HarvestIQ - Expected Farmer Value (EFV) & Processor Margin Calculator
Mathematically consistent equations guaranteeing ZERO double-counting of spoilage.
"""

import numpy as np
from typing import Dict, Any, Union
from app.config import LOGISTICS_CONFIG

class EFVCalculator:
    def __init__(self):
        self.transit_vibration_rate = LOGISTICS_CONFIG["TRANSIT_VIBRATION_DAMAGE_RATE_PER_100KM"]
        self.handling_shock_rate = LOGISTICS_CONFIG["HANDLING_SHOCK_LOSS_RATE"]
        self.freight_per_tonne_km = LOGISTICS_CONFIG["FREIGHT_COST_PER_TONNE_KM_INR"]
        self.storage_cost_per_kg_day = LOGISTICS_CONFIG["COLD_STORAGE_COST_PER_KG_DAY_INR"]
        self.salvage_discount = LOGISTICS_CONFIG["SALVAGE_VALUE_DISCOUNT_FACTOR"]

    def calculate_logistics_costs(
        self,
        quantity_kg: float,
        transit_distance_km: float,
        storage_duration_days: float,
        is_cold_storage: bool = False
    ) -> Dict[str, float]:
        """Calculates transit freight, handling, and storage costs."""
        tonnes = quantity_kg / 1000.0
        transit_cost = tonnes * transit_distance_km * self.freight_per_tonne_km
        handling_cost = quantity_kg * 0.15  # ₹0.15/kg loading/unloading
        
        storage_rate = self.storage_cost_per_kg_day if is_cold_storage else 0.02  # ₹0.02/kg/day ambient
        storage_cost = quantity_kg * storage_duration_days * storage_rate
        
        total_logistics = transit_cost + handling_cost + storage_cost
        
        return {
            "transit_cost_inr": round(transit_cost, 2),
            "handling_cost_inr": round(handling_cost, 2),
            "storage_cost_inr": round(storage_cost, 2),
            "total_logistics_inr": round(total_logistics, 2)
        }

    def calculate_efv_single(
        self,
        quantity_kg: float,
        spoilage_rate: float,
        market_price_per_kg: float,
        transit_distance_km: float,
        storage_duration_days: float,
        harvest_cost_per_kg: float = 2.50,
        grade_multiplier: float = 1.0,
        is_cold_storage: bool = False
    ) -> Dict[str, Any]:
        """
        Deterministic evaluation of EFV for a single point estimate.
        Guarantees zero double-counting:
        1. Usable Weight: Q_usable = Q * (1 - SpoilageRate)
        2. Mechanical Damage Rate on Usable Produce: D = D_transit + D_handling
        3. Undamaged Sound Weight: Q_sound = Q_usable * (1 - D)
        4. Damaged Salvage Weight: Q_damaged = Q_usable * D (sold at discounted price)
        5. Gross Revenue = (Q_sound * P * Grade) + (Q_damaged * P * Grade * salvage_discount)
        6. EFV = Gross Revenue - Logistics Costs - Harvest Costs
        """
        # Guard spoilage rate
        s_rate = max(0.0, min(1.0, spoilage_rate))
        
        # 1. Spoilage directly destroys physical volume
        usable_kg = quantity_kg * (1.0 - s_rate)
        spoiled_kg = quantity_kg * s_rate
        
        # 2. Damage rate on surviving usable produce
        distance_factor = transit_distance_km / 100.0
        damage_rate = min(0.50, (self.transit_vibration_rate * distance_factor) + self.handling_shock_rate)
        
        # 3. Partition usable volume into sound vs damaged
        sound_kg = usable_kg * (1.0 - damage_rate)
        damaged_kg = usable_kg * damage_rate
        
        # 4. Effective prices
        effective_sound_price = market_price_per_kg * grade_multiplier
        effective_salvage_price = effective_sound_price * self.salvage_discount
        
        sound_revenue = sound_kg * effective_sound_price
        damaged_revenue = damaged_kg * effective_salvage_price
        gross_revenue = sound_revenue + damaged_revenue
        
        # 5. Logistics and Harvest Cost
        logistics = self.calculate_logistics_costs(
            quantity_kg=quantity_kg,
            transit_distance_km=transit_distance_km,
            storage_duration_days=storage_duration_days,
            is_cold_storage=is_cold_storage
        )
        harvest_cost_total = quantity_kg * harvest_cost_per_kg
        
        # 6. Net Expected Farmer Value
        net_efv = gross_revenue - logistics["total_logistics_inr"] - harvest_cost_total
        
        return {
            "gross_revenue_inr": round(gross_revenue, 2),
            "total_logistics_inr": logistics["total_logistics_inr"],
            "harvest_cost_inr": round(harvest_cost_total, 2),
            "net_efv_inr": round(net_efv, 2),
            "usable_kg": round(usable_kg, 2),
            "spoiled_kg": round(spoiled_kg, 2),
            "sound_kg": round(sound_kg, 2),
            "damaged_kg": round(damaged_kg, 2),
            "logistics_breakdown": logistics
        }

    def calculate_efv_vectorized(
        self,
        quantity_kg: float,
        spoilage_rates: np.ndarray,
        market_prices: np.ndarray,
        transit_distance_km: float,
        storage_duration_days: float,
        harvest_cost_per_kg: float = 2.50,
        grade_multiplier: float = 1.0,
        is_cold_storage: bool = False
    ) -> np.ndarray:
        """
        Vectorized calculation for Monte Carlo simulation arrays (N samples).
        """
        s_rates = np.clip(spoilage_rates, 0.0, 1.0)
        usable_kg = quantity_kg * (1.0 - s_rates)
        
        distance_factor = transit_distance_km / 100.0
        damage_rate = min(0.50, (self.transit_vibration_rate * distance_factor) + self.handling_shock_rate)
        
        sound_kg = usable_kg * (1.0 - damage_rate)
        damaged_kg = usable_kg * damage_rate
        
        effective_sound_price = market_prices * grade_multiplier
        effective_salvage_price = effective_sound_price * self.salvage_discount
        
        gross_revenue = (sound_kg * effective_sound_price) + (damaged_kg * effective_salvage_price)
        
        logistics = self.calculate_logistics_costs(
            quantity_kg=quantity_kg,
            transit_distance_km=transit_distance_km,
            storage_duration_days=storage_duration_days,
            is_cold_storage=is_cold_storage
        )
        total_costs = logistics["total_logistics_inr"] + (quantity_kg * harvest_cost_per_kg)
        
        net_efv_array = gross_revenue - total_costs
        return net_efv_array

efv_calculator = EFVCalculator()
