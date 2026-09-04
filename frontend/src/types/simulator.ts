export type CropType = 'Tomato' | 'Onion' | 'Potato' | 'Mango';
export type MaturityStage = 'Immature' | 'Optimal' | 'Ripe' | 'Overripe';
export type DecisionType = 'BUY_NOW' | 'WAIT' | 'REJECT' | 'CHANGE_OPTION';
export type DataSourceType = 'live' | 'cached' | 'demo';
export type DataStatusType = 'REAL_DATA' | 'LITERATURE_DERIVED' | 'ASSUMPTION' | 'SYNTHETIC_DEMO';

export interface OutcomeInterval {
  mean: number;
  median: number;
  p05: number;
  p95: number;
  prob_loss: number;
}

export interface SpoilageMetrics {
  mean_rate: number;
  p95_rate: number;
  effective_k: number;
  estimated_shelf_life_days: number;
}

export interface HarvestTimingOption {
  timing_label: 'Day 0 (Immediate)' | 'Day 3 (Delayed)' | 'Day 7 (Extended)';
  delay_days: number;
  efv_mean: number;
  efv_p05: number;
  efv_p95: number;
  spoilage_mean: number;
  prob_loss: number;
  recommendation: string;
}

export interface MarketOptionComparison {
  option_name: 'Direct Processing Unit' | 'Local Mandi / Deferred Sale';
  efv_mean: number;
  net_margin_inr: number;
  advantage_pct: number;
  recommendation_note: string;
}

export interface ScenarioResult {
  scenario_name: 'Normal Operating Conditions' | 'High Spoilage Risk (Heat/Delay)' | 'Market Risk (Price Crash)';
  decision: string;
  efv_mean: number;
  spoilage_mean: number;
  key_vulnerability: string;
}

export interface SensitivityFactor {
  parameter_name: string;
  base_value: number;
  low_efv: number;
  high_efv: number;
  swing_inr: number;
  rank: number;
}

export interface TippingPoint {
  parameter_name: string;
  current_value: number;
  unit: string;
  critical_threshold: number;
  delta_to_flip: number;
  target_decision: string;
  explanation: string;
}

export interface DataProvenanceItem {
  field: string;
  source_name: string;
  data_status: DataStatusType;
  confidence_penalty: number;
  citation_or_note: string;
}

export interface AnalysisResponse {
  id?: number;
  created_at: string;
  decision: DecisionType;
  decision_badge: string;
  recommendation_reliability: number;
  outcome_interval: OutcomeInterval;
  spoilage_metrics: SpoilageMetrics;
  timing_comparisons: HarvestTimingOption[];
  market_options: MarketOptionComparison[];
  scenario_simulations: ScenarioResult[];
  sensitivity_tornado: SensitivityFactor[];
  tipping_points: TippingPoint[];
  explanation: string;
  data_source: DataSourceType;
  data_provenance: DataProvenanceItem[];
  missing_fields: string[];
  simulation_seed?: number;
  model_version: string;
  parameter_version: string;
}

export interface AnalysisRequest {
  crop: CropType;
  maturity_stage: MaturityStage;
  quantity_kg: number;
  region: string;
  temperature_c?: number;
  relative_humidity_pct?: number;
  market_price_per_kg?: number;
  storage_duration_days: number;
  transport_duration_hours: number;
  transit_distance_km: number;
  simulation_seed?: number;
  mc_iterations?: number;
  force_data_source?: DataSourceType;
}

export interface BaselineCompareRequest {
  crop: string;
  sample_lots_count: number;
  fixed_price_threshold_inr: number;
  simulation_seed?: number;
}

export interface BaselineDiscrepancyItem {
  lot_id: number;
  crop: string;
  maturity_stage: string;
  temperature_c: number;
  storage_days: number;
  market_price_inr: number;
  baseline_decision: 'BUY' | 'REJECT';
  harvestiq_decision: DecisionType;
  is_discrepant: boolean;
  spoilage_rate_pct: number;
  realized_loss_baseline_inr: number;
  economic_value_saved_inr: number;
  discrepancy_reason: string;
}

export interface BaselineCompareResponse {
  total_lots_evaluated: number;
  discrepancy_count: number;
  discrepancy_rate_pct: number;
  total_baseline_spoilage_loss_inr: number;
  total_harvestiq_value_saved_inr: number;
  lots: BaselineDiscrepancyItem[];
  methodology_summary: string;
}

export interface HistoryItem {
  id: number;
  created_at: string;
  crop: string;
  maturity_stage: string;
  quantity_kg: number;
  region: string;
  temperature_c: number;
  market_price_per_kg: number;
  decision: DecisionType;
  recommendation_reliability: number;
  efv_mean: number;
  efv_p05: number;
  efv_p95: number;
  spoilage_mean: number;
  data_source: DataSourceType;
  simulation_seed?: number;
}
