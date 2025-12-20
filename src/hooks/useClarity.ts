/**
 * Hook pour charger Microsoft Clarity de manière sécurisée
 * Le project ID est lu depuis les variables d'environnement (non hardcodé)
 *
 * @see https://clarity.microsoft.com/
 */

import { useEffect } from 'react';

const CLARITY_SCRIPT_ID = 'clarityScript';
const LOAD_DELAY_MS = 2000;

declare global {
  interface Window {
    clarity?: (command: string, ...args: unknown[]) => void;
  }
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
      return;
    }

    const timeoutId = setTimeout(() => {
      // Initialize Clarity
      (function(c: Window, l: Document, a: string, r: string, i: string) {
        c[a as keyof Window] = c[a as keyof Window] || function(...args: unknown[]) {
          (c[a as keyof Window] as { q?: unknown[] }).q =
            (c[a as keyof Window] as { q?: unknown[] }).q || [];
          ((c[a as keyof Window] as { q: unknown[] }).q).push(args);
        };
        const t = l.createElement(r) as HTMLScriptElement;
        t.id = CLARITY_SCRIPT_ID;
        t.async = true;
        t.src = 'https://www.clarity.ms/tag/' + i;
        const y = l.getElementsByTagName(r)[0];
        y.parentNode?.insertBefore(t, y);
      })(window, document, 'clarity', 'script', projectId);
    }, LOAD_DELAY_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);
}
