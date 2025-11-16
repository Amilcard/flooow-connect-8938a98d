import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NewOnboardingStep } from "@/components/onboarding/NewOnboardingStep";
import onboardingActivites from "@/assets/onboarding-activites.png";
import onboardingAides from "@/assets/onboarding-aides.png";
import onboardingMobilite from "@/assets/onboarding-mobilite.png";
import onboardingCommunity from "@/assets/onboarding-community.png";
import onboardingMegaphone from "@/assets/onboarding-megaphone.png";

type OnboardingStepType = "decouvrir" | "aides" | "mobilite" | "guichet" | "cest-parti";

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStepType>("decouvrir");
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
    decouvrir: {
      title: "Découvrir facilement",
      body: "En quelques clics, Flooow géolocalise les activités disponibles autour de chez vous : sport, loisirs, scolarité, culture, insertion… Tout ce dont vos enfants ont besoin, au bon endroit et au bon moment.",
      illustration: onboardingActivites,
      accentColor: "blue" as const,
      onNext: () => setCurrentStep("aides"),
      stepNumber: 1,
      isLastStep: false,
    },
    aides: {
      title: "Vos aides financières estimées",
      body: "Flooow estime immédiatement vos aides financières possibles (CAF, Pass'Sport, dispositifs locaux…). Plus besoin de démarches multiples : vous gagnez du temps dès le départ.",
      illustration: onboardingAides,
      accentColor: "orange" as const,
      onNext: () => setCurrentStep("mobilite"),
      stepNumber: 2,
      isLastStep: false,
    },
    mobilite: {
      title: "Se rendre à l'activité",
      body: "Des solutions de trajet adaptées vous sont proposées : transports locaux, vélo, marche… Et bientôt, le covoiturage entre parents pour encore plus de sérénité.",
      illustration: onboardingMobilite,
      accentColor: "blue" as const,
      onNext: () => setCurrentStep("guichet"),
      stepNumber: 3,
      isLastStep: false,
    },
    guichet: {
      title: "Votre guichet du quotidien",
      body: "Toutes les informations utiles sont réunies au même endroit : activités, disponibilités, créneaux, aides, mobilité… Flooow, votre guichet du quotidien pour accompagner vos enfants.",
      illustration: onboardingCommunity,
      accentColor: "orange" as const,
      onNext: () => setCurrentStep("cest-parti"),
      stepNumber: 4,
      isLastStep: false,
    },
    "cest-parti": {
      title: "C'est parti !",
      body: "Bienvenue dans la communauté FlooowTesteurs ! Merci de nous aider à améliorer la plateforme avec vos retours.\nNananère !",
      illustration: onboardingMegaphone,
      accentColor: "blue" as const,
      onNext: handleComplete,
      stepNumber: 5,
      isLastStep: true,
      primaryCtaLabel: "C'est parti",
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
      totalSteps={5}
      onNext={currentStepData.onNext}
      onSkip={handleSkip}
      isLastStep={currentStepData.isLastStep}
      primaryCtaLabel={"primaryCtaLabel" in currentStepData ? currentStepData.primaryCtaLabel : undefined}
      showSocialIcons={"showSocialIcons" in currentStepData ? currentStepData.showSocialIcons : false}
    />
  );
};

export default Onboarding;
