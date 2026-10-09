'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Search, X, TrendingUp, Wallet, Settings, MessageSquare } from 'lucide-react';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, setActiveTab } = useApp();
  const [query, setQuery] = useState('');

  if (!isSearchOpen) return null;

  const results = [
    { title: 'Dashboard & Portfolio Overview', tab: 'dashboard', icon: TrendingUp },
    { title: 'Institutional Markets & Assets', tab: 'markets', icon: TrendingUp },
    { title: 'Trading Terminal (Spot/Futures)', tab: 'trading', icon: TrendingUp },
    { title: 'Multi-Asset Wallet & Deposits', tab: 'wallet', icon: Wallet },
    { title: 'Transaction Ledger', tab: 'transactions', icon: Wallet },
    { title: 'Support Chat', tab: 'chat', icon: MessageSquare },
    { title: 'Platform Settings & Preferences', tab: 'settings', icon: Settings },
  ].filter(r => r.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-24 p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-4 shadow-2xl relative">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3 px-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Type to search assets, views, or settings (⌘K)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button onClick={() => setIsSearchOpen(false)} className="text-slate-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 space-y-1 max-h-80 overflow-y-auto">
          {results.map((res, idx) => {
            const Icon = res.icon;
            return (
              <button
                key={idx}
                onClick={() => { setActiveTab(res.tab as any); setIsSearchOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-800/80 text-xs text-slate-300 flex items-center gap-3 transition-colors"
              >
                <Icon className="w-4 h-4 text-blue-400" />
                <span>{res.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
