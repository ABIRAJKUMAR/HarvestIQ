import React from 'react';
import type { AnalysisRequest } from '../types/simulator';
import { useLanguage } from '../context/LanguageContext';
import { Flame, TrendingDown, ThermometerSnowflake, ShieldAlert, Sparkles, Scale } from 'lucide-react';

interface EdgeCasePresetSelectorProps {
  onSelectPreset: (preset: AnalysisRequest) => void;
}

export const EdgeCasePresetSelector: React.FC<EdgeCasePresetSelectorProps> = ({ onSelectPreset }) => {
  const { t } = useLanguage();

  const presets: {
    id: string;
    label: string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    payload: AnalysisRequest;
  }[] = [
    {
      id: 'standard',
      label: 'Normal Harvest',
      subtitle: 'Tomato • 24°C • Good Quality',
      icon: <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />,
      color: 'hover:border-emerald-300 dark:hover:border-emerald-700',
      payload: {
        crop: 'Tomato',
        maturity_stage: 'Optimal',
        quantity_kg: 1000,
        region: 'Dindigul_TN',
        temperature_c: 24,
        relative_humidity_pct: 75,
        market_price_per_kg: 24,
        storage_duration_days: 1,
        transport_duration_hours: 6,
        transit_distance_km: 100,
        simulation_seed: 42,
        mc_iterations: 1000
      }
    },
    {
      id: 'heatwave',
      label: 'Extreme Heatwave',
      subtitle: '38°C Heat • High Rot Risk',
      icon: <Flame className="w-4 h-4 text-rose-700 dark:text-rose-400" />,
      color: 'hover:border-rose-300 dark:hover:border-rose-700',
      payload: {
        crop: 'Tomato',
        maturity_stage: 'Optimal',
        quantity_kg: 1000,
        region: 'Dindigul_TN',
        temperature_c: 38,
        relative_humidity_pct: 45,
        market_price_per_kg: 22,
        storage_duration_days: 2,
        transport_duration_hours: 8,
        transit_distance_km: 150,
        simulation_seed: 101,
        mc_iterations: 1000
      }
    },
    {
      id: 'overripe',
      label: 'Overripe Crop',
      subtitle: 'Fully Ripe • Needs Immediate Sale',
      icon: <ThermometerSnowflake className="w-4 h-4 text-amber-700 dark:text-amber-400" />,
      color: 'hover:border-amber-300 dark:hover:border-amber-700',
      payload: {
        crop: 'Tomato',
        maturity_stage: 'Overripe',
        quantity_kg: 1500,
        region: 'Kolar_KA',
        temperature_c: 29,
        relative_humidity_pct: 80,
        market_price_per_kg: 18,
        storage_duration_days: 0.5,
        transport_duration_hours: 4,
        transit_distance_km: 80,
        simulation_seed: 202,
        mc_iterations: 1000
      }
    },
    {
      id: 'crash',
      label: 'Sudden Price Drop',
      subtitle: 'Spot Price Drops -40%',
      icon: <TrendingDown className="w-4 h-4 text-purple-700 dark:text-purple-400" />,
      color: 'hover:border-purple-300 dark:hover:border-purple-700',
      payload: {
        crop: 'Tomato',
        maturity_stage: 'Optimal',
        quantity_kg: 2000,
        region: 'Nashik_MH',
        temperature_c: 26,
        relative_humidity_pct: 70,
        market_price_per_kg: 10,
        storage_duration_days: 2,
        transport_duration_hours: 6,
        transit_distance_km: 120,
        simulation_seed: 303,
        mc_iterations: 1000
      }
    },
    {
      id: 'missing_weather',
      label: 'Sensor Offline',
      subtitle: 'Auto NASA Weather Backup',
      icon: <ShieldAlert className="w-4 h-4 text-sky-700 dark:text-sky-400" />,
      color: 'hover:border-sky-300 dark:hover:border-sky-700',
      payload: {
        crop: 'Onion',
        maturity_stage: 'Optimal',
        quantity_kg: 5000,
        region: 'Nashik_MH',
        storage_duration_days: 4,
        transport_duration_hours: 12,
        transit_distance_km: 250,
        simulation_seed: 404,
        mc_iterations: 1000
      }
    },
    {
      id: 'arbitrage',
      label: 'High Mandi Price',
      subtitle: 'Distant City Premium Sale',
      icon: <Scale className="w-4 h-4 text-teal-700 dark:text-teal-400" />,
      color: 'hover:border-teal-300 dark:hover:border-teal-700',
      payload: {
        crop: 'Mango',
        maturity_stage: 'Optimal',
        quantity_kg: 800,
        region: 'Dindigul_TN',
        temperature_c: 25,
        relative_humidity_pct: 65,
        market_price_per_kg: 65,
        storage_duration_days: 1,
        transport_duration_hours: 14,
        transit_distance_km: 380,
        simulation_seed: 505,
        mc_iterations: 1000
      }
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-stone-600 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
          <span>{t('preset_header')}</span>
        </span>
        <span className="text-[11px] text-stone-400 dark:text-slate-500 font-medium">1-Click Fast Fill</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelectPreset(p.payload)}
            className={`p-2.5 rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50/60 dark:bg-slate-800/60 ${p.color} text-left transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-xs group cursor-pointer`}
          >
            <div className="flex items-center space-x-1.5">
              <span className="p-1 rounded-md bg-white dark:bg-slate-700 border border-stone-200 dark:border-slate-600 shadow-2xs group-hover:scale-105 transition-transform">
                {p.icon}
              </span>
              <span className="text-xs font-bold text-stone-900 dark:text-white truncate">
                {p.label}
              </span>
            </div>
            <p className="text-[10px] text-stone-500 dark:text-slate-400 mt-1.5 truncate font-medium">
              {p.subtitle}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
