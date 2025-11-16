import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NewOnboardingStep } from "@/components/onboarding/NewOnboardingStep";
import onboardingActivites from "@/assets/onboarding-activites.png";
import onboardingAides from "@/assets/onboarding-aides.png";
import onboardingMobilite from "@/assets/onboarding-mobilite.png";
import onboardingCommunity from "@/assets/onboarding-community.png";
import onboardingAventure from "@/assets/onboarding-aventure.png";

type OnboardingStepType = "activites" | "decouverte" | "aides" | "testeurs";

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStepType>("activites");
  const navigate = useNavigate();

  const handleComplete = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    navigate("/home", { replace: true });
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    navigate("/home", { replace: true });
  };

  const steps = {
    activites: {
      title: "Tu veux trouver des activités près de chez toi ?",
      body: "Flooow t'aide à découvrir sports, culture, devoirs, vacances et loisirs.",
      illustration: onboardingActivites,
      accentColor: "blue" as const,
      onNext: () => setCurrentStep("decouverte"),
      stepNumber: 1,
      isLastStep: false,
    },
    decouverte: {
      title: "Trouve l'activité qui lui ressemble",
      body: "Explore les univers, filtre par âge, par période ou par budget, et découvre ce qui correspond à ton enfant.",
      illustration: onboardingMobilite,
      accentColor: "orange" as const,
      onNext: () => setCurrentStep("aides"),
      stepNumber: 2,
      isLastStep: false,
    },
    aides: {
      title: "Simule les aides en un clic",
      body: "Calcule ton reste à charge avec ton QF et ton code postal, sans créer de compte.",
      illustration: onboardingAides,
      accentColor: "blue" as const,
      onNext: () => setCurrentStep("testeurs"),
      stepNumber: 3,
      isLastStep: false,
    },
    testeurs: {
      title: "Rejoins les FlooowTesteurs",
      body: "Tu fais partie des premiers testeurs. Tu recevras des infos-bulles et tu pourras nous aider en donnant ton avis.",
      illustration: onboardingCommunity,
      accentColor: "orange" as const,
      onNext: handleComplete,
      stepNumber: 4,
      isLastStep: true,
      primaryCtaLabel: "Accéder à Flooow",
      showSocialIcons: true,
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
      primaryCtaLabel={"primaryCtaLabel" in currentStepData ? currentStepData.primaryCtaLabel : undefined}
      showSocialIcons={"showSocialIcons" in currentStepData ? currentStepData.showSocialIcons : false}
    />
  );
};

export default Onboarding;
