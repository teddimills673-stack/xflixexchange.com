'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, Signal } from 'lucide-react';

interface InternetGuardProps {
  children: React.ReactNode;
}

export const InternetGuard: React.FC<InternetGuardProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(() => (typeof window !== 'undefined' ? navigator.onLine : true));
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const checkConnectivity = async () => {
    if (typeof window === 'undefined') return true;
    if (!navigator.onLine) return false;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch('/favicon.ico?t=' + Date.now(), {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res.ok || res.status < 500;
    } catch {
      return navigator.onLine;
    }
  };

  useEffect(() => {
    const handleOnline = async () => {
      const online = await checkConnectivity();
      setIsOnline(online);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(async () => {
      if (!isOnline) {
        const online = await checkConnectivity();
        if (online) setIsOnline(true);
      }
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOnline]);

  const handleRetry = async () => {
    setIsChecking(true);
    const online = await checkConnectivity();
    setIsChecking(false);
    setIsOnline(online);
  };

  if (!isOnline) {
    return (
      <div className="fixed inset-0 z-[99999] bg-[#070a14] flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-fadeIn">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">

          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-500/10">
            <WifiOff className="w-8 h-8 text-rose-400 animate-pulse" />
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">No Internet Connection</h1>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-8 px-2">
            An active internet connection (Wi-Fi or mobile cellular data) is required to use this application. Please check your connection and try again.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleRetry}
              disabled={isChecking}
              className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white py-3.5 px-6 rounded-2xl font-semibold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Verifying connection...' : 'Retry Connection'}</span>
            </button>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center text-[11px] text-slate-500 font-mono">
              <span className="flex items-center gap-1.5">
                <Signal className="w-3.5 h-3.5 text-rose-400" />
                <span>Status: Disconnected / Offline</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
