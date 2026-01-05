import { useState, useEffect, useCallback, useMemo } from "react";
import { safeErrorMessage } from "@/utils/sanitize";

interface FinancialAid {
  aid_name: string;
  amount: number;
  territory_level: string;
  official_link: string | null;
  is_informational?: boolean;
  is_potential?: boolean; // Potential aids require additional info (e.g., QF) to confirm
}

interface TransportMode {
  type: "bus" | "bike" | "walk";
  label: string;
  duration: number; // in minutes
  details?: string;
}

interface ActivityBookingState {
  childId: string;
  quotientFamilial: string;
  cityCode: string;
  aids: FinancialAid[];
  totalAids: number;
  remainingPrice: number;
  calculated: boolean;
  transportMode?: TransportMode;
}

const STORAGE_KEY_PREFIX = "activity_booking_";

export const useActivityBookingState = (activityId: string) => {
  const storageKey = useMemo(() => `${STORAGE_KEY_PREFIX}${activityId}`, [activityId]);

  const [state, setState] = useState<ActivityBookingState | null>(() => {
    if (!activityId) return null;
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${activityId}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (state && activityId) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (error) {
        console.error(safeErrorMessage(error, 'Save booking state'));
      }
    }
  }, [state, storageKey, activityId]);

  const saveAidCalculation = useCallback((data: {
    childId: string;
    quotientFamilial: string;
    cityCode: string;
    aids: FinancialAid[];
    totalAids: number;
    remainingPrice: number;
  }) => {
    setState(prev => ({
      ...prev,
      childId: data.childId,
      quotientFamilial: data.quotientFamilial,
      cityCode: data.cityCode,
      aids: data.aids,
      totalAids: data.totalAids,
      remainingPrice: data.remainingPrice,
      calculated: true,
      transportMode: prev?.transportMode
    }));
  }, []);

  const saveTransportMode = useCallback((mode: TransportMode) => {
    setState(prev => prev ? { ...prev, transportMode: mode } : null);
  }, []);

  const clearState = useCallback(() => {
    localStorage.removeItem(storageKey);
    setState(null);
  }, [storageKey]);

  const isAidCalculated = useMemo(() => state?.calculated && state?.childId, [state?.calculated, state?.childId]);

  return {
    state,
    saveAidCalculation,
    saveTransportMode,
    clearState,
    isAidCalculated
  };
};
