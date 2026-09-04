"""
HarvestIQ - Rule-Based Explanation Generator
Synthesizes clear, review-defendable decision rationale directly from computed contributors (No LLM).
"""

from typing import Dict, Any, List
from app.schemas.response import OutcomeInterval, SpoilageMetrics

class ExplanationGenerator:
    def generate_explanation(
        self,
        decision: str,
        crop: str,
        maturity_stage: str,
        quantity_kg: float,
        temperature_c: float,
        interval: OutcomeInterval,
        spoilage: SpoilageMetrics,
        decision_meta: Dict[str, Any],
        missing_fields: List[str],
        reliability_score: float
    ) -> str:
        """
        Generates structured, plain-language explanation paragraphs.
        """
        lines = []
        
        # 1. Primary Recommendation
        lines.append(f"**Recommendation: {decision} ({decision_meta.get('reason', '')})**\n")
        lines.append(f"{decision_meta.get('action', '')}\n")
        
        # 2. Economic Value & Uncertainty Breakdown
        lines.append(
            f"• **Expected Farmer Value:** ₹{interval.mean:,.0f} (5th–95th percentile outcome range: ₹{interval.p05:,.0f} to ₹{interval.p95:,.0f}). "
            f"Probability of negative return: {interval.prob_loss * 100.0:.1f}%."
        )
        
        # 3. Spoilage & Quality Risk Drivers
        lines.append(
            f"• **Spoilage & Shelf Life:** Estimated ambient degradation rate is {spoilage.mean_rate * 100.0:.1f}% "
            f"(95th percentile upper risk: {spoilage.p95_rate * 100.0:.1f}%). "
            f"At {temperature_c:.1f}°C ambient temperature with '{maturity_stage}' maturity, remaining safe shelf life is ~{spoilage.estimated_shelf_life_days:.1f} days."
        )
        
        # 4. Recommendation Reliability & Data Caveats
        if reliability_score < 80.0:
            lines.append(
                f"• **Recommendation Reliability ({reliability_score:.0f}%):** "
                f"Confidence penalty applied due to {', '.join(missing_fields) if missing_fields else 'high outcome uncertainty'}. "
                f"Verify local ambient packhouse temperatures prior to high-volume commitments."
            )
        else:
            lines.append(
                f"• **Recommendation Reliability ({reliability_score:.0f}%):** High confidence backed by verified meteorological and APMC market inputs."
            )
            
        return "\n".join(lines)

explanation_generator = ExplanationGenerator()
