import React from 'react';
import {
  Sprout,
  Play,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Database,
  Sliders,
  History,
  CheckCircle2,
  ThermometerSnowflake,
  Clock
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (tab: 'simulator' | 'baseline' | 'experiments' | 'history') => void;
  onOpenProvenance: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onOpenProvenance }) => {
  return (
    <div className="space-y-12 animate-fadeIn pb-8">
      
      {/* ================================================================= */}
      {/* 1. DYNAMIC 2-COLUMN HERO SECTION (LIGHT/DARK ADAPTIVE)             */}
      {/* ================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-stone-50 to-stone-100 dark:from-emerald-950 dark:via-slate-900 dark:to-slate-950 text-stone-900 dark:text-white p-8 sm:p-12 lg:p-14 border border-stone-200 dark:border-emerald-900/50 shadow-2xl transition-all duration-200">
        
        {/* Soft Ambient Glows */}
        <div className="absolute -right-24 -top-24 w-[450px] h-[450px] rounded-full bg-emerald-600/10 dark:bg-emerald-600/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 rounded-full bg-teal-600/5 dark:bg-teal-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Headline, Description & CTAs (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold tracking-wide transition-colors">
              <Sprout className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>AI & Biophysical Post harvest Decision Intelligence</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] text-stone-900 dark:text-white transition-colors">
              Stop Post harvest Losses with <span className="text-emerald-600 dark:text-emerald-400">Risk-Aware</span> Harvest Timing.
            </h1>

            <p className="text-sm sm:text-base text-stone-600 dark:text-slate-300 leading-relaxed font-medium transition-colors">
              HarvestIQ transforms perishable crop procurement by combining Arrhenius spoilage kinetics with 
              Monte Carlo market simulations (N=1,000 iterations), delivering clear, explainable <strong className="text-stone-950 dark:text-white">BUY NOW</strong>, <strong className="text-stone-950 dark:text-white">WAIT</strong>, or <strong className="text-stone-950 dark:text-white">REJECT</strong> decisions.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => onNavigate('simulator')}
                className="px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-900/20 dark:shadow-emerald-900/40 flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Launch Decision Simulator</span>
              </button>

              <button
                onClick={() => onNavigate('baseline')}
                className="px-5 py-3.5 rounded-xl bg-white hover:bg-stone-100 dark:bg-slate-800/90 dark:hover:bg-slate-700 active:scale-98 text-stone-700 dark:text-slate-200 hover:text-stone-950 dark:hover:text-white font-bold text-xs sm:text-sm border border-stone-300 dark:border-slate-700 flex items-center space-x-2 transition-all cursor-pointer shadow-2xs"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Explore Baseline Benchmark</span>
              </button>
            </div>

            {/* Live Telemetry Highlights Ribbon */}
            <div className="pt-6 border-t border-stone-200 dark:border-slate-800/90 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs transition-colors">
              <div>
                <div className="font-heading text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">N=1,000</div>
                <div className="text-stone-500 dark:text-slate-400 font-medium mt-0.5">Monte Carlo Scenarios</div>
              </div>
              <div>
                <div className="font-heading text-xl sm:text-2xl font-extrabold text-stone-800 dark:text-white">40.0%</div>
                <div className="text-stone-500 dark:text-slate-400 font-medium mt-0.5">Heuristic Errors Prevented</div>
              </div>
              <div>
                <div className="font-heading text-xl sm:text-2xl font-extrabold text-teal-600 dark:text-teal-400">&lt; 15 ms</div>
                <div className="text-stone-500 dark:text-slate-400 font-medium mt-0.5">Sub-Second Execution</div>
              </div>
              <div>
                <div className="font-heading text-xl sm:text-2xl font-extrabold text-stone-800 dark:text-white">100%</div>
                <div className="text-stone-500 dark:text-slate-400 font-medium mt-0.5">Explainable & Audited</div>
              </div>
            </div>
          </div>

          {/* Right Column: Showcase Card (Fully Light/Dark Responsive) */}
          <div className="lg:col-span-5 w-full">
            <div className="rounded-2xl bg-white dark:bg-slate-900/95 border border-stone-200 dark:border-slate-700/80 p-5 sm:p-6 shadow-2xl backdrop-blur-md space-y-4 text-stone-800 dark:text-slate-100 transition-colors">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-150 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500 dark:text-slate-300">
                    Live Engine Inference
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Tomato (Optimal)
                </span>
              </div>

              {/* Primary Decision Banner */}
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-700/80 flex items-center justify-between text-emerald-900 dark:text-emerald-200 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-emerald-600 text-white">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Verdict</div>
                    <div className="text-base font-extrabold text-emerald-950 dark:text-white">BUY NOW (Immediate)</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">₹14,761</div>
                  <div className="text-[10px] text-stone-500 dark:text-slate-400">Expected EFV</div>
                </div>
              </div>

              {/* Spoilage & Risk Bars */}
              <div className="space-y-3 pt-1 text-xs">
                <div>
                  <div className="flex items-center justify-between text-stone-700 dark:text-slate-300 font-bold mb-1">
                    <span className="flex items-center space-x-1.5">
                      <ThermometerSnowflake className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                      <span>Day 0 Spoilage Risk</span>
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">22.3% (Safe)</span>
                  </div>
                  <div className="h-2 bg-stone-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[22.3%]" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-stone-700 dark:text-slate-300 font-bold mb-1">
                    <span className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                      <span>Day 3 Delay Rotting Risk</span>
                    </span>
                    <span className="text-rose-600 dark:text-rose-400 font-extrabold">57.6% (Severe Decay)</span>
                  </div>
                  <div className="h-2 bg-stone-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 w-[57.6%]" />
                  </div>
                </div>
              </div>

              {/* Real Microclimate Attribution */}
              <div className="p-3 rounded-xl bg-stone-50/70 dark:bg-slate-800/70 border border-stone-200 dark:border-slate-700/60 grid grid-cols-2 gap-2 text-[11px] transition-colors">
                <div>
                  <span className="text-stone-500 dark:text-slate-400 block">NASA Weather:</span>
                  <strong className="text-stone-850 dark:text-white font-bold">28.4°C | 80% RH</strong>
                </div>
                <div>
                  <span className="text-stone-500 dark:text-slate-400 block">APMC Spot Price:</span>
                  <strong className="text-stone-850 dark:text-white font-bold">₹24.00 / kg</strong>
                </div>
              </div>

              {/* Fast Action */}
              <button
                onClick={() => onNavigate('simulator')}
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <span>Simulate Your Harvest Lot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

            </div>
          </div>

        </div>
      </section>

      {/* ================================================================= */}
      {/* 2. WHAT YOU CAN DO ON HARVESTIQ (4 CORE CAPABILITIES)             */}
      {/* ================================================================= */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
            Core Modules
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white">
            What You Can Do on HarvestIQ
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400 font-medium">
            A comprehensive suite of analytical tools designed for field procurement officers, contract food processors, and quality auditors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Decision Simulator */}
          <div
            onClick={() => onNavigate('simulator')}
            className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 group-hover:scale-110 transition-transform">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-stone-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                1. Decision Simulator
              </h3>
              <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed font-medium">
                Input crop lot weight, visual maturity, and logistics. Simulate spoilage kinetics across ambient temperatures and get authoritative procurement recommendations.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <span>Open Simulator</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Baseline Benchmark */}
          <div
            onClick={() => onNavigate('baseline')}
            className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center border border-teal-200 dark:border-teal-800 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-stone-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                2. Baseline Benchmark
              </h3>
              <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed font-medium">
                Compare HarvestIQ's risk model against the industry-standard fixed-price heuristic across 10 sample lots to see where traditional methods make costly rotting errors.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-teal-700 dark:text-teal-400">
              <span>Compare Heuristics</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Computational Sweeps */}
          <div
            onClick={() => onNavigate('experiments')}
            className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400 flex items-center justify-center border border-sky-200 dark:border-sky-800 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-stone-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                3. Parameter Sweeps
              </h3>
              <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed font-medium">
                Explore systematic response curves mapping temperature variations (15°C–45°C), Arrhenius decay kinetics, and storage decay curves over 7-day delays.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-sky-700 dark:text-sky-400">
              <span>View Sweeps</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Audit History */}
          <div
            onClick={() => onNavigate('history')}
            className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800 group-hover:scale-110 transition-transform">
                <History className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-stone-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                4. Audit History
              </h3>
              <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed font-medium">
                View an immutable database log of past model runs with exact random seeds, microclimate inputs, and full decision rationale for complete compliance.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400">
              <span>View Log</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </section>

      {/* ================================================================= */}
      {/* 3. STEP-BY-STEP INTERACTIVE WORKFLOW                             */}
      {/* ================================================================= */}
      <section className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-xs space-y-8">
        <div className="max-w-2xl space-y-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
            Workflow Guide
          </span>
          <h2 className="font-heading text-2xl font-extrabold text-stone-900 dark:text-white">
            How HarvestIQ Operates in 3 Simple Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-stone-50/70 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-xs">
                1
              </span>
              <span className="text-[11px] font-bold text-stone-500 dark:text-slate-400 uppercase">Input Layer</span>
            </div>
            <h3 className="font-bold text-stone-900 dark:text-white text-sm">
              Configure Lot & Weather Parameters
            </h3>
            <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed font-medium">
              Select commodity (Tomato, Onion, Potato, Mango), lot size, visual maturity grade, and ambient temperatures (auto-resolved from NASA POWER).
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-stone-50/70 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-xs">
                2
              </span>
              <span className="text-[11px] font-bold text-stone-500 dark:text-slate-400 uppercase">Compute Engine</span>
            </div>
            <h3 className="font-bold text-stone-900 dark:text-white text-sm">
              Run 1,000 Monte Carlo Simulations
            </h3>
            <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed font-medium">
              The Python backend executes 1,000 stochastic futures calculating Arrhenius degradation (Q10 = 2.15) and price distribution spreads in under 15ms.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-stone-50/70 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-xs">
                3
              </span>
              <span className="text-[11px] font-bold text-stone-500 dark:text-slate-400 uppercase">Action Output</span>
            </div>
            <h3 className="font-bold text-stone-900 dark:text-white text-sm">
              Execute Risk-Optimized Decision
            </h3>
            <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed font-medium">
              Receive a definitive BUY NOW, WAIT, or REJECT verdict with a 90% confidence return interval (P5 to P95 range) and market arbitrage comparison.
            </p>
          </div>

        </div>

        {/* CTA to start */}
        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
              Ready to simulate your first procurement lot?
            </h4>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
              Use standard parameters or test one of 6 pre-built edge cases.
            </p>
          </div>
          <button
            onClick={() => onNavigate('simulator')}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            Open Simulator &rarr;
          </button>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 4. DATA INTEGRITY & ATTRIBUTION BANNER                            */}
      {/* ================================================================= */}
      <section className="p-6 sm:p-8 rounded-3xl bg-stone-100 dark:bg-slate-900/80 border border-stone-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start space-x-4 max-w-2xl">
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-stone-200 dark:border-slate-700 shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-stone-900 dark:text-white">
              Rigorous 5-Tier Data Strategy & Provenance
            </h3>
            <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed mt-1 font-medium">
              Every parameter in HarvestIQ is classified as either a verified literature citation (UC Davis / USDA), live empirical feed (NASA POWER & Agmarknet APMC), or declared initial operational assumption.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenProvenance}
          className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-stone-50 dark:hover:bg-slate-700 text-stone-800 dark:text-white text-xs font-bold border border-stone-300 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer shrink-0"
        >
          View Attribution Matrix
        </button>
      </section>

    </div>
  );
};
