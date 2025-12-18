/**
 * Hook pour charger Usetiful de manière sécurisée
 * Le token est lu depuis les variables d'environnement (non hardcodé)
 *
 * @see https://docs.usetiful.com/
 */

import { useEffect } from 'react';

const USETIFUL_SCRIPT_ID = 'usetifulScript';
const USETIFUL_SCRIPT_SRC = 'https://www.usetiful.com/dist/usetiful.js';
const LOAD_DELAY_MS = 2000;

/**
 * Charge le script Usetiful après un délai pour optimiser TTI
 * Le token est injecté depuis VITE_USETIFUL_TOKEN
 */
export function useUsetiful(): void {
  useEffect(() => {
    const token = import.meta.env.VITE_USETIFUL_TOKEN;

    // Skip if no token configured or already loaded
    if (!token || document.getElementById(USETIFUL_SCRIPT_ID)) {
      return;
    }

    const timeoutId = setTimeout(() => {
      const script = document.createElement('script');
      script.id = USETIFUL_SCRIPT_ID;
      script.src = USETIFUL_SCRIPT_SRC;
      script.async = true;
      script.dataset.token = token;

      document.head.appendChild(script);
    }, LOAD_DELAY_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);
}
