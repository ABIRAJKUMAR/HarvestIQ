import React from 'react';
import { FileText, IndianRupee, ThermometerSnowflake, ShieldAlert, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ExplanationCardProps {
  explanation: string;
  reliabilityScore: number;
}

export const ExplanationCard: React.FC<ExplanationCardProps> = ({
  explanation,
  reliabilityScore
}) => {
  // Parse explanation lines cleanly
  const lines = explanation.split('\n').filter(l => l.trim().length > 0);
  
  // Extract main recommendation and action text
  const mainRecLine = lines.find(l => l.includes('Recommendation:')) || '';
  const actionLine = lines.find(l => !l.includes('Recommendation:') && !l.startsWith('•')) || '';
  const bulletLines = lines.filter(l => l.startsWith('•'));

  const cleanText = (text: string) => text.replace(/\*\*/g, '').replace(/^•\s*/, '').trim();

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-800">
        <h3 className="font-heading text-base font-bold text-stone-900 dark:text-white flex items-center space-x-2">
          <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span>Executive Decision Rationale & Defense Summary</span>
        </h3>
        <span className="text-[11px] font-bold text-stone-500 dark:text-slate-400 uppercase tracking-wider bg-stone-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
          Executive Decision Intelligence
        </span>
      </div>

      {/* Main Rationale Callout */}
      <div className="p-4 rounded-xl bg-stone-50 dark:bg-slate-800/70 border border-stone-200 dark:border-slate-700 space-y-2">
        {mainRecLine && (
          <div className="font-bold text-stone-900 dark:text-white text-sm flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>{cleanText(mainRecLine)}</span>
          </div>
        )}
        {actionLine && (
          <p className="text-xs sm:text-sm text-stone-700 dark:text-slate-300 font-medium pl-6">
            {cleanText(actionLine)}
          </p>
        )}
      </div>

      {/* Structured Key Point Cards */}
      <div className="space-y-2.5">
        {bulletLines.map((bullet, idx) => {
          const raw = cleanText(bullet);
          const parts = raw.split(':');
          const title = parts[0];
          const body = parts.slice(1).join(':').trim();

          const getIcon = () => {
            if (title.toLowerCase().includes('expected') || title.toLowerCase().includes('value')) {
              return <IndianRupee className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />;
            }
            if (title.toLowerCase().includes('spoilage') || title.toLowerCase().includes('shelf')) {
              return <ThermometerSnowflake className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />;
            }
            if (reliabilityScore >= 80) {
              return <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />;
            }
            return <ShieldAlert className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />;
          };

          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-white dark:bg-slate-800/60 border border-stone-200/80 dark:border-slate-700/70 flex items-start space-x-3 text-xs sm:text-sm"
            >
              <div className="p-1.5 rounded-lg bg-stone-50 dark:bg-slate-700/60 border border-stone-200 dark:border-slate-600 shrink-0 mt-0.5">
                {getIcon()}
              </div>
              <div className="leading-relaxed">
                <strong className="text-stone-900 dark:text-white font-bold">{title}: </strong>
                <span className="text-stone-700 dark:text-slate-300 font-medium">{body}</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
