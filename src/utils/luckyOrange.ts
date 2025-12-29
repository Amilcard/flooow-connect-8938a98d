/**
 * Lucky Orange Privacy & Event Tracking Helper
 *
 * Safe wrapper that handles:
 * - Consent management via LO.privacy API
 * - Route-based exclusion (onboarding, ma-ville, territoire-non-couvert)
 * - Minor user protection (no tracking for minors)
 * - Key event tracking
 *
 * All functions are no-op if window.LO is not available.
 */

// Routes where tracking should NEVER occur (even with consent)
const EXCLUDED_ROUTES = [
  '/onboarding',
  '/ma-ville',
  '/territoire-non-couvert',
];

// Type declarations for Lucky Orange
declare global {
  interface Window {
    LO?: {
      privacy?: {
        setConsentStatus: (status: boolean) => void;
        getConsentStatus: () => boolean;
      };
      track?: (eventName: string, properties?: Record<string, unknown>) => void;
    };
  }
}

/**
 * Check if Lucky Orange is loaded
 */
function isLOAvailable(): boolean {
  const available = typeof window !== 'undefined' && !!window.LO?.privacy;
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    console.debug('[LO Debug] Lucky Orange available:', available);
  }
  return available;
}

/**
 * Check if current route is excluded from tracking
 */
function isExcludedRoute(pathname?: string): boolean {
  const path = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');
  return EXCLUDED_ROUTES.some(route => path.startsWith(route));
}

/**
 * Set Lucky Orange consent status
 * @param hasConsent - true if user accepted analytics
 * @param isMinor - true if user is a minor (always blocks tracking)
 * @param pathname - current route (for exclusion check)
 */
export function setLOConsent(
  hasConsent: boolean,
  isMinor: boolean = false,
  pathname?: string
): void {
  if (!isLOAvailable()) return;

  // Always deny for minors or excluded routes
  if (isMinor || isExcludedRoute(pathname)) {
    if (import.meta.env.DEV) {
      console.debug('[LO Debug] Consent blocked:', { isMinor, pathname, excluded: isExcludedRoute(pathname) });
    }
    window.LO!.privacy!.setConsentStatus(false);
    return;
  }

  if (import.meta.env.DEV) {
    console.debug('[LO Debug] Consent set:', hasConsent);
  }
  window.LO!.privacy!.setConsentStatus(hasConsent);
}

/**
 * Force opt-out (deny consent)
 * Use when user withdraws consent or on excluded routes
 */
export function optOutLO(): void {
  if (!isLOAvailable()) return;
  window.LO!.privacy!.setConsentStatus(false);
}

/**
 * Track a custom event in Lucky Orange
 * No-op if LO not available, user hasn't consented, or on excluded routes
 *
 * @param eventName - Name of the event to track
 * @param properties - Optional event properties
 */
export function trackLOEvent(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  if (!isLOAvailable()) return;

  // Don't track on excluded routes
  if (isExcludedRoute()) return;

  // Only track if consent is granted
  if (!window.LO!.privacy!.getConsentStatus()) return;

  try {
    window.LO!.track?.(eventName, properties);
  } catch {
    // Silent fail - analytics should never break the app
  }
}

// ============================================
// Pre-defined Key Events
// ============================================

/**
 * Track when user completes their first search
 */
export function trackFirstSearch(): void {
  trackLOEvent('search_completed_first');
}

/**
 * Track when aids estimation is completed
 */
export function trackAidsEstimationCompleted(savingsPercent?: number): void {
  trackLOEvent('aids_estimation_completed', savingsPercent ? { savingsPercent } : undefined);
}

/**
 * Track when a booking is confirmed
 */
export function trackBookingConfirmed(activityId?: string): void {
  trackLOEvent('booking_confirmed', activityId ? { activityId } : undefined);
}
