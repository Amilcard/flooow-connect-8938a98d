/**
 * Hook pour charger Microsoft Clarity de manière sécurisée
 * Le project ID est lu depuis les variables d'environnement (non hardcodé)
 *
 * @see https://clarity.microsoft.com/
 */

import { useEffect } from 'react';

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
  // Setup clarity queue function
  const win = window as Window & { clarity?: { q?: unknown[] } & ((...args: unknown[]) => void) };

  if (!win.clarity) {
    const clarityFn = function(...args: unknown[]) {
      const clarity = win.clarity as { q?: unknown[] };
      clarity.q = clarity.q || [];
      clarity.q.push(args);
    };
    win.clarity = clarityFn as typeof win.clarity;
  }

  // Create and inject script element
  const scriptElement = document.createElement('script') as HTMLScriptElement;
  scriptElement.id = CLARITY_SCRIPT_ID;
  scriptElement.async = true;
  scriptElement.src = `${CLARITY_BASE_URL}${projectId}`;

  const firstScript = document.getElementsByTagName('script')[0];
  firstScript.parentNode?.insertBefore(scriptElement, firstScript);
}

/**
 * Charge le script Microsoft Clarity après un délai pour optimiser TTI
 * Le project ID est injecté depuis VITE_CLARITY_PROJECT_ID
 */
export function useClarity(): void {
  useEffect(() => {
    const projectId = import.meta.env.VITE_CLARITY_PROJECT_ID;

    // Skip if no project ID configured or already loaded
    if (!projectId || document.getElementById(CLARITY_SCRIPT_ID)) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      initializeClarity(projectId);
    }, LOAD_DELAY_MS);

    return () => {
      clearTimeout(timeoutId);
      return undefined;
    };
  }, []);
}
