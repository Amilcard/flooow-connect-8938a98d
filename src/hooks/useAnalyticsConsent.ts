/**
 * Hook pour gérer le consentement analytics (RGPD)
 * Stocke le consentement dans localStorage
 */

import { useState, useEffect, useCallback } from 'react';

export type ConsentStatus = 'granted' | 'denied' | null;

const STORAGE_KEY = 'flooow_analytics_consent';
const CONSENT_DATE_KEY = 'flooow_analytics_consent_date';

export function useAnalyticsConsent() {
  const [consent, setConsentState] = useState<ConsentStatus>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ConsentStatus;
    if (stored === 'granted' || stored === 'denied') {
      setConsentState(stored);
      setShowBanner(false);
    } else {
      setShowBanner(true);
    }
    setIsLoading(false);
  }, []);

  const setConsent = useCallback((status: ConsentStatus) => {
    if (status) {
      localStorage.setItem(STORAGE_KEY, status);
      localStorage.setItem(CONSENT_DATE_KEY, new Date().toISOString());
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CONSENT_DATE_KEY);
    }
    setConsentState(status);
    setShowBanner(false);
  }, []);

  const acceptConsent = useCallback(() => {
    setConsent('granted');
  }, [setConsent]);

  const denyConsent = useCallback(() => {
    setConsent('denied');
  }, [setConsent]);

  const withdrawConsent = useCallback(() => {
    setConsent('denied');
  }, [setConsent]);

  const resetConsent = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CONSENT_DATE_KEY);
    setConsentState(null);
    setShowBanner(true);
  }, []);

  const isGranted = consent === 'granted';
  const isDenied = consent === 'denied';
  const hasDecided = consent !== null;

  return {
    consent,
    setConsent,
    acceptConsent,
    denyConsent,
    withdrawConsent,
    resetConsent,
    isGranted,
    isDenied,
    hasDecided,
    isLoading,
    showBanner,
    setShowBanner,
  };
}
