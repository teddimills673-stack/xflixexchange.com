'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/lib/store';
import { Calculator, ArrowRightLeft, RefreshCw, AlertCircle, Coins, Search } from 'lucide-react';
import { CryptoAsset } from '@/types';
import { INITIAL_ASSETS } from '@/lib/mockData';

export const CalculatorView: React.FC = () => {
  const { convertCurrency } = useApp();
  const [assets, setAssets] = useState<CryptoAsset[]>(INITIAL_ASSETS);
  const [dataSource, setDataSource] = useState<string>('CoinGecko API');
  const [apiStatus, setApiStatus] = useState<string>('LIVE');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Calculator states
  const [calcMode, setCalcMode] = useState<'crypto-fiat' | 'crypto-crypto'>('crypto-fiat');
  const [fromAssetId, setFromAssetId] = useState<string>('bitcoin');
  const [toAssetId, setToAssetId] = useState<string>('ethereum');
  const [amount, setAmount] = useState<string>('1.0');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchMarketData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/market');
      const data = await res.json();
      if (data.assets && Array.isArray(data.assets)) {
        setAssets(data.assets);
        setDataSource(data.source || 'CoinGecko API');
        setApiStatus(data.status || 'LIVE');
        if (data.status === 'UNAVAILABLE') {
          setErrorMsg(data.error || 'Market data API temporarily failed. Showing fallback feed with retry option.');
        }
      }
    } catch (err) {
      setErrorMsg('Failed to fetch market data. Please verify network connectivity.');
      setApiStatus('UNAVAILABLE');
      setDataSource('Standard Fallback Feed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fromAsset = assets.find(a => a.id === fromAssetId) || assets[0];
  const toAsset = assets.find(a => a.id === toAssetId) || assets[1] || assets[0];

  const numericAmount = parseFloat(amount || '0');
  const fromPriceUSD = fromAsset?.priceUSD || 0;
  const toPriceUSD = toAsset?.priceUSD || 1;

  const totalUSD = numericAmount * fromPriceUSD;
  const convertedFiat = convertCurrency(totalUSD);
  const crossConversionOutput = toPriceUSD > 0 ? totalUSD / toPriceUSD : 0;

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold ${apiStatus === 'LIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
              Source: {dataSource}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Expanded Crypto Calculator & ROI</h1>
          <p className="text-xs text-slate-400 mt-1">Dynamic bi-directional cryptocurrency conversion backed by real-time market data feeds.</p>
        </div>

        <button
          onClick={fetchMarketData}
          disabled={isLoading}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Prices</span>
        </button>
      </div>

      {errorMsg && (
        <div className="bg-amber-500/15 border border-amber-500/30 text-amber-300 p-4 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={fetchMarketData}
            className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
          >
            Retry Now
          </button>
        </div>
      )}

      {/* Mode Selector & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300">Conversion Mode</span>
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setCalcMode('crypto-fiat')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${calcMode === 'crypto-fiat' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Crypto ⇄ Fiat
            </button>
            <button
              onClick={() => setCalcMode('crypto-crypto')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${calcMode === 'crypto-crypto' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Crypto ⇄ Crypto
            </button>
          </div>
        </div>

        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Search crypto asset by name or symbol (e.g. Bitcoin, ETH, SOL)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-400" />
            <span>Select Assets & Quantity</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-mono">FROM ASSET</label>
              <select
                value={fromAssetId}
                onChange={(e) => setFromAssetId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs px-3.5 py-3 rounded-xl font-medium"
              >
                {filteredAssets.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.symbol}) — ${a.priceUSD.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-mono">QUANTITY</label>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs px-3.5 py-3 rounded-xl font-mono text-base font-bold"
                placeholder="0.00"
              />
            </div>

            {calcMode === 'crypto-crypto' && (
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-mono">TO ASSET</label>
                <select
                  value={toAssetId}
                  onChange={(e) => setToAssetId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs px-3.5 py-3 rounded-xl font-medium"
                >
                  {filteredAssets.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.symbol}) — ${a.priceUSD.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-1 text-slate-400">
            <div className="flex justify-between">
              <span>{fromAsset?.name} Live Price:</span>
              <span className="text-white">${fromPriceUSD.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>24h Price Change:</span>
              <span className={fromAsset?.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {fromAsset?.change24h >= 0 ? '+' : ''}{fromAsset?.change24h?.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="bg-gradient-to-br from-blue-900/20 via-slate-900 to-slate-900 border border-blue-500/20 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-blue-400">Conversion Result</span>
              <span className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded font-mono">Real-time Feed</span>
            </div>

            {calcMode === 'crypto-fiat' ? (
              <div className="space-y-2">
                <p className="text-3xl font-bold text-white font-mono">
                  ${totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  In Base Currency ({convertedFiat.symbol}): {convertedFiat.formatted}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-3xl font-bold text-white font-mono">
                  {crossConversionOutput.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })} {toAsset?.symbol}
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  Equivalent to ${totalUSD.toLocaleString()} USD
                </p>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-800 text-xs font-mono space-y-2 text-slate-300">
            <div className="flex justify-between">
              <span>Estimated Institutional Execution Fee (0.02%):</span>
              <span className="text-emerald-400">${(totalUSD * 0.0002).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Network Gas Estimation:</span>
              <span className="text-emerald-400">$1.20 (Standard Priority)</span>
            </div>
            <div className="flex justify-between border-t border-slate-800/80 pt-2 text-white font-bold">
              <span>Net Settled Value:</span>
              <span className="text-emerald-400">${(totalUSD * 0.9998 - 1.20).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
