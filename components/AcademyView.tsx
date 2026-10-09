'use client';

import React, { useState } from 'react';
import { GraduationCap, BookOpen, TrendingUp, Search, Compass, Shield, Award } from 'lucide-react';

export const AcademyView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'research' | 'academy'>('research');

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-mono uppercase font-bold">Institutional Intelligence & Education</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Research & Crypto Academy</h1>
          <p className="text-xs text-slate-400 mt-1">Comprehensive market intelligence, blockchain analytics, and structured educational modules.</p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('research')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'research'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Research</span>
          </button>
          <button
            onClick={() => setActiveSubTab('academy')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'academy'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Academy</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'research' ? (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Market Intelligence & Digital Asset Research</h2>
                <p className="text-xs text-slate-400">Published by OKX FLIX Quantitative & Market Analysis Group</p>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 text-xs text-slate-300 leading-relaxed space-y-4">
              <p>
                Explore comprehensive research and market intelligence covering digital assets, blockchain technology, cryptocurrency markets, network activity, security, regulation, and emerging financial technologies. Our research section is designed to help users understand market developments through clear explanations, relevant data, historical context, and balanced analysis.
              </p>
              <p>
                Whether you are learning about Bitcoin, Ethereum, stablecoins, decentralized networks, or broader blockchain innovation, the platform provides structured information to support informed decision-making and deeper understanding of the digital-asset ecosystem.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
              <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">MACRO INSIGHTS</span>
              <h3 className="text-sm font-bold text-white">Global Liquidity & Institutional Inflows</h3>
              <p className="text-xs text-slate-400">Analyzing institutional capital allocation trends across spot exchange-traded funds and decentralized settlement rails.</p>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
              <span className="text-[10px] font-mono bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded">NETWORK METRICS</span>
              <h3 className="text-sm font-bold text-white">Layer-1 & Layer-2 Scaling Dynamics</h3>
              <p className="text-xs text-slate-400">Evaluating transaction throughput, gas optimization, cryptographic proofs, and rollup security architecture.</p>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">REGULATION</span>
              <h3 className="text-sm font-bold text-white">Global Compliance & Asset Frameworks</h3>
              <p className="text-xs text-slate-400">Navigating cross-border regulatory harmonization, institutional custody standards, and MiCA compliance.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Crypto Academy & Educational Curriculum</h2>
                <p className="text-xs text-slate-400">Structured learning paths from foundational concepts to advanced risk management</p>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 text-xs text-slate-300 leading-relaxed space-y-4">
              <p>
                Build your understanding of digital assets and blockchain technology through structured educational resources designed for different levels of experience. Learn the fundamentals of cryptocurrency, wallets, transactions, blockchain networks, market mechanics, security practices, risk management, and responsible digital-asset use.
              </p>
              <p>
                Academy content should be practical, clear, and educational, helping users develop knowledge step by step without presenting educational information as personalized financial advice or guaranteed investment outcomes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded">BEGINNER MODULE</span>
                <span className="text-xs text-slate-400 font-mono">4 Lessons • 25 Mins</span>
              </div>
              <h3 className="text-sm font-bold text-white">Foundations of Cryptography & Wallets</h3>
              <p className="text-xs text-slate-400">Understand public/private key cryptography, seed phrases, hardware cold storage, and secure address verification.</p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">INTERMEDIATE</span>
                <span className="text-xs text-slate-400 font-mono">6 Lessons • 45 Mins</span>
              </div>
              <h3 className="text-sm font-bold text-white">Market Mechanics & Order Book Dynamics</h3>
              <p className="text-xs text-slate-400">Explore limit vs market orders, liquidity depth charts, margin leverage, and order execution routing.</p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded">ADVANCED</span>
                <span className="text-xs text-slate-400 font-mono">5 Lessons • 50 Mins</span>
              </div>
              <h3 className="text-sm font-bold text-white">Risk Management & Portfolio Diversification</h3>
              <p className="text-xs text-slate-400">Master position sizing, stop-loss execution, volatility hedging, and anti-phishing security protocols.</p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">SECURITY</span>
                <span className="text-xs text-slate-400 font-mono">3 Lessons • 20 Mins</span>
              </div>
              <h3 className="text-sm font-bold text-white">Advanced Security & Phishing Defense</h3>
              <p className="text-xs text-slate-400">Learn how to configure 2FA, biometric passkeys, anti-phishing passphrases, and secure institutional key management.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

