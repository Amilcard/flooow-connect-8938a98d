import { useState, useEffect } from "react";

interface FinancialAid {
  aid_name: string;
  amount: number;
  territory_level: string;
  official_link: string | null;
  is_informational?: boolean;
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
  const storageKey = `${STORAGE_KEY_PREFIX}${activityId}`;

  const [state, setState] = useState<ActivityBookingState | null>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (state) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (error) {
        console.error("Failed to save booking state:", error);
      }
    }
  }, [state, storageKey]);

  const saveAidCalculation = (data: {
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
  };

  const saveTransportMode = (mode: TransportMode) => {
    setState(prev => prev ? { ...prev, transportMode: mode } : null);
  };

  const clearState = () => {
    localStorage.removeItem(storageKey);
    setState(null);
  };

  const isAidCalculated = state?.calculated && state?.childId;

  return {
    state,
    saveAidCalculation,
    saveTransportMode,
    clearState,
    isAidCalculated
  };
};
