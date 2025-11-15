import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BetaWelcomeScreen } from "@/components/onboarding/BetaWelcomeScreen";
import { FindActivitiesScreen } from "@/components/onboarding/FindActivitiesScreen";
import { UnderstandCostsScreen } from "@/components/onboarding/UnderstandCostsScreen";
import { EasyAccessScreen } from "@/components/onboarding/EasyAccessScreen";

type OnboardingStep = 
  | "beta-welcome" 
  | "find-activities" 
  | "understand-costs" 
  | "easy-access";

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("beta-welcome");
  const navigate = useNavigate();

  const handleComplete = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    navigate("/home");
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    navigate("/home");
  };

  const handleWelcomeNext = () => {
    setCurrentStep("find-activities");
  };

  const handleFindActivitiesNext = () => {
    setCurrentStep("understand-costs");
  };

  const handleUnderstandCostsNext = () => {
    setCurrentStep("easy-access");
  };

  const renderStep = () => {
    switch (currentStep) {
      case "beta-welcome":
        return <BetaWelcomeScreen onNext={handleWelcomeNext} onSkip={handleSkip} />;
      
      case "find-activities":
        return <FindActivitiesScreen onNext={handleFindActivitiesNext} onSkip={handleSkip} />;
      
      case "understand-costs":
        return <UnderstandCostsScreen onNext={handleUnderstandCostsNext} onSkip={handleSkip} />;
      
      case "easy-access":
        return <EasyAccessScreen onNext={handleComplete} onSkip={handleSkip} />;
      
      default:
        return <BetaWelcomeScreen onNext={handleWelcomeNext} onSkip={handleSkip} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {renderStep()}
    </div>
  );
};

export default Onboarding;
