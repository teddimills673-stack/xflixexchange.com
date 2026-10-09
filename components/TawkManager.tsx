'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/lib/store';

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
    _tawkReady?: boolean;
  }
}

export const TawkManager: React.FC = () => {
  const { activeTab } = useApp();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    window.Tawk_API.onLoad = function() {
      window._tawkReady = true;
      try {
        if (window.Tawk_API && typeof window.Tawk_API.hideWidget === 'function') {
          window.Tawk_API.hideWidget();
        }
      } catch (e) {
        // Safe catch
      }
    };

    // Load script only once
    const existingScript = document.querySelector('script[src*="tawk.to"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://embed.tawk.to/6aaff9937bfc4f3446dd579b/default';
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      if (activeTab === 'chat') {
        document.body.classList.add('tawk-active');
        if (window._tawkReady && window.Tawk_API) {
          if (typeof window.Tawk_API.showWidget === 'function') {
            window.Tawk_API.showWidget();
          }
          if (typeof window.Tawk_API.maximize === 'function') {
            window.Tawk_API.maximize();
          }
        } else {
          // If not ready yet, set onLoad to show and maximize once ready
          const prevOnLoad = window.Tawk_API.onLoad;
          window.Tawk_API.onLoad = function() {
            window._tawkReady = true;
            if (typeof prevOnLoad === 'function') prevOnLoad();
            if (typeof window.Tawk_API.showWidget === 'function') {
              window.Tawk_API.showWidget();
            }
            if (typeof window.Tawk_API.maximize === 'function') {
              window.Tawk_API.maximize();
            }
          };
        }
      } else {
        document.body.classList.remove('tawk-active');
        if (window.Tawk_API && typeof window.Tawk_API.hideWidget === 'function') {
          window.Tawk_API.hideWidget();
        }
        if (window.Tawk_API && typeof window.Tawk_API.minimize === 'function') {
          window.Tawk_API.minimize();
        }
      }
    } catch (e) {
      // Safe catch
    }
  }, [activeTab]);

  return null;
};
