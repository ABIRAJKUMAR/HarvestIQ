import React from 'react';
import type { OutcomeInterval, SpoilageMetrics } from '../types/simulator';
import { useLanguage } from '../context/LanguageContext';
import { IndianRupee, ThermometerSnowflake, ShieldAlert, BarChart3 } from 'lucide-react';

interface OutcomeIntervalGridProps {
  interval: OutcomeInterval;
  spoilage: SpoilageMetrics;
}

export const OutcomeIntervalGrid: React.FC<OutcomeIntervalGridProps> = ({
  interval,
  spoilage
}) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Metric 1: Expected Farmer Value (Mean) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-500 dark:text-slate-400 uppercase tracking-wider">
            {t('mean_efv')}
          </span>
          <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <IndianRupee className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-3">
          <div className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
            ₹{interval.mean.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-stone-500 dark:text-slate-400 mt-1 font-medium">
            Median (P50): ₹{interval.median.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Metric 2: 90% Outcome Interval Range */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-500 dark:text-slate-400 uppercase tracking-wider">
            {t('outcome_range')}
          </span>
          <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
            <BarChart3 className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-3">
          <div className="font-heading text-lg sm:text-xl font-extrabold text-stone-900 dark:text-white tracking-tight">
            ₹{interval.p05.toLocaleString('en-IN', { maximumFractionDigits: 0 })} – ₹{interval.p95.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-stone-500 dark:text-slate-400 mt-1 font-medium">
            90% Confidence Interval
          </p>
        </div>
      </div>

      {/* Metric 3: Biological Spoilage Rate */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            {t('spoilage_rate_title')}
          </span>
          <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <ThermometerSnowflake className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-3">
          <div className="font-heading text-2xl sm:text-3xl font-extrabold text-amber-700 dark:text-amber-400 tracking-tight">
            {(spoilage.mean_rate * 100).toFixed(1)}%
          </div>
          <p className="text-xs text-stone-500 dark:text-slate-400 mt-1 font-medium">
            Shelf Life: ~{spoilage.estimated_shelf_life_days.toFixed(1)} Days
          </p>
        </div>
      </div>

      {/* Metric 4: Downside Loss Risk Probability */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-500 dark:text-slate-400 uppercase tracking-wider">
            {t('downside_risk_title')}
          </span>
          <span className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            <ShieldAlert className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-3">
          <div className="font-heading text-2xl sm:text-3xl font-extrabold text-rose-700 dark:text-rose-400 tracking-tight">
            {(interval.prob_loss * 100).toFixed(1)}%
          </div>
          <p className="text-xs text-stone-500 dark:text-slate-400 mt-1 font-medium">
            Risk-adjusted loss probability
          </p>
        </div>
      </div>

    </div>
  );
};
