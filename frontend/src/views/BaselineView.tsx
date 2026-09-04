import React, { useState, useEffect } from 'react';
import type { BaselineCompareResponse } from '../types/simulator';
import { api } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, RefreshCw } from 'lucide-react';

export const BaselineView: React.FC = () => {
  const { t } = useLanguage();
  const [crop, setCrop] = useState<string>('Tomato');
  const [lotsCount] = useState<number>(10);
  const [priceThreshold, setPriceThreshold] = useState<number>(22.0);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<BaselineCompareResponse | null>(null);

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const res = await api.compareBaseline({
        crop,
        sample_lots_count: lotsCount,
        fixed_price_threshold_inr: priceThreshold,
        simulation_seed: 42
      });
      setData(res);
    } catch (err) {
      console.error('Failed to run baseline comparison', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, [crop, lotsCount, priceThreshold]);

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="font-heading text-xl font-bold text-stone-900 dark:text-white">
              {t('baseline_title')}
            </h2>
          </div>
          <p className="text-xs text-stone-500 dark:text-slate-400 mt-1 max-w-2xl font-medium">
            {t('baseline_subtitle')}
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div>
            <label className="block text-stone-600 dark:text-slate-400 font-bold mb-1">Commodity</label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-stone-900 dark:text-white font-bold"
            >
              <option value="Tomato">Tomato</option>
              <option value="Onion">Onion</option>
              <option value="Potato">Potato</option>
              <option value="Mango">Mango</option>
            </select>
          </div>

          <div>
            <label className="block text-stone-600 dark:text-slate-400 font-bold mb-1">Fixed Ceiling (₹/kg)</label>
            <input
              type="number"
              value={priceThreshold}
              onChange={(e) => setPriceThreshold(Number(e.target.value))}
              className="w-24 bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-stone-900 dark:text-white font-bold text-right"
            />
          </div>

          <button
            onClick={fetchComparison}
            disabled={loading}
            className="self-end px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-run</span>
          </button>
        </div>
      </div>

      {data && (
        <>
          {/* Key Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-xs transition-colors">
              <span className="text-xs font-bold text-stone-500 dark:text-slate-400 uppercase tracking-wider">
                {t('total_lots')}
              </span>
              <div className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white mt-1">
                {data.total_lots_evaluated} Lots
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 shadow-xs transition-colors">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                {t('discrepancy_rate')}
              </span>
              <div className="font-heading text-2xl sm:text-3xl font-extrabold text-amber-700 dark:text-amber-400 mt-1">
                {data.discrepancy_rate_pct}% ({data.discrepancy_count} lots)
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 shadow-xs transition-colors">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                {t('baseline_losses')}
              </span>
              <div className="font-heading text-2xl sm:text-3xl font-extrabold text-rose-700 dark:text-rose-400 mt-1">
                ₹{data.total_baseline_spoilage_loss_inr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 shadow-xs transition-colors">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                {t('harvestiq_saved')}
              </span>
              <div className="font-heading text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
                ₹{data.total_harvestiq_value_saved_inr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>

          </div>

          {/* Methodology Summary Banner */}
          <div className="p-4 rounded-xl bg-stone-100 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700 text-xs sm:text-sm text-stone-700 dark:text-slate-300 leading-relaxed font-medium transition-colors">
            <strong className="text-stone-900 dark:text-white">Comparative Evaluation Summary: </strong>
            {data.methodology_summary}
          </div>

          {/* Lots Discrepancy Matrix Table */}
          <div className="bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-colors">
            <div className="p-4 border-b border-stone-200 dark:border-slate-800 font-heading text-sm font-bold text-stone-900 dark:text-white">
              Representative Lots Benchmark Matrix
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-slate-800 text-stone-600 dark:text-slate-400 border-b border-stone-200 dark:border-slate-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Lot #</th>
                    <th className="p-3.5">Maturity / Temp</th>
                    <th className="p-3.5">Spot Price</th>
                    <th className="p-3.5">Baseline Rule</th>
                    <th className="p-3.5">HarvestIQ Decision</th>
                    <th className="p-3.5">Spoilage %</th>
                    <th className="p-3.5">Discrepancy Analysis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-slate-800">
                  {data.lots.map((lot) => (
                    <tr
                      key={lot.lot_id}
                      className={lot.is_discrepant ? 'bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50/70 dark:hover:bg-amber-950/30' : 'hover:bg-stone-50/60 dark:hover:bg-slate-800/50'}
                    >
                      <td className="p-3.5 font-bold text-stone-800 dark:text-slate-200">#{lot.lot_id}</td>
                      <td className="p-3.5">
                        <span className="font-bold text-stone-900 dark:text-white">{lot.maturity_stage}</span>
                        <div className="text-[11px] text-stone-500 dark:text-slate-400">{lot.temperature_c}°C, {lot.storage_days}d hold</div>
                      </td>
                      <td className="p-3.5 font-bold text-stone-900 dark:text-white">₹{lot.market_price_inr.toFixed(2)}/kg</td>
                      
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          lot.baseline_decision === 'BUY'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                        }`}>
                          {lot.baseline_decision}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          lot.harvestiq_decision === 'BUY_NOW'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : lot.harvestiq_decision === 'WAIT'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            : lot.harvestiq_decision === 'CHANGE_OPTION'
                            ? 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                        }`}>
                          {lot.harvestiq_decision.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="p-3.5 font-extrabold text-amber-700 dark:text-amber-400">
                        {lot.spoilage_rate_pct}%
                      </td>

                      <td className="p-3.5 text-[11px] text-stone-700 dark:text-slate-300 max-w-xs leading-relaxed font-medium">
                        {lot.discrepancy_reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
