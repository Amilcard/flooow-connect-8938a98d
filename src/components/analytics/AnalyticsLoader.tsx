import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLuckyOrange } from '@/hooks/useLuckyOrange';

export const AnalyticsLoader = () => {
  const location = useLocation();
  const { trackEvent, isLoaded } = useLuckyOrange();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Dédup : ne pas tracker 2 fois le même path (StrictMode)
    if (!isLoaded) return;
    if (lastTrackedPath.current === location.pathname) return;

    lastTrackedPath.current = location.pathname;
    trackEvent('nav_view', { route: location.pathname });
  }, [location.pathname, isLoaded, trackEvent]);

  return null;
};
