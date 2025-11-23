import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StrictOnboardingScreen, StrictOnboardingScreenConfig } from "./StrictOnboardingScreen";

// Assets
import logoFlooow from "@/assets/logo-flooow.png";

export const OnboardingCarousel = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem("onboardingViewCount", "1");
    navigate("/home", { replace: true });
  };

  // Configuration for Screen 1 (Strictly from JSON)
  const screen1Config: StrictOnboardingScreenConfig = {
    meta: {
      important: "Utilisation du logo Flooow statique (PNG) avec animation CSS."
    },
    screenId: "onboarding_1",
    layout: {
      type: "vertical",
      safeArea: true,
      paddingHorizontal: 24,
      spacing: 20
    },
    illustration: {
      file: logoFlooow,
      type: "image",
      heightPercent: 50,
      loop: false,
      autoplay: false,
      className: "animate-in fade-in zoom-in duration-1000" // Added animation
    },
    title: "Bienvenue chez les testeurs Flooow",
    body: "Trouver une activité pour son enfant, c'est souvent la course d'obstacles. Infos éparpillées, tarifs flous, aides impossibles à comprendre. Ici, on simplifie tout ça. Vous testez, vous nous dites ce qui coince, on améliore ensemble.",
    cta: {
      label: "Continuer",
      action: "next_onboarding"
    },
    pagination: {
      index: 0,
      total: 4
    }
  };

  // Placeholders for other screens to ensure build passes
  const placeholderConfig: StrictOnboardingScreenConfig = {
    ...screen1Config,
    title: "Coming Soon",
    body: "This screen is under construction.",
    screenId: "placeholder"
  };

  const screens = [screen1Config, placeholderConfig, placeholderConfig, placeholderConfig];

  return (
    <StrictOnboardingScreen 
      config={screens[currentStep]} 
      onNext={handleNext}
    />
  );
};
