import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

interface ReliabilityBannerProps {
  score: number;
  missingFields: string[];
}

export const ReliabilityBanner: React.FC<ReliabilityBannerProps> = ({
  score,
  missingFields
}) => {
  const { t } = useLanguage();

  const isHigh = score >= 80;
  const isModerate = score >= 60 && score < 80;

  return (
    <div
      className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
        isHigh
          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
          : isModerate
          ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
          : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
      }`}
    >
      <div className="flex items-center space-x-2.5">
        <span className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 shrink-0">
          {isHigh ? (
            <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          ) : isModerate ? (
            <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-rose-700 dark:text-rose-400" />
          )}
        </span>
        <div>
          <div className="font-bold flex items-center space-x-2">
            <span>{t('reliability_score')}: {score.toFixed(0)}%</span>
            <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700">
              {isHigh ? 'High Confidence' : isModerate ? 'Moderate Caution' : 'Uncertain Data'}
            </span>
          </div>
          {missingFields && missingFields.length > 0 ? (
            <p className="text-[11px] opacity-80 mt-0.5 font-medium">
              Heuristic penalty applied for: {missingFields.join(', ')}
            </p>
          ) : (
            <p className="text-[11px] opacity-80 mt-0.5 font-medium">
              Validated using live NASA POWER weather & Agmarknet market spot feeds.
            </p>
          )}
        </div>
      </div>

      <div className="w-full sm:w-36 shrink-0">
        <div className="w-full bg-white dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-stone-200 dark:border-slate-700">
          <div
            className={`h-full rounded-full ${
              isHigh ? 'bg-emerald-600 dark:bg-emerald-500' : isModerate ? 'bg-amber-500 dark:bg-amber-400' : 'bg-rose-600 dark:bg-rose-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(10, score))}%` }}
          />
        </div>
      </div>
    </div>
  );
};
