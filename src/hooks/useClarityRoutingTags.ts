/**
 * Hook pour tagger les parcours utilisateur dans Clarity
 * S'active à chaque changement de route
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { setClarityTag, trackClarityEvent } from './useClarity';

interface RoutingTagsOptions {
  isAdult: boolean;
  hasConsent: boolean;
  tourState?: 'not_started' | 'in_progress' | 'completed' | 'skipped';
}

// Map routes to screen names and funnels
const ROUTE_CONFIG: Record<string, { screen: string; funnel?: string; step?: number }> = {
  '/': { screen: 'splash' },
  '/home': { screen: 'home', funnel: 'discovery', step: 1 },
  '/search': { screen: 'search', funnel: 'discovery', step: 2 },
  '/search/filters': { screen: 'search_filters', funnel: 'discovery', step: 3 },
  '/activities': { screen: 'activities', funnel: 'discovery', step: 2 },
  '/activites/carte': { screen: 'activities_map', funnel: 'discovery', step: 2 },
  '/onboarding': { screen: 'onboarding', funnel: 'onboarding', step: 1 },
  '/login': { screen: 'login', funnel: 'auth', step: 1 },
  '/signup': { screen: 'signup', funnel: 'auth', step: 2 },
  '/forgot-password': { screen: 'forgot_password', funnel: 'auth' },
  '/reset-password': { screen: 'reset_password', funnel: 'auth' },
  '/inscription/parent': { screen: 'parent_signup', funnel: 'auth', step: 3 },
  '/mon-compte': { screen: 'account', funnel: 'account', step: 1 },
  '/mon-compte/informations': { screen: 'account_info', funnel: 'account', step: 2 },
  '/mon-compte/enfants': { screen: 'account_children', funnel: 'account' },
  '/mon-compte/reservations': { screen: 'account_bookings', funnel: 'account' },
  '/mon-compte/parametres': { screen: 'account_settings', funnel: 'account' },
  '/aides': { screen: 'aides', funnel: 'aides', step: 1 },
  '/aides/simulateur': { screen: 'simulateur', funnel: 'aides', step: 2 },
  '/aides/simulateur-v2': { screen: 'simulateur_v2', funnel: 'aides', step: 2 },
  '/ma-ville-mon-actu': { screen: 'city_news', funnel: 'community' },
  '/agenda': { screen: 'agenda', funnel: 'events' },
  '/community': { screen: 'community', funnel: 'community' },
  '/covoiturage': { screen: 'covoiturage', funnel: 'transport' },
  '/itineraire': { screen: 'itineraire', funnel: 'transport' },
  '/faq': { screen: 'faq', funnel: 'support' },
  '/support': { screen: 'support', funnel: 'support' },
  '/contact': { screen: 'contact', funnel: 'support' },
  '/legal/privacy': { screen: 'privacy_policy', funnel: 'legal' },
  '/legal/rgpd': { screen: 'rgpd', funnel: 'legal' },
  '/legal/cookies': { screen: 'cookies', funnel: 'legal' },
  '/legal/cgu': { screen: 'cgu', funnel: 'legal' },
};

// Dynamic routes patterns
const DYNAMIC_ROUTES: Array<{ pattern: RegExp; config: { screen: string; funnel?: string; step?: number } }> = [
  { pattern: /^\/activity\/[^/]+$/, config: { screen: 'activity_detail', funnel: 'discovery', step: 4 } },
  { pattern: /^\/booking\/[^/]+$/, config: { screen: 'booking', funnel: 'booking', step: 1 } },
  { pattern: /^\/booking-recap\/[^/]+$/, config: { screen: 'booking_recap', funnel: 'booking', step: 2 } },
  { pattern: /^\/booking-status\/[^/]+$/, config: { screen: 'booking_status', funnel: 'booking', step: 3 } },
  { pattern: /^\/event\/[^/]+$/, config: { screen: 'event_detail', funnel: 'events', step: 2 } },
  { pattern: /^\/validations\/[^/]+$/, config: { screen: 'validation_parentale', funnel: 'validation' } },
];

function getRouteConfig(pathname: string) {
  // Check static routes first
  if (ROUTE_CONFIG[pathname]) {
    return ROUTE_CONFIG[pathname];
  }

  // Check dynamic routes
  for (const { pattern, config } of DYNAMIC_ROUTES) {
    if (pattern.test(pathname)) {
      return config;
    }
  }

  // Default for unknown routes
  return { screen: 'unknown', funnel: undefined, step: undefined };
}

/**
 * Hook pour tagger automatiquement les changements de route dans Clarity
 */
export function useClarityRoutingTags(options: RoutingTagsOptions): void {
  const { isAdult, hasConsent, tourState = 'not_started' } = options;
  const location = useLocation();

  useEffect(() => {
    // Only tag if adult and has consent
    if (!isAdult || !hasConsent) {
      return;
    }

    const config = getRouteConfig(location.pathname);

    // Set route tag
    setClarityTag('route', location.pathname);

    // Set screen tag
    setClarityTag('screen', config.screen);

    // Set funnel tag if defined
    if (config.funnel) {
      setClarityTag('funnel', config.funnel);
    }

    // Set step tag if defined
    if (config.step !== undefined) {
      setClarityTag('step', String(config.step));
    }

    // Set parent mode tag
    setClarityTag('parent_mode', 'true');

    // Set tour state tag
    setClarityTag('tour_state', tourState);

    // Emit screen event
    trackClarityEvent(`screen_${config.screen}`);

  }, [location.pathname, isAdult, hasConsent, tourState]);
}
