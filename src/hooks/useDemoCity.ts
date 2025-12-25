import { useState, useEffect, useCallback } from 'react';
import { 
  DemoCityKey, 
  DEMO_CITIES,
  DEMO_CITY_KEYS,
  getDemoCityFromPostalCode,
  suggestClosestDemoCity,
  isPostalCodeValid 
} from '@/components/demo/DemoCityConfig';

// Clés localStorage
const STORAGE_KEYS = {
  REAL_CITY: 'flooow_real_city',
  REAL_POSTAL_CODE: 'flooow_real_postal_code',
  DEMO_CITY_KEY: 'flooow_demo_city_key',
  IS_DEMO_FLOW: 'flooow_is_demo_flow',
  SIMULATION_MODE: 'flooow_simulation_mode',
} as const;

export interface DemoCityState {
  // Ville réelle saisie par l'utilisateur
  realCity: string | null;
  realPostalCode: string | null;
  
  // Ville de démo (si hors couverture ou choix explicite)
  demoCityKey: DemoCityKey | null;
  isDemoFlow: boolean;
  
  // Mode simulation itinéraire (actif uniquement en démo)
  simulationModeEnabled: boolean;
  
  // État de chargement
  isLoaded: boolean;
}

export interface DemoCityActions {
  // Définir la ville réelle de l'utilisateur
  setRealCity: (city: string, postalCode: string) => void;
  
  // Entrer en mode démo avec une ville spécifique
  enterDemoFlow: (cityKey: DemoCityKey) => void;
  
  // Quitter le mode démo (revient à empty state)
  exitDemoFlow: () => void;
  
  // Changer la ville de démo
  changeDemoCity: (cityKey: DemoCityKey) => void;
  
  // Toggle simulation itinéraire
  toggleSimulationMode: () => void;
  
  // Reset complet
  reset: () => void;
}

export interface DemoCityHelpers {
  // La ville active (réelle si couverte, démo sinon)
  activeCityKey: DemoCityKey | null;
  activeCityConfig: typeof DEMO_CITIES[DemoCityKey] | null;
  
  // Labels pour l'UI
  activeCityLabel: string | null;
  realCityLabel: string | null;
  demoCityLabel: string | null;
  
  // Checks
  isRealCityCovered: boolean;
  needsDemoChoice: boolean;
  suggestedDemoCity: DemoCityKey | null;
}

const DEFAULT_STATE: DemoCityState = {
  realCity: null,
  realPostalCode: null,
  demoCityKey: null,
  isDemoFlow: false,
  simulationModeEnabled: false, // FALSE par défaut (safe)
  isLoaded: false,
};

/**
 * Charge l'état depuis localStorage
 */
const loadStateFromStorage = (): Partial<DemoCityState> => {
  try {
    return {
      realCity: localStorage.getItem(STORAGE_KEYS.REAL_CITY),
      realPostalCode: localStorage.getItem(STORAGE_KEYS.REAL_POSTAL_CODE),
      demoCityKey: localStorage.getItem(STORAGE_KEYS.DEMO_CITY_KEY) as DemoCityKey | null,
      isDemoFlow: localStorage.getItem(STORAGE_KEYS.IS_DEMO_FLOW) === 'true',
      simulationModeEnabled: localStorage.getItem(STORAGE_KEYS.SIMULATION_MODE) === 'true',
    };
  } catch {
    return {};
  }
};

/**
 * Sauvegarde l'état dans localStorage
 */
const saveStateToStorage = (state: Partial<DemoCityState>): void => {
  try {
    if (state.realCity !== undefined) {
      state.realCity 
        ? localStorage.setItem(STORAGE_KEYS.REAL_CITY, state.realCity)
        : localStorage.removeItem(STORAGE_KEYS.REAL_CITY);
    }
    if (state.realPostalCode !== undefined) {
      state.realPostalCode
        ? localStorage.setItem(STORAGE_KEYS.REAL_POSTAL_CODE, state.realPostalCode)
        : localStorage.removeItem(STORAGE_KEYS.REAL_POSTAL_CODE);
    }
    if (state.demoCityKey !== undefined) {
      state.demoCityKey
        ? localStorage.setItem(STORAGE_KEYS.DEMO_CITY_KEY, state.demoCityKey)
        : localStorage.removeItem(STORAGE_KEYS.DEMO_CITY_KEY);
    }
    if (state.isDemoFlow !== undefined) {
      localStorage.setItem(STORAGE_KEYS.IS_DEMO_FLOW, String(state.isDemoFlow));
    }
    if (state.simulationModeEnabled !== undefined) {
      localStorage.setItem(STORAGE_KEYS.SIMULATION_MODE, String(state.simulationModeEnabled));
    }
  } catch {
    // Ignore storage errors
  }
};

/**
 * Hook principal pour gérer le mode démo et la ville active
 * 
 * Logique :
 * 1. Si la ville réelle est couverte (69/13/42) → pas de démo, on utilise la vraie ville
 * 2. Si la ville réelle n'est pas couverte → on propose une démo
 * 3. En mode démo → toutes les requêtes utilisent demoCityKey
 */
