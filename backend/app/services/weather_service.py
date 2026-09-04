"""
HarvestIQ - Weather Data Service
Integrates NASA POWER API for live agroclimatology with seamless offline fallback to regional climatology.
"""

import json
import requests
from typing import Dict, Any, Tuple
from app.config import settings

class WeatherService:
    def __init__(self):
        self.fallback_file = settings.WEATHER_CLIMATOLOGY_FILE
        self._load_fallback_data()

    def _load_fallback_data(self):
        try:
            with open(self.fallback_file, "r", encoding="utf-8") as f:
                self.climatology_data = json.load(f)
        except Exception:
            self.climatology_data = {"regions": {}}

    def get_weather(
        self,
        region: str = "Dindigul_TN",
        month: int = 4,
        force_tier: str = None
    ) -> Tuple[float, float, str, Dict[str, Any]]:
        """
        Returns (temperature_c, relative_humidity_pct, data_source, metadata).
        Data source is one of: 'live', 'cached', 'demo'.
        """
        # If forced to demo/cached for review demonstration
        if force_tier in ["cached", "demo"]:
            return self._get_fallback_weather(region, month, tier=force_tier)
            
        region_info = self.climatology_data.get("regions", {}).get(region, {})
        lat = region_info.get("lat", 10.3673)
        lon = region_info.get("lon", 77.9803)
        
        # Attempt Live NASA POWER Call
        try:
            url = f"{settings.NASA_POWER_BASE_URL}?parameters=T2M,RH2M&community=AG&longitude={lon}&latitude={lat}&format=JSON&header=false"
            response = requests.get(url, timeout=settings.API_TIMEOUT_SECONDS)
            if response.status_code == 200:
                data = response.json()
                properties = data.get("properties", {}).get("parameter", {})
                t2m_dict = properties.get("T2M", {})
                rh2m_dict = properties.get("RH2M", {})
                
                # Take most recent valid entry
                valid_temps = [v for v in t2m_dict.values() if v is not None and v > -90]
                valid_rhs = [v for v in rh2m_dict.values() if v is not None and v > 0]
                
                if valid_temps and valid_rhs:
                    temp = float(valid_temps[-1])
                    rh = float(valid_rhs[-1])
                    return temp, rh, "live", {
                        "source": "NASA POWER API (Agroclimatology)",
                        "lat": lat,
                        "lon": lon,
                        "status": "REAL_DATA"
                    }
        except Exception:
            pass  # Fall through to cached climatology
            
        return self._get_fallback_weather(region, month, tier="cached")

    def _get_fallback_weather(self, region: str, month: int, tier: str = "cached") -> Tuple[float, float, str, Dict[str, Any]]:
        region_info = self.climatology_data.get("regions", {}).get(region)
        if not region_info:
            # Universal default fallback
            return 28.0, 70.0, "demo", {
                "source": "Default Benchmark Simulation Norms",
                "status": "SYNTHETIC_DEMO"
            }
            
        monthly_avg = region_info.get("monthly_averages", {}).get(str(month), {"temp_c": 28.0, "humidity_pct": 70.0})
        temp = monthly_avg.get("temp_c", 28.0)
        rh = monthly_avg.get("humidity_pct", 70.0)
        
        return temp, rh, tier, {
            "source": f"NASA POWER 10-Yr Climatology ({region_info.get('name', region)})",
            "status": "REAL_DATA" if tier == "cached" else "SYNTHETIC_DEMO"
        }

weather_service = WeatherService()
