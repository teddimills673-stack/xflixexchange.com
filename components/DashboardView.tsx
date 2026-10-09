'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { 
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, 
  Wallet, ShieldCheck, PieChart, Activity, AlertCircle, RefreshCw, Send, HelpCircle, ChevronRight, Eye, EyeOff 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { INITIAL_ASSETS } from '@/lib/mockData';
import { getAssetLogo } from '@/lib/logoMap';

const PORTFOLIO_HISTORY_RANGES: Record<string, { date: string; value: number }[]> = {
  '24H': [
    { date: '00:00', value: 2834628 },
    { date: '04:00', value: 2837128 },
    { date: '08:00', value: 2839284 },
    { date: '12:00', value: 2838603 },
    { date: '16:00', value: 2840321.78 },
    { date: '20:00', value: 2840321.78 },
    { date: 'Now', value: 2840321.78 },
  ],
  '7D': [
    { date: 'Mon', value: 2823267 },
    { date: 'Tue', value: 2828947 },
    { date: 'Wed', value: 2826675 },
    { date: 'Thu', value: 2834628 },
    { date: 'Fri', value: 2839170 },
    { date: 'Sat', value: 2840321.78 },
    { date: 'Sun', value: 2840321.78 },
  ],
  '30D': [
    { date: 'Aug 1', value: 2817586 },
    { date: 'Aug 5', value: 2831219 },
    { date: 'Aug 10', value: 2823267 },
    { date: 'Aug 15', value: 2838031 },
    { date: 'Aug 20', value: 2840321.78 },
    { date: 'Aug 22', value: 2840321.78 },
  ],
  '1Y': [
    { date: 'Q1', value: 2101828 },
    { date: 'Q2', value: 2385860 },
    { date: 'Q3', value: 2669890 },
    { date: 'Q4', value: 2840321.78 },
  ],
  'All': [
    { date: '2012', value: 56806 },
    { date: '2015', value: 511255 },
    { date: '2018', value: 1363348 },
    { date: '2022', value: 2214441 },
    { date: '2026', value: 2840321.78 },
  ],
};

