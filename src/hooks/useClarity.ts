/**
 * Hook pour charger Microsoft Clarity de maniere securisee et conditionnelle
 * - Ne charge que si consent analytics = granted
 * - Ne charge que si userType = adult (COPPA/RGPD mineurs)
 * - Envoie les signaux consent a Clarity
 * - Permet le retrait du consentement
 *
 * @see https://clarity.microsoft.com/
 */

import { useEffect, useCallback } from 'react';

const CLARITY_SCRIPT_ID = 'clarityScript';
const CLARITY_BASE_URL = 'https://www.clarity.ms/tag/';
const LOAD_DELAY_MS = 2000;

declare global {
  interface Window {
    clarity?: (command: string, ...args: unknown[]) => void;
  }
}

/**
 * Initialize Clarity tracking script
 */
function initializeClarity(projectId: string): void {
  const win = window as Window & { clarity?: { q?: unknown[] } & ((...args: unknown[]) => void) };

  if (!win.clarity) {
    const clarityFn = function(...args: unknown[]) {
      const clarity = win.clarity as { q?: unknown[] };
      if (!clarity.q) {
        clarity.q = [];
      }
      clarity.q.push(args);
    };
    win.clarity = clarityFn as typeof win.clarity;
  }

  const scriptElement = document.createElement('script') as HTMLScriptElement;
  scriptElement.id = CLARITY_SCRIPT_ID;
  scriptElement.async = true;
  scriptElement.src = `${CLARITY_BASE_URL}${projectId}`;

  const firstScript = document.getElementsByTagName('script')[0];
  firstScript.parentNode?.insertBefore(scriptElement, firstScript);
}

/**
 * Remove Clarity script and cookies
 */
function removeClarity(): void {
  const script = document.getElementById(CLARITY_SCRIPT_ID);
  if (script) {
    script.remove();
  }

  const expireDate = 'Thu, 01 Jan 1970 00:00:00 GMT';
  const hostname = window.location.hostname;
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim();
    if (name.startsWith('_clck') || name.startsWith('_clsk') || name.startsWith('CLID')) {
      const cookiePaths = [
        `${name}=;expires=${expireDate};path=/`,
        `${name}=;expires=${expireDate};path=/;domain=${hostname}`,
      ];
      cookiePaths.forEach((cookieStr) => { document.cookie = cookieStr; });
    }
  });

  if (window.clarity) {
    (window as { clarity?: unknown }).clarity = undefined;
  }
}

/**
 * Send consent signal to Clarity
 */
export function sendClarityConsent(analyticsGranted: boolean): void {
  if (window.clarity) {
    window.clarity('consent');
    window.clarity('set', 'analytics_consent', analyticsGranted ? 'granted' : 'denied');
    window.clarity('set', 'ad_storage', 'denied');
  }
}

/**
 * Set a custom tag in Clarity
 */
export function setClarityTag(key: string, value: string): void {
  if (window.clarity) {
    window.clarity('set', key, value);
  }
}

/**
 * Identify user in Clarity (without PII)
 */
export function identifyClarity(userId: string, sessionId?: string): void {
  if (window.clarity) {
    window.clarity('identify', userId, sessionId);
  }
}

/**
 * Track custom event in Clarity
 */
export function trackClarityEvent(eventName: string): void {
  if (window.clarity) {
    window.clarity('event', eventName);
  }
}

interface UseClarityOptions {
  isAdult: boolean;
  hasConsent: boolean;
  userId?: string;
}

/**
 * Charge le script Microsoft Clarity apres un delai, conditionnellement
 * - Requiert consent analytics = granted
 * - Requiert userType = adult
 */
export function useClarity(options?: UseClarityOptions): void {
  const { isAdult = false, hasConsent = false, userId } = options || {};

  useEffect(() => {
    const projectId = import.meta.env.VITE_CLARITY_PROJECT_ID;

    if (!projectId) {
      return;
    }

    if (!isAdult || !hasConsent) {
      if (document.getElementById(CLARITY_SCRIPT_ID)) {
        removeClarity();
      }
      return;
    }

    if (document.getElementById(CLARITY_SCRIPT_ID)) {
      sendClarityConsent(true);
      if (userId) {
        identifyClarity(userId);
      }
      return;
    }

    const timeoutId = setTimeout(() => {
      initializeClarity(projectId);

      setTimeout(() => {
        sendClarityConsent(true);
        setClarityTag('user_type', 'adult');
        if (userId) {
          identifyClarity(userId);
        }
      }, 500);
    }, LOAD_DELAY_MS);

    return function cleanup() {
      clearTimeout(timeoutId);
    };
  }, [isAdult, hasConsent, userId]);
}

/**
 * Hook to withdraw Clarity consent and remove tracking
 */
export function useWithdrawClarityConsent(): () => void {
  return useCallback(() => {
    removeClarity();
  }, []);
}
