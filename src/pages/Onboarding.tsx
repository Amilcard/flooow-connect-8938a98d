import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NewOnboardingStep } from "@/components/onboarding/NewOnboardingStep";

/**
 * Onboarding 4 écrans - Ton CityCrunch (réécriture complète)
 * ONBOARDING_CITYCRUNCH_REWRITE
 *
 * Ordre des slides :
 * 1. Bienvenue dans la communauté Flooow (version bêta)
 * 2. On fait le point sur vos aides (simulateur)
 * 3. On repère les activités près de chez vous (catalogue)
 * 4. Flooow, c'est vous et nous (communauté testeurs)
 *
 * Ton : clair, complice, légèrement décalé • Sans emojis
 */

type OnboardingStepType = "bienvenue" | "activites" | "aides" | "communaute";

// Placeholder transparent 1x1 pour désactiver les images
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3C/svg%3E";

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStepType>("bienvenue");
  const navigate = useNavigate();

  const handleComplete = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    navigate("/signup", { replace: true });
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    navigate("/home", { replace: true });
  };

  const steps = {
    bienvenue: {
      title: "Bienvenue dans la communauté Flooow",
      body: "Vous testez la version bêta de l'appli.\n\nOn a une idée folle : faciliter la vie des parents et des ados pour trouver des activités sans exploser le budget. Vous faites partie des premiers à tester Flooow et vos retours vont peser lourd dans la suite du projet.\n\n• Vous testez, on écoute, on ajuste\n• On note tous les bugs, les idées, les remarques\n• L'objectif : une appli simple, utile et vraiment pensée pour les familles\n\nMerci de jouer le jeu jusqu'au bout, même si tout n'est pas encore parfait. C'est justement le but de cette version.",
      illustration: PLACEHOLDER_IMAGE,
      accentColor: "orange" as const,
      onNext: () => setCurrentStep("aides"),
      stepNumber: 1,
      isLastStep: false,
      primaryCtaLabel: "Créer mon compte"
    },
    aides: {
      title: "On fait le point sur vos aides",
      body: "Vos enfants et adolescents de 4 à 17 ans. Vos droits. Vos économies.\n\nFlooow repère les aides qui peuvent alléger le coût des activités de vos enfants. Vous renseignez quelques infos, on vous donne une estimation claire du reste à charge.\n\n• Moins de paperasse, plus de visibilité\n• Un simulateur pour éviter de passer à côté d'une aide\n• Un objectif simple : faire du bien à votre portefeuille, sans mauvaise surprise\n\nPas de calcul compliqué : vous répondez à quelques questions, on s'occupe du reste.",
      illustration: PLACEHOLDER_IMAGE,
      accentColor: "orange" as const,
      onNext: () => setCurrentStep("activites"),
      stepNumber: 2,
      isLastStep: false,
      primaryCtaLabel: "Suivant"
    },
    activites: {
      title: "On repère les activités près de chez vous",
      body: "Sport, culture, loisirs, soutien scolaire : tout au même endroit.\n\nFlooow rassemble l'offre de votre territoire pour vos enfants et ados de 4 à 17 ans. Vous indiquez votre zone, vos envies, et on vous montre ce qui existe vraiment autour de chez vous.\n\n• Des activités triées par âge, quartier et budget\n• Des infos claires : horaires, lieu, accessibilité, contacts\n• Des résultats pensés pour les familles, pas pour les moteurs de recherche\n\nSi une activité manque, vous pourrez aussi nous le dire : c'est comme ça qu'on améliore la carte du territoire.",
      illustration: PLACEHOLDER_IMAGE,
      accentColor: "blue" as const,
      onNext: () => setCurrentStep("communaute"),
      stepNumber: 3,
      isLastStep: false,
      primaryCtaLabel: "Suivant"
    },
    communaute: {
      title: "Flooow, c'est vous et nous",
      body: "Une appli testée en conditions réelles, avec de vraies familles.\n\nDerrière Flooow, il y a une petite équipe et des partenaires locaux, mais surtout des parents, des enfants et des ados qui donnent leur avis sans filtre. Vos retours nous aident à construire un outil utile pour trois choses :\n\n• Votre portefeuille : mieux utiliser les aides et éviter les dépenses inutiles\n• Votre territoire : valoriser les clubs, les structures et les projets près de chez vous\n• La planète : encourager les trajets malins et les activités accessibles sans voiture\n\nPendant toute la période de test, vous serez guidés pas à pas. On vous expliquera les parcours, on vous demandera parfois votre avis et on vous laissera toujours le choix.",
      illustration: PLACEHOLDER_IMAGE,
      accentColor: "blue" as const,
      onNext: handleComplete,
      stepNumber: 4,
      isLastStep: true,
      primaryCtaLabel: "C'est parti",
      showSocialIcons: false
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
      totalSteps={4}
      onNext={currentStepData.onNext}
      onSkip={handleSkip}
      isLastStep={currentStepData.isLastStep}
      primaryCtaLabel={currentStepData.primaryCtaLabel}
      showSocialIcons={currentStepData.showSocialIcons}
    />
  );
};

export default Onboarding;
