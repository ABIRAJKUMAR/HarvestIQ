import React from 'react';
import type { MarketOptionComparison } from '../types/simulator';
import { useLanguage } from '../context/LanguageContext';
import { Store, Factory, ArrowRight } from 'lucide-react';

interface MarketOptionsViewProps {
  options: MarketOptionComparison[];
}

export const MarketOptionsView: React.FC<MarketOptionsViewProps> = ({ options }) => {
  const { t } = useLanguage();

  const getOptionIcon = (name: string) => {
    if (name.includes('Processing')) {
      return <Factory className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />;
    }
    return <Store className="w-4 h-4 text-sky-700 dark:text-sky-400" />;
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
      
      {/* Header */}
      <div>
        <h3 className="font-heading text-base font-bold text-stone-900 dark:text-white flex items-center space-x-2">
          <Store className="w-4 h-4 text-sky-700 dark:text-sky-400" />
          <span>{t('market_tab')}</span>
        </h3>
        <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5 font-medium">
          Evaluating contractual processing procurement vs open-market APMC Mandi spot auction
        </p>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((opt, i) => {
          const isProcessing = opt.option_name.includes('Processing');
          return (
            <div
              key={i}
              className="p-4 rounded-xl bg-stone-50/60 dark:bg-slate-800/60 border border-stone-200/90 dark:border-slate-700 space-y-3 transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <span className={`p-2 rounded-xl border ${
                  isProcessing
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                    : 'bg-sky-50 dark:bg-sky-950/80 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-400'
                }`}>
                  {getOptionIcon(opt.option_name)}
                </span>
                <div>
                  <h4 className="font-bold text-stone-900 dark:text-white text-xs sm:text-sm">
                    {opt.option_name}
                  </h4>
                  <span className="text-[10px] text-stone-500 dark:text-slate-400 font-semibold">
                    {isProcessing ? 'Guaranteed Processing Contract' : 'APMC Wholesale Spot Auction'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400">
                  Expected Net Realized Return:
                </span>
                <div className="font-heading text-xl font-extrabold text-stone-900 dark:text-white mt-0.5">
                  ₹{opt.efv_mean.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900/90 border border-stone-200/70 dark:border-slate-700 text-[11px] text-stone-600 dark:text-slate-300 leading-relaxed font-medium">
                {opt.recommendation_note}
              </div>
            </div>
          );
        })}
      </div>

      {/* Arbitrage Advantage Note */}
      {options.length >= 2 && (
        <div className="p-3 rounded-xl bg-stone-100 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700 flex items-center justify-between text-xs text-stone-700 dark:text-slate-300 font-medium transition-colors">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-stone-900 dark:text-white">Channel Spread:</span>
            <span>
              Net spread delta of ₹{Math.abs(options[0].efv_mean - options[1].efv_mean).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex items-center space-x-1 font-bold text-emerald-800 dark:text-emerald-400">
            <span>Risk-Adjusted Decision</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

    </div>
  );
};
