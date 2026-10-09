'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';

export const LegalView: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-4xl mx-auto">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-xl space-y-6 text-slate-300 text-xs leading-relaxed">
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-blue-400 font-mono text-xs mb-1">
            <BookOpen className="w-4 h-4" />
            <span>OKXFLIX LEGAL & REGULATORY COMPLIANCE</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Legal & Disclosures</h1>
          <p className="text-slate-400 text-xs mt-1">OKXFLIX Platform • Global Standards</p>
        </div>

        <div className="space-y-4 text-slate-200 text-sm leading-relaxed">
          <p>
            OKXFLIX is an innovative cryptocurrency trading platform designed to provide users with a modern digital-asset trading experience. The platform uses blockchain technology and provides access to a wide range of digital assets and trading pairs.
          </p>

          <p>
            Users can explore features such as spot trading, margin trading, derivatives, perpetual futures, options, DeFi-related services, lending, and other digital-asset tools, where supported by the platform.
          </p>

          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-amber-300 space-y-2 mt-6">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <span>Important Risk Disclosure</span>
            </h4>
            <p className="text-xs leading-relaxed text-amber-200/90">
              Digital-asset trading involves significant risk. Users should independently verify all platform information, fees, availability, and applicable regulatory requirements before making financial decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
