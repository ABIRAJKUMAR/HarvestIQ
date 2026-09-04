"""
HarvestIQ - Main Analysis API Route (/api/analyze)
Executes full decision-support pipeline from user inputs to Monte Carlo, decision, sensitivity, and provenance.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.models.database import get_db
from app.models.analysis_record import AnalysisRecord
from app.config import settings
from app.schemas.request import AnalysisRequest
from app.schemas.response import (
    AnalysisResponse,
    OutcomeInterval,
    SpoilageMetrics,
    HarvestTimingOption,
    MarketOptionComparison,
    ScenarioResult,
)
from app.services.weather_service import weather_service
from app.services.market_service import market_service
from app.services.spoilage_model import spoilage_model
from app.services.monte_carlo import monte_carlo_engine
from app.services.decision_engine import decision_engine
from app.services.sensitivity_engine import sensitivity_engine
from app.services.missing_data_handler import missing_data_handler
from app.services.explanation_generator import explanation_generator

router = APIRouter(prefix="/api", tags=["Analysis"])

@router.post("/analyze", response_model=AnalysisResponse)
def analyze_lot(request: AnalysisRequest, db: Session = Depends(get_db)):
    """
    Full pipeline execution for harvest timing and market option simulation.
    """
    # 1. Resolve Weather
    user_temp_provided = request.temperature_c is not None
    if user_temp_provided:
        temp_c = request.temperature_c
        rh_pct = request.relative_humidity_pct if request.relative_humidity_pct is not None else 75.0
        weather_source = "user"
    else:
        temp_c, rh_pct, weather_source, _ = weather_service.get_weather(
            region=request.region,
            force_tier=request.force_data_source
        )

    # 2. Resolve Market Price
    user_price_provided = request.market_price_per_kg is not None
    if user_price_provided:
        price_per_kg = request.market_price_per_kg
        market_source = "user"
    else:
        price_per_kg, market_source, _ = market_service.get_market_price(
            crop=request.crop,
            region=request.region,
            force_tier=request.force_data_source
        )

    # Overall data source tier
    if weather_source == "live" and market_source == "live":
        overall_data_source = "live"
    elif "demo" in [weather_source, market_source]:
        overall_data_source = "demo"
    else:
        overall_data_source = "cached"

    # 3. Run Monte Carlo for Day 0 (Immediate Harvest & Direct Processing)
    mc_day0 = monte_carlo_engine.run_simulation(
        crop=request.crop,
        maturity_stage=request.maturity_stage,
        quantity_kg=request.quantity_kg,
        temperature_c=temp_c,
        relative_humidity_pct=rh_pct,
        market_price_per_kg=price_per_kg,
        storage_days=request.storage_duration_days,
        transport_hours=request.transport_duration_hours,
        transit_distance_km=request.transit_distance_km,
        delay_days=0,
        num_iterations=request.mc_iterations or 1000,
        simulation_seed=request.simulation_seed
    )

    # 4. Run Monte Carlo for Harvest Timing Windows (Day 3 & Day 7)
    mc_day3 = monte_carlo_engine.run_simulation(
        crop=request.crop,
        maturity_stage=request.maturity_stage,
        quantity_kg=request.quantity_kg,
        temperature_c=temp_c,
        relative_humidity_pct=rh_pct,
        market_price_per_kg=price_per_kg,
        storage_days=request.storage_duration_days,
        transport_hours=request.transport_duration_hours,
        transit_distance_km=request.transit_distance_km,
        delay_days=3,
        num_iterations=request.mc_iterations or 1000,
        simulation_seed=(request.simulation_seed + 3) if request.simulation_seed else None
    )

    mc_day7 = monte_carlo_engine.run_simulation(
        crop=request.crop,
        maturity_stage=request.maturity_stage,
        quantity_kg=request.quantity_kg,
        temperature_c=temp_c,
        relative_humidity_pct=rh_pct,
        market_price_per_kg=price_per_kg,
        storage_days=request.storage_duration_days,
        transport_hours=request.transport_duration_hours,
        transit_distance_km=request.transit_distance_km,
        delay_days=7,
        num_iterations=request.mc_iterations or 1000,
        simulation_seed=(request.simulation_seed + 7) if request.simulation_seed else None
    )

    # 5. Run Market Option Simulation (Local Mandi Spot Sale)
    mc_mandi = monte_carlo_engine.run_simulation(
        crop=request.crop,
        maturity_stage=request.maturity_stage,
        quantity_kg=request.quantity_kg,
        temperature_c=temp_c,
        relative_humidity_pct=rh_pct,
        market_price_per_kg=price_per_kg * 1.06,
        storage_days=request.storage_duration_days + 0.5,
        transport_hours=request.transport_duration_hours * 0.6,
        transit_distance_km=request.transit_distance_km * 0.5,
        delay_days=0,
        num_iterations=request.mc_iterations or 1000,
        simulation_seed=(request.simulation_seed + 10) if request.simulation_seed else None
    )

    # 6. Run 3 Standard Operating Scenarios
    mc_scen_spoilage = monte_carlo_engine.run_simulation(
        crop=request.crop,
        maturity_stage="Ripe" if request.maturity_stage in ["Immature", "Optimal"] else "Overripe",
        quantity_kg=request.quantity_kg,
        temperature_c=temp_c + 6.0,
        relative_humidity_pct=min(95.0, rh_pct + 15.0),
        market_price_per_kg=price_per_kg,
        storage_days=request.storage_duration_days + 2.0,
        transport_hours=request.transport_duration_hours + 10.0,
        transit_distance_km=request.transit_distance_km,
        delay_days=0,
        num_iterations=500,
        simulation_seed=(request.simulation_seed + 20) if request.simulation_seed else None
    )

    mc_scen_market_risk = monte_carlo_engine.run_simulation(
        crop=request.crop,
        maturity_stage=request.maturity_stage,
        quantity_kg=request.quantity_kg,
        temperature_c=temp_c,
        relative_humidity_pct=rh_pct,
        market_price_per_kg=price_per_kg * 0.75,
        storage_days=request.storage_duration_days,
        transport_hours=request.transport_duration_hours,
        transit_distance_km=request.transit_distance_km,
        delay_days=0,
        num_iterations=500,
        simulation_seed=(request.simulation_seed + 30) if request.simulation_seed else None
    )

    # 7. Evaluate Recommendation Reliability & Data Provenance
    reliability_score, missing_fields, provenance = missing_data_handler.evaluate_inputs(
        weather_source=weather_source,
        market_source=market_source,
        user_temp_provided=user_temp_provided,
        user_price_provided=user_price_provided,
        maturity_stage=request.maturity_stage,
        efv_p05=mc_day0["efv_p05"],
        efv_p95=mc_day0["efv_p95"],
        efv_median=mc_day0["efv_median"]
    )

    # 8. Evaluate Centralized Decision
    decision, decision_badge, decision_meta = decision_engine.evaluate_decision(
        efv_day0=mc_day0["efv_mean"],
        efv_day3=mc_day3["efv_mean"],
        efv_day7=mc_day7["efv_mean"],
        spoilage_mean_day0=mc_day0["spoilage_mean"],
        spoilage_p95_day0=mc_day0["spoilage_p95"],
        prob_loss_day0=mc_day0["prob_loss"],
        efv_mandi_option=mc_mandi["efv_mean"],
        reliability_score=reliability_score
    )

    # 9. Spoilage Kinetics Metrics
    spoilage_info = spoilage_model.calculate_spoilage_rate(
        crop=request.crop,
        maturity_stage=request.maturity_stage,
        temperature_c=temp_c,
        relative_humidity_pct=rh_pct,
        storage_days=request.storage_duration_days,
        transport_hours=request.transport_duration_hours
    )

    spoilage_metrics = SpoilageMetrics(
        mean_rate=mc_day0["spoilage_mean"],
        p95_rate=mc_day0["spoilage_p95"],
        effective_k=spoilage_info["effective_k"],
        estimated_shelf_life_days=spoilage_info["estimated_shelf_life_days"]
    )

    # 10. Timing Options
    timing_comparisons = [
        HarvestTimingOption(
            timing_label="Day 0 (Immediate)",
            delay_days=0,
            efv_mean=mc_day0["efv_mean"],
            efv_p05=mc_day0["efv_p05"],
            efv_p95=mc_day0["efv_p95"],
            spoilage_mean=mc_day0["spoilage_mean"],
            prob_loss=mc_day0["prob_loss"],
            recommendation="Baseline immediate procurement"
        ),
        HarvestTimingOption(
            timing_label="Day 3 (Delayed)",
            delay_days=3,
            efv_mean=mc_day3["efv_mean"],
            efv_p05=mc_day3["efv_p05"],
            efv_p95=mc_day3["efv_p95"],
            spoilage_mean=mc_day3["spoilage_mean"],
            prob_loss=mc_day3["prob_loss"],
            recommendation="Favorable if price trend positive" if mc_day3["efv_mean"] > mc_day0["efv_mean"] else "Spoilage offsets price gains"
        ),
        HarvestTimingOption(
            timing_label="Day 7 (Extended)",
            delay_days=7,
            efv_mean=mc_day7["efv_mean"],
            efv_p05=mc_day7["efv_p05"],
            efv_p95=mc_day7["efv_p95"],
            spoilage_mean=mc_day7["spoilage_mean"],
            prob_loss=mc_day7["prob_loss"],
            recommendation="High spoilage risk accumulation" if mc_day7["spoilage_mean"] > 0.30 else "Viable for hardy cultivars"
        )
    ]

    # 11. Market Options
    mandi_advantage_pct = ((mc_mandi["efv_mean"] - mc_day0["efv_mean"]) / max(1.0, mc_day0["efv_mean"])) * 100.0
    market_options = [
        MarketOptionComparison(
            option_name="Direct Processing Unit",
            efv_mean=mc_day0["efv_mean"],
            net_margin_inr=mc_day0["efv_mean"],
            advantage_pct=0.0,
            recommendation_note="Guaranteed offtake contract, lower price volatility."
        ),
        MarketOptionComparison(
            option_name="Local Mandi / Deferred Sale",
            efv_mean=mc_mandi["efv_mean"],
            net_margin_inr=mc_mandi["efv_mean"],
            advantage_pct=round(mandi_advantage_pct, 1),
            recommendation_note="Higher spot potential but exposes seller to daily auction volatility."
        )
    ]

    # 12. Scenarios
    scenario_simulations = [
        ScenarioResult(
            scenario_name="Normal Operating Conditions",
            decision=decision,
            efv_mean=mc_day0["efv_mean"],
            spoilage_mean=mc_day0["spoilage_mean"],
            key_vulnerability="Standard ambient seasonal temperature"
        ),
        ScenarioResult(
            scenario_name="High Spoilage Risk (Heat/Delay)",
            decision="REJECT" if mc_scen_spoilage["spoilage_p95"] > 0.50 else "BUY_NOW",
            efv_mean=mc_scen_spoilage["efv_mean"],
            spoilage_mean=mc_scen_spoilage["spoilage_mean"],
            key_vulnerability="Temperature surge (+6°C) and +10h transit delay"
        ),
        ScenarioResult(
            scenario_name="Market Risk (Price Crash)",
            decision="REJECT" if mc_scen_market_risk["prob_loss"] > 0.30 else "BUY_NOW",
            efv_mean=mc_scen_market_risk["efv_mean"],
            spoilage_mean=mc_scen_market_risk["spoilage_mean"],
            key_vulnerability="Mandi market price drop (-25%)"
        )
    ]

    # 13. Sensitivity & Tipping Points
    tornado_list, tipping_points = sensitivity_engine.run_tornado_analysis(
        crop=request.crop,
        maturity_stage=request.maturity_stage,
        quantity_kg=request.quantity_kg,
        temperature_c=temp_c,
        relative_humidity_pct=rh_pct,
        market_price_per_kg=price_per_kg,
        storage_days=request.storage_duration_days,
        transport_hours=request.transport_duration_hours,
        transit_distance_km=request.transit_distance_km,
        simulation_seed=request.simulation_seed or 42
    )

    # 14. Outcome Interval Object
    outcome_interval = OutcomeInterval(
        mean=mc_day0["efv_mean"],
        median=mc_day0["efv_median"],
        p05=mc_day0["efv_p05"],
        p95=mc_day0["efv_p95"],
        prob_loss=mc_day0["prob_loss"]
    )

    # 15. Explanation Generation
    explanation = explanation_generator.generate_explanation(
        decision=decision,
        crop=request.crop,
        maturity_stage=request.maturity_stage,
        quantity_kg=request.quantity_kg,
        temperature_c=temp_c,
        interval=outcome_interval,
        spoilage=spoilage_metrics,
        decision_meta=decision_meta,
        missing_fields=missing_fields,
        reliability_score=reliability_score
    )

    # 16. Persist Audit Record in SQLite
    record = AnalysisRecord(
        crop=request.crop,
        maturity_stage=request.maturity_stage,
        quantity_kg=request.quantity_kg,
        region=request.region,
        temperature_c=temp_c,
        relative_humidity_pct=rh_pct,
        market_price_per_kg=price_per_kg,
        storage_duration_days=request.storage_duration_days,
        transport_duration_hours=request.transport_duration_hours,
        decision=decision,
        recommendation_reliability=reliability_score,
        efv_mean=mc_day0["efv_mean"],
        efv_median=mc_day0["efv_median"],
        efv_p05=mc_day0["efv_p05"],
        efv_p95=mc_day0["efv_p95"],
        prob_loss=mc_day0["prob_loss"],
        spoilage_mean=mc_day0["spoilage_mean"],
        spoilage_p95=mc_day0["spoilage_p95"],
        explanation=explanation,
        data_source=overall_data_source,
        simulation_seed=request.simulation_seed,
        model_version=settings.MODEL_VERSION,
        parameter_version=settings.PARAMETER_VERSION,
        provenance_json=[p.model_dump() for p in provenance],
        full_result_json={
            "timing_comparisons": [t.model_dump() for t in timing_comparisons],
            "market_options": [m.model_dump() for m in market_options],
            "scenario_simulations": [s.model_dump() for s in scenario_simulations]
        }
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    # 17. Return Full Response
    return AnalysisResponse(
        id=record.id,
        created_at=record.created_at,
        decision=decision,
        decision_badge=decision_badge,
        recommendation_reliability=reliability_score,
        outcome_interval=outcome_interval,
        spoilage_metrics=spoilage_metrics,
        timing_comparisons=timing_comparisons,
        market_options=market_options,
        scenario_simulations=scenario_simulations,
        sensitivity_tornado=tornado_list,
        tipping_points=tipping_points,
        explanation=explanation,
        data_source=overall_data_source,
        data_provenance=provenance,
        missing_fields=missing_fields,
        simulation_seed=request.simulation_seed,
        model_version=settings.MODEL_VERSION,
        parameter_version=settings.PARAMETER_VERSION
    )
