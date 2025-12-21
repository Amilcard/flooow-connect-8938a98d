/**
 * TerritoryContext - Gestion unique du territoire utilisateur
 *
 * Logique:
 * - isCovered = true si CP commence par 42 (Loire)
 * - isDemoFlow = true si utilisateur explore le catalogue d'exemple
 * - needsTerritoryChoice = true si aucun CP enregistré
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// Constantes
const STORAGE_KEY = 'flooow_territory_v1';
const COVERED_DEPARTMENT = '42';
const DEMO_TERRITORY_KEY = 'saint-etienne-42100';

interface TerritoryState {
  postalCode: string | null;
  isCovered: boolean;
  isDemoFlow: boolean;
  activeTerritoryKey: string;
}

interface TerritoryContextValue extends TerritoryState {
  isLoaded: boolean;
  needsTerritoryChoice: boolean;
  showDemoBanner: boolean;
  setPostalCode: (cp: string) => void;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
  reset: () => void;
}

const defaultState: TerritoryState = {
  postalCode: null,
  isCovered: false,
  isDemoFlow: false,
  activeTerritoryKey: DEMO_TERRITORY_KEY,
};

const TerritoryContext = createContext<TerritoryContextValue | null>(null);

export function TerritoryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TerritoryState>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger depuis localStorage au montage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as TerritoryState;
        setState(parsed);
      }
    } catch (e) {
      console.warn('TerritoryContext: Failed to load from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Persister dans localStorage à chaque changement
  useEffect(() => {
    if (isLoaded && state.postalCode !== null) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.warn('TerritoryContext: Failed to save to localStorage', e);
      }
    }
  }, [state, isLoaded]);

  const setPostalCode = (cp: string) => {
    const isCovered = cp.startsWith(COVERED_DEPARTMENT);
    setState({
      postalCode: cp,
      isCovered,
      // Si couvert, JAMAIS en mode démo
      isDemoFlow: isCovered ? false : state.isDemoFlow,
      activeTerritoryKey: DEMO_TERRITORY_KEY,
    });
  };

  const enterDemoMode = () => {
    setState(prev => ({
      ...prev,
      isDemoFlow: true,
      activeTerritoryKey: DEMO_TERRITORY_KEY,
    }));
  };

  const exitDemoMode = () => {
    // Réinitialiser complètement
    localStorage.removeItem(STORAGE_KEY);
    setState(defaultState);
  };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(defaultState);
  };

  // Calcul des flags dérivés
  const needsTerritoryChoice = isLoaded && state.postalCode === null;
  const showDemoBanner = isLoaded && state.isDemoFlow && !state.isCovered;

  const value: TerritoryContextValue = {
    ...state,
    isLoaded,
    needsTerritoryChoice,
    showDemoBanner,
    setPostalCode,
    enterDemoMode,
    exitDemoMode,
    reset,
  };

  return (
    <TerritoryContext.Provider value={value}>
      {children}
    </TerritoryContext.Provider>
  );
}

export function useTerritoryContext(): TerritoryContextValue {
  const context = useContext(TerritoryContext);
  if (!context) {
    throw new Error('useTerritoryContext must be used within a TerritoryProvider');
  }
  return context;
}

// Export des constantes pour réutilisation
export { STORAGE_KEY, COVERED_DEPARTMENT, DEMO_TERRITORY_KEY };
