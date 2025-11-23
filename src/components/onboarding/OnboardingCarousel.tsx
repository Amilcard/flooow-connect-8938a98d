import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StrictOnboardingScreen, StrictOnboardingScreenConfig } from "./StrictOnboardingScreen";

// Assets
import logoFlooow from "@/assets/logo-flooow.png";
import familiaAnimation from "@/assets/lottie/familia.json";
import financeGuruAnimation from "@/assets/lottie/finance-guru.json";

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

  // Configuration for Screen 2 (Strictly from JSON)
  const screen2Config: StrictOnboardingScreenConfig = {
    meta: {
      important: "Ne pas réutiliser les styles actuels. Antigravity doit respecter le layout vertical simple : illustration 50%, texte 35%, CTA 15%."
    },
    screenId: "onboarding_2",
    layout: {
      type: "vertical",
      safeArea: true,
      paddingHorizontal: 24,
      spacing: 20
    },
    illustration: {
      file: familiaAnimation, // Correct assignment for Screen 2
      type: "lottie",
      heightPercent: 50,
      loop: true,
      autoplay: true
    },
    title: "Trouvez une activité en quelques clics",
    body: "Fini de passer votre samedi matin à chercher sur dix sites différents. Tapez un mot-clé, filtrez par âge, budget ou période. On affiche les activités près de chez vous, avec toutes les infos utiles.",
    cta: {
      label: "Suivant",
      action: "next_onboarding"
    },
    pagination: {
      index: 1,
      total: 4
    }
  };

  // Configuration for Screen 3 (Strictly from JSON)
  const screen3Config: StrictOnboardingScreenConfig = {
    meta: {
      important: "Respect strict du texte et des proportions. Pas de style hérité du design actuel. Compatibilité Lovable à valider avant écriture."
    },
    screenId: "onboarding_3",
    layout: {
      type: "vertical",
      safeArea: true,
      paddingHorizontal: 24,
      spacing: 20
    },
    illustration: {
      file: financeGuruAnimation, // JSON says "Finance guru.json", mapped to imported asset
      type: "lottie",
      heightPercent: 50,
      loop: true,
      autoplay: true
    },
    title: "Comprendre enfin les aides disponibles",
    body: "CAF, aides nationales, dispositifs locaux... On fait le calcul pour vous. Flooow estime ce à quoi vous avez droit selon votre situation familiale. Plus besoin de jongler entre les guichets.",
    cta: {
      label: "Suivant",
      action: "next_onboarding"
    },
    pagination: {
      index: 2,
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

  const screens = [screen1Config, screen2Config, screen3Config, placeholderConfig];

  return (
    <StrictOnboardingScreen 
      config={screens[currentStep]} 
      onNext={handleNext}
    />
  );
};
