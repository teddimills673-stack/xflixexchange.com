'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { ShieldAlert, X, ArrowRight, Lock, MessageSquare } from 'lucide-react';

export const ActivationModal: React.FC = () => {
  const { user, isActivationModalOpen, setIsActivationModalOpen, setFeeProtocol, setActiveTab } = useApp();

  if (!isActivationModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/10 via-transparent to-blue-600/10 pointer-events-none"></div>

        <button 
          onClick={() => setIsActivationModalOpen(false)} 
          className="absolute right-6 top-6 text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30 shadow-lg shadow-amber-500/20">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-mono font-bold border border-amber-500/20">
            <Lock className="w-3.5 h-3.5" />
            <span>ACCOUNT VERIFICATION REQUIRED</span>
          </div>

          <h3 className="text-xl font-bold text-white tracking-tight">Account Verification Required</h3>
          
          <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
            Your account is currently DORMANT. Additional verification is required before withdrawal privileges can be restored.
          </p>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left text-xs space-y-2">
            <div className="flex justify-between text-slate-400 font-mono text-[11px] border-b border-slate-800/80 pb-1.5">
              <span>Account Status:</span>
              <span className="text-amber-400 font-bold">Dormant</span>
            </div>
            <div className="flex justify-between text-slate-400 font-mono text-[11px] pb-1">
              <span>Withdrawal Status:</span>
              <span className="text-rose-400 font-bold">Temporarily Restricted</span>
            </div>
            <p className="text-slate-300 pt-1 leading-relaxed">
              Please complete the required account verification through the platform’s official verification process. Do not send funds or cryptocurrency to an address provided through chat or support messages to unlock your account.
            </p>
            <div className="pt-2 text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/80">
              Once verification has been completed and approved, withdrawal access will be restored according to the account’s applicable terms and security requirements.
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={() => {
                setIsActivationModalOpen(false);
                setFeeProtocol(prev => ({ ...prev, isLocked: true, step: 1 }));
              }}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2"
            >
              <span>Begin Account Verification</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsActivationModalOpen(false);
                setActiveTab('chat');
              }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span>Open Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
