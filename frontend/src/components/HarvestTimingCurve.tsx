import React from 'react';
import type { HarvestTimingOption } from '../types/simulator';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Clock } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

interface HarvestTimingCurveProps {
  timingOptions: HarvestTimingOption[];
}

export const HarvestTimingCurve: React.FC<HarvestTimingCurveProps> = ({ timingOptions }) => {
  const { t } = useLanguage();
  const { isDarkMode } = useTheme();

  const chartData = timingOptions.map((opt) => ({
    name: opt.timing_label,
    delayDays: opt.delay_days,
    efv: opt.efv_mean,
    efv_p05: opt.efv_p05,
    efv_p95: opt.efv_p95,
    spoilagePct: Number((opt.spoilage_mean * 100).toFixed(1)),
    recommendation: opt.recommendation
  }));

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
      
      {/* Header */}
      <div>
        <h3 className="font-heading text-base font-bold text-stone-900 dark:text-white flex items-center space-x-2">
          <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span>{t('timing_tab')}</span>
        </h3>
        <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5 font-medium">
          Evaluating trade-off between price appreciation vs spoilage accumulation over delay windows
        </p>
      </div>

      {/* Recharts Dual-Axis Visualization */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} vertical={false} />
            <XAxis dataKey="name" stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
            <YAxis
              yAxisId="left"
              stroke={isDarkMode ? '#34d399' : '#059669'}
              fontSize={11}
              tickLine={false}
              tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={isDarkMode ? '#fbbf24' : '#d97706'}
              fontSize={11}
              tickLine={false}
              unit="%"
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
              formatter={(value: any, name: any) => {
                if (name === 'Expected Value (₹)') return [`₹${Number(value).toLocaleString('en-IN')}`, name];
                if (name === 'Spoilage Rate (%)') return [`${value}%`, name];
                return [value, name];
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Bar
              yAxisId="left"
              dataKey="efv"
              name="Expected Value (₹)"
              fill="#059669"
              radius={[6, 6, 0, 0]}
              barSize={40}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="spoilagePct"
              name="Spoilage Rate (%)"
              stroke="#d97706"
              strokeWidth={2.5}
              dot={{ r: 4, fill: isDarkMode ? '#0f172a' : '#ffffff', stroke: '#d97706', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 3 Summary Mini-Cards */}
      <div className="grid grid-cols-3 gap-2.5 pt-2">
        {timingOptions.map((opt, i) => (
          <div
            key={i}
            className="p-3 rounded-xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200/70 dark:border-slate-700 space-y-1 transition-colors"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-stone-800 dark:text-slate-200">Day {opt.delay_days}</span>
              <span className="font-extrabold text-amber-700 dark:text-amber-400">
                {(opt.spoilage_mean * 100).toFixed(1)}% Spoilage
              </span>
            </div>
            <div className="font-heading text-sm font-extrabold text-stone-900 dark:text-white">
              ₹{opt.efv_mean.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <p className="text-[10px] text-stone-500 dark:text-slate-400 truncate font-medium">
              {opt.recommendation}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
};
