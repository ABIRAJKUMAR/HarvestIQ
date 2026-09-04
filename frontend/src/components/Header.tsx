import React, { useState } from 'react';
import { Sprout, Globe, Moon, Sun, User, LogOut, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  activeTab: 'home' | 'simulator' | 'baseline' | 'experiments' | 'history';
  setActiveTab: (tab: 'home' | 'simulator' | 'baseline' | 'experiments' | 'history') => void;
  onOpenProvenance: () => void;
  dataSource?: 'live' | 'cached' | 'demo';
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenProvenance,
  dataSource = 'cached'
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, openAuthModal, signOut } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);

  const getDataSourceBadge = () => {
    switch (dataSource) {
      case 'live':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t('live_data')}</span>
          </span>
        );
      case 'cached':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            <span>{t('cached_data')}</span>
          </span>
        );
      case 'demo':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>{t('demo_data')}</span>
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-stone-200/90 dark:border-slate-800 shadow-xs transition-colors">
      <div className="w-full max-w-[96%] xl:max-w-[94%] 2xl:max-w-[1720px] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand Logo */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('home')}>
              <div className="w-8 h-8 rounded-full border-2 border-emerald-600 dark:border-emerald-500 flex items-center justify-center text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/50">
                <Sprout className="w-4 h-4" />
              </div>
              <span className="font-heading font-extrabold text-base tracking-tight text-stone-900 dark:text-white uppercase">
                HARVESTIQ
              </span>
            </div>

            {/* Clean Horizontal Links */}
            <nav className="hidden lg:flex items-center space-x-6 text-xs font-bold">
              <button
                onClick={() => setActiveTab('home')}
                className={`transition-colors cursor-pointer ${
                  activeTab === 'home'
                    ? 'text-emerald-700 dark:text-emerald-400 font-extrabold'
                    : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                {t('tab_home')}
              </button>

              <button
                onClick={() => setActiveTab('simulator')}
                className={`transition-colors cursor-pointer ${
                  activeTab === 'simulator'
                    ? 'text-emerald-700 dark:text-emerald-400 font-extrabold'
                    : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                {t('tab_simulator')}
              </button>

              <button
                onClick={() => setActiveTab('baseline')}
                className={`transition-colors cursor-pointer ${
                  activeTab === 'baseline'
                    ? 'text-emerald-700 dark:text-emerald-400 font-extrabold'
                    : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                {t('tab_baseline')}
              </button>

              <button
                onClick={() => setActiveTab('experiments')}
                className={`transition-colors cursor-pointer ${
                  activeTab === 'experiments'
                    ? 'text-emerald-700 dark:text-emerald-400 font-extrabold'
                    : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                {t('tab_experiments')}
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`transition-colors cursor-pointer ${
                  activeTab === 'history'
                    ? 'text-emerald-700 dark:text-emerald-400 font-extrabold'
                    : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                {t('tab_history')}
              </button>

              <button
                onClick={onOpenProvenance}
                className="text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                {t('provenance_btn')}
              </button>
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-3">
            
            {/* Data Source Indicator */}
            <div className="hidden sm:block">
              {getDataSourceBadge()}
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-stone-50 dark:bg-slate-800 hover:bg-stone-100 dark:hover:bg-slate-700 text-stone-700 dark:text-slate-200 border border-stone-200 dark:border-slate-700 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>{language === 'en' ? 'தமிழ்' : 'EN'}</span>
            </button>

            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full bg-stone-50 dark:bg-slate-800 hover:bg-stone-100 dark:hover:bg-slate-700 text-stone-600 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-700" />}
            </button>

            {/* User Account / Sign In */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 pl-1 pr-3 py-1 bg-white dark:bg-slate-800 hover:bg-stone-50 dark:hover:bg-slate-700 text-stone-800 dark:text-slate-100 border border-stone-200 dark:border-slate-700 rounded-full text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white font-extrabold flex items-center justify-center text-xs">
                    {user.avatarInitial || 'A'}
                  </div>
                  <span>My Account</span>
                  <ChevronDown className="w-3 h-3 text-stone-400" />
                </button>

                {/* Account Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn text-xs">
                    <div className="px-4 py-2 border-b border-stone-100 dark:border-slate-800">
                      <div className="font-bold text-stone-900 dark:text-white">{user.fullName}</div>
                      <div className="text-[11px] text-stone-500 dark:text-slate-400 truncate">{user.email}</div>
                      <span className="mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {user.role}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        openAuthModal('signin');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-stone-50 dark:hover:bg-slate-800 text-stone-700 dark:text-slate-300 flex items-center space-x-2 font-medium"
                    >
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      <span>Switch Account</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        signOut();
                      }}
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
                onClick={() => openAuthModal('signin')}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

          </div>

        </div>

        {/* Mobile Navigation Links */}
        <div className="lg:hidden flex items-center justify-between pb-3 pt-1 border-t border-stone-100 dark:border-slate-800 overflow-x-auto space-x-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'home' ? 'bg-emerald-700 text-white' : 'text-stone-600 dark:text-slate-400'
            }`}
          >
            {t('tab_home')}
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'simulator' ? 'bg-emerald-700 text-white' : 'text-stone-600 dark:text-slate-400'
            }`}
          >
            {t('tab_simulator')}
          </button>
          <button
            onClick={() => setActiveTab('baseline')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'baseline' ? 'bg-emerald-700 text-white' : 'text-stone-600 dark:text-slate-400'
            }`}
          >
            {t('tab_baseline')}
          </button>
          <button
            onClick={() => setActiveTab('experiments')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'experiments' ? 'bg-emerald-700 text-white' : 'text-stone-600 dark:text-slate-400'
            }`}
          >
            {t('tab_experiments')}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'history' ? 'bg-emerald-700 text-white' : 'text-stone-600 dark:text-slate-400'
            }`}
          >
            {t('tab_history')}
          </button>
        </div>

      </div>
    </header>
  );
};
