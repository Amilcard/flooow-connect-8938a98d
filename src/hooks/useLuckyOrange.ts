import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '@/contexts/AnalyticsContext';

const EXCLUDED_ROUTES = ['/onboarding', '/ma-ville', '/territoire-non-couvert'];

declare global {
  interface Window {
    LOQ?: Array<[string, ...unknown[]]>;
    LO?: {
      events: { track: (name: string, meta?: Record<string, unknown>) => void };
      visitor: { identify: (id: string, traits?: Record<string, unknown>) => void };
    };
    __lo_loaded?: boolean;
  }
}

export const useLuckyOrange = () => {
  const { consent, userType } = useAnalytics();
  const { pathname } = useLocation();

  useEffect(() => {
    const siteId = import.meta.env.VITE_LO_SITE_ID;
    if (!siteId) {
      if (import.meta.env.DEV) console.warn('[LO] VITE_LO_SITE_ID manquant');
      return;
    }
    if (consent !== 'granted') return;
    if (userType === 'minor') return;
    if (EXCLUDED_ROUTES.some((route) => pathname.startsWith(route))) return;
    if (window.__lo_loaded) return;

    window.LOQ = window.LOQ || [];
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://tools.luckyorange.com/core/lo.js?site-id=${siteId}`;
    document.head.appendChild(script);
    window.__lo_loaded = true;
  }, [consent, userType, pathname]);

  const trackEvent = useCallback((name: string, meta?: Record<string, unknown>) => {
    window.LOQ = window.LOQ || [];
    window.LOQ.push(['ready', () => window.LO?.events.track(name, meta)]);
  }, []);

  const identify = useCallback((id: string, traits?: Record<string, unknown>) => {
    window.LOQ = window.LOQ || [];
    window.LOQ.push(['ready', () => window.LO?.visitor.identify(id, traits)]);
  }, []);

  return { isLoaded: !!window.__lo_loaded, trackEvent, identify };
};

export const useLOEvents = () => useLuckyOrange();
