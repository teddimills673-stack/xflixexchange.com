'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { ShieldCheck, Lock, Smartphone, Key, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const SecurityView: React.FC = () => {
  const { user } = useApp();

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-4xl mx-auto">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Security & Compliance Center</h1>
            <p className="text-xs text-slate-400 mt-1">Multi-factor authentication, cryptographic passkeys, and biometric verification.</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl text-center">
            <p className="text-[10px] text-slate-400 font-mono">SECURITY SCORE</p>
            <p className="text-lg font-bold text-emerald-400 font-mono">{user.securityScore}/100</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Two-Factor Authentication (2FA)</h3>
                <p className="text-xs text-slate-400">Google Authenticator & TOTP token verification</p>
              </div>
            </div>
            <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg text-xs font-mono font-bold">Enabled</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Cryptographic Passkeys</h3>
                <p className="text-xs text-slate-400">Hardware security key or Apple/Google password manager</p>
              </div>
            </div>
            <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg text-xs font-mono font-bold">Active</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Anti-Phishing Code</h3>
                <p className="text-xs text-slate-400">Custom security passphrase for all outgoing platform communications</p>
              </div>
            </div>
            <span className="text-xs font-mono text-white bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">{user.antiPhishingCode}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
