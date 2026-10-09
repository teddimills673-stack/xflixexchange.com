'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/lib/store';
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';

export const TawkChatView: React.FC = () => {
  const { theme, setActiveTab } = useApp();
  const isLight = theme === 'light';
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
      try {
        if (window.Tawk_API && typeof window.Tawk_API.showWidget === 'function') {
          window.Tawk_API.showWidget();
        }
        if (window.Tawk_API && typeof window.Tawk_API.maximize === 'function') {
          window.Tawk_API.maximize();
        }
      } catch (e) {
        // Safe catch
      }
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`w-full h-full min-h-[calc(100vh-4rem)] flex flex-col overflow-hidden ${isLight ? 'bg-white text-slate-900' : 'bg-[#0b0f19] text-white'}`}>
      {/* Top Navigation Bar with Back Button */}
      <div className={`px-4 py-3 border-b flex items-center justify-between shrink-0 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3.5 py-2 rounded-xl border transition-all flex items-center gap-2 text-xs font-semibold ${isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'}`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold uppercase tracking-wider">Live Support Chat</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Secure</span>
        </div>
      </div>

      {/* Tawk Chat Container filling the rest of the view */}
      <div className="flex-1 relative w-full h-full min-h-0 overflow-hidden bg-transparent">
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/60 backdrop-blur-sm z-20">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <p className="text-xs text-slate-300 font-medium">Connecting to secure chat...</p>
          </div>
        )}
        <div id="tawk-host-container" className="w-full h-full relative" />
      </div>
    </div>
  );
};
