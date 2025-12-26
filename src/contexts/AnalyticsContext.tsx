import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type ConsentStatus = 'unknown' | 'granted' | 'denied';
type UserType = 'adult' | 'minor' | 'unknown';

interface AnalyticsContextType {
  consent: ConsentStatus;
  userType: UserType;
  grantConsent: () => void;
  denyConsent: () => void;
  setUserType: (type: UserType) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

const CONSENT_KEY = 'analyticsConsent';
const USER_TYPE_KEY = 'analyticsUserType';

export const AnalyticsProvider = ({ children }: { children: ReactNode }) => {
  const [consent, setConsent] = useState<ConsentStatus>('unknown');
  const [userType, setUserTypeState] = useState<UserType>('unknown');

  useEffect(() => {
    const storedConsent = localStorage.getItem(CONSENT_KEY) as ConsentStatus | null;
    const storedUserType = localStorage.getItem(USER_TYPE_KEY) as UserType | null;
    if (storedConsent && ['granted', 'denied'].includes(storedConsent)) {
      setConsent(storedConsent);
    }
    if (storedUserType && ['adult', 'minor'].includes(storedUserType)) {
      setUserTypeState(storedUserType);
    }
  }, []);

  const grantConsent = useCallback(() => {
    setConsent('granted');
    localStorage.setItem(CONSENT_KEY, 'granted');
  }, []);

  const denyConsent = useCallback(() => {
    setConsent('denied');
    localStorage.setItem(CONSENT_KEY, 'denied');
  }, []);

  const setUserType = useCallback((type: UserType) => {
    setUserTypeState(type);
    localStorage.setItem(USER_TYPE_KEY, type);
  }, []);

  return (
    <AnalyticsContext.Provider value={{ consent, userType, grantConsent, denyConsent, setUserType }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) throw new Error('useAnalytics must be used within AnalyticsProvider');
  return context;
};
