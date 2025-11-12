import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { WelcomeScreen } from "@/components/onboarding/WelcomeScreen";
import { BetaContextScreen } from "@/components/onboarding/BetaContextScreen";
import { TerritoryChoiceScreen } from "@/components/onboarding/TerritoryChoiceScreen";
import { TerritoryCoveredScreen } from "@/components/onboarding/TerritoryCoveredScreen";
import { TerritoryNotCoveredScreen } from "@/components/onboarding/TerritoryNotCoveredScreen";
import { PrivacyConsentScreen } from "@/components/onboarding/PrivacyConsentScreen";
import { toast } from "sonner";

type OnboardingStep = 
  | "welcome" 
  | "beta-context" 
  | "territory-choice" 
  | "territory-covered" 
  | "territory-not-covered"
  | "privacy-consent";

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [territoryId, setTerritoryId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleWelcomeNext = () => {
    setCurrentStep("beta-context");
  };

  const handleBetaContextNext = () => {
    setCurrentStep("territory-choice");
  };

  const handleTerritoryChoice = (selectedTerritoryId: string | null, isCovered: boolean) => {
    setTerritoryId(selectedTerritoryId);
    
    if (isCovered) {
      setCurrentStep("territory-covered");
    } else {
      setCurrentStep("territory-not-covered");
    }
  };

  const handleTerritorySkip = () => {
    localStorage.setItem("userTerritoryMode", "discovery");
    setCurrentStep("privacy-consent");
  };

  const handleTerritoryCoveredNext = () => {
    setCurrentStep("privacy-consent");
  };

  const handleDiscoverDemo = () => {
    localStorage.setItem("userTerritoryMode", "demo");
    setCurrentStep("privacy-consent");
  };

  const handleNotifyMe = () => {
    // TODO: Implémenter l'inscription à la liste d'attente
    toast.success("Nous te préviendrons dès que Flooow arrive dans ton territoire !");
    handleDiscoverDemo();
  };

  const handleComplete = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    
    if (territoryId) {
      localStorage.setItem("userTerritoryId", territoryId);
    }
    
    navigate("/");
  };

  const renderStep = () => {
    switch (currentStep) {
      case "welcome":
        return <WelcomeScreen onNext={handleWelcomeNext} />;
      
      case "beta-context":
        return <BetaContextScreen onNext={handleBetaContextNext} />;
      
      case "territory-choice":
        return (
          <TerritoryChoiceScreen 
            onNext={handleTerritoryChoice}
            onSkip={handleTerritorySkip}
          />
        );
      
      case "territory-covered":
        return <TerritoryCoveredScreen onNext={handleTerritoryCoveredNext} />;
      
      case "territory-not-covered":
        return (
          <TerritoryNotCoveredScreen 
            onDiscoverDemo={handleDiscoverDemo}
            onNotifyMe={handleNotifyMe}
          />
        );
      
      case "privacy-consent":
        return <PrivacyConsentScreen onComplete={handleComplete} />;
      
      default:
        return <WelcomeScreen onNext={handleWelcomeNext} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {renderStep()}
    </div>
  );
};

export default Onboarding;
