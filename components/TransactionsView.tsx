'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { History, Search, Filter, ExternalLink, CheckCircle2 } from 'lucide-react';
import { TransactionRecord } from '@/types';

export const TransactionsView: React.FC = () => {
  const { transactions } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);

  const filteredTxs = transactions.filter(tx => 
    tx.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    tx.coin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.reference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Institutional Transaction Ledger</h1>
          <p className="text-xs text-slate-400 mt-1">Secure transaction records with transparent activity details and a complete account history.</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by ID, coin, reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 bg-slate-950/50 uppercase">
                <th className="py-3.5 px-4">Tx ID</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Asset & Amount</th>
                <th className="py-3.5 px-4">Counterparty ID</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-medium text-slate-200 font-mono">
              {filteredTxs.map(tx => (
                <tr 
                  key={tx.id} 
                  onClick={() => setSelectedTx(tx)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 text-blue-400 font-bold">{tx.id}</td>
                  <td className="py-3.5 px-4 text-slate-400">{tx.date} {tx.time}</td>
                  <td className="py-3.5 px-4 uppercase font-bold text-slate-300">{tx.type}</td>
                  <td className="py-3.5 px-4 text-white font-bold">{tx.amount.toLocaleString()} {tx.coin}</td>
                  <td className="py-3.5 px-4 text-slate-400">{tx.anonymousCounterpartyId}</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px]">
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedTx(tx); }}
                      className="text-blue-400 hover:underline text-xs"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-scaleUp font-mono text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase">Transaction Details</h3>
                <p className="text-[11px] text-blue-400">{selectedTx.id}</p>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded text-[10px] font-bold">
                {selectedTx.status}
              </span>
            </div>

            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Asset & Amount:</span>
                <span className="text-white font-bold">{selectedTx.amount.toLocaleString()} {selectedTx.coin}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Timestamp:</span>
                <span>{selectedTx.date} {selectedTx.time}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Direction:</span>
                <span className="uppercase">{selectedTx.direction}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Network:</span>
                <span>{selectedTx.network}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Confirmation Count:</span>
                <span>{selectedTx.confirmationCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Counterparty ID:</span>
                <span>{selectedTx.anonymousCounterpartyId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Reference:</span>
                <span className="text-right text-slate-400">{selectedTx.reference}</span>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl text-[11px] text-blue-300">
              VERIFIED HISTORICAL RECORD: This transaction is recorded securely in the institutional ledger.
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTx(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
