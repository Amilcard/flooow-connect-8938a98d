/**
 * Hook pour gérer la barrière parent/mineur
 * Stocke le type d'utilisateur dans localStorage
 * Empêche le tracking Clarity pour les mineurs
 */

import { useState, useEffect, useCallback } from 'react';

export type UserType = 'adult' | 'minor' | null;

const STORAGE_KEY = 'flooow_user_type';

export function useParentGate() {
  const [userType, setUserTypeState] = useState<UserType>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showGate, setShowGate] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as UserType;
    if (stored === 'adult' || stored === 'minor') {
      setUserTypeState(stored);
      setShowGate(false);
    } else {
      setShowGate(true);
    }
    setIsLoading(false);
  }, []);

  const setUserType = useCallback((type: UserType) => {
    if (type) {
      localStorage.setItem(STORAGE_KEY, type);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setUserTypeState(type);
    setShowGate(false);
  }, []);

  const resetUserType = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUserTypeState(null);
    setShowGate(true);
  }, []);

  const isAdult = userType === 'adult';
  const isMinor = userType === 'minor';
  const hasChosenType = userType !== null;

  return {
    userType,
    setUserType,
    resetUserType,
    isAdult,
    isMinor,
    hasChosenType,
    isLoading,
    showGate,
    setShowGate,
  };
}
