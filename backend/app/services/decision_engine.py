"""
HarvestIQ - Centralized Rule-Based Decision Engine
Applies transparent, configurable thresholds to Monte Carlo simulation distributions.
"""

from typing import Dict, Any, Tuple
from app.config import DECISION_CONFIG

class DecisionEngine:
    def __init__(self):
        self.config = DECISION_CONFIG

    def evaluate_decision(
        self,
        efv_day0: float,
        efv_day3: float,
        efv_day7: float,
        spoilage_mean_day0: float,
        spoilage_p95_day0: float,
        prob_loss_day0: float,
        efv_mandi_option: float,
        reliability_score: float
    ) -> Tuple[str, str, Dict[str, Any]]:
        """
        Determines the optimal harvest & procurement decision:
        - REJECT: Extreme spoilage or negative expected profit.
        - CHANGE_OPTION: Mandi / open market sale significantly beats direct processing.
        - WAIT: Delayed harvest provides substantial positive expected value exceeding hurdle margin.
        - BUY_NOW: Immediate harvest locks in safe positive value.
        """
        # Thresholds
        extreme_spoilage_thresh = self.config["EXTREME_SPOILAGE_P95_THRESHOLD"]
        mean_spoilage_thresh = self.config["MEAN_SPOILAGE_REJECT_THRESHOLD"]
        profit_hurdle = self.config["MIN_PROFIT_HURDLE_INR"]
        wait_advantage_hurdle = self.config["WAIT_MIN_ADVANTAGE_INR"]
        wait_max_loss_prob = self.config["WAIT_MAX_PROB_LOSS"]
        wait_max_spoilage = self.config["WAIT_MAX_SPOILAGE_P95"]
        option_advantage_pct = self.config["CHANGE_OPTION_MIN_ADVANTAGE_PCT"]
        
        # 1. Check REJECT Conditions
        if spoilage_p95_day0 >= extreme_spoilage_thresh:
            return (
                "REJECT",
                "CRITICAL SPOILAGE RISK",
                {
                    "reason": f"95th percentile spoilage risk ({spoilage_p95_day0*100:.1f}%) exceeds safety ceiling ({extreme_spoilage_thresh*100:.0f}%).",
                    "action": "Do not purchase this lot for processing; quality degradation exceeds commercial recovery limit."
                }
            )
            
        if spoilage_mean_day0 >= mean_spoilage_thresh:
            return (
                "REJECT",
                "HIGH MEAN SPOILAGE",
                {
                    "reason": f"Expected average spoilage ({spoilage_mean_day0*100:.1f}%) exceeds tolerable processing threshold ({mean_spoilage_thresh*100:.0f}%).",
                    "action": "Reject lot due to poor postharvest shelf life."
                }
            )
            
        if efv_day0 < profit_hurdle and efv_day3 < profit_hurdle and efv_day7 < profit_hurdle:
            return (
                "REJECT",
                "UNPROFITABLE LOT",
                {
                    "reason": f"Expected Net Farmer Value (₹{efv_day0:,.0f}) is below minimum economic hurdle (₹{profit_hurdle:,.0f}).",
                    "action": "Procurement costs and logistics exceed market value."
                }
            )
            
        if prob_loss_day0 > 0.40:
            return (
                "REJECT",
                "EXCESSIVE DOWNSIDE RISK",
                {
                    "reason": f"Probability of net loss ({prob_loss_day0*100:.1f}%) is too high under current market conditions.",
                    "action": "Reject procurement contract or renegotiate procurement price downward."
                }
            )
            
        # 2. Check CHANGE_OPTION Condition (Mandi Sale vs Direct Processing)
        if efv_mandi_option > (efv_day0 * (1.0 + option_advantage_pct)) and spoilage_p95_day0 < 0.40:
            advantage_inr = efv_mandi_option - efv_day0
            advantage_pct_calc = (advantage_inr / max(1.0, efv_day0)) * 100.0
            return (
                "CHANGE_OPTION",
                "MANDI ARBITRAGE ADVANTAGE",
                {
                    "reason": f"Local Mandi spot sale yields +{advantage_pct_calc:.1f}% (+₹{advantage_inr:,.0f}) higher net value than direct processing procurement.",
                    "action": "Reroute lot to local APMC Mandi or negotiate spot price."
                }
            )
            
        # 3. Check WAIT Condition (Harvest Timing Optimization)
        best_delay_efv = max(efv_day3, efv_day7)
        delay_advantage = best_delay_efv - efv_day0
        
        if (
            delay_advantage >= wait_advantage_hurdle and
            prob_loss_day0 <= wait_max_loss_prob and
            spoilage_p95_day0 <= wait_max_spoilage
        ):
            target_day = "Day 3" if efv_day3 >= efv_day7 else "Day 7"
            return (
                "WAIT",
                f"DELAY HARVEST TO {target_day.upper()}",
                {
                    "reason": f"Delaying harvest to {target_day} yields +₹{delay_advantage:,.0f} higher expected value with acceptable spoilage risk.",
                    "action": f"Advise farmer to hold harvest until {target_day} for higher market return/yield."
                }
            )
            
        # 4. Default: BUY_NOW
        return (
            "BUY_NOW",
            "PROCEED WITH HARVEST & PROCUREMENT",
            {
                "reason": f"Immediate harvest locks in ₹{efv_day0:,.0f} expected value with low spoilage exposure ({spoilage_mean_day0*100:.1f}%).",
                "action": "Execute procurement contract immediately."
            }
        )

decision_engine = DecisionEngine()
