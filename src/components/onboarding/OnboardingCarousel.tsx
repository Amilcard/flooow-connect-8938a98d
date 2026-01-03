import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StrictOnboardingScreen, StrictOnboardingScreenConfig } from "./StrictOnboardingScreen";

// Assets - Static (small files)
import logoFlooow from "@/assets/logo-flooow.png";
// Lottie animations loaded dynamically to reduce initial bundle

export const OnboardingCarousel = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [familiaAnimation, setFamiliaAnimation] = useState<object | null>(null);
  const [financeGuruAnimation, setFinanceGuruAnimation] = useState<object | null>(null);
  const [confetiAnimation, setConfetiAnimation] = useState<object | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const totalSteps = 4;

  // Load familia immediately (needed for step 1)
  useEffect(() => {
    import("@/assets/lottie/familia.json")
      .then((data) => setFamiliaAnimation(data.default))
      .catch(() => { /* Animation load failed silently */ });
  }, []);

  // Preload animations progressively
  useEffect(() => {
    if (currentStep >= 1 && !financeGuruAnimation) {
      import("@/assets/lottie/finance-guru.json")
        .then((data) => setFinanceGuruAnimation(data.default))
        .catch(() => { /* Animation load failed silently */ });
    }
    if (currentStep >= 2 && !confetiAnimation) {
      import("@/assets/lottie/confeti.json")
        .then((data) => setConfetiAnimation(data.default))
        .catch(() => { /* Animation load failed silently */ });
    }
  }, [currentStep, financeGuruAnimation, confetiAnimation]);

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
    // Le compteur est déjà incrémenté dans Splash.tsx
    // Pas besoin de le modifier ici
    navigate("/home", { replace: true });
  };

  const handleSkip = () => {
    // Si l'utilisateur a coché "Ne plus afficher", sauvegarder la préférence
    if (dontShowAgain) {
      localStorage.setItem("onboardingDisabled", "true");
    }
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
    title: "Bienvenue parmi les Flooow-testeurs",
    body: "Vous testez une version en cours de construction : il peut rester des bugs, mais vos retours nous aident à améliorer l'appli pour toutes les familles. Merci de jouer le jeu (et de nous le dire quand ça coince).",
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
    title: "Des activités, sans chasse au trésor administrative",
    body: "Flooow rassemble pour vous les activités sport, culture, loisirs, scolarité et vacances autour de chez vous. Vous filtrez par âge, envies, budget… et l'appli vous évite de partir à la pêche aux infos sur dix sites différents.",
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
    title: "Comprendre vos aides",
    body: "Pass'Sport, CAF, aides locales... Flooow estime ce à quoi vous pourriez prétendre selon votre situation. Vous ne savez pas si vous avez des aides ? Flooow est là pour ça. Plus besoin de jongler entre les guichets.",
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
  // Background animation only shown if loaded (graceful degradation)
  const screen4Config: StrictOnboardingScreenConfig = {
    meta: {
      important: "Utilisation de l'animation Confetti en fond et du logo Flooow en illustration."
    },
    screenId: "onboarding_4",
    layout: {
      type: "vertical",
      safeArea: true,
      paddingHorizontal: 24,
      spacing: 22,
      ...(confetiAnimation && {
        background: {
          type: "lottie" as const,
          file: confetiAnimation,
          loop: true,
          autoplay: true,
          opacity: 0.35,
          mode: "cover" as const
        }
      })
    },
    illustration: {
      file: logoFlooow,
      type: "image",
      heightPercent: 45,
      loop: false,
      autoplay: false,
      className: "animate-in slide-in-from-bottom duration-1000 max-w-[300px]"
    },
    title: "Vous testez, nous améliorons (promis, on essaie vite)",
    body: (
      <span>
        Vous naviguez, vous cherchez, vous cliquez… et si quelque chose vous semble bizarre, manquant ou incomplet, c'est normal : vous êtes en terrain d'expérimentation. Grâce à vos retours, nous ajustons les infos, les écrans et les parcours pour que les familles suivantes aient un trajet beaucoup plus fluide.
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
      onSkip={handleSkip}
      dontShowAgain={dontShowAgain}
      onDontShowAgainChange={setDontShowAgain}
    />
  );
};
