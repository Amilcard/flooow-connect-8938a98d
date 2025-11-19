import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NewOnboardingStep } from "@/components/onboarding/NewOnboardingStep";

/**
 * Onboarding 4 écrans - Ton CityCrunch
 * "Parents pour parents • Sérieux et léger • On construit ensemble"
 */

type OnboardingStepType = "bienvenue" | "activites" | "aides" | "communaute";

// Placeholder transparent 1x1 pour désactiver les images
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3C/svg%3E";

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStepType>("bienvenue");
  const navigate = useNavigate();

  const handleComplete = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    navigate("/signup", { replace: true });
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    navigate("/home", { replace: true });
  };

  const steps = {
    bienvenue: {
      title: "Flooow, c'est nous",
      body: "Des parents pour des parents.\n\n✨ Stop au non-recours !\n\nVersion test. On construit Flooow avec vous.",
      illustration: PLACEHOLDER_IMAGE,
      accentColor: "orange" as const,
      onNext: () => setCurrentStep("activites"),
      stepNumber: 1,
      isLastStep: false,
      primaryCtaLabel: "C'est parti"
    },
    activites: {
      title: "Activités près de chez nous",
      body: "Sport, culture, loisirs. On trouve en 2 clics.\n\n• 4-17 ans\n• Quartier par quartier\n• Initiations possibles\n\n💡 Infobulles dispo partout",
      illustration: PLACEHOLDER_IMAGE,
      accentColor: "blue" as const,
      onNext: () => setCurrentStep("aides"),
      stepNumber: 2,
      isLastStep: false,
      primaryCtaLabel: "Suivant"
    },
    aides: {
      title: "On simule nos aides",
      body: "1 minute. Gratuit. On y a droit.\n\n• Stop au non-recours\n• Calcul automatique\n• Paiement échelonné possible",
      illustration: PLACEHOLDER_IMAGE,
      accentColor: "orange" as const,
      onNext: () => setCurrentStep("communaute"),
      stepNumber: 3,
      isLastStep: false,
      primaryCtaLabel: "Suivant"
    },
    communaute: {
      title: "Bienvenue dans la Family",
      body: "On partage. On s'entraide. On construit Flooow.\n\n💬 On s'améliore grâce à vous\nBugs, idées, retours. On écoute. On améliore.\n\n• Communauté testeurs\n• Bons plans partagés\n• Questions/réponses",
      illustration: PLACEHOLDER_IMAGE,
      accentColor: "blue" as const,
      onNext: handleComplete,
      stepNumber: 4,
      isLastStep: true,
      primaryCtaLabel: "Créer mon compte",
      showSocialIcons: false
    },
  };

  const currentStepData = steps[currentStep];

  return (
    <NewOnboardingStep
      title={currentStepData.title}
      body={currentStepData.body}
      illustration={currentStepData.illustration}
      accentColor={currentStepData.accentColor}
      currentStep={currentStepData.stepNumber}
      totalSteps={4}
      onNext={currentStepData.onNext}
      onSkip={handleSkip}
      isLastStep={currentStepData.isLastStep}
      primaryCtaLabel={currentStepData.primaryCtaLabel}
      showSocialIcons={currentStepData.showSocialIcons}
    />
  );
};

export default Onboarding;