export const DashboardView: React.FC = () => {
  const { user, setUser, balances, transactions, convertCurrency, setActiveTab, triggerDeactivationLock, theme } = useApp();
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('30D');

  const isOwner = user.role === 'owner' || user.email === 'richardshannon901@gmail.com';

  const totalPortfolioUSD = balances.reduce((acc, b) => acc + b.valueUSD, 0);
  const formattedPortfolio = convertCurrency(totalPortfolioUSD);
  const dailyPnL = isOwner ? convertCurrency(18420.50) : convertCurrency(0);

  const [portfolioCurrency, setPortfolioCurrency] = useState<'USD' | 'USDT' | 'BTC'>('USD');
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState<boolean>(false);

  const btcPrice = 68720.50;
  const portfolioDisplayValue = React.useMemo(() => {
    if (portfolioCurrency === 'USD') {
      return convertCurrency(totalPortfolioUSD);
    } else if (portfolioCurrency === 'USDT') {
      return { symbol: 'USDT', formatted: totalPortfolioUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) };
    } else {
      const btcVal = totalPortfolioUSD / btcPrice;
      return { symbol: '₿', formatted: btcVal.toFixed(4) };
    }
  }, [totalPortfolioUSD, portfolioCurrency, convertCurrency]);
  
  const portfolioHistory = isOwner 
    ? (PORTFOLIO_HISTORY_RANGES[selectedTimeRange] || PORTFOLIO_HISTORY_RANGES['30D'])
    : (totalPortfolioUSD > 0 ? [
        { date: 'Start', value: 0 },
        { date: 'Current', value: totalPortfolioUSD }
      ] : []);

  const handleWithdrawClick = () => {
    if (isOwner) {
      triggerDeactivationLock();
    } else {
      setActiveTab('wallet');
    }
  };

  const cardBg = theme === 'light' ? 'bg-white border-slate-200 text-slate-900 shadow-sm' : 'bg-slate-900/90 border-slate-800 text-white shadow-xl';
  const textSub = theme === 'light' ? 'text-slate-500' : 'text-slate-400';
  const textMain = theme === 'light' ? 'text-slate-900' : 'text-white';

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Dormant Verification Notice for Main Owner */}
      {isOwner && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-500/20 text-amber-400 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider border border-amber-500/30">
                  Dormant Account
                </span>
                <span className={`text-xs ${textSub} font-mono`}>Status: Inactive / Pending Verification</span>
              </div>
              <h2 className={`text-base font-bold ${textMain} mt-1.5`}>Account Verification Required</h2>
              <p className={`text-xs ${textSub} mt-0.5 leading-relaxed`}>
                Your account is currently dormant. Verification is required before the account can be reactivated.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className={`border rounded-2xl p-6 relative overflow-hidden ${theme === 'light' ? 'bg-gradient-to-r from-blue-50 via-white to-white border-blue-200 shadow-sm' : 'bg-gradient-to-r from-blue-900/40 via-slate-900 to-slate-900 border-blue-500/20'}`}>
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono px-2 py-0.5 rounded-full border border-emerald-500/20">
                Institutional VIP Tier
              </span>
              <span className={`text-xs ${textSub} font-mono`}>ID: {user.id}</span>
            </div>
            <h1 className={`text-2xl font-bold ${textMain} tracking-tight`}>Welcome back, {user.username}</h1>
            <p className={`text-sm ${textSub} mt-1`}>
              OKX FLIX Crypto Exchange
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('wallet')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/25 flex items-center gap-2 transition-all"
            >
              <Wallet className="w-4 h-4" />
              <span>Wallet & Deposit</span>
            </button>
            <button
              onClick={handleWithdrawClick}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all ${theme === 'light' ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'}`}
            >
              <Send className="w-4 h-4 text-amber-400" />
              <span>Withdraw Funds</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financial Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className={`${cardBg} rounded-2xl p-5 relative min-w-0`}>
          <div className="flex items-center justify-between mb-1 gap-2">
            <p className={`text-xs ${textSub} font-medium truncate`}>Total Portfolio Balance</p>
            <button
              onClick={() => setUser(prev => ({ ...prev, privacyMode: !prev.privacyMode }))}
              className="text-[11px] font-mono flex items-center gap-1 text-blue-500 hover:text-blue-600 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-1 rounded-lg transition-all shrink-0"
              title="Toggle Privacy Mode"
            >
              {user.privacyMode ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{user.privacyMode ? 'Hidden' : 'Privacy'}</span>
            </button>
          </div>
          <div className="flex items-baseline justify-between mt-1 gap-2 flex-wrap">
            <h2 className={`text-xl sm:text-2xl font-bold ${textMain} tracking-tight font-mono truncate max-w-full`}>
              {user.privacyMode ? '••••••••' : `${portfolioDisplayValue.symbol} ${portfolioDisplayValue.formatted}`}
            </h2>
            <span className="text-xs text-emerald-500 dark:text-emerald-400 font-semibold flex items-center gap-0.5 shrink-0">
              <TrendingUp className="w-3.5 h-3.5" /> {isOwner ? '+3.24%' : '+0.00%'}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[11px] text-slate-500 font-mono truncate">Net Asset Value</p>
            <div className="relative">
              <button
                onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800/50 hover:bg-slate-800 px-2 py-0.5 rounded transition-all"
                title="Switch Display Currency"
              >
                <span>‹ {portfolioCurrency}</span>
              </button>
              {isCurrencyDropdownOpen && (
                <div className="absolute right-0 bottom-full mb-1 w-24 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-50">
                  {(['USD', 'USDT', 'BTC'] as const).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => {
                        setPortfolioCurrency(curr);
                        setIsCurrencyDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-mono transition-colors ${
                        portfolioCurrency === curr ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`${cardBg} rounded-2xl p-5 min-w-0`}>
          <p className={`text-xs ${textSub} font-medium mb-1 truncate`}>24H Realized P&L</p>
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <h2 className={`text-xl sm:text-2xl font-bold tracking-tight font-mono truncate max-w-full ${isOwner ? 'text-emerald-500 dark:text-emerald-400' : textMain}`}>{isOwner ? '+' : ''}{dailyPnL.symbol} {dailyPnL.formatted}</h2>
            <span className={`text-xs px-2 py-0.5 rounded font-mono shrink-0 ${isOwner ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : theme === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'}`}>{isOwner ? '+0.74%' : '+0.00%'}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-mono truncate">Calculated from Market Index</p>
        </div>

        <div className={`${cardBg} rounded-2xl p-5 min-w-0 sm:col-span-2 lg:col-span-1`}>
          <p className={`text-xs ${textSub} font-medium mb-1 truncate`}>Security Status</p>
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <h2 className={`text-xl sm:text-2xl font-bold ${textMain} tracking-tight font-mono`}>{user.securityScore}/100</h2>
            <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-mono shrink-0">Optimal</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-mono truncate">2FA & Passkey Protected</p>
        </div>
      </div>

      {/* Main Chart & Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Portfolio Value Trajectory</h3>
              <p className="text-xs text-slate-400">Portfolio valuation over time</p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {['24H', '7D', '30D', '1Y', 'All'].map((t) => (
                <button 
                  key={t} 
                  onClick={() => setSelectedTimeRange(t)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${selectedTimeRange === t ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[280px] w-full mt-2 flex items-center justify-center">
            {portfolioHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={portfolioHistory}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Portfolio Value']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center p-6 bg-slate-950/40 rounded-2xl border border-slate-800/80 max-w-sm">
                <PieChart className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-white mb-1">No Historical Valuation Data</h4>
                <p className="text-[11px] text-slate-400">Deposit funds or execute trades to begin tracking your portfolio performance trajectory over time.</p>
              </div>
            )}
          </div>
        </div>

        {/* Asset Allocation */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Asset Allocation</h3>
            <p className="text-xs text-slate-400 mb-4">Distribution across holdings</p>

            <div className="space-y-3">
              {balances.map((b) => {
                const percentage = ((b.valueUSD / totalPortfolioUSD) * 100).toFixed(1);
                return (
                  <div key={b.assetSymbol} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full border-2 border-blue-500 bg-slate-900 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                          {getAssetLogo(b.assetSymbol) ? (
                            <img src={getAssetLogo(b.assetSymbol)} alt={b.assetName} className="w-4 h-4 object-contain" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-[10px] font-bold text-blue-400 font-mono">{b.assetSymbol.slice(0, 3)}</span>
                          )}
                        </div>
                        {b.assetName}
                      </span>
                      <span className="font-mono text-slate-300">{percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('wallet')}
            className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            Manage All Wallets & Assets
          </button>
        </div>
      </div>

      {/* Recent Transactions & Market Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Recent Transactions</h3>
            <button onClick={() => setActiveTab('transactions')} className="text-xs text-blue-400 hover:underline">
              View All Ledger
            </button>
          </div>

          <div className="space-y-3">
            {transactions.slice(0, 4).map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                    tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-400' :
                    tx.type === 'withdrawal' ? 'bg-rose-500/10 text-rose-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {tx.coin.slice(0, 3)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white uppercase">{tx.type} • {tx.coin}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{tx.date} {tx.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-white">{tx.amount.toLocaleString()} {tx.coin}</p>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Market Assets */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Trending Market Assets</h3>
            <button onClick={() => setActiveTab('markets')} className="text-xs text-blue-400 hover:underline">
              View Markets
            </button>
          </div>

          <div className="space-y-3">
            {INITIAL_ASSETS.slice(0, 4).map(asset => (
              <div key={asset.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold font-mono text-xs">
                    {asset.symbol}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{asset.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">${asset.priceUSD.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-mono font-bold flex items-center gap-0.5 ${asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {asset.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                  </span>
                  <p className="text-[10px] text-slate-500 font-mono">Vol: ${(asset.volume24h / 1e6).toFixed(1)}M</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ & Help Center Quick Widget */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">FAQ & Account Help Center</h3>
              <p className="text-xs text-slate-400">Quick answers to Earn, Wallet deposits, withdrawals, and account reactivation</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('faq')}
            className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-3.5 py-2 rounded-xl transition-all"
          >
            <span>View Full FAQ</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            onClick={() => setActiveTab('faq')}
            className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-blue-500/50 cursor-pointer transition-all group"
          >
            <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider">Earn & APR</span>
            <h4 className="text-xs font-bold text-white mt-1 group-hover:text-blue-300 transition-colors">What is Earn & When does revenue calculation start?</h4>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">OKX Earn provides interest on assets through Simple Earn, Loan, and On-chain Earn...</p>
          </div>

          <div 
            onClick={() => setActiveTab('faq')}
            className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-blue-500/50 cursor-pointer transition-all group"
          >
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">Wallet & Deposit</span>
            <h4 className="text-xs font-bold text-white mt-1 group-hover:text-emerald-300 transition-colors">How do I make a deposit & verify networks?</h4>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">Open Wallet, select Deposit, choose asset and network, copy address or scan QR...</p>
          </div>

          <div 
            onClick={() => setActiveTab('faq')}
            className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-blue-500/50 cursor-pointer transition-all group"
          >
            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">Account Security</span>
            <h4 className="text-xs font-bold text-white mt-1 group-hover:text-amber-300 transition-colors">How do I reactivate my account securely?</h4>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">If your account is restricted, follow official reactivation steps in Account Status...</p>
          </div>
        </div>
      </div>
    </div>
  );
};
