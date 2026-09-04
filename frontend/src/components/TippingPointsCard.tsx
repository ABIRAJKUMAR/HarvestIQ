import React from 'react';
import type { TippingPoint } from '../types/simulator';
import { useLanguage } from '../context/LanguageContext';
import { Target, AlertCircle, ArrowRight } from 'lucide-react';

interface TippingPointsCardProps {
  tippingPoints: TippingPoint[];
}

export const TippingPointsCard: React.FC<TippingPointsCardProps> = ({ tippingPoints }) => {
  const { t } = useLanguage();

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
      
      {/* Header */}
      <div>
        <h3 className="font-heading text-base font-bold text-stone-900 dark:text-white flex items-center space-x-2">
          <Target className="w-4 h-4 text-rose-700 dark:text-rose-400" />
          <span>{t('tipping_tab')}</span>
        </h3>
        <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5 font-medium">
          Exact critical parameter deltas that would flip the current procurement recommendation
        </p>
      </div>

      {/* Tipping Points List */}
      <div className="space-y-3">
        {tippingPoints.map((tp, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-stone-50/70 dark:bg-slate-800/60 border border-stone-200/80 dark:border-slate-700 space-y-2 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span className="font-bold text-stone-900 dark:text-white text-xs sm:text-sm">
                  {tp.parameter_name}
                </span>
              </div>
              <div className="text-[11px] font-semibold text-stone-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-stone-200 dark:border-slate-700">
                Current: {tp.current_value} {tp.unit}
              </div>
            </div>

            <p className="text-[11px] text-stone-600 dark:text-slate-300 leading-relaxed font-medium">
              {tp.explanation}
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 dark:border-slate-700/60 text-xs">
              <span className="text-stone-500 dark:text-slate-400 font-medium">
                Flip Threshold: <strong className="text-rose-700 dark:text-rose-400">{tp.critical_threshold} {tp.unit}</strong>
              </span>
              <span className="flex items-center space-x-1 font-bold text-rose-700 dark:text-rose-400 text-[11px]">
                <span>Flip to {tp.target_decision}</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
