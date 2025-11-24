import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StrictOnboardingScreen, StrictOnboardingScreenConfig } from "./StrictOnboardingScreen";

// Assets
import logoFlooow from "@/assets/logo-flooow.svg";
import familiaAnimation from "@/assets/lottie/familia.json";
import financeGuruAnimation from "@/assets/lottie/finance-guru.json";
import confetiAnimation from "@/assets/lottie/confeti.json";
import logoNananere from "@/assets/logo-nananere.png";

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

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
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
      className: "animate-in fade-in zoom-in duration-1000"
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
      file: familiaAnimation,
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
      file: financeGuruAnimation,
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

  // Configuration for Screen 4 (Strictly from JSON)
  const screen4Config: StrictOnboardingScreenConfig = {
    meta: {
      important: "Utilisation de l'animation Confetti en fond et du slogan Nananere en illustration."
    },
    screenId: "onboarding_4",
    layout: {
      type: "vertical",
      safeArea: true,
      paddingHorizontal: 24,
      spacing: 22,
      background: {
        type: "lottie",
        file: confetiAnimation,
        loop: true,
        autoplay: true,
        opacity: 0.35,
        mode: "cover"
      }
    },
    illustration: {
      file: logoNananere,
      type: "image",
      heightPercent: 45,
      loop: false,
      autoplay: false,
      className: "animate-in slide-in-from-bottom duration-1000 max-w-[300px]"
    },
    title: "Flooow, votre outil du quotidien",
    body: (
      <span>
        Trouver une activité, estimer vos aides financières, recevoir les infos locales, organiser vos déplacements : Flooow simplifie vos semaines. Votre quotidien, mais sans la prise de tête.
        <span className="block mt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 font-medium text-primary text-lg">
          Merci d'être là.
        </span>
      </span>
    ),
    cta: {
      label: "Commencer",
      action: "close_onboarding",
      position: "bottom"
    },
    pagination: {
      index: 3,
      total: 4,
      alignment: "center"
    }
  };

  const screens = [screen1Config, screen2Config, screen3Config, screen4Config];

  return (
    <StrictOnboardingScreen 
      config={screens[currentStep]} 
      onNext={handleNext}
      onPrevious={currentStep > 0 ? handlePrevious : undefined}
    />
  );
};
