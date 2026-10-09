'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { TabType } from '@/types';
import { getTranslation } from '@/lib/i18n';
import { 
  LayoutDashboard, TrendingUp, CandlestickChart, PieChart, 
  Wallet, History, Calculator, Headphones, ShieldCheck, 
  Settings, BookOpen, Building2, ShieldAlert, Award, HelpCircle, Lock 
} from 'lucide-react';

interface NavItem {
  id: TabType;
  translationKey: string;
  icon: React.ElementType;
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', translationKey: 'nav.dashboard', icon: LayoutDashboard },
  { id: 'markets', translationKey: 'nav.markets', icon: TrendingUp },
  { id: 'trading', translationKey: 'nav.trading', icon: CandlestickChart },
  { id: 'portfolio', translationKey: 'nav.portfolio', icon: PieChart },
  { id: 'wallet', translationKey: 'nav.wallet', icon: Wallet },
  { id: 'transactions', translationKey: 'nav.transactions', icon: History },
  { id: 'calculator', translationKey: 'nav.calculator', icon: Calculator },
  { id: 'chat', translationKey: 'nav.support', icon: Headphones },
  { id: 'security', translationKey: 'nav.security', icon: ShieldCheck },
  { id: 'settings', translationKey: 'nav.settings', icon: Settings },
  { id: 'legal', translationKey: 'nav.legal', icon: BookOpen },
  { id: 'faq', translationKey: 'nav.faq', icon: HelpCircle },
  { id: 'law-enforcement', translationKey: 'nav.lawEnforcement', icon: Building2, badge: 'GOV' },
  { id: 'admin', translationKey: 'nav.admin', icon: ShieldAlert, badge: 'PRO' },
  { id: 'fees-system', translationKey: 'nav.feesSystem', icon: Lock },
];

const ITEM_COLORS: Record<TabType, { text: string; hoverText: string; activeBg: string; shadow: string }> = {
  dashboard: { text: 'text-blue-400', hoverText: 'group-hover:text-blue-300', activeBg: 'bg-blue-600', shadow: 'shadow-blue-600/30' },
  markets: { text: 'text-emerald-400', hoverText: 'group-hover:text-emerald-300', activeBg: 'bg-emerald-600', shadow: 'shadow-emerald-600/30' },
  trading: { text: 'text-amber-400', hoverText: 'group-hover:text-amber-300', activeBg: 'bg-amber-600', shadow: 'shadow-amber-600/30' },
  portfolio: { text: 'text-purple-400', hoverText: 'group-hover:text-purple-300', activeBg: 'bg-purple-600', shadow: 'shadow-purple-600/30' },
  wallet: { text: 'text-cyan-400', hoverText: 'group-hover:text-cyan-300', activeBg: 'bg-cyan-600', shadow: 'shadow-cyan-600/30' },
  transactions: { text: 'text-teal-400', hoverText: 'group-hover:text-teal-300', activeBg: 'bg-teal-600', shadow: 'shadow-teal-600/30' },
  calculator: { text: 'text-rose-400', hoverText: 'group-hover:text-rose-300', activeBg: 'bg-rose-600', shadow: 'shadow-rose-600/30' },
  chat: { text: 'text-sky-400', hoverText: 'group-hover:text-sky-300', activeBg: 'bg-sky-600', shadow: 'shadow-sky-600/30' },
  security: { text: 'text-emerald-400', hoverText: 'group-hover:text-emerald-300', activeBg: 'bg-emerald-600', shadow: 'shadow-emerald-600/30' },
  settings: { text: 'text-slate-400', hoverText: 'group-hover:text-slate-200', activeBg: 'bg-slate-700', shadow: 'shadow-slate-700/30' },
  legal: { text: 'text-violet-400', hoverText: 'group-hover:text-violet-300', activeBg: 'bg-violet-600', shadow: 'shadow-violet-600/30' },
  faq: { text: 'text-orange-400', hoverText: 'group-hover:text-orange-300', activeBg: 'bg-orange-600', shadow: 'shadow-orange-600/30' },
  'law-enforcement': { text: 'text-zinc-400', hoverText: 'group-hover:text-zinc-200', activeBg: 'bg-zinc-700', shadow: 'shadow-zinc-700/30' },
  admin: { text: 'text-red-400', hoverText: 'group-hover:text-red-300', activeBg: 'bg-red-600', shadow: 'shadow-red-600/30' },
  'fees-system': { text: 'text-yellow-400', hoverText: 'group-hover:text-yellow-300', activeBg: 'bg-yellow-600', shadow: 'shadow-yellow-600/30' },
};

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, language, user, theme } = useApp();

  const sidebarBg = theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0b0f19] border-slate-800 text-white';

  return (
    <aside className={`w-64 border-r hidden md:flex flex-col shrink-0 select-none ${sidebarBg}`}>
      <div className="p-4 border-b border-slate-800/60">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${theme === 'light' ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-blue-600/10 border-blue-500/20 text-white'}`}>
          <Award className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0" />
          <div>
            <p className="text-xs font-bold">{user.role === 'owner' ? 'VIP Institutional Tier' : 'Standard User Account'}</p>
            <p className="text-[10px] text-blue-500 dark:text-blue-400 font-mono">{user.role === 'owner' ? 'Institutional Account' : 'Verified Member'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          if ((item.id === 'admin' || item.id === 'fees-system') && user.role !== 'owner' && user.email !== 'richardshannon901@gmail.com') {
            return null;
          }
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const label = getTranslation(language, item.translationKey);
          const colorCfg = ITEM_COLORS[item.id] || { text: 'text-blue-400', hoverText: 'group-hover:text-blue-300', activeBg: 'bg-blue-600', shadow: 'shadow-blue-600/30' };
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive 
                  ? `${colorCfg.activeBg} text-white shadow-lg ${colorCfg.shadow}` 
                  : theme === 'light' 
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-950'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : `${colorCfg.text} ${colorCfg.hoverText}`}`} />
                <span>{label}</span>
              </div>
              {item.badge && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  isActive ? 'bg-white/20 text-white' : theme === 'light' ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800/60">
        <div className={`rounded-xl p-3 text-center border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
          <p className="text-[11px] font-semibold">OKX FLIX Core v4.8</p>
          <p className="text-[10px] text-slate-500 mt-0.5 font-mono">Digital Asset Exchange</p>
        </div>
      </div>
    </aside>
  );
};
