import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { HomeView } from './views/HomeView';
import { SimulatorView } from './views/SimulatorView';
import { BaselineView } from './views/BaselineView';
import { ExperimentsView } from './views/ExperimentsView';
import { HistoryView } from './views/HistoryView';
import { DataProvenanceModal } from './components/DataProvenanceModal';
import { AuthModal } from './components/AuthModal';
import type { AnalysisResponse, DataProvenanceItem } from './types/simulator';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'simulator' | 'baseline' | 'experiments' | 'history'>('home');
  const [isProvenanceOpen, setIsProvenanceOpen] = useState<boolean>(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResponse | null>(null);

  // Default fallback provenance items if none run yet
  const defaultProvenance: DataProvenanceItem[] = [
    {
      field: "Respiration Temperature Sensitivity (Q10)",
      source_name: "UC Davis Post harvest Technology (Kader 2002)",
      data_status: "LITERATURE_DERIVED",
      confidence_penalty: 0.0,
      citation_or_note: "Published respiration acceleration quotient (Q10 = 2.15)."
    },
    {
      field: "Base Shelf Life Rates (k0)",
      source_name: "USDA Handbook 66 & ICAR-DOGR",
      data_status: "LITERATURE_DERIVED",
      confidence_penalty: 0.0,
      citation_or_note: "Standard baseline storage decay guidelines."
    },
    {
      field: "Historical Market Volatility (sigma)",
      source_name: "Agmarknet APMC Modal Price Series",
      data_status: "REAL_DATA",
      confidence_penalty: 0.0,
      citation_or_note: "Government wholesale mandi arrivals and modal prices."
    },
    {
      field: "Transit Vibration Damage Coeff",
      source_name: "Initial Packhouse Engineering Assumption",
      data_status: "ASSUMPTION",
      confidence_penalty: 0.0,
      citation_or_note: "Assumed 2.5% per 100km transit damage; requires packhouse calibration."
    }
  ];

  const provenanceList = currentAnalysis?.data_provenance || defaultProvenance;

  return (
    <div className="min-h-screen bg-[#fbfbfa] dark:bg-[#090d16] text-stone-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-200 dark:selection:bg-emerald-900 selection:text-emerald-900 dark:selection:text-emerald-100 transition-colors duration-200">
      
      {/* Top Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProvenance={() => setIsProvenanceOpen(true)}
        dataSource={currentAnalysis?.data_source || 'cached'}
      />

      {/* Main Page Body with Fluid Dynamic Width */}
      <main className="flex-1 w-full max-w-[96%] xl:max-w-[94%] 2xl:max-w-[1720px] mx-auto px-2 sm:px-4 lg:px-6 py-6 sm:py-8">
        {activeTab === 'home' && (
          <HomeView
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenProvenance={() => setIsProvenanceOpen(true)}
          />
        )}

        {activeTab === 'simulator' && (
          <SimulatorView
            initialData={currentAnalysis}
            onAnalysisComplete={(data) => setCurrentAnalysis(data)}
          />
        )}

        {activeTab === 'baseline' && <BaselineView />}

        {activeTab === 'experiments' && <ExperimentsView />}

        {activeTab === 'history' && <HistoryView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 py-6 mt-12 text-center text-xs text-stone-500 dark:text-slate-400 transition-colors">
        <div className="w-full max-w-[96%] xl:max-w-[94%] 2xl:max-w-[1720px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            <strong className="text-stone-800 dark:text-slate-200 font-bold">HarvestIQ Enterprise</strong> — Risk-Aware Post harvest Spoilage Kinetics & Market Option Decision Engine.
          </p>
          <p className="text-stone-500 dark:text-slate-400 font-medium">
            Explainable Agricultural Decision Intelligence Platform.
          </p>
        </div>
      </footer>

      {/* Data Provenance & Literature Modal */}
      <DataProvenanceModal
        isOpen={isProvenanceOpen}
        onClose={() => setIsProvenanceOpen(false)}
        provenanceList={provenanceList}
      />

      {/* Sign In & Sign Up Modal (Connected / Ready for Supabase) */}
      <AuthModal />

    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
