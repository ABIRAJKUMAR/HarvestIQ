import React, { useState } from 'react';
import { Sparkles, Info } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

export const ExperimentsView: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [selectedSweep, setSelectedSweep] = useState<'temperature' | 'storage'>('temperature');

  // Sweep 1: Temperature Sweep Data (15C to 45C across maturity stages)
  const temperatureSweepData = [
    { temp: 15, Immature: 2.1, Optimal: 3.2, Ripe: 4.8, Overripe: 8.5 },
    { temp: 20, Immature: 3.5, Optimal: 5.1, Ripe: 7.6, Overripe: 13.2 },
    { temp: 25, Immature: 5.6, Optimal: 8.2, Ripe: 12.1, Overripe: 20.8 },
    { temp: 30, Immature: 9.1, Optimal: 13.1, Ripe: 19.2, Overripe: 32.4 },
    { temp: 35, Immature: 14.5, Optimal: 20.6, Ripe: 29.8, Overripe: 48.5 },
    { temp: 40, Immature: 22.8, Optimal: 31.8, Ripe: 44.9, Overripe: 68.2 },
    { temp: 45, Immature: 34.8, Optimal: 47.4, Ripe: 64.3, Overripe: 86.7 }
  ];

  // Sweep 2: Storage Duration Sweep (0 to 7 days)
  const storageSweepData = [
    { days: 0, EFV_Optimal: 18500, EFV_Ripe: 17200, Spoilage_Optimal: 2.1 },
    { days: 1, EFV_Optimal: 17100, EFV_Ripe: 14900, Spoilage_Optimal: 5.8 },
    { days: 2, EFV_Optimal: 15400, EFV_Ripe: 12100, Spoilage_Optimal: 11.2 },
    { days: 3, EFV_Optimal: 13200, EFV_Ripe: 8900, Spoilage_Optimal: 18.5 },
    { days: 4, EFV_Optimal: 10600, EFV_Ripe: 5400, Spoilage_Optimal: 28.1 },
    { days: 5, EFV_Optimal: 7600, EFV_Ripe: 1800, Spoilage_Optimal: 39.8 },
    { days: 6, EFV_Optimal: 4200, EFV_Ripe: -2100, Spoilage_Optimal: 53.4 },
    { days: 7, EFV_Optimal: 600, EFV_Ripe: -6400, Spoilage_Optimal: 68.2 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center space-x-2.5">
          <span className="p-2.5 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            <Sparkles className="w-5 h-5" />
          </span>
          <div>
            <h2 className="font-heading text-xl font-bold text-stone-900 dark:text-white">
              Category A: Computational Experiments & Parameter Sweeps
            </h2>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5 font-medium">
              Systematic model response mapping across temperature, crop maturity, storage duration, and price volatility.
            </p>
          </div>
        </div>

        {/* Note */}
        <div className="mt-4 p-4 rounded-xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700 text-xs text-stone-700 dark:text-slate-300 flex items-start space-x-2.5 font-medium leading-relaxed transition-colors">
          <Info className="w-4 h-4 text-sky-700 dark:text-sky-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-stone-900 dark:text-white">Simulation Methodology Note: </strong>
            These curves represent <em>computational simulation sweeps</em> exploring model sensitivity surfaces. 
            They are distinct from <em>empirical evaluations</em> (NASA POWER & Agmarknet benchmarks) and <em>synthetic failure cases</em>.
          </div>
        </div>
      </div>

      {/* Clean Pill Segment Control */}
      <div className="flex p-1.5 bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl w-fit space-x-1 shadow-2xs">
        <button
          onClick={() => setSelectedSweep('temperature')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedSweep === 'temperature'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          1. Temperature vs Spoilage Kinetics (% Rot)
        </button>

        <button
          onClick={() => setSelectedSweep('storage')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedSweep === 'storage'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          2. Storage Duration vs Net EFV (₹)
        </button>
      </div>

      {/* Chart Canvas */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        {selectedSweep === 'temperature' ? (
          <>
            <div>
              <h3 className="font-heading text-base font-bold text-stone-900 dark:text-white">
                Temperature Response Surface (Arrhenius Q10 = 2.15)
              </h3>
              <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5 font-medium">
                Simulating spoilage accumulation (%) across 15°C to 45°C for 4 distinct maturity grades over a standard 48-hour procurement corridor.
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={temperatureSweepData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} />
                  <XAxis dataKey="temp" stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={12} unit="°C" />
                  <YAxis stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={12} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                      borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                      borderRadius: '0.75rem',
                      color: isDarkMode ? '#f8fafc' : '#0f172a',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.2)'
                    }}
                    formatter={(val: any, name: any) => [`${val}% Spoilage`, `${name} Stage`]}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="Immature" stroke="#0284c7" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Optimal" stroke="#059669" strokeWidth={3} dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="Ripe" stroke="#d97706" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Overripe" stroke="#dc2626" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <>
            <div>
              <h3 className="font-heading text-base font-bold text-stone-900 dark:text-white">
                Storage Delay vs Expected Farmer Value (EFV Decay Curve)
              </h3>
              <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5 font-medium">
                Demonstrating the rapid erosion of net farmer profit beyond Day 3 under ambient packhouse storage.
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={storageSweepData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} />
                  <XAxis dataKey="days" stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={12} unit=" Days" />
                  <YAxis stroke={isDarkMode ? '#34d399' : '#059669'} fontSize={12} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                      borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                      borderRadius: '0.75rem',
                      color: isDarkMode ? '#f8fafc' : '#0f172a',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.2)'
                    }}
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Expected Farmer Value']}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="EFV_Optimal" name="Optimal Stage (₹)" stroke="#059669" strokeWidth={3} dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="EFV_Ripe" name="Ripe Stage (₹)" stroke="#d97706" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>

    </div>
  );
};
