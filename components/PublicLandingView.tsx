'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { ShieldCheck, Lock, ArrowRight, CheckCircle2, Globe, Cpu, Coins, Shield } from 'lucide-react';

export const PublicLandingView: React.FC = () => {
  const { setIsAuthModalOpen, setAuthModalMode } = useApp();

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Top Bar */}
      <header className="border-b border-slate-800/80 bg-[#0b0f19] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
            <img 
              src="/logo.svg" 
              alt="OKX FLIX Logo" 
              className="w-10 h-10 rounded-xl shadow-lg shadow-blue-500/20 object-cover border border-slate-700 shrink-0" 
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5 flex-wrap">
                <span className="truncate">OKX FLIX</span>
                <span className="text-[9px] sm:text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-mono shrink-0">INSTITUTIONAL</span>
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono truncate">Secure Digital Asset Exchange & Vault</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => { setAuthModalMode('signin'); setIsAuthModalOpen(true); }}
              className="text-xs text-slate-300 hover:text-white px-4 py-2 font-medium transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthModalMode('signup'); setIsAuthModalOpen(true); }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all"
            >
              Create Account
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-16 flex flex-col items-center justify-center text-center">
        {/* Prominent Official App Logo */}
        <div className="mb-6 flex flex-col items-center">
          <img 
            src="/logo.svg" 
            alt="OKX FLIX Logo" 
            className="w-20 h-20 md:w-24 md:h-24 rounded-3xl shadow-2xl shadow-blue-600/50 object-cover border border-blue-400/30 ring-8 ring-blue-500/10" 
            referrerPolicy="no-referrer"
          />
          <span className="mt-3 text-xs font-mono font-bold tracking-widest text-blue-400 uppercase">OKX FLIX INSTITUTIONAL</span>
        </div>

        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full text-blue-400 text-xs font-mono mb-6">
          <ShieldCheck className="w-4 h-4" />
          <span>Argon2id Encrypted Sessions & PCI-DSS Compliant Gateway</span>
        </div>

        <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight max-w-4xl leading-tight">
          Next-Generation Institutional <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Digital Asset Exchange</span>
        </h2>

        <p className="text-sm md:text-base text-slate-400 max-w-2xl mt-6 leading-relaxed">
          Secure, high-liquidity cryptocurrency trading, cold storage vault custody, and comprehensive quantitative research designed for institutional traders and professional allocators.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
          <button
            onClick={() => { setAuthModalMode('signup'); setIsAuthModalOpen(true); }}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-xl shadow-blue-600/40 flex items-center justify-center gap-2 transition-transform hover:scale-105"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setAuthModalMode('signin'); setIsAuthModalOpen(true); }}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-8 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Sign In
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full text-left">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Military-Grade Security</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Argon2id password hashing, rate-limited login endpoints, cryptographically secure reset tokens, and HttpOnly session cookies.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Deep Institutional Liquidity</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ultra-low latency spot matching engines, multi-currency wallets, and robust risk management protocols.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Global Compliance & Audit</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transparent audit logs, dual-control withdrawal safeguards, and verified institutional account verification pathways.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500 font-mono">
        &copy; 2026 OKX FLIX Institutional Exchange. All rights reserved. Secure SSL/TLS Encrypted Session.
      </footer>
    </div>
  );
};
