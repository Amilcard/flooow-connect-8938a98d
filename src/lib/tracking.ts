import { useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { trackFirstSearch, trackAidsEstimationCompleted, trackBookingConfirmed } from '@/utils/luckyOrange';

/**
 * Helper pour le tracking des actions utilisateur
 * Utilisé pour analytics et calcul des KPIs
 */

// Feature flag: disable DB tracking if tables don't exist yet
// Set VITE_ENABLE_DB_TRACKING=true when Supabase tables are ready
const ENABLE_DB_TRACKING = import.meta.env.VITE_ENABLE_DB_TRACKING === 'true';

// Générer un session_id unique par session navigateur
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('tracking_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('tracking_session_id', sessionId);
  }
  return sessionId;
};

/**
 * Logger une recherche utilisateur
 */
// Track if user has already performed a first search this session
const FIRST_SEARCH_KEY = 'flooow_first_search_tracked';

export const logSearch = async (params: {
  searchQuery?: string;
  filtersApplied: Record<string, unknown>;
  resultsCount: number;
}) => {
  // Track first search for Lucky Orange (once per session) - always works
  if (!sessionStorage.getItem(FIRST_SEARCH_KEY)) {
    sessionStorage.setItem(FIRST_SEARCH_KEY, 'true');
    trackFirstSearch();
  }

  // Skip DB tracking if disabled (tables don't exist yet)
  if (!ENABLE_DB_TRACKING) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();

    // Tables analytics non typées dans Supabase types générés
    await (supabase.from('search_logs' as never) as ReturnType<typeof supabase.from>).insert({
      user_id: user?.id || null,
      session_id: getSessionId(),
      search_query: params.searchQuery || null,
      filters_applied: params.filtersApplied,
      results_count: params.resultsCount
    });
  } catch {
    // Fail silently - don't spam console
  }
};

/**
 * Logger une consultation de fiche activité
 */
export const logActivityView = async (params: {
  activityId: string;
  source: 'search' | 'home' | 'direct' | 'favorites';
  viewDurationSeconds?: number;
}) => {
  // Skip DB tracking if disabled (tables don't exist yet)
  if (!ENABLE_DB_TRACKING) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();

    // Tables analytics non typées dans Supabase types générés
    await (supabase.from('activity_views' as never) as ReturnType<typeof supabase.from>).insert({
      activity_id: params.activityId,
      user_id: user?.id || null,
      session_id: getSessionId(),
      view_duration_seconds: params.viewDurationSeconds || null,
      source: params.source
    });
  } catch {
    // Fail silently - don't spam console
  }
};

/**
 * Hook pour tracker automatiquement la durée de consultation
 * À utiliser dans les composants de détail
 */
export const useActivityViewTracking = (
  activityId: string | undefined,
  source: 'search' | 'home' | 'direct' | 'favorites' = 'direct'
) => {
  const startTimeRef = useRef(Date.now());

  return useCallback(() => {
    if (!activityId) return;

    const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);

    // Logger seulement si durée > 2 secondes (évite les bounces)
    if (durationSeconds > 2) {
      logActivityView({
        activityId,
        source,
        viewDurationSeconds: durationSeconds
      });
    }
  }, [activityId, source]);
};

/**
 * Log aids estimation completion (Lucky Orange event)
 */
export const logAidsEstimationCompleted = (savingsPercent?: number): void => {
  trackAidsEstimationCompleted(savingsPercent);
};

/**
 * Log booking confirmation (Lucky Orange event)
 */
export const logBookingConfirmed = (activityId?: string): void => {
  trackBookingConfirmed(activityId);
};
