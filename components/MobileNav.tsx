'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { LayoutDashboard, TrendingUp, Wallet, PieChart, Menu } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen } = useApp();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0b0f19]/95 backdrop-blur-md border-t border-slate-800 z-50 px-2 py-2 flex items-center justify-around shadow-2xl">
      <button
        onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
          activeTab === 'dashboard' ? 'text-blue-400 bg-blue-500/10 font-semibold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-[10px]">Dashboard</span>
      </button>

      <button
        onClick={() => { setActiveTab('markets'); setIsMobileMenuOpen(false); }}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
          activeTab === 'markets' ? 'text-emerald-400 bg-emerald-500/10 font-semibold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <TrendingUp className="w-5 h-5" />
        <span className="text-[10px]">Markets</span>
      </button>

      <button
        onClick={() => { setActiveTab('wallet'); setIsMobileMenuOpen(false); }}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
          activeTab === 'wallet' ? 'text-cyan-400 bg-cyan-500/10 font-semibold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Wallet className="w-5 h-5" />
        <span className="text-[10px]">Wallet</span>
      </button>

      <button
        onClick={() => { setActiveTab('portfolio'); setIsMobileMenuOpen(false); }}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
          activeTab === 'portfolio' ? 'text-purple-400 bg-purple-500/10 font-semibold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <PieChart className="w-5 h-5" />
        <span className="text-[10px]">Portfolio</span>
      </button>

      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
          isMobileMenuOpen ? 'text-blue-400 bg-blue-500/10 font-semibold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px]">More</span>
      </button>
    </div>
  );
};
