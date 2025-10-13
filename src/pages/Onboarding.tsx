import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, MapPin, Euro, Heart } from "lucide-react";

const onboardingSteps = [
  {
    icon: <MapPin className="w-20 h-20 text-primary" />,
    title: "Trouvez des activités à proximité",
    description: "Découvrez des activités adaptées à vos enfants près de chez vous"
  },
  {
    icon: <Euro className="w-20 h-20 text-accent" />,
    title: "Bénéficiez d'aides financières",
    description: "Accédez aux aides CAF, PassSport et autres dispositifs disponibles"
  },
  {
    icon: <Heart className="w-20 h-20 text-primary" />,
    title: "Accessibilité pour tous",
    description: "Des activités adaptées pour tous les enfants, avec ou sans handicap"
  }
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem("hasSeenOnboarding", "true");
      navigate("/");
    }
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    navigate("/");
  };

  const step = onboardingSteps[currentStep];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8">
        <div className="space-y-6">
          {step.icon}
          <h2 className="text-2xl font-bold">{step.title}</h2>
          <p className="text-muted-foreground text-lg">{step.description}</p>
        </div>

        <div className="flex gap-2">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-6 space-y-3">
        <Button
          onClick={handleNext}
          className="w-full h-14"
          size="lg"
        >
          {currentStep < onboardingSteps.length - 1 ? "Suivant" : "Commencer"}
          <ChevronRight className="ml-2" />
        </Button>
        
        {currentStep < onboardingSteps.length - 1 && (
          <Button
            onClick={handleSkip}
            variant="ghost"
            className="w-full"
          >
            Passer
          </Button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
