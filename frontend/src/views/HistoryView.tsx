import React, { useEffect, useState } from 'react';
import type { HistoryItem } from '../types/simulator';
import { api } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { History, RefreshCw, Eye } from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getHistory(50);
      setItems(data);
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleViewDetail = async (id: number) => {
    try {
      const detail = await api.getHistoryDetail(id);
      setSelectedItem(detail);
    } catch (err) {
      console.error('Failed to load detail', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
        <div className="flex items-center space-x-2.5">
          <span className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <History className="w-5 h-5" />
          </span>
          <div>
            <h2 className="font-heading text-xl font-bold text-stone-900 dark:text-white">
              {t('history_title')}
            </h2>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5 font-medium">
              {t('history_subtitle')}
            </p>
          </div>
        </div>

        <button
          onClick={fetchHistory}
          disabled={loading}
          className="px-3.5 py-1.5 rounded-lg bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-800 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 border border-stone-300 dark:border-slate-700 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-slate-800 text-stone-600 dark:text-slate-400 border-b border-stone-200 dark:border-slate-700 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Run ID</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Lot Spec</th>
                <th className="p-3.5">Region / Temp</th>
                <th className="p-3.5">Decision</th>
                <th className="p-3.5">Reliability</th>
                <th className="p-3.5">Expected EFV</th>
                <th className="p-3.5">Data Tier</th>
                <th className="p-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-slate-800">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50/60 dark:hover:bg-slate-800/50">
                  <td className="p-3.5 font-bold text-stone-700 dark:text-slate-300">#{item.id}</td>
                  <td className="p-3.5 text-stone-500 dark:text-slate-400">
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="p-3.5">
                    <span className="font-bold text-stone-900 dark:text-white">{item.crop}</span> ({item.maturity_stage})
                    <div className="text-[11px] text-stone-500 dark:text-slate-400">{item.quantity_kg} kg</div>
                  </td>
                  <td className="p-3.5 text-stone-700 dark:text-slate-300 font-medium">
                    {item.region}
                    <div className="text-[11px] text-stone-500 dark:text-slate-400">{item.temperature_c}°C</div>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      item.decision === 'BUY_NOW'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : item.decision === 'WAIT'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        : item.decision === 'CHANGE_OPTION'
                        ? 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                    }`}>
                      {item.decision.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-3.5 font-extrabold text-stone-800 dark:text-slate-200">
                    {item.recommendation_reliability.toFixed(0)}%
                  </td>
                  <td className="p-3.5 font-heading font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">
                    ₹{item.efv_mean.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="p-3.5 capitalize text-stone-600 dark:text-slate-400 font-medium">
                    {item.data_source}
                  </td>
                  <td className="p-3.5">
                    <button
                      onClick={() => handleViewDetail(item.id)}
                      className="p-2 rounded-lg bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-700 dark:text-slate-300 border border-stone-300 dark:border-slate-700 cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] p-6 shadow-2xl overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-slate-800 pb-3">
              <h3 className="font-heading text-base font-bold text-stone-900 dark:text-white">
                Simulation Audit Record #{selectedItem.id} ({selectedItem.crop})
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="px-3 py-1 rounded-lg bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 space-y-1">
              <div className="font-bold text-stone-900 dark:text-white text-sm">Decision Rationale:</div>
              <p className="text-stone-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-medium">
                {selectedItem.explanation}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700">
                <span className="text-stone-500 dark:text-slate-400 font-bold uppercase">Expected EFV</span>
                <div className="font-heading text-base font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5">₹{selectedItem.efv_mean.toLocaleString('en-IN')}</div>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700">
                <span className="text-stone-500 dark:text-slate-400 font-bold uppercase">5th Percentile</span>
                <div className="font-heading text-base font-extrabold text-stone-800 dark:text-slate-200 mt-0.5">₹{selectedItem.efv_p05.toLocaleString('en-IN')}</div>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700">
                <span className="text-stone-500 dark:text-slate-400 font-bold uppercase">95th Percentile</span>
                <div className="font-heading text-base font-extrabold text-stone-800 dark:text-slate-200 mt-0.5">₹{selectedItem.efv_p95.toLocaleString('en-IN')}</div>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700">
                <span className="text-stone-500 dark:text-slate-400 font-bold uppercase">Seed</span>
                <div className="font-heading text-base font-extrabold text-teal-700 dark:text-teal-400 mt-0.5">{selectedItem.simulation_seed || 'N/A'}</div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
