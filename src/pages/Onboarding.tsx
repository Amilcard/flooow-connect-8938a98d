import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingStep } from "@/components/onboarding/OnboardingStep";
import { DiscoverActivitiesIllustration } from "@/components/onboarding/illustrations/DiscoverActivities";
import { CommunityIllustration } from "@/components/onboarding/illustrations/CommunityIllustration";
import { CostEstimationIllustration } from "@/components/onboarding/illustrations/CostEstimationIllustration";
import { ReadyIllustration } from "@/components/onboarding/illustrations/ReadyIllustration";

type OnboardingStepType = "discover" | "community" | "cost" | "ready";

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStepType>("discover");
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
    discover: {
      title: "Tu souhaites accéder et découvrir une multitude d'activités près de chez toi ?",
      description: "Sports, Aides aux devoirs, Cultures, Vacances, Insertion...",
      illustration: <DiscoverActivitiesIllustration />,
      onNext: () => setCurrentStep("community"),
      stepNumber: 1,
      isLastStep: false,
    },
    community: {
      title: "Rejoins la Communauté Flooow !",
      description:
        "Clique sur le ou les univers de ton choix afin d'identifier l'activité qui pourrait te correspondre. En quelques clics tu peux découvrir les différentes propositions, t'initier gratuitement selon la période et le club et t'y inscrire.",
      illustration: <CommunityIllustration />,
      onNext: () => setCurrentStep("cost"),
      stepNumber: 2,
      isLastStep: false,
    },
    cost: {
      title: "Mais ce n'est pas tout !",
      description:
        "Tu as également la possibilité d'évaluer le coût de l'inscription avant d'envoyer une demande à l'organisme !",
      illustration: <CostEstimationIllustration />,
      onNext: () => setCurrentStep("ready"),
      stepNumber: 3,
      isLastStep: false,
    },
    ready: {
      title: "Prêt(e) pour l'aventure ?",
      description: undefined,
      illustration: <ReadyIllustration />,
      onNext: handleComplete,
      stepNumber: 4,
      isLastStep: true,
    },
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <OnboardingStep
        title={currentStepData.title}
        description={currentStepData.description}
        illustration={currentStepData.illustration}
        currentStep={currentStepData.stepNumber}
        totalSteps={4}
        onNext={currentStepData.onNext}
        onSkip={handleSkip}
        isLastStep={currentStepData.isLastStep}
      />
    </div>
  );
};

export default Onboarding;
