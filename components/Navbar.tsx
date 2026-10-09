'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { 
  Search, Bell, User, Globe, Moon, Sun, Shield, LogOut, 
  ChevronDown, CheckCircle2, AlertTriangle, Coins, Menu, X, Award 
} from 'lucide-react';
import { LiquidNavigationPanel } from '@/components/LiquidNavigationPanel';

export const Navbar: React.FC = () => {
  const { 
    user, balances, baseCurrency, setBaseCurrency, 
    theme, setTheme, setIsSearchOpen, setIsAuthModalOpen, 
    setActiveTab, convertCurrency, feeProtocol, logout, language, activeTab,
    isMobileMenuOpen, setIsMobileMenuOpen
  } = useApp();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCurrencyMenuOpen, setIsCurrencyMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Security 2FA Passkey Updated', time: '2m ago', unread: true, type: 'security' },
    { id: '2', title: 'Institutional Deposit Confirmed (1.45 BTC)', time: '1h ago', unread: true, type: 'deposit' },
    { id: '3', title: 'Market Alert: BTC Reached $94,500 Target', time: '3h ago', unread: false, type: 'market' },
    { id: '4', title: 'Account Audit Log Compliance Passed', time: '1d ago', unread: false, type: 'system' },
  ]);

  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const totalPortfolioUSD = balances.reduce((acc, b) => acc + b.valueUSD, 0);
  const convertedTotal = convertCurrency(totalPortfolioUSD);

  const headerBg = theme === 'light' ? 'bg-white border-slate-200 text-slate-900 shadow-xs' : 'bg-[#0b0f19] border-slate-800 text-white';
  const controlBg = theme === 'light' ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800';
  const dropdownBg = theme === 'light' ? 'bg-white border-slate-200 text-slate-900 shadow-xl' : 'bg-slate-900 border-slate-800 text-white shadow-2xl';

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b ${headerBg}`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 shrink">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className={`md:hidden p-2 rounded-xl border transition-colors shrink-0 ${controlBg}`}
            title="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 cursor-pointer group min-w-0"
          >
            <img 
              src="/logo.svg" 
              alt="OKX FLIX Logo" 
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform object-cover border border-slate-700 shrink-0" 
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 truncate">
              <span className="text-sm sm:text-lg font-bold tracking-tight flex items-center gap-1.5 truncate">
                OKX FLIX
                <span className="text-[10px] bg-blue-500/20 text-blue-500 dark:text-blue-400 px-1.5 py-0.5 rounded font-mono hidden xs:inline-block">PRO</span>
              </span>
              <p className="text-[10px] text-slate-400 font-mono hidden md:block">Crypto Exchange</p>
            </div>
          </div>

          {/* Quick Stats / API Status */}
          <div className="hidden lg:flex items-center gap-3 text-xs bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-200">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              API: LIVE
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">BTC Dominance: <strong className="text-white">54.2%</strong></span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">Fear & Greed: <strong className="text-amber-400">74 (Greed)</strong></span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Global Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-colors ${controlBg}`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search assets, orders, help...</span>
            <kbd className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-mono">⌘K</kbd>
          </button>

          {/* Currency Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsCurrencyMenuOpen(!isCurrencyMenuOpen);
                setIsProfileMenuOpen(false);
                setIsNotificationsOpen(false);
              }}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-medium shrink-0 ${controlBg}`}
            >
              <span className="font-mono">{baseCurrency}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {isCurrencyMenuOpen && (
              <div className={`absolute right-0 mt-2 w-36 rounded-xl py-1 z-50 text-xs border ${dropdownBg}`}>
                {(['USD', 'EUR', 'GBP', 'GHS', 'CAD', 'AUD', 'JPY', 'CHF'] as const).map(curr => (
                  <button
                    key={curr}
                    onClick={() => { setBaseCurrency(curr); setIsCurrencyMenuOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-blue-600/20 hover:text-blue-400 transition-colors ${baseCurrency === curr ? 'text-blue-500 dark:text-blue-400 font-semibold' : ''}`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-lg border transition-colors shrink-0 ${controlBg}`}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
          </button>

          {/* Notifications Center Dropdown */}
          <div className="relative">
            <button 
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsProfileMenuOpen(false);
                setIsCurrencyMenuOpen(false);
              }}
              className={`p-2 rounded-lg border relative transition-colors shrink-0 ${controlBg} ${isNotificationsOpen ? 'border-blue-500 text-blue-500' : ''}`}
              title="Notifications Center"
            >
              <Bell className="w-4 h-4" />
              {notifications.some(n => n.unread) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl p-4 z-50 text-xs border ${dropdownBg}`}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/50 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">Notification Center</span>
                    <span className="text-[10px] bg-blue-500/10 text-blue-500 dark:text-blue-400 font-mono px-2 py-0.5 rounded-full border border-blue-500/20">
                      {notifications.filter(n => n.unread).length} Unread
                    </span>
                  </div>
                  <button 
                    onClick={() => setNotifications(notifications.map(n => ({ ...n, unread: false })))}
                    className="text-[11px] text-blue-500 dark:text-blue-400 hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                  {notifications.map(n => (
                    <div 
                      key={n.id}
                      onClick={() => {
                        setNotifications(notifications.map(item => item.id === n.id ? { ...item, unread: false } : item));
                        if (n.type === 'security') setActiveTab('security');
                        else if (n.type === 'deposit') setActiveTab('wallet');
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        n.unread 
                          ? theme === 'light' ? 'bg-blue-50 border-blue-200 shadow-xs' : 'bg-blue-600/10 border-blue-500/30'
                          : theme === 'light' ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        n.type === 'security' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' :
                        n.type === 'deposit' ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30' :
                        n.type === 'market' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                        'bg-purple-500/20 text-purple-500 border border-purple-500/30'
                      }`}>
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-semibold truncate">{n.title}</p>
                          {n.unread && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-slate-700/50 mt-3 text-center">
                  <button
                    onClick={() => {
                      setActiveTab('security');
                      setIsNotificationsOpen(false);
                    }}
                    className="text-xs text-blue-500 dark:text-blue-400 hover:underline font-semibold"
                  >
                    View Account Security & Logs →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setIsProfileMenuOpen(!isProfileMenuOpen);
                setIsCurrencyMenuOpen(false);
                setIsNotificationsOpen(false);
              }}
              className={`flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border transition-colors ${controlBg}`}
            >
              <div className="text-right hidden sm:block min-w-0">
                <p className="text-xs font-semibold truncate max-w-[90px]">{user.username}</p>
                <p className="text-[10px] text-emerald-500 dark:text-emerald-400 font-mono truncate">ID: {user.id}</p>
              </div>
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.username} 
                  className="w-8 h-8 rounded-lg object-cover border border-blue-500/30 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center border border-slate-700 shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {isProfileMenuOpen && (
              <div className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl p-2 z-50 text-xs border ${dropdownBg}`}>
                <div className="p-3 border-b border-slate-700/50 mb-1">
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-slate-400 text-[11px] truncate">{user.email}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 px-2 py-0.5 rounded font-mono">Score: {user.securityScore}/100</span>
                    <span className="text-[10px] bg-blue-500/10 text-blue-500 dark:text-blue-400 px-2 py-0.5 rounded font-mono uppercase">{user.role}</span>
                  </div>
                </div>

                <button 
                  onClick={() => { setActiveTab('portfolio'); setIsProfileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-500/10 flex items-center gap-2"
                >
                  <Coins className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <span>Portfolio Balance: {convertedTotal.symbol} {convertedTotal.formatted}</span>
                </button>

                <button 
                  onClick={() => { setActiveTab('security'); setIsProfileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-500/10 flex items-center gap-2"
                >
                  <Shield className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span>Security & 2FA Settings</span>
                </button>

                <button 
                  onClick={() => { setActiveTab('settings'); setIsProfileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-500/10 flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <span>Account & Preferences</span>
                </button>

                <div className="border-t border-slate-700/50 my-1"></div>

                <button 
                  onClick={() => { logout(); setIsProfileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-500/10 text-rose-500 dark:text-rose-400 flex items-center gap-2 font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out / Switch Session</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <LiquidNavigationPanel />
    </header>
  );
};
