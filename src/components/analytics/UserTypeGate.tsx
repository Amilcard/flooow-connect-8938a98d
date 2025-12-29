import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { supabase } from '@/integrations/supabase/client';

const getAgeFromDob = (dob: string | null) => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) return null;

  const diffMs = Date.now() - birthDate.getTime();
  const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  return Math.floor(years);
};

export const UserTypeGate = () => {
  const { user, isAuthenticated } = useAuth();
  const { userType, setUserType } = useAnalytics();

  useEffect(() => {
    let isActive = true;

    const determineUserType = async () => {
      if (!isAuthenticated || !user) {
        if (userType !== 'unknown') {
          setUserType('unknown');
        }
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('parent_id, dob')
        .eq('id', user.id)
        .maybeSingle();

      if (!isActive) return;
      if (error) {
        console.error('[Analytics] Impossible de déterminer le type utilisateur', error);
        return;
      }

      const age = getAgeFromDob(data?.dob ?? null);
      const isMinor = Boolean(data?.parent_id) || (age !== null && age < 18);
      const nextType = isMinor ? 'minor' : 'adult';

      if (nextType !== userType) {
        setUserType(nextType);
      }
    };

    determineUserType();

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, setUserType, user, userType]);

  return null;
};
