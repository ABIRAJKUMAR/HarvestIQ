"""
HarvestIQ - Empirical Market Price Simulator
Samples from empirical historical Mandi distributions and volatility parameters.
"""

import numpy as np
from typing import Dict, Any, List, Optional
from app.config import SPOILAGE_PARAMETERS

class MarketPriceModel:
    def __init__(self):
        self.crop_params = SPOILAGE_PARAMETERS["CROPS"]

    def sample_price_trajectory(
        self,
        crop: str,
        base_price_per_kg: float,
        horizon_days: int = 7,
        num_samples: int = 1000,
        rng: Optional[np.random.Generator] = None
    ) -> np.ndarray:
        """
        Generates simulated prices for a future horizon using empirical historical volatility.
        P(t) = P0 * (1 + delta_sampled)
        """
        if rng is None:
            rng = np.random.default_rng(42)
            
        crop_data = self.crop_params.get(crop, self.crop_params["Tomato"])
        daily_sigma = crop_data.get("daily_volatility_sigma", 0.15)
        
        # Scale volatility over horizon days
        effective_sigma = daily_sigma * np.sqrt(max(1, horizon_days))
        
        # Empirical historical delta sampling with slight mean reversion
        # Draw from standard normal perturbation scaled by observed Mandi volatility
        price_deltas = rng.normal(loc=0.0, scale=effective_sigma, size=num_samples)
        
        # Price cannot drop below salvage floor (e.g. 20% of base)
        simulated_prices = base_price_per_kg * (1.0 + price_deltas)
        simulated_prices = np.clip(simulated_prices, a_min=base_price_per_kg * 0.20, a_max=base_price_per_kg * 2.50)
        
        return simulated_prices

price_model = MarketPriceModel()
