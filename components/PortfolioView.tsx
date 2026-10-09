'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { PieChart, TrendingUp, ShieldCheck, Coins, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PERFORMANCE_DATA = [
  { period: '24H', roi: '+0.74%', realized: '+$1,840.00', unrealized: '+$14,200.00' },
  { period: '7D', roi: '+2.63%', realized: '+$8,900.00', unrealized: '+$42,100.00' },
  { period: '30D', roi: '+8.45%', realized: '+$34,200.00', unrealized: '+$112,400.00' },
  { period: '90D', roi: '+19.20%', realized: '+$84,100.00', unrealized: '+$298,500.00' },
  { period: '1Y', roi: '+142.5%', realized: '+$640,000.00', unrealized: '+$1,450,000.00' },
  { period: 'All Time', roi: '+4,820.9%', realized: '+$1,920,000.00', unrealized: '+$2,840,321.78' },
];

export const PortfolioView: React.FC = () => {
  const { 
    user, balances, convertCurrency, setActiveTab 
  } = useApp();
  const isOwner = user.role === 'owner' || user.email === 'richardshannon901@gmail.com';

  const totalUSD = balances.reduce((acc, b) => acc + b.valueUSD, 0);
  const formattedTotal = convertCurrency(totalUSD);

  const realizedPnLDisplay = isOwner ? '+$1,920,000.00' : convertCurrency(0).symbol + convertCurrency(0).formatted;
  const unrealizedPnLDisplay = isOwner ? '+$582,410.25' : convertCurrency(0).symbol + convertCurrency(0).formatted;
  const roiDisplay = isOwner ? '+19.2% All-Time Return' : '0.0% All-Time Return';

  const performanceRows = isOwner ? [] : PERFORMANCE_DATA.map(p => ({
    ...p,
    roi: '0.0%',
    realized: convertCurrency(0).symbol + convertCurrency(0).formatted,
    unrealized: convertCurrency(0).symbol + convertCurrency(0).formatted,
  }));

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Institutional Portfolio Analytics</h1>
          <p className="text-xs text-slate-400 mt-1">Detailed valuation, ROI metrics, and realized/unrealized P&L breakdown.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('wallet')}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30"
          >
            Manage Wallet Assets
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 min-w-0">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl min-w-0 overflow-hidden">
          <p className="text-xs text-slate-400 font-medium mb-1 truncate">Total Net Worth</p>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-mono tracking-tight break-all">{formattedTotal.symbol} {formattedTotal.formatted}</h2>
          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 font-mono truncate">
            <TrendingUp className="w-4 h-4 shrink-0" />
            <span className="truncate">{roiDisplay}</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl min-w-0 overflow-hidden">
          <p className="text-xs text-slate-400 font-medium mb-1 truncate">Realized Profit & Loss</p>
          <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold font-mono tracking-tight break-all ${isOwner ? 'text-emerald-400' : 'text-slate-200'}`}>{realizedPnLDisplay}</h2>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 font-mono truncate">
            <span className="truncate">Locked & Settled Gains</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl min-w-0 overflow-hidden">
          <p className="text-xs text-slate-400 font-medium mb-1 truncate">Unrealized P&L (Open Positions)</p>
          <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold font-mono tracking-tight break-all ${isOwner ? 'text-emerald-400' : 'text-slate-200'}`}>{unrealizedPnLDisplay}</h2>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 font-mono truncate">
            <span className="truncate">Mark-to-Market Valuation</span>
          </div>
        </div>
      </div>

      {!isOwner && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-4">Historical Performance & ROI Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="py-3 px-4">Timeframe</th>
                  <th className="py-3 px-4">ROI (%)</th>
                  <th className="py-3 px-4">Realized P&L</th>
                  <th className="py-3 px-4">Unrealized P&L</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {performanceRows.map(p => (
                  <tr key={p.period} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-white">{p.period}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-300">{p.roi}</td>
                    <td className="py-3.5 px-4 text-slate-300">{p.realized}</td>
                    <td className="py-3.5 px-4 text-slate-300">{p.unrealized}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px]">Verified Sim</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
