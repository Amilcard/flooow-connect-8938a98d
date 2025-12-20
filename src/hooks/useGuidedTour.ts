/**
 * Hook pour gérer les tours guidés in-app
 * Stocke l'état du tour dans localStorage
 * Ne s'active que pour les adultes avec consent
 */

import { useState, useEffect, useCallback } from 'react';

export interface TourStep {
  id: string;
  target: string; // data-tour attribute value
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export interface TourConfig {
  id: string;
  name: string;
  steps: TourStep[];
  triggerRoute?: string; // Route where tour should start
}

export type TourState = 'not_started' | 'in_progress' | 'completed' | 'skipped';

const STORAGE_KEY_PREFIX = 'flooow_tour_';

export function useGuidedTour(tour: TourConfig, isEnabled: boolean) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tourState, setTourStateInternal] = useState<TourState>('not_started');
  const [isVisible, setIsVisible] = useState(false);

  const storageKey = `${STORAGE_KEY_PREFIX}${tour.id}`;

  // Load tour state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as TourState;
    if (stored === 'completed' || stored === 'skipped') {
      setTourStateInternal(stored);
      setIsVisible(false);
    } else if (isEnabled) {
      // Auto-start tour if enabled and not completed/skipped
      setTourStateInternal('not_started');
    }
  }, [storageKey, isEnabled]);

  const setTourState = useCallback((state: TourState) => {
    localStorage.setItem(storageKey, state);
    setTourStateInternal(state);
  }, [storageKey]);

  const startTour = useCallback(() => {
    if (!isEnabled) return;
    setCurrentStepIndex(0);
    setTourState('in_progress');
    setIsVisible(true);
  }, [isEnabled, setTourState]);

  const nextStep = useCallback(() => {
    if (currentStepIndex < tour.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Tour completed
      setTourState('completed');
      setIsVisible(false);
    }
  }, [currentStepIndex, tour.steps.length, setTourState]);

  const previousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const skipTour = useCallback(() => {
    setTourState('skipped');
    setIsVisible(false);
  }, [setTourState]);

  const resetTour = useCallback(() => {
    localStorage.removeItem(storageKey);
    setTourStateInternal('not_started');
    setCurrentStepIndex(0);
  }, [storageKey]);

  const currentStep = tour.steps[currentStepIndex] || null;
  const totalSteps = tour.steps.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === tour.steps.length - 1;

  return {
    currentStep,
    currentStepIndex,
    totalSteps,
    tourState,
    isVisible,
    isFirstStep,
    isLastStep,
    startTour,
    nextStep,
    previousStep,
    skipTour,
    resetTour,
    setIsVisible,
  };
}

// Tour 1: Découverte recherche → filtres → activité
export const DISCOVERY_TOUR: TourConfig = {
  id: 'discovery_v1',
  name: 'Découvrir Flooow',
  triggerRoute: '/home',
  steps: [
    {
      id: 'search_bar',
      target: 'search-bar',
      title: 'Recherchez une activité',
      content: 'Tapez un mot-clé, une ville ou un type d\'activité pour commencer votre recherche.',
      position: 'bottom',
    },
    {
      id: 'filters',
      target: 'filters-button',
      title: 'Affinez vos résultats',
      content: 'Utilisez les filtres pour trouver l\'activité parfaite : âge, budget, distance...',
      position: 'bottom',
    },
    {
      id: 'activity_card',
      target: 'activity-card',
      title: 'Découvrez les détails',
      content: 'Cliquez sur une activité pour voir tous les détails : horaires, tarifs, aides disponibles.',
      position: 'top',
    },
    {
      id: 'aides',
      target: 'aides-section',
      title: 'Vos aides financières',
      content: 'Flooow estime automatiquement les aides auxquelles vous pourriez avoir droit.',
      position: 'top',
    },
  ],
};
