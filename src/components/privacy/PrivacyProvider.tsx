/**
 * Provider qui gère la privacy: ParentGate et Consent
 * Encapsule toute la logique de consentement
 */

import { createContext, useContext, ReactNode } from 'react';
import { useParentGate, UserType } from '@/hooks/useParentGate';
import { useAnalyticsConsent, ConsentStatus } from '@/hooks/useAnalyticsConsent';
import { useGuidedTour, DISCOVERY_TOUR, TourState } from '@/hooks/useGuidedTour';
import { ParentGateModal } from './ParentGateModal';
import { ConsentBanner } from './ConsentBanner';
import { GuidedTourBubble } from '../tours/GuidedTourBubble';

interface PrivacyContextValue {
  // Parent Gate
  userType: UserType;
  isAdult: boolean;
  isMinor: boolean;
  setUserType: (type: UserType) => void;
  resetUserType: () => void;

  // Consent
  consent: ConsentStatus;
  hasConsent: boolean;
  acceptConsent: () => void;
  denyConsent: () => void;
  withdrawConsent: () => void;

  // Tour
  tourState: TourState;
  startTour: () => void;
  resetTour: () => void;
}

const PrivacyContext = createContext<PrivacyContextValue | null>(null);

export function usePrivacy() {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
}

interface PrivacyProviderProps {
  children: ReactNode;
}

export function PrivacyProvider({ children }: PrivacyProviderProps) {
  // Parent Gate state
  const {
    userType,
    setUserType,
    resetUserType,
    isAdult,
    isMinor,
    isLoading: isLoadingGate,
    showGate,
  } = useParentGate();

  // Consent state
  const {
    consent,
    acceptConsent,
    denyConsent,
    withdrawConsent,
    isGranted: hasConsent,
    isLoading: isLoadingConsent,
    showBanner,
  } = useAnalyticsConsent();

  // Guided tour
  const tour = useGuidedTour(DISCOVERY_TOUR, isAdult && hasConsent);

  // Don't render anything until we've loaded the stored state
  if (isLoadingGate || isLoadingConsent) {
    return null;
  }

  // Compute display conditions
  const shouldShowConsentBanner = !showGate && isAdult && showBanner;
  const shouldShowTour = !showGate && !showBanner && isAdult && hasConsent && tour.isVisible && tour.currentStep;

  const contextValue: PrivacyContextValue = {
    userType,
    isAdult,
    isMinor,
    setUserType,
    resetUserType,
    consent,
    hasConsent,
    acceptConsent,
    denyConsent,
    withdrawConsent,
    tourState: tour.tourState,
    startTour: tour.startTour,
    resetTour: tour.resetTour,
  };

  return (
    <PrivacyContext.Provider value={contextValue}>
      {children}
      {showGate && <ParentGateModal onSelect={setUserType} />}
      {shouldShowConsentBanner && <ConsentBanner onAccept={acceptConsent} onDeny={denyConsent} />}
      {shouldShowTour && tour.currentStep && (
        <GuidedTourBubble
          step={tour.currentStep}
          currentIndex={tour.currentStepIndex}
          totalSteps={tour.totalSteps}
          isFirstStep={tour.isFirstStep}
          isLastStep={tour.isLastStep}
          onNext={tour.nextStep}
          onPrevious={tour.previousStep}
          onSkip={tour.skipTour}
        />
      )}
    </PrivacyContext.Provider>
  );
}
