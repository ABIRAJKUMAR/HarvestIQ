import React, { useState } from 'react';
import type { AnalysisRequest, AnalysisResponse, CropType, MaturityStage } from '../types/simulator';
import { api } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { ReliabilityBanner } from '../components/ReliabilityBanner';
import { DecisionBadge } from '../components/DecisionBadge';
import { OutcomeIntervalGrid } from '../components/OutcomeIntervalGrid';
import { HarvestTimingCurve } from '../components/HarvestTimingCurve';
import { MarketOptionsView } from '../components/MarketOptionsView';
import { SensitivityTornado } from '../components/SensitivityTornado';
import { TippingPointsCard } from '../components/TippingPointsCard';
import { EdgeCasePresetSelector } from '../components/EdgeCasePresetSelector';
import { ExplanationCard } from '../components/ExplanationCard';
import {
  Play,
  Sliders,
  CloudSun,
  Truck,
  AlertCircle,
  CheckCircle2,
  Download,
  Table,
  FileJson
} from 'lucide-react';
import {
  downloadExecutiveReport,
  downloadCsvReport,
  downloadJsonReport
} from '../utils/reportGenerator';

interface SimulatorViewProps {
  initialData?: AnalysisResponse | null;
  onAnalysisComplete?: (data: AnalysisResponse) => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  initialData,
  onAnalysisComplete
}) => {
  const { t } = useLanguage();

  // Form State
  const [crop, setCrop] = useState<CropType>('Tomato');
  const [maturity, setMaturity] = useState<MaturityStage>('Optimal');
  const [quantityKg, setQuantityKg] = useState<number>(1000);
  const [region, setRegion] = useState<string>('Dindigul_TN');
  
  const [useCustomWeather, setUseCustomWeather] = useState<boolean>(false);
  const [tempC, setTempC] = useState<number>(28);
  const [rhPct, setRhPct] = useState<number>(80);

  const [useCustomPrice, setUseCustomPrice] = useState<boolean>(false);
  const [marketPrice, setMarketPrice] = useState<number>(24);

  const [storageDays, setStorageDays] = useState<number>(1.0);
  const [transitHours, setTransitHours] = useState<number>(6.0);
  const [transitDistKm, setTransitDistKm] = useState<number>(100.0);
  const [simSeed, setSimSeed] = useState<number>(42);

  // Execution State
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(initialData || null);

  const handleRunSimulation = async (customPayload?: AnalysisRequest) => {
    setLoading(true);
    setError(null);

    const payload: AnalysisRequest = customPayload || {
      crop,
      maturity_stage: maturity,
      quantity_kg: quantityKg,
      region,
      temperature_c: useCustomWeather ? tempC : undefined,
      relative_humidity_pct: useCustomWeather ? rhPct : undefined,
      market_price_per_kg: useCustomPrice ? marketPrice : undefined,
      storage_duration_days: storageDays,
      transport_duration_hours: transitHours,
      transit_distance_km: transitDistKm,
      simulation_seed: simSeed,
      mc_iterations: 1000
    };

    try {
      const data = await api.analyzeLot(payload);
      setResult(data);
      if (onAnalysisComplete) onAnalysisComplete(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Simulation execution failed. Please verify backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (preset: AnalysisRequest) => {
    setCrop(preset.crop);
    setMaturity(preset.maturity_stage);
    setQuantityKg(preset.quantity_kg);
    setRegion(preset.region);
    
    if (preset.temperature_c !== undefined) {
      setUseCustomWeather(true);
      setTempC(preset.temperature_c);
      setRhPct(preset.relative_humidity_pct || 75);
    } else {
      setUseCustomWeather(false);
    }

    if (preset.market_price_per_kg !== undefined) {
      setUseCustomPrice(true);
      setMarketPrice(preset.market_price_per_kg);
    } else {
      setUseCustomPrice(false);
    }

    setStorageDays(preset.storage_duration_days);
    setTransitHours(preset.transport_duration_hours);
    setTransitDistKm(preset.transit_distance_km);
    setSimSeed(preset.simulation_seed || 42);

    handleRunSimulation(preset);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Quick Edge-Case Presets Bar */}
      <EdgeCasePresetSelector onSelectPreset={handleApplyPreset} />

      {/* 2. Top Section: Step 1 - Procurement & Field Parameters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5 transition-colors">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 dark:border-slate-800 gap-2">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 inline-block mb-1">
              Step 1
            </span>
            <h2 className="font-heading text-lg font-bold text-stone-900 dark:text-white flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              <span>{t('form_title')}</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-slate-400 font-medium mt-0.5">
              {t('form_subtitle')}
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-stone-500 dark:text-slate-400 font-semibold">{t('sim_seed_label')}:</span>
            <input
              type="number"
              value={simSeed}
              onChange={(e) => setSimSeed(Number(e.target.value))}
              className="w-20 bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-stone-800 dark:text-slate-100 font-bold text-right focus:ring-1 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* 4-Card Parameter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Commodity & Quality */}
          <div className="p-4 rounded-xl bg-stone-50/70 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700/80 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-slate-300 block">
              1. Crop & Ripeness
            </span>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                {t('crop_label')}
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value as CropType)}
                className="w-full bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-white font-bold focus:ring-1 focus:ring-emerald-600"
              >
                <option value="Tomato">Tomato (தக்காளி)</option>
                <option value="Onion">Onion (வெங்காயம்)</option>
                <option value="Potato">Potato (உருளைக்கிழங்கு)</option>
                <option value="Mango">Mango (மாம்பழம்)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                {t('maturity_label')}
              </label>
              <select
                value={maturity}
                onChange={(e) => setMaturity(e.target.value as MaturityStage)}
                className="w-full bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-white font-bold focus:ring-1 focus:ring-emerald-600"
              >
                <option value="Immature">Immature (முதிராதது)</option>
                <option value="Optimal">Optimal (சரியான பக்குவம்)</option>
                <option value="Ripe">Ripe (பழுத்தது)</option>
                <option value="Overripe">Overripe (அதிகம் பழுத்தது)</option>
              </select>
            </div>
          </div>

          {/* Card 2: Lot Weight & Hub Region */}
          <div className="p-4 rounded-xl bg-stone-50/70 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700/80 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-slate-300 block">
              2. Quantity & Location
            </span>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                {t('quantity_label')}
              </label>
              <input
                type="number"
                min="100"
                max="50000"
                step="100"
                value={quantityKg}
                onChange={(e) => setQuantityKg(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-white font-bold focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                {t('region_label')}
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-white font-bold focus:ring-1 focus:ring-emerald-600"
              >
                <option value="Dindigul_TN">Dindigul (Tamil Nadu)</option>
                <option value="Kolar_KA">Kolar (Karnataka)</option>
                <option value="Nashik_MH">Nashik (Maharashtra)</option>
              </select>
            </div>
          </div>

          {/* Card 3: Meteorological Environment */}
          <div className="p-4 rounded-xl bg-stone-50/70 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-slate-300 flex items-center space-x-1.5">
                <CloudSun className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>3. Temperature & Weather</span>
              </span>
              <button
                type="button"
                onClick={() => setUseCustomWeather(!useCustomWeather)}
                className="text-[11px] text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-300 font-bold hover:underline"
              >
                {useCustomWeather ? t('auto_weather') : t('custom_weather')}
              </button>
            </div>

            {useCustomWeather ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 dark:text-slate-400 mb-1">
                    {t('temp_label')}
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="50"
                    value={tempC}
                    onChange={(e) => setTempC(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-900 dark:text-white font-bold focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 dark:text-slate-400 mb-1">
                    {t('rh_label')}
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="100"
                    value={rhPct}
                    onChange={(e) => setRhPct(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-900 dark:text-white font-bold focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>
            ) : (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-stone-200 dark:border-slate-700 text-xs text-stone-600 dark:text-slate-400 space-y-1">
                <div className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  <span>NASA POWER Live Feed</span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-slate-500">Auto-resolved based on {region.split('_')[0]} grid.</p>
              </div>
            )}
          </div>

          {/* Card 4: Market Price & Logistics */}
          <div className="p-4 rounded-xl bg-stone-50/70 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-slate-300 flex items-center space-x-1.5">
                <Truck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>4. Storage & Transport</span>
              </span>
              <button
                type="button"
                onClick={() => setUseCustomPrice(!useCustomPrice)}
                className="text-[11px] text-emerald-800 dark:text-emerald-400 font-bold hover:underline"
              >
                {useCustomPrice ? t('auto_market') : t('custom_market')}
              </button>
            </div>

            {useCustomPrice && (
              <div>
                <label className="text-[11px] font-semibold text-stone-600 dark:text-slate-400">{t('price_label')}</label>
                <input
                  type="number"
                  min="2"
                  max="200"
                  step="0.5"
                  value={marketPrice}
                  onChange={(e) => setMarketPrice(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-900 dark:text-white font-bold"
                />
              </div>
            )}

            <div className="grid grid-cols-3 gap-1.5 text-xs pt-1">
              <div>
                <label className="text-[10px] font-semibold text-stone-500 dark:text-slate-400">Hold (d)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={storageDays}
                  onChange={(e) => setStorageDays(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-stone-900 dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-stone-500 dark:text-slate-400">Transit (h)</label>
                <input
                  type="number"
                  min="1"
                  max="48"
                  value={transitHours}
                  onChange={(e) => setTransitHours(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-stone-900 dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-stone-500 dark:text-slate-400">Dist (km)</label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={transitDistKm}
                  onChange={(e) => setTransitDistKm(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-stone-900 dark:text-white font-bold"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => handleRunSimulation()}
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-99 text-white font-extrabold text-sm shadow-md shadow-emerald-700/20 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center space-x-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{t('running_sim')}</span>
            </span>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>{t('run_sim_btn')}</span>
            </>
          )}
        </button>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center space-x-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

      </div>

      {/* 3. Bottom Section: Step 2 - Risk-Aware Decision & Distribution Telemetry */}
      {result ? (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-stone-800 dark:text-white pb-1">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                Step 2
              </span>
              <h3 className="font-heading text-lg font-bold">
                AI Recommendations & Profit Analysis
              </h3>
            </div>

            {/* Download Report Actions Toolbar */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => downloadExecutiveReport(result, {
                  crop,
                  maturity_stage: maturity,
                  quantity_kg: quantityKg,
                  region,
                  temperature_c: useCustomWeather ? tempC : undefined,
                  relative_humidity_pct: useCustomWeather ? rhPct : undefined,
                  market_price_per_kg: useCustomPrice ? marketPrice : undefined,
                  storage_duration_days: storageDays,
                  transport_duration_hours: transitHours,
                  transit_distance_km: transitDistKm
                })}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
                title="Print or Save Executive PDF Report"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report (PDF)</span>
              </button>

              <button
                onClick={() => downloadCsvReport(result, {
                  crop,
                  maturity_stage: maturity,
                  quantity_kg: quantityKg,
                  region
                })}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-stone-50 dark:hover:bg-slate-700 active:scale-98 text-stone-700 dark:text-slate-200 border border-stone-200 dark:border-slate-700 font-bold text-xs flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer"
                title="Export Data as CSV"
              >
                <Table className="w-3.5 h-3.5 text-stone-500 dark:text-slate-400" />
                <span>CSV</span>
              </button>

              <button
                onClick={() => downloadJsonReport(result)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-stone-50 dark:hover:bg-slate-700 active:scale-98 text-stone-700 dark:text-slate-200 border border-stone-200 dark:border-slate-700 font-bold text-xs flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer"
                title="Export Raw JSON"
              >
                <FileJson className="w-3.5 h-3.5 text-stone-500 dark:text-slate-400" />
                <span>JSON</span>
              </button>
            </div>
          </div>

          {/* Reliability Banner */}
          <ReliabilityBanner
            score={result.recommendation_reliability}
            missingFields={result.missing_fields}
          />

          {/* Primary Decision Card */}
          <DecisionBadge
            decision={result.decision}
            subtitle={result.decision_badge}
          />

          {/* Outcome Interval 4-Card Grid */}
          <OutcomeIntervalGrid
            interval={result.outcome_interval}
            spoilage={result.spoilage_metrics}
          />

          {/* 2-Column Analytical Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Harvest Timing Curve Chart */}
            <HarvestTimingCurve timingOptions={result.timing_comparisons} />

            {/* Market Options Comparison */}
            <MarketOptionsView options={result.market_options} />
          </div>

          {/* Sensitivity Tornado & Tipping Points */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sensitivity Tornado Plot */}
            <SensitivityTornado factors={result.sensitivity_tornado} />

            {/* Decision Tipping Points */}
            <TippingPointsCard tippingPoints={result.tipping_points} />
          </div>

          {/* Clean Formatted Executive Explanation Block */}
          <ExplanationCard
            explanation={result.explanation}
            reliabilityScore={result.recommendation_reliability}
          />

        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 text-center space-y-3 shadow-xs transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 mx-auto flex items-center justify-center text-emerald-700 dark:text-emerald-400">
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-stone-900 dark:text-white">
              Ready for Risk Simulation
            </h3>
            <p className="text-xs text-stone-500 dark:text-slate-400 max-w-md mx-auto mt-1 font-medium">
              Select an edge-case preset above or configure lot parameters in Step 1, then click "Run Risk Simulation" to compute Monte Carlo distributions.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
