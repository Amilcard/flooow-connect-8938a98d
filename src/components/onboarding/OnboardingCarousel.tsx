import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingScreen, AnimationConfig, IllustrationConfig } from "./OnboardingScreen";
import { ProgressDots } from "./ProgressDots";
import { OnboardingNavigation } from "./navigation/OnboardingNavigation";
import { PartyPopper, Brush, Book, Calculator, Bike, MapPin, Search, Heart, ChevronLeft, Sparkles } from "lucide-react";

// Assets
import logoFlooow from "@/assets/logo-flooow.png";
import logoNananere from "@/assets/logo-nananere.png";
import familiaAnimation from "@/assets/lottie/familia.json";
import financeGuruAnimation from "@/assets/lottie/finance-guru.json";

// Using existing assets as proxies for requested ones
const studentAnimation = familiaAnimation; 

export const OnboardingCarousel = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem("onboardingViewCount", "1"); // Mark as viewed
    navigate("/home", { replace: true });
  };

  // Screen Data Configuration
  const screens = [
    {
      id: 1,
      title: "Bienvenue dans la version test",
      text: "Vous faites partie des premiers à découvrir Flooow. Dites-nous ce qui fonctionne, ce qui manque, et ce qui mérite d’être simplifié : chaque retour compte.",
      animation: {
        type: "image",
        imageSrc: logoFlooow,
        cssClass: "w-40 h-40 object-contain animate-draw-appear" // Reduced size, draw animation
      } as AnimationConfig,
      illustration: {
        type: "none" // REMOVED floating icons
      } as IllustrationConfig,
      additionalContent: (
        <div className="absolute bottom-0 right-0 animate-pop" style={{ animationDelay: "0.5s" }}>
           <div className="relative">
             <div className="bg-white text-xs font-bold px-2 py-1 rounded-full shadow-sm border border-gray-100 transform -rotate-6 text-primary">
               nananère
             </div>
           </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Votre reste à charge… sans la prise de tête",
      text: (
        <span>
          Vous obtenez ici une <span className="font-bold text-primary bg-primary/10 px-1 rounded animate-sparkle">estimation</span> de vos aides et du reste à charge. Pas un devis, mais une idée claire pour anticiper avant de contacter l’organisme.
        </span>
      ),
      animation: {
        type: "lottie",
        lottieData: financeGuruAnimation,
        cssClass: "w-full h-full max-h-[260px] mt-[-20px]" // Reduced top margin
      } as AnimationConfig,
      illustration: {
        type: "none"
      } as IllustrationConfig
    },
    {
      id: 3,
      title: "Des activités… vraiment à côté de chez vous",
      text: "Nous vous montrons ce qui existe autour de vous : par âge, budget ou horaires. Et nous proposons le trajet le plus simple, souvent celui qui fait du bien à vous… et à la planète.",
      animation: {
        type: "lottie",
        lottieData: studentAnimation,
        cssClass: "w-full h-full max-h-[170px]" // Forced height 170px
      } as AnimationConfig,
      illustration: {
        type: "none"
      } as IllustrationConfig,
      additionalContent: (
        <div className="absolute top-0 right-10 animate-pulse-scale">
          <MapPin className="text-primary w-10 h-10 drop-shadow-md" fill="currentColor" />
        </div>
      )
    },
    {
      id: 4,
      title: "Bienvenue sur Flooow",
      text: (
        <div className="flex flex-col gap-4 justify-center h-full">
          <span>Trouvez facilement des activités, vos aides, vos mobilités… sans passer votre soirée sur Internet. Votre quotidien, mais en plus simple.</span>
          <span className="font-bold text-lg text-primary">Merci d’être là !!</span>
        </div>
      ),
      animation: {
        type: "image",
        imageSrc: logoFlooow,
        cssClass: "w-48 h-48 object-contain animate-draw-appear"
      } as AnimationConfig,
      illustration: {
        type: "none" // REMOVED floating icons
      } as IllustrationConfig
    }
  ];

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Top Bar with Back and Skip */}
      <div className="flex justify-between items-center p-4 h-16 z-20">
        {currentStep > 1 ? (
          <button 
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Retour"
          >
            <ChevronLeft size={24} />
          </button>
        ) : (
          <div className="w-10" /> /* Spacer */
        )}

        {currentStep < totalSteps && (
          <button 
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 text-sm font-medium px-4 py-2"
          >
            Passer
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative w-full max-w-lg mx-auto flex flex-col justify-center">
        {screens.map((screen) => (
          <OnboardingScreen
            key={screen.id}
            title={screen.title}
            text={screen.text}
            animation={screen.animation}
            illustration={screen.illustration}
            isActive={currentStep === screen.id}
            additionalContent={screen.additionalContent}
            data-tour-id={`onboarding-step-${screen.id}`}
          />
        ))}
      </div>

      {/* Bottom Navigation Area */}
      <div className="w-full max-w-lg mx-auto bg-white pt-2 pb-8 z-20">
        <ProgressDots 
          totalSteps={totalSteps} 
          currentStep={currentStep} 
          className="mb-6"
        />
        
        <OnboardingNavigation
          onNext={handleNext}
          onSkip={handleSkip}
          isLastStep={currentStep === totalSteps}
          labels={{
            next: "Continuer",
            start: "C’est parti",
            skip: "Passer"
          }}
        />
      </div>
    </div>
  );
};