export const useDemoCity = (): DemoCityState & DemoCityActions & DemoCityHelpers => {
  const [state, setState] = useState<DemoCityState>(DEFAULT_STATE);

  // Charger depuis localStorage au mount
  useEffect(() => {
    const stored = loadStateFromStorage();
    setState(prev => ({
      ...prev,
      ...stored,
      isLoaded: true,
    }));
  }, []);

  // === ACTIONS ===

  const setRealCity = useCallback((city: string, postalCode: string) => {
    const coveredCity = getDemoCityFromPostalCode(postalCode);
    
    const newState: Partial<DemoCityState> = {
      realCity: city,
      realPostalCode: postalCode,
    };

    // Si ville couverte, sortir du mode démo
    if (coveredCity) {
      newState.isDemoFlow = false;
      newState.demoCityKey = null;
      newState.simulationModeEnabled = false;
    }

    setState(prev => ({ ...prev, ...newState }));
    saveStateToStorage(newState);
  }, []);

  const enterDemoFlow = useCallback((cityKey: DemoCityKey) => {
    const newState: Partial<DemoCityState> = {
      isDemoFlow: true,
      demoCityKey: cityKey,
      simulationModeEnabled: true, // Activé quand on entre en démo
    };
    
    setState(prev => ({ ...prev, ...newState }));
    saveStateToStorage(newState);
  }, []);

  const exitDemoFlow = useCallback(() => {
    const newState: Partial<DemoCityState> = {
      isDemoFlow: false,
      demoCityKey: null,
      simulationModeEnabled: false,
    };
    
    setState(prev => ({ ...prev, ...newState }));
    saveStateToStorage(newState);
  }, []);

  const changeDemoCity = useCallback((cityKey: DemoCityKey) => {
    if (!state.isDemoFlow) return;
    
    const newState: Partial<DemoCityState> = {
      demoCityKey: cityKey,
    };
    
    setState(prev => ({ ...prev, ...newState }));
    saveStateToStorage(newState);
  }, [state.isDemoFlow]);

  const toggleSimulationMode = useCallback(() => {
    if (!state.isDemoFlow) return;
    
    const newState: Partial<DemoCityState> = {
      simulationModeEnabled: !state.simulationModeEnabled,
    };
    
    setState(prev => ({ ...prev, ...newState }));
    saveStateToStorage(newState);
  }, [state.isDemoFlow, state.simulationModeEnabled]);

  const reset = useCallback(() => {
    setState(DEFAULT_STATE);
    Object.values(STORAGE_KEYS).forEach(key => {
      try { localStorage.removeItem(key); } catch {}
    });
  }, []);

  // === HELPERS (computed) ===

  // Ville réelle couverte ?
  const coveredCityKey = state.realPostalCode 
    ? getDemoCityFromPostalCode(state.realPostalCode)
    : null;
  
  const isRealCityCovered = coveredCityKey !== null;

  // Ville active = réelle si couverte, démo sinon
  const activeCityKey: DemoCityKey | null = isRealCityCovered 
    ? coveredCityKey 
    : (state.isDemoFlow ? state.demoCityKey : null);

  const activeCityConfig = activeCityKey ? DEMO_CITIES[activeCityKey] : null;

  // L'utilisateur doit-il choisir une ville démo ?
  const needsDemoChoice = !isRealCityCovered && !state.isDemoFlow && state.realPostalCode !== null;

  // Suggestion de ville proche
  const suggestedDemoCity = state.realPostalCode && !isRealCityCovered
    ? suggestClosestDemoCity(state.realPostalCode)
    : null;

  // Labels
  const activeCityLabel = activeCityConfig?.shortLabel || null;
  const realCityLabel = state.realCity || (state.realPostalCode ? `CP ${state.realPostalCode}` : null);
  const demoCityLabel = state.demoCityKey ? DEMO_CITIES[state.demoCityKey].shortLabel : null;

  return {
    // State
    ...state,
    
    // Actions
    setRealCity,
    enterDemoFlow,
    exitDemoFlow,
    changeDemoCity,
    toggleSimulationMode,
    reset,
    
    // Helpers
    activeCityKey,
    activeCityConfig,
    activeCityLabel,
    realCityLabel,
    demoCityLabel,
    isRealCityCovered,
    needsDemoChoice,
    suggestedDemoCity,
  };
};

/**
 * Hook simplifié pour juste vérifier si on est en mode démo
 * Utile pour les composants qui ont juste besoin du check
 */
export const useIsDemoFlow = (): boolean => {
  const [isDemoFlow, setIsDemoFlow] = useState(false);
  
  useEffect(() => {
    setIsDemoFlow(localStorage.getItem(STORAGE_KEYS.IS_DEMO_FLOW) === 'true');
  }, []);
  
  return isDemoFlow;
};

/**
 * Hook pour récupérer la ville active (pour les requêtes)
 */
export const useActiveDemoCity = (): DemoCityKey | null => {
  const { activeCityKey } = useDemoCity();
  return activeCityKey;
};
