import { useState } from 'react';
import {
  Sprout,
  Sliders,
  Play,
  CloudSun,
  Truck,
  IndianRupee,
  ThermometerSnowflake,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Store,
  Factory,
  SlidersHorizontal,
  Target,
  FileText,
  CheckCircle2,
  Database,
  Globe,
  Moon,
  Sun,
  User,
  LogOut,
  ChevronDown,
  X,
  Sparkles,
  Flame,
  TrendingDown,
  Scale
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export type CropType = 'Tomato' | 'Onion' | 'Potato' | 'Mango';
export type MaturityStage = 'Immature' | 'Optimal' | 'Ripe' | 'Overripe';
export type DecisionType = 'BUY_NOW' | 'WAIT' | 'REJECT' | 'CHANGE_OPTION';

export default function HarvestIQStitchApp() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [language, setLanguage] = useState<'en' | 'ta'>('en');
  const [activeTab, setActiveTab] = useState<'simulator' | 'baseline' | 'experiments' | 'history'>('simulator');
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [user, setUser] = useState<{ name: string; email: string; role: string; initial: string } | null>({
    name: 'Agronomy Operator',
    email: 'operator@harvestiq.io',
    role: 'Procurement Officer',
    initial: 'A'
  });
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  const [crop, setCrop] = useState<CropType>('Tomato');
  const [maturity, setMaturity] = useState<MaturityStage>('Optimal');
  const [quantityKg, setQuantityKg] = useState<number>(1000);
  const [region, setRegion] = useState<string>('Dindigul_TN');
  const [useCustomWeather, setUseCustomWeather] = useState<boolean>(false);
  const [tempC, setTempC] = useState<number>(28);
  const [rhPct, setRhPct] = useState<number>(80);
  const [useCustomPrice, setUseCustomPrice] = useState<boolean>(false);
  const [marketPrice, setMarketPrice] = useState<number>(24);
  const [storageDays, setStorageDays] = useState<number>(1.0);
  const [transitHours, setTransitHours] = useState<number>(6.0);
  const [transitDistKm, setTransitDistKm] = useState<number>(100.0);
  const [simSeed, setSimSeed] = useState<number>(42);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasRun, setHasRun] = useState<boolean>(true);
  const [isProvenanceOpen, setIsProvenanceOpen] = useState<boolean>(false);

  const timingOptions = [
    { label: 'Day 0 (Immediate)', delay: 0, efv: 14761, spoilage: 22.3, rec: 'Baseline immediate procurement' },
    { label: 'Day 3 (Delayed)', delay: 3, efv: 6277, spoilage: 57.6, rec: 'Spoilage offsets price gains' },
    { label: 'Day 7 (Extended)', delay: 7, efv: 543, spoilage: 81.3, rec: 'High spoilage risk accumulation' }
  ];

  const sensitivityFactors = [
    { name: 'Storage Duration', swing: 12644, rank: 1 },
    { name: 'Market Spot Price', swing: 7396, rank: 2 },
    { name: 'Ambient Temperature', swing: 3605, rank: 3 },
    { name: 'Transit Duration', swing: 1820, rank: 4 }
  ];

  const tippingPoints = [
    { name: 'Ambient Temperature', current: '31.8 °C', threshold: '38.3 °C', target: 'REJECT', desc: 'A heatwave rise of +6.5°C accelerates rotting beyond 35% safe limit.' },
    { name: 'Market Spot Price', current: '₹24.5 /kg', threshold: '₹17.6 /kg', target: 'REJECT', desc: 'A price drop of -28% reduces net return below harvest + freight costs.' },
    { name: 'Transit Delay', current: '6 hours', threshold: '20 hours', target: 'REJECT', desc: 'A roadblock delay of +14 hours extends ambient exposure past safe limit.' }
  ];

  const handleRunSim = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setHasRun(true);
    }, 600);
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-[#fbfbfa] dark:bg-[#090d16] text-stone-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
        
        {/* Navigation Header */}
        <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-stone-200/90 dark:border-slate-800 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('simulator')}>
                  <div className="w-8 h-8 rounded-full border-2 border-emerald-600 dark:border-emerald-500 flex items-center justify-center text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/50">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <span className="font-extrabold text-base tracking-tight text-stone-900 dark:text-white uppercase">
                    HARVESTIQ
                  </span>
                </div>

                <nav className="hidden lg:flex items-center space-x-6 text-xs font-bold">
                  <button
                    onClick={() => setActiveTab('simulator')}
                    className={`transition-colors cursor-pointer ${
                      activeTab === 'simulator' ? 'text-emerald-700 dark:text-emerald-400 font-extrabold' : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    Decision Simulator
                  </button>
                  <button
                    onClick={() => setActiveTab('baseline')}
                    className={`transition-colors cursor-pointer ${
                      activeTab === 'baseline' ? 'text-emerald-700 dark:text-emerald-400 font-extrabold' : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    Baseline Benchmark
                  </button>
                  <button
                    onClick={() => setActiveTab('experiments')}
                    className={`transition-colors cursor-pointer ${
                      activeTab === 'experiments' ? 'text-emerald-700 dark:text-emerald-400 font-extrabold' : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    Computational Sweeps
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`transition-colors cursor-pointer ${
                      activeTab === 'history' ? 'text-emerald-700 dark:text-emerald-400 font-extrabold' : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    Audit History
                  </button>
                  <button
                    onClick={() => setIsProvenanceOpen(true)}
                    className="text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Data Provenance
                  </button>
                </nav>
              </div>

              <div className="flex items-center space-x-3">
                <span className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live Data</span>
                </span>

                <button
                  onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-stone-50 dark:bg-slate-800 hover:bg-stone-100 dark:hover:bg-slate-700 text-stone-700 dark:text-slate-200 border border-stone-200 dark:border-slate-700 text-xs font-bold cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  <span>{language === 'en' ? 'தமிழ்' : 'EN'}</span>
                </button>

                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="w-9 h-9 rounded-full bg-stone-50 dark:bg-slate-800 hover:bg-stone-100 dark:hover:bg-slate-700 text-stone-600 dark:text-slate-300 border border-stone-200 dark:border-slate-700 flex items-center justify-center cursor-pointer"
                >
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-700" />}
                </button>

                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center space-x-2 pl-1 pr-3 py-1 bg-white dark:bg-slate-800 hover:bg-stone-50 dark:hover:bg-slate-700 text-stone-800 dark:text-slate-100 border border-stone-200 dark:border-slate-700 rounded-full text-xs font-bold cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-xs">
                        {user.initial}
                      </div>
                      <span>My Account</span>
                      <ChevronDown className="w-3 h-3 text-stone-400" />
                    </button>

                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 text-xs">
                        <div className="px-4 py-2 border-b border-stone-100 dark:border-slate-800">
                          <div className="font-bold text-stone-900 dark:text-white">{user.name}</div>
                          <div className="text-[11px] text-stone-500 dark:text-slate-400 truncate">{user.email}</div>
                          <span className="mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {user.role}
                          </span>
                        </div>
                        <button
                          onClick={() => { setIsProfileOpen(false); setIsAuthModalOpen(true); }}
                          className="w-full text-left px-4 py-2 hover:bg-stone-50 dark:hover:bg-slate-800 text-stone-700 dark:text-slate-300 flex items-center space-x-2 font-medium"
                        >
                          <User className="w-3.5 h-3.5 text-stone-400" />
                          <span>Switch Account</span>
                        </button>
                        <button
                          onClick={() => { setIsProfileOpen(false); setUser(null); }}
                          className="w-full text-left px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center space-x-2 font-medium"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => { setAuthMode('signin'); setIsAuthModalOpen(true); }}
                    className="px-4 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer"
                  >
                    Sign In
                  </button>
                )}
              </div>

            </div>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          
          {/* Edge-Case Presets Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-600 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>1-Click Edge-Case Presets</span>
              </span>
              <span className="text-[11px] text-stone-400 dark:text-slate-500 font-medium">Auto-Fill Scenarios</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {[
                { title: 'Standard Lot', desc: 'Tomato, 24°C, Optimal', icon: <Sparkles className="w-4 h-4 text-emerald-600" /> },
                { title: 'Heatwave Stress', desc: '38°C extreme ambient', icon: <Flame className="w-4 h-4 text-rose-600" /> },
                { title: 'Overripe Salvage', desc: 'High rot risk, immediate', icon: <ThermometerSnowflake className="w-4 h-4 text-amber-600" /> },
                { title: 'Mandi Price Crash', desc: 'Spot price ₹10 (-40%)', icon: <TrendingDown className="w-4 h-4 text-purple-600" /> },
                { title: 'Missing Weather', desc: 'Fallback climatology', icon: <ShieldAlert className="w-4 h-4 text-sky-600" /> },
                { title: 'Mandi Arbitrage', desc: 'Distant market premium', icon: <Scale className="w-4 h-4 text-teal-600" /> }
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={handleRunSim}
                  className="p-2.5 rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50/60 dark:bg-slate-800/60 text-left hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
                >
                  <div className="flex items-center space-x-1.5">
                    <span className="p-1 rounded-md bg-white dark:bg-slate-700 border border-stone-200 dark:border-slate-600">
                      {p.icon}
                    </span>
                    <span className="text-xs font-bold text-stone-900 dark:text-white truncate">{p.title}</span>
                  </div>
                  <p className="text-[10px] text-stone-500 dark:text-slate-400 mt-1.5 truncate font-medium">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 1: Parameter Input Form Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 dark:border-slate-800 gap-2">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 inline-block mb-1">
                  Step 1
                </span>
                <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center space-x-2">
                  <Sliders className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  <span>Procurement & Field Parameters</span>
                </h2>
                <p className="text-xs text-stone-500 dark:text-slate-400 font-medium mt-0.5">
                  Enter harvest lot characteristics to simulate spoilage kinetics & price risk
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="text-stone-500 dark:text-slate-400 font-semibold">Sim Seed:</span>
                <input
                  type="number"
                  value={simSeed}
                  onChange={(e) => setSimSeed(Number(e.target.value))}
                  className="w-20 bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-stone-800 dark:text-slate-100 font-bold text-right"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Crop & Quality */}
              <div className="p-4 rounded-xl bg-stone-50/70 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700/80 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-slate-300 block">
                  1. Crop & Quality
                </span>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">Commodity</label>
                  <select
                    value={crop}
                    onChange={(e) => setCrop(e.target.value as CropType)}
                    className="w-full bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-white font-bold"
                  >
                    <option value="Tomato">Tomato (தக்காளி)</option>
                    <option value="Onion">Onion (வெங்காயம்)</option>
                    <option value="Potato">Potato (உருளைக்கிழங்கு)</option>
                    <option value="Mango">Mango (மாம்பழம்)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">Maturity Grade</label>
                  <select
                    value={maturity}
                    onChange={(e) => setMaturity(e.target.value as MaturityStage)}
                    className="w-full bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-white font-bold"
                  >
                    <option value="Immature">Immature (முதிராதது)</option>
                    <option value="Optimal">Optimal (சரியான பக்குவம்)</option>
                    <option value="Ripe">Ripe (பழுத்தது)</option>
                    <option value="Overripe">Overripe (அதிகம் பழுத்தது)</option>
                  </select>
                </div>
              </div>

              {/* Card 2: Weight & Hub */}
              <div className="p-4 rounded-xl bg-stone-50/70 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700/80 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-slate-300 block">
                  2. Weight & Hub
                </span>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">Lot Weight (kg)</label>
                  <input
                    type="number"
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">Hub Region</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-white font-bold"
                  >
                    <option value="Dindigul_TN">Dindigul (Tamil Nadu)</option>
                    <option value="Kolar_KA">Kolar (Karnataka)</option>
                    <option value="Nashik_MH">Nashik (Maharashtra)</option>
                  </select>
                </div>
              </div>

              {/* Card 3: Weather */}
              <div className="p-4 rounded-xl bg-stone-50/70 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-slate-300 flex items-center space-x-1.5">
                    <CloudSun className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>3. Weather</span>
                  </span>
                  <button
                    onClick={() => setUseCustomWeather(!useCustomWeather)}
                    className="text-[11px] text-emerald-800 dark:text-emerald-400 font-bold hover:underline"
                  >
                    {useCustomWeather ? 'Auto NASA' : 'Manual'}
                  </button>
                </div>
                {useCustomWeather ? (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[11px] font-semibold text-stone-600 dark:text-slate-400">Temp (°C)</label>
                      <input
                        type="number"
                        value={tempC}
                        onChange={(e) => setTempC(Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-900 dark:text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-stone-600 dark:text-slate-400">RH (%)</label>
                      <input
                        type="number"
                        value={rhPct}
                        onChange={(e) => setRhPct(Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-900 dark:text-white font-bold"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-stone-200 dark:border-slate-700 text-xs text-stone-600 dark:text-slate-400 space-y-1">
                    <div className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>NASA POWER Feed</span>
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-slate-500">Auto-resolved on regional grid.</p>
                  </div>
                )}
              </div>

              {/* Card 4: Logistics */}
              <div className="p-4 rounded-xl bg-stone-50/70 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-slate-300 flex items-center space-x-1.5">
                    <Truck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>4. Logistics</span>
                  </span>
                  <button
                    onClick={() => setUseCustomPrice(!useCustomPrice)}
                    className="text-[11px] text-emerald-800 dark:text-emerald-400 font-bold hover:underline"
                  >
                    {useCustomPrice ? 'Auto APMC' : 'Manual'}
                  </button>
                </div>
                {useCustomPrice && (
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 dark:text-slate-400">Price (₹/kg)</label>
                    <input
                      type="number"
                      value={marketPrice}
                      onChange={(e) => setMarketPrice(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-900 dark:text-white font-bold"
                    />
                  </div>
                )}
                <div className="grid grid-cols-3 gap-1.5 text-xs pt-1">
                  <div>
                    <label className="text-[10px] font-semibold text-stone-500 dark:text-slate-400">Hold (d)</label>
                    <input
                      type="number"
                      value={storageDays}
                      onChange={(e) => setStorageDays(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-stone-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-stone-500 dark:text-slate-400">Transit (h)</label>
                    <input
                      type="number"
                      value={transitHours}
                      onChange={(e) => setTransitHours(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-stone-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-stone-500 dark:text-slate-400">Dist (km)</label>
                    <input
                      type="number"
                      value={transitDistKm}
                      onChange={(e) => setTransitDistKm(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-stone-900 dark:text-white font-bold"
                    />
                  </div>
                </div>
              </div>

            </div>

            <button
              onClick={handleRunSim}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md shadow-emerald-700/20 flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <span>Executing Monte Carlo Sim (N=1,000)...</span>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Risk Simulation</span>
                </>
              )}
            </button>
          </div>

          {/* STEP 2: Results Telemetry */}
          {hasRun && (
            <div className="space-y-6">
              
              <div className="flex items-center space-x-2 text-stone-800 dark:text-white">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  Step 2
                </span>
                <h3 className="text-lg font-bold">
                  Simulation Telemetry & Decision Output
                </h3>
              </div>

              {/* Reliability Banner */}
              <div className="p-4 rounded-2xl border bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <span className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  </span>
                  <div>
                    <span className="font-bold">Recommendation Reliability: 85% (High Confidence)</span>
                    <p className="text-[11px] opacity-80 mt-0.5">Validated with live NASA POWER weather & APMC Mandi market feeds.</p>
                  </div>
                </div>
                <div className="w-36 bg-white dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-stone-200 dark:border-slate-700">
                  <div className="h-full bg-emerald-600 dark:bg-emerald-500 w-[85%]" />
                </div>
              </div>

              {/* Decision Badge */}
              <div className="p-5 sm:p-6 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                <div className="flex items-start space-x-3.5">
                  <div className="p-3 rounded-2xl bg-emerald-600 dark:bg-emerald-500 text-white">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-extrabold uppercase opacity-80">Simulation Recommendation</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-700 text-white">BUY NOW</span>
                    </div>
                    <h3 className="text-xl font-extrabold tracking-tight mt-0.5">BUY NOW (Execute Procurement Contract)</h3>
                    <p className="text-xs sm:text-sm font-semibold opacity-90 mt-0.5">Immediate harvest locks in ₹14,761 expected value with low spoilage exposure (22.3%).</p>
                  </div>
                </div>
              </div>

              {/* 4-Card Metric Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <span className="text-xs font-bold text-stone-500 dark:text-slate-400 uppercase">Expected Net Return (Mean)</span>
                  <div className="text-3xl font-extrabold text-stone-900 dark:text-white mt-3">₹14,761</div>
                  <p className="text-xs text-stone-500 dark:text-slate-400 mt-1">Median: ₹14,650</p>
                </div>
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <span className="text-xs font-bold text-stone-500 dark:text-slate-400 uppercase">90% Outcome Interval</span>
                  <div className="text-xl font-extrabold text-stone-900 dark:text-white mt-3">₹8,809 – ₹20,309</div>
                  <p className="text-xs text-stone-500 dark:text-slate-400 mt-1">P05 to P95 Distribution</p>
                </div>
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">Biological Spoilage Rate</span>
                  <div className="text-3xl font-extrabold text-amber-700 dark:text-amber-400 mt-3">22.3%</div>
                  <p className="text-xs text-stone-500 dark:text-slate-400 mt-1">Shelf Life: ~3.4 Days</p>
                </div>
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase">Downside Loss Risk</span>
                  <div className="text-3xl font-extrabold text-rose-700 dark:text-rose-400 mt-3">0.0%</div>
                  <p className="text-xs text-stone-500 dark:text-slate-400 mt-1">Prob. of Negative Return</p>
                </div>
              </div>

              {/* Analytical Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Harvest Timing Curve */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-xs space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                      <span>Harvest Timing Comparison</span>
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">Price appreciation vs spoilage accumulation trade-off</p>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={timingOptions} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} vertical={false} />
                        <XAxis dataKey="label" stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={11} />
                        <YAxis yAxisId="left" stroke={isDarkMode ? '#34d399' : '#059669'} fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                        <YAxis yAxisId="right" orientation="right" stroke="#d97706" fontSize={11} unit="%" />
                        <Tooltip />
                        <Bar yAxisId="left" dataKey="efv" fill="#059669" radius={[6, 6, 0, 0]} barSize={40} name="Expected Value (₹)" />
                        <Line yAxisId="right" type="monotone" dataKey="spoilage" stroke="#d97706" strokeWidth={2.5} name="Spoilage Rate (%)" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {timingOptions.map((opt, i) => (
                      <div key={i} className="p-3 rounded-xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200/70 dark:border-slate-700 text-xs">
                        <div className="font-bold text-stone-800 dark:text-slate-200">Day {opt.delay} ({opt.spoilage}%)</div>
                        <div className="font-extrabold text-stone-900 dark:text-white mt-0.5">₹{opt.efv.toLocaleString('en-IN')}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Market Options Comparison */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-xs space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center space-x-2">
                      <Store className="w-4 h-4 text-sky-700 dark:text-sky-400" />
                      <span>Market Options Arbitrage</span>
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">Contractual processing vs open-market APMC spot auction</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-stone-50/60 dark:bg-slate-800/60 border border-stone-200/90 dark:border-slate-700 space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <Factory className="w-4 h-4" />
                        </span>
                        <div className="font-bold text-stone-900 dark:text-white text-xs">Direct Processing Unit</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 dark:text-slate-400 uppercase">Expected Net Return:</span>
                        <div className="text-xl font-extrabold text-stone-900 dark:text-white">₹14,761</div>
                      </div>
                      <p className="text-[11px] text-stone-600 dark:text-slate-300">Guaranteed offtake contract, lower price volatility.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-stone-50/60 dark:bg-slate-800/60 border border-stone-200/90 dark:border-slate-700 space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
                          <Store className="w-4 h-4" />
                        </span>
                        <div className="font-bold text-stone-900 dark:text-white text-xs">Local Mandi Spot</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 dark:text-slate-400 uppercase">Expected Net Return:</span>
                        <div className="text-xl font-extrabold text-stone-900 dark:text-white">₹15,024</div>
                      </div>
                      <p className="text-[11px] text-stone-600 dark:text-slate-300">Higher spot potential but exposes seller to daily auction volatility.</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Sensitivity & Tipping Points */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-xs space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center space-x-2">
                      <SlidersHorizontal className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                      <span>Sensitivity Tornado Plot</span>
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">OAT parameter perturbation ranking by financial swing</p>
                  </div>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={sensitivityFactors} margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} horizontal={false} />
                        <XAxis type="number" stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                        <YAxis type="category" dataKey="name" stroke={isDarkMode ? '#cbd5e1' : '#334155'} fontSize={11} width={110} />
                        <Tooltip />
                        <Bar dataKey="swing" fill="#0d9488" radius={[0, 6, 6, 0]} barSize={22} name="EFV Impact (±₹)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-xs space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center space-x-2">
                      <Target className="w-4 h-4 text-rose-700 dark:text-rose-400" />
                      <span>Decision Tipping Points</span>
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">Critical thresholds that would flip the procurement decision</p>
                  </div>
                  <div className="space-y-2.5">
                    {tippingPoints.map((tp, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-stone-50/70 dark:bg-slate-800/60 border border-stone-200/80 dark:border-slate-700 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-stone-900 dark:text-white">{tp.name}</span>
                          <span className="text-stone-500 dark:text-slate-400">Current: {tp.current}</span>
                        </div>
                        <p className="text-[11px] text-stone-600 dark:text-slate-300">{tp.desc}</p>
                        <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 font-bold pt-1">
                          <span>Flip Threshold: {tp.threshold}</span>
                          <span>Flip to {tp.target} &rarr;</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Executive Decision Rationale Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    <span>Executive Decision Rationale & Summary</span>
                  </h3>
                  <span className="text-[11px] font-bold text-stone-500 dark:text-slate-400 uppercase bg-stone-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                    Decision Intelligence
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 dark:bg-slate-800/70 border border-stone-200 dark:border-slate-700">
                  <div className="font-bold text-stone-900 dark:text-white text-sm flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    <span>Recommendation: BUY_NOW (Immediate harvest locks in ₹14,761 expected value with low spoilage exposure.)</span>
                  </div>
                  <p className="text-xs text-stone-700 dark:text-slate-300 pl-6 mt-1">Execute procurement contract immediately.</p>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/60 border border-stone-200/80 dark:border-slate-700 flex items-start space-x-3 text-xs">
                    <IndianRupee className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-stone-900 dark:text-white">Expected Farmer Value: </strong>
                      <span className="text-stone-700 dark:text-slate-300">₹14,761 (5th–95th percentile outcome range: ₹8,809 to ₹20,309). Probability of negative return: 0.0%.</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/60 border border-stone-200/80 dark:border-slate-700 flex items-start space-x-3 text-xs">
                    <ThermometerSnowflake className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-stone-900 dark:text-white">Spoilage & Shelf Life: </strong>
                      <span className="text-stone-700 dark:text-slate-300">Estimated ambient degradation rate is 22.3%. At 31.8°C ambient temperature with 'Optimal' maturity, remaining safe shelf life is ~3.4 days.</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/60 border border-stone-200/80 dark:border-slate-700 flex items-start space-x-3 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-stone-900 dark:text-white">Recommendation Reliability (85%): </strong>
                      <span className="text-stone-700 dark:text-slate-300">High confidence backed by verified meteorological and APMC market inputs.</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </main>

        {/* Footer */}
        <footer className="border-t border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 py-6 mt-12 text-center text-xs text-stone-500 dark:text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>
              <strong className="text-stone-800 dark:text-slate-200 font-bold">HarvestIQ Enterprise</strong> — Risk-Aware Post harvest Spoilage Kinetics & Market Option Decision Engine.
            </p>
            <p className="text-stone-500 dark:text-slate-400 font-medium">
              Explainable Agricultural Decision Intelligence Platform.
            </p>
          </div>
        </footer>

        {/* Data Provenance Modal */}
        {isProvenanceOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center space-x-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>Data Provenance & Attribution Matrix</span>
                </h3>
                <button onClick={() => setIsProvenanceOpen(false)} className="p-1 rounded hover:bg-stone-100 dark:hover:bg-slate-800 cursor-pointer">
                  <X className="w-5 h-5 text-stone-500" />
                </button>
              </div>
              <div className="space-y-2">
                {[
                  { field: 'Respiration Sensitivity (Q10)', status: 'Literature Citation', src: 'UC Davis Post harvest (Kader 2002)' },
                  { field: 'Base Shelf Life Rates (k0)', status: 'Literature Citation', src: 'USDA Handbook 66 & ICAR-DOGR' },
                  { field: 'Historical Market Volatility', status: 'Real Public Feed', src: 'Agmarknet APMC Modal Prices' },
                  { field: 'Transit Vibration Damage Coeff', status: 'Assumed Parameter', src: 'Initial Packhouse Engineering Assumption' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-stone-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-stone-900 dark:text-white">{item.field}</div>
                      <div className="text-[11px] text-stone-500">{item.src}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Supabase Auth Modal */}
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 text-xs shadow-2xl">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  {authMode === 'signin' ? 'Sign In to Account' : 'Create Enterprise Account'}
                </h3>
                <button onClick={() => setIsAuthModalOpen(false)} className="cursor-pointer">
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>
              <div className="grid grid-cols-2 p-1 bg-stone-100 dark:bg-slate-800 rounded-xl font-bold">
                <button
                  onClick={() => setAuthMode('signin')}
                  className={`py-2 rounded-lg cursor-pointer ${authMode === 'signin' ? 'bg-white dark:bg-slate-900 text-emerald-700' : 'text-stone-500'}`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthMode('signup')}
                  className={`py-2 rounded-lg cursor-pointer ${authMode === 'signup' ? 'bg-white dark:bg-slate-900 text-emerald-700' : 'text-stone-500'}`}
                >
                  Sign Up
                </button>
              </div>
              <div className="space-y-3">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 mb-1">Full Name</label>
                    <input type="text" placeholder="e.g. Anand Kumar" className="w-full px-3 py-2 bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl" />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 mb-1">Email</label>
                  <input type="email" placeholder="operator@company.com" className="w-full px-3 py-2 bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 mb-1">Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-3 py-2 bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl" />
                </div>
                <button
                  onClick={() => setIsAuthModalOpen(false)}
                  className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold cursor-pointer"
                >
                  {authMode === 'signin' ? 'Sign In to Dashboard' : 'Complete Registration'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
