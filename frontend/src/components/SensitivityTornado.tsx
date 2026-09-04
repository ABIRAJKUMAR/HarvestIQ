import React from 'react';
import type { SensitivityFactor } from '../types/simulator';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { SlidersHorizontal } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface SensitivityTornadoProps {
  factors: SensitivityFactor[];
}

export const SensitivityTornado: React.FC<SensitivityTornadoProps> = ({ factors }) => {
  const { t } = useLanguage();
  const { isDarkMode } = useTheme();

  const sortedData = [...factors].sort((a, b) => b.swing_inr - a.swing_inr);

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
      
      {/* Header */}
      <div>
        <h3 className="font-heading text-base font-bold text-stone-900 dark:text-white flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-teal-700 dark:text-teal-400" />
          <span>{t('sensitivity_tab')}</span>
        </h3>
        <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5 font-medium">
          One-at-a-Time (OAT) parameter perturbation ranking variables by financial impact (₹ swing)
        </p>
      </div>

      {/* Tornado Bar Chart */}
      <div className="h-56 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={sortedData}
            margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} horizontal={false} />
            <XAxis
              type="number"
              stroke={isDarkMode ? '#94a3b8' : '#64748b'}
              fontSize={11}
              tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
            />
            <YAxis
              type="category"
              dataKey="parameter_name"
              stroke={isDarkMode ? '#cbd5e1' : '#334155'}
              fontSize={11}
              tickLine={false}
              width={110}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                borderRadius: '0.75rem',
                color: isDarkMode ? '#f8fafc' : '#0f172a',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.2)'
              }}
              formatter={(val: any) => [`±₹${Number(val).toLocaleString('en-IN')}`, 'Expected EFV Impact']}
            />
            <Bar dataKey="swing_inr" fill="#0d9488" radius={[0, 6, 6, 0]} barSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 4 Factor Mini-Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {sortedData.slice(0, 4).map((f) => (
          <div
            key={f.parameter_name}
            className="p-2.5 rounded-xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200/70 dark:border-slate-700 text-center space-y-0.5 transition-colors"
          >
            <span className="text-[10px] font-bold text-stone-500 dark:text-slate-400 uppercase tracking-wider block truncate">
              #{f.rank} {f.parameter_name}
            </span>
            <div className="font-heading text-xs font-extrabold text-teal-800 dark:text-teal-400">
              ±₹{f.swing_inr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
