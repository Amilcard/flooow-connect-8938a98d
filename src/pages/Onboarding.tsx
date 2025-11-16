import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NewOnboardingStep } from "@/components/onboarding/NewOnboardingStep";
import onboardingActivites from "@/assets/onboarding-activites.png";
import onboardingAides from "@/assets/onboarding-aides.png";
import onboardingMobilite from "@/assets/onboarding-mobilite.png";
import onboardingCommunity from "@/assets/onboarding-community.png";
import onboardingAventure from "@/assets/onboarding-aventure.png";

type OnboardingStepType = "activites" | "aides" | "mobilite" | "testeurs" | "aventure";

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
      title: "Découvre facilement des activités près de chez toi",
      body: "Sports, culture, loisirs, vacances, soutien scolaire…\nFloooow t'aide à trouver en quelques secondes ce qui correspond vraiment à ton enfant.\nSimple. Rapide. Gratuit.",
      illustration: onboardingActivites,
      accentColor: "blue" as const,
      onNext: () => setCurrentStep("aides"),
      stepNumber: 1,
      isLastStep: false,
    },
    aides: {
      title: "Comprends instantanément tes aides financières",
      body: "Simule les aides disponibles sans créer de compte :\nCAF, Pass'Sport, aides locales…\nTu connais ton reste à charge avant même d'inscrire ton enfant.",
      illustration: onboardingAides,
      accentColor: "orange" as const,
      onNext: () => setCurrentStep("mobilite"),
      stepNumber: 2,
      isLastStep: false,
    },
    mobilite: {
      title: "Trouve comment te rendre à l'activité facilement",
      body: "Bus, tram, vélo, covoiturage…\nFloooow t'affiche automatiquement les solutions les plus simples et éco-responsables pour te déplacer.",
      illustration: onboardingMobilite,
      accentColor: "blue" as const,
      onNext: () => setCurrentStep("testeurs"),
      stepNumber: 3,
      isLastStep: false,
    },
    testeurs: {
      title: "Bienvenue dans la communauté FloooowTesteurs",
      body: "Tu fais partie des premières familles à tester Floooow.\nDes infos-bulles t'aideront à comprendre chaque étape.\nTes retours nous permettront d'améliorer l'application pour toutes les familles.",
      illustration: onboardingCommunity,
      accentColor: "orange" as const,
      onNext: () => setCurrentStep("aventure"),
      stepNumber: 4,
      isLastStep: false,
    },
    aventure: {
      title: "Prêt(e) pour l'aventure ?",
      body: "Tu peux commencer à utiliser Floooow tout de suite.\nTu retrouveras les aides, la mobilité et les infos-bulles directement dans l'application.\nFloooow – et nananère aux galères d'inscription.",
      illustration: onboardingAventure,
      accentColor: "orange" as const,
      onNext: handleComplete,
      stepNumber: 5,
      isLastStep: true,
      primaryCtaLabel: "Commencer avec Floooow",
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
      totalSteps={5}
      onNext={currentStepData.onNext}
      onSkip={handleSkip}
      isLastStep={currentStepData.isLastStep}
      primaryCtaLabel={"primaryCtaLabel" in currentStepData ? currentStepData.primaryCtaLabel : undefined}
    />
  );
};

export default Onboarding;
