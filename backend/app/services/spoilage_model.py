"""
HarvestIQ - Biological Spoilage Kinetics Model
Based on Arrhenius temperature respiration acceleration and maturity multipliers.

EXPLICIT PARAMETER PROVENANCE:
- T_ref = 20.0 degC (Literature: FAO Postharvest Series)
- Q10 = 2.15 (Literature: Kader, 2002, UC Davis)
- k0 crop constants (Literature: USDA Handbook 66 & ICAR-DOGR)
- beta_RH = 0.50 (Assumed - Needs Calibration)
"""

import math
from typing import Dict, Any, Tuple
from app.config import SPOILAGE_PARAMETERS

class SpoilageKineticsModel:
    def __init__(self):
        self.t_ref = SPOILAGE_PARAMETERS["REFERENCE_TEMPERATURE_C"]["value"]
        self.q10 = SPOILAGE_PARAMETERS["Q10_RESPIRATION_COEFFICIENT"]["value"]
        self.beta_rh = SPOILAGE_PARAMETERS["EXCESS_HUMIDITY_COEFFICIENT_BETA"]["value"]
        self.crop_params = SPOILAGE_PARAMETERS["CROPS"]
        self.maturity_params = SPOILAGE_PARAMETERS["MATURITY_STAGE_MULTIPLIERS"]

    def calculate_effective_rate(
        self,
        crop: str,
        maturity_stage: str,
        temperature_c: float,
        relative_humidity_pct: float
    ) -> Tuple[float, Dict[str, float]]:
        """
        Calculates effective quality degradation rate constant k_eff (1/day).
        k_eff = k0 * Q10^((T - T_ref)/10) * (1 + beta_RH * max(0, RH - RH_opt)/100) * M_stage
        """
        crop_data = self.crop_params.get(crop, self.crop_params["Tomato"])
        k0 = crop_data["k0"]
        rh_opt = crop_data["rh_opt"]
        
        maturity_data = self.maturity_params.get(maturity_stage, self.maturity_params["Optimal"])
        m_stage = maturity_data["multiplier"]
        
        # Temperature acceleration factor (Arrhenius / Q10 law)
        temp_factor = math.pow(self.q10, (temperature_c - self.t_ref) / 10.0)
        
        # Excess humidity acceleration factor
        excess_rh = max(0.0, relative_humidity_pct - rh_opt)
        rh_factor = 1.0 + (self.beta_rh * excess_rh / 100.0)
        
        # Effective rate
        k_eff = k0 * temp_factor * rh_factor * m_stage
        
        breakdown = {
            "base_k0": k0,
            "temperature_factor": temp_factor,
            "humidity_factor": rh_factor,
            "maturity_multiplier": m_stage,
            "k_eff": k_eff
        }
        return k_eff, breakdown

    def calculate_spoilage_rate(
        self,
        crop: str,
        maturity_stage: str,
        temperature_c: float,
        relative_humidity_pct: float,
        storage_days: float,
        transport_hours: float
    ) -> Dict[str, Any]:
        """
        Calculates expected spoilage fraction S(t) in range [0.0, 1.0].
        t_total = storage_days + (transport_hours / 24.0)
        S(t) = 1 - exp(- k_eff * t_total)
        """
        total_time_days = max(0.0, storage_days + (transport_hours / 24.0))
        k_eff, breakdown = self.calculate_effective_rate(
            crop=crop,
            maturity_stage=maturity_stage,
            temperature_c=temperature_c,
            relative_humidity_pct=relative_humidity_pct
        )
        
        spoilage_fraction = 1.0 - math.exp(- k_eff * total_time_days)
        # Numerical guard
        spoilage_fraction = max(0.0, min(1.0, spoilage_fraction))
        
        # Shelf life remaining until 50% quality deterioration
        shelf_life_days = math.log(2.0) / k_eff if k_eff > 0 else 999.0
        
        return {
            "spoilage_rate": spoilage_fraction,
            "spoilage_pct": round(spoilage_fraction * 100.0, 2),
            "effective_k": round(k_eff, 4),
            "total_exposure_days": round(total_time_days, 2),
            "estimated_shelf_life_days": round(shelf_life_days, 1),
            "breakdown": breakdown
        }

spoilage_model = SpoilageKineticsModel()
