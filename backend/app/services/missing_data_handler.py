"""
HarvestIQ - Missing Data & Recommendation Reliability Handler
Detects omitted inputs, manages fallback chains, and calculates explicit reliability penalties.
"""

from typing import Dict, Any, List, Tuple
from app.config import RELIABILITY_PENALTIES
from app.schemas.response import DataProvenanceItem

class MissingDataHandler:
    def evaluate_inputs(
        self,
        weather_source: str,
        market_source: str,
        user_temp_provided: bool,
        user_price_provided: bool,
        maturity_stage: str,
        efv_p05: float,
        efv_p95: float,
        efv_median: float
    ) -> Tuple[float, List[str], List[DataProvenanceItem]]:
        """
        Calculates recommendation reliability score (0-100%) and generates data provenance list.
        """
        reliability = 100.0
        missing_fields = []
        provenance: List[DataProvenanceItem] = []
        
        # 1. Weather Provenance & Penalty
        if user_temp_provided:
            provenance.append(DataProvenanceItem(
                field="Ambient Temperature & Humidity",
                source_name="Direct User Field Measurement",
                data_status="REAL_DATA",
                confidence_penalty=0.0,
                citation_or_note="User provided on-site sensor / field observation."
            ))
        elif weather_source == "live":
            provenance.append(DataProvenanceItem(
                field="Ambient Temperature & Humidity",
                source_name="NASA POWER Agroclimatology API",
                data_status="REAL_DATA",
                confidence_penalty=0.0,
                citation_or_note="Real-time daily satellite & reanalysis meteorological observation."
            ))
        elif weather_source == "cached":
            penalty = RELIABILITY_PENALTIES["MISSING_LIVE_WEATHER"]
            reliability -= penalty
            missing_fields.append("Live Weather (Using 10-Yr Climatology Norms)")
            provenance.append(DataProvenanceItem(
                field="Ambient Temperature & Humidity",
                source_name="NASA POWER 10-Yr Monthly Climatology",
                data_status="REAL_DATA",
                confidence_penalty=penalty,
                citation_or_note=f"Live API unavailable or bypassed; applied -{penalty:.0f}% reliability penalty."
            ))
        else:
            penalty = RELIABILITY_PENALTIES["MISSING_LIVE_WEATHER"] + 5.0
            reliability -= penalty
            missing_fields.append("Weather (Using Default Demo Norms)")
            provenance.append(DataProvenanceItem(
                field="Ambient Temperature & Humidity",
                source_name="Simulated Regional Defaults",
                data_status="SYNTHETIC_DEMO",
                confidence_penalty=penalty,
                citation_or_note="Offline synthetic baseline."
            ))
            
        # 2. Market Price Provenance & Penalty
        if user_price_provided:
            provenance.append(DataProvenanceItem(
                field="Spot Procurement Market Price",
                source_name="User Specified Local Price",
                data_status="REAL_DATA",
                confidence_penalty=0.0,
                citation_or_note="Locally negotiated spot contract price."
            ))
        elif market_source == "cached":
            penalty = RELIABILITY_PENALTIES["MISSING_LIVE_MARKET"]
            reliability -= penalty
            missing_fields.append("Live Market Feed (Using 7-Day APMC Snapshot)")
            provenance.append(DataProvenanceItem(
                field="Spot Procurement Market Price",
                source_name="Agmarknet APMC Modal Snapshot",
                data_status="REAL_DATA",
                confidence_penalty=penalty,
                citation_or_note=f"Using verified 7-day APMC modal snapshot; applied -{penalty:.0f}% reliability penalty."
            ))
        else:
            penalty = RELIABILITY_PENALTIES["MISSING_LIVE_MARKET"] + 5.0
            reliability -= penalty
            missing_fields.append("Market Price (Using Demo Reference)")
            provenance.append(DataProvenanceItem(
                field="Spot Procurement Market Price",
                source_name="Default Commodity Reference",
                data_status="SYNTHETIC_DEMO",
                confidence_penalty=penalty,
                citation_or_note="Synthetic benchmark price."
            ))
            
        # 3. Maturity Stage Provenance
        provenance.append(DataProvenanceItem(
            field="Crop Maturity Stage",
            source_name=f"User Visual Grade ({maturity_stage})",
            data_status="LITERATURE_DERIVED",
            confidence_penalty=0.0,
            citation_or_note="Corresponds to respiration multipliers synthesized from Kader (2002)."
        ))
        
        # 4. Outcome Spread Check (High uncertainty penalty)
        spread = abs(efv_p95 - efv_p05)
        median_abs = max(1.0, abs(efv_median))
        if (spread / median_abs) > 1.2:
            penalty = RELIABILITY_PENALTIES["HIGH_SPREAD_PENALTY"]
            reliability -= penalty
            missing_fields.append("Wide Simulation Outcome Spread")
            
        reliability = max(10.0, min(100.0, round(reliability, 1)))
        return reliability, missing_fields, provenance

missing_data_handler = MissingDataHandler()
