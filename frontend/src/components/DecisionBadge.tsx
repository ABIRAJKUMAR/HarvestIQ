import React from 'react';
import type { DecisionType } from '../types/simulator';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle2, Clock, XCircle, ArrowRightLeft } from 'lucide-react';

interface DecisionBadgeProps {
  decision: DecisionType;
  subtitle: string;
}

export const DecisionBadge: React.FC<DecisionBadgeProps> = ({
  decision,
  subtitle
}) => {
  const { t } = useLanguage();

  const getDecisionConfig = () => {
    switch (decision) {
      case 'BUY_NOW':
        return {
          label: 'BUY NOW (Execute Procurement)',
          badge: 'High Value / Low Spoilage Risk',
          bg: 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200',
          iconBg: 'bg-emerald-600 dark:bg-emerald-500 text-white',
          tagBg: 'bg-emerald-700 dark:bg-emerald-600 text-white',
          icon: <CheckCircle2 className="w-6 h-6" />
        };
      case 'WAIT':
        return {
          label: 'WAIT (Delay Harvest 3-5 Days)',
          badge: 'Immature Lot / Higher Future Margin',
          bg: 'bg-amber-50 dark:bg-amber-950/70 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200',
          iconBg: 'bg-amber-600 dark:bg-amber-500 text-white',
          tagBg: 'bg-amber-700 dark:bg-amber-600 text-white',
          icon: <Clock className="w-6 h-6" />
        };
      case 'REJECT':
        return {
          label: 'REJECT (Unacceptable Rot / Price Risk)',
          badge: 'Spoilage Exceeds Breakeven Margin',
          bg: 'bg-rose-50 dark:bg-rose-950/70 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200',
          iconBg: 'bg-rose-600 dark:bg-rose-500 text-white',
          tagBg: 'bg-rose-700 dark:bg-rose-600 text-white',
          icon: <XCircle className="w-6 h-6" />
        };
      case 'CHANGE_OPTION':
        return {
          label: 'CHANGE OPTION (Reroute to Mandi / Cold Storage)',
          badge: 'Arbitrage Advantage Over Processing',
          bg: 'bg-sky-50 dark:bg-sky-950/70 border-sky-300 dark:border-sky-700 text-sky-900 dark:text-sky-200',
          iconBg: 'bg-sky-600 dark:bg-sky-500 text-white',
          tagBg: 'bg-sky-700 dark:bg-sky-600 text-white',
          icon: <ArrowRightLeft className="w-6 h-6" />
        };
    }
  };

  const config = getDecisionConfig();

  return (
    <div className={`p-5 sm:p-6 rounded-2xl border-2 shadow-xs transition-colors ${config.bg}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div className="flex items-start space-x-3.5">
          <div className={`p-3 rounded-2xl shrink-0 shadow-xs ${config.iconBg}`}>
            {config.icon}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider opacity-80">
                {t('rec_title')}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${config.tagBg}`}>
                {decision.replace(/_/g, ' ')}
              </span>
            </div>
            <h3 className="font-heading text-lg sm:text-xl font-extrabold tracking-tight mt-0.5">
              {config.label}
            </h3>
            <p className="text-xs sm:text-sm font-semibold opacity-90 mt-0.5">
              {subtitle || config.badge}
            </p>
          </div>
        </div>

        <div className="hidden lg:block text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 block">
            Decision Protocol
          </span>
          <span className="text-xs font-extrabold opacity-95">
            Arrhenius-EFV Cost Optimizer
          </span>
        </div>

      </div>
    </div>
  );
};
