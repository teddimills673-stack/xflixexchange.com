'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { Search, Star, TrendingUp, TrendingDown, ArrowUpDown, ExternalLink, ShieldCheck, Clock, Building2, Layers } from 'lucide-react';
import { CryptoAsset } from '@/types';
import { INITIAL_ASSETS } from '@/lib/mockData';
import { getAssetLogo } from '@/lib/logoMap';

interface EquityAsset {
  id: string;
  name: string;
  symbol: string;
  priceUSD: number;
  change24h: number;
  category: string;
  marketStatus: string;
  type: string;
  iconUrl: string;
  lastUpdated: string;
}

const MARKET_TABS = ['Cryptocurrencies', 'Global Equities', 'Tokenized Equities', 'Private Instruments', 'Favorites'];

const CRYPTO_CATEGORIES = [
  'All', 'Hot', 'Trending', 'Top Market Cap', 'DeFi', 'AI Tokens', 'Layer 1', 'Layer 2', 'Meme Coins', 'Stablecoins'
];

export const MarketsView: React.FC = () => {
  const { setActiveTab } = useApp();
  const [activeTabType, setActiveTabType] = useState<string>('Cryptocurrencies');
  const [assets, setAssets] = useState<CryptoAsset[]>(INITIAL_ASSETS);
  const [equities, setEquities] = useState<EquityAsset[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>(['bitcoin', 'ethereum', 'solana', 'apple', 'nvidia']);
  const [apiStatus, setApiStatus] = useState<{ status: string; source: string }>({ status: 'LIVE', source: 'CoinGecko & Global Equities Feed' });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    async function fetchMarketData() {
      try {
        const res = await fetch('/api/market');
        const data = await res.json();
        if (data.assets) setAssets(data.assets);
        if (data.equities) setEquities(data.equities);
        if (data.status) setApiStatus({ status: data.status, source: data.source });
        setLastSyncTime(new Date().toLocaleTimeString());
      } catch (err) {
        console.error("Failed to fetch market data", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000); // 30s live refresh
    return () => clearInterval(interval);
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const filteredCrypto = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || asset.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTabType === 'Favorites') return matchesSearch && favorites.includes(asset.id);
    if (selectedCategory === 'All') return matchesSearch;
    return matchesSearch && asset.category === selectedCategory;
  });

  const filteredEquities = equities.filter(eq => {
    const matchesSearch = eq.name.toLowerCase().includes(searchQuery.toLowerCase()) || eq.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTabType === 'Favorites') return matchesSearch && favorites.includes(eq.id);
    if (activeTabType === 'Global Equities') return matchesSearch && eq.category === 'Global Equities';
    if (activeTabType === 'Tokenized Equities') return matchesSearch && eq.category === 'Tokenized Equities';
    if (activeTabType === 'Private Instruments') return matchesSearch && eq.category === 'Private Instruments';
    return matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-7xl mx-auto">
      {/* Header & API Status */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Global Market Dashboard & Equities</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time cryptocurrency prices, global equities, tokenized stocks, and verified institutional market data.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass-card px-3.5 py-2 rounded-2xl flex items-center gap-2.5 text-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${apiStatus.status === 'LIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
            <span className="text-slate-300 font-mono">Feed: <strong className="text-white">{apiStatus.status}</strong> ({apiStatus.source})</span>
            <span className="text-slate-500 text-[10px] font-mono pl-2 border-l border-slate-800">Synced: {lastSyncTime}</span>
          </div>
        </div>
      </div>

      {/* Main Asset Class Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {MARKET_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTabType(tab); setSelectedCategory('All'); }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTabType === tab 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                : 'glass-card text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Sub-categories (for crypto) & Search */}
      {activeTabType === 'Cryptocurrencies' && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
          {CRYPTO_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat 
                  ? 'bg-blue-600/40 border border-blue-500/50 text-white' 
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative w-full md:w-80">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search coin, ticker (AAPL, BTC, NVDA)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="glass-input w-full rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Markets Table */}
      <div className="glass-panel rounded-3xl shadow-2xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-[11px] font-mono text-slate-400 bg-slate-950/60 uppercase">
                <th className="py-4 px-5">Asset / Instrument</th>
                <th className="py-4 px-5">Price (USD)</th>
                <th className="py-4 px-5">24H Change</th>
                {activeTabType === 'Cryptocurrencies' && <th className="py-4 px-5">7D Change</th>}
                {activeTabType === 'Cryptocurrencies' && <th className="py-4 px-5">24H Volume</th>}
                <th className="py-4 px-5">Market Status</th>
                <th className="py-4 px-5">Instrument Type</th>
                <th className="py-4 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs font-medium text-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-mono animate-pulse">Loading real-time institutional feed...</td>
                </tr>
              ) : activeTabType === 'Cryptocurrencies' ? (
                filteredCrypto.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-mono">No matching crypto assets found.</td>
                  </tr>
                ) : (
                  filteredCrypto.map(asset => {
                    const isFav = favorites.includes(asset.id);
                    return (
                      <tr 
                        key={asset.id} 
                        onClick={() => setActiveTab('trading')}
                        className="hover:bg-slate-800/30 cursor-pointer transition-colors group"
                      >
                        <td className="py-4 px-5 flex items-center gap-3.5">
                          <button onClick={(e) => toggleFavorite(asset.id, e)} className="text-slate-600 hover:text-amber-400 transition-colors">
                            <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                          </button>
                          {/* Logo with Thick Blue Border */}
                          <div className="w-12 h-12 rounded-full border-2 border-blue-500 bg-slate-900 flex items-center justify-center overflow-hidden shrink-0 shadow-md shadow-blue-500/20">
                            {getAssetLogo(asset.symbol) || asset.iconUrl ? (
                              <img src={getAssetLogo(asset.symbol) || asset.iconUrl} alt={asset.name} className="w-7 h-7 object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-xs font-bold text-blue-400 font-mono">{asset.symbol.slice(0, 3)}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{asset.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{asset.symbol}</p>
                          </div>
                        </td>

                        <td className="py-4 px-5 font-mono font-bold text-white text-sm">
                          ${asset.priceUSD >= 1 ? asset.priceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : asset.priceUSD.toFixed(6)}
                        </td>

                        <td className={`py-4 px-5 font-mono font-bold ${asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                        </td>

                        <td className={`py-4 px-5 font-mono ${asset.change7d >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {asset.change7d >= 0 ? '+' : ''}{asset.change7d}%
                        </td>

                        <td className="py-4 px-5 font-mono text-slate-300">
                          ${(asset.volume24h / 1e6).toLocaleString('en-US', { maximumFractionDigits: 1 })}M
                        </td>

                        <td className="py-4 px-5">
                          <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold">
                            Live Stream
                          </span>
                        </td>

                        <td className="py-4 px-5 font-mono text-slate-400">
                          Cryptocurrency
                        </td>

                        <td className="py-4 px-5 text-right">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveTab('trading'); }}
                            className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-3.5 py-1.5 rounded-xl font-bold transition-all"
                          >
                            Trade
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )
              ) : (
                /* Equities & Tokenized Stocks Table */
                filteredEquities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-mono">No matching equities found.</td>
                  </tr>
                ) : (
                  filteredEquities.map(eq => {
                    const isFav = favorites.includes(eq.id);
                    return (
                      <tr 
                        key={eq.id} 
                        className="hover:bg-slate-800/30 transition-colors group"
                      >
                        <td className="py-4 px-5 flex items-center gap-3.5">
                          <button onClick={(e) => toggleFavorite(eq.id, e)} className="text-slate-600 hover:text-amber-400 transition-colors">
                            <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                          </button>
                          {/* Stock Logo with Thick Blue Border */}
                          <div className="w-12 h-12 rounded-full border-2 border-blue-500 bg-slate-900 flex items-center justify-center overflow-hidden shrink-0 shadow-md shadow-blue-500/20">
                            {getAssetLogo(eq.symbol) || eq.iconUrl ? (
                              <img src={getAssetLogo(eq.symbol) || eq.iconUrl} alt={eq.name} className="w-7 h-7 object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-xs font-bold text-blue-400 font-mono">{eq.symbol.slice(0, 3)}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{eq.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{eq.symbol}</p>
                          </div>
                        </td>

                        <td className="py-4 px-5 font-mono font-bold text-white text-sm">
                          {eq.priceUSD > 0 ? `$${eq.priceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Private / Unlisted'}
                        </td>

                        <td className={`py-4 px-5 font-mono font-bold ${eq.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {eq.change24h !== 0 ? `${eq.change24h >= 0 ? '+' : ''}${eq.change24h}%` : '—'}
                        </td>

                        <td className="py-4 px-5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                            eq.marketStatus === 'Open' 
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                              : eq.marketStatus === '24/7 DeFi'
                              ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          }`}>
                            {eq.marketStatus}
                          </span>
                        </td>

                        <td className="py-4 px-5 font-mono text-slate-300 text-[11px]">
                          {eq.type}
                        </td>

                        <td className="py-4 px-5 text-right">
                          <button 
                            onClick={() => setActiveTab('trading')}
                            className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-3.5 py-1.5 rounded-xl font-bold transition-all"
                          >
                            {eq.category === 'Private Instruments' ? 'Details' : 'Trade'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
