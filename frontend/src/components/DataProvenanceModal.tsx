import React from 'react';
import type { DataProvenanceItem } from '../types/simulator';
import { useLanguage } from '../context/LanguageContext';
import { Database, X, BookOpen, Layers } from 'lucide-react';

interface DataProvenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  provenanceList: DataProvenanceItem[];
}

export const DataProvenanceModal: React.FC<DataProvenanceModalProps> = ({
  isOpen,
  onClose,
  provenanceList
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'LITERATURE_DERIVED':
        return (
          <span className="whitespace-nowrap inline-block px-2.5 py-1 rounded-md text-[11px] font-bold leading-normal bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            Literature Citation
          </span>
        );
      case 'REAL_DATA':
        return (
          <span className="whitespace-nowrap inline-block px-2.5 py-1 rounded-md text-[11px] font-bold leading-normal bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
            Real Public Feed
          </span>
        );
      case 'ASSUMPTION':
        return (
          <span className="whitespace-nowrap inline-block px-2.5 py-1 rounded-md text-[11px] font-bold leading-normal bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            Assumed Parameter
          </span>
        );
      case 'SYNTHETIC_DEMO':
        return (
          <span className="whitespace-nowrap inline-block px-2.5 py-1 rounded-md text-[11px] font-bold leading-normal bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
            Synthetic Scenario
          </span>
        );
      default:
        return (
          <span className="whitespace-nowrap inline-block px-2.5 py-1 rounded-md text-[11px] font-bold leading-normal bg-stone-100 dark:bg-slate-800 text-stone-800 dark:text-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden transition-colors">
        
        {/* Modal Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-stone-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <Database className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-heading text-lg font-bold text-stone-900 dark:text-white">
                {t('provenance_title')}
              </h2>
              <p className="text-xs text-stone-500 dark:text-slate-400 font-medium">
                Complete traceability & literature attribution for all simulator parameters
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Classification Taxonomy Guide */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700 space-y-1.5 text-xs transition-colors">
            <div className="font-bold text-stone-800 dark:text-white flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Rigorous 5-Tier Data Strategy & Quality Compliance</span>
            </div>
            <p className="text-stone-600 dark:text-slate-300 leading-relaxed">
              In accordance with industrial data integrity standards, all predictive parameters are explicitly labeled with published literature citations, empirical sensor feeds, or verified initial operational assumptions.
            </p>
          </div>

          {/* Attribution Table */}
          <div className="border border-stone-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left">
              <thead className="bg-stone-50 dark:bg-slate-800 text-stone-600 dark:text-slate-400 border-b border-stone-200 dark:border-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5 whitespace-nowrap">Model Parameter / Feed</th>
                  <th className="p-3.5 whitespace-nowrap min-w-[150px]">Data Status</th>
                  <th className="p-3.5 whitespace-nowrap">Authoritative Source</th>
                  <th className="p-3.5">Citation / Technical Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-slate-800 text-xs">
                {provenanceList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/60 dark:hover:bg-slate-800/50">
                    <td className="p-3.5 font-bold text-stone-800 dark:text-slate-200">
                      {item.field}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {getStatusBadge(item.data_status)}
                    </td>
                    <td className="p-3.5 text-stone-700 dark:text-slate-300 font-medium whitespace-nowrap">
                      {item.source_name}
                    </td>
                    <td className="p-3.5 text-stone-600 dark:text-slate-400 flex items-start space-x-1.5 font-medium leading-relaxed">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item.citation_or_note}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 dark:bg-slate-800 border-t border-stone-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-slate-700 hover:bg-stone-300 dark:hover:bg-slate-600 text-stone-800 dark:text-white font-bold text-xs transition-colors cursor-pointer"
          >
            {t('close')}
          </button>
        </div>

      </div>
    </div>
  );
};
