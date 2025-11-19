import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NewOnboardingStep, OnboardingContent } from "@/components/onboarding/NewOnboardingStep";

// Placeholder transparent 1x1 pour désactiver les images (en attendant les vraies illustrations)
// TODO: Remplacer par les vraies illustrations quand disponibles
import onboarding1 from "@/assets/onboarding-megaphone.png";
import onboarding2 from "@/assets/onboarding-activites.png";
import onboarding3 from "@/assets/onboarding-aides.png";
import onboarding4 from "@/assets/onboarding-community.png";

// Fallback si les images n'existent pas encore
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3C/svg%3E";

type OnboardingStepId = 1 | 2 | 3 | 4;

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStepId>(1);
  const navigate = useNavigate();

  const handleComplete = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    navigate("/home", { replace: true });
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    navigate("/home", { replace: true });
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as OnboardingStepId);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as OnboardingStepId);
    }
  };

  // Configuration des étapes
  const steps: Record<OnboardingStepId, {
    title: string;
    content: OnboardingContent;
    illustration: string;
    navigation: {
      back?: { label: string };
      skip?: { label: string };
      continue: { label: string };
    };
  }> = {
    1: {
      title: "Bienvenue dans la bêta Flooow",
      content: {
        intro: "Vous faites partie des premiers à tester l'appli. On a une idée simple : vous aider à trouver des activités pour vos enfants sans exploser le budget.",
        bulletPoints: [
          "Vous testez, on écoute, on ajuste",
          "Bugs, idées, remarques : on note tout",
          "L'objectif : une appli pensée pour les familles"
        ],
        closing: "Tout n'est pas encore parfait, c'est justement le principe de cette version. Merci de jouer le jeu !"
      },
      illustration: onboarding1 || PLACEHOLDER_IMAGE,
      navigation: {
        continue: { label: "CONTINUER" }
      }
    },
    2: {
      title: "On repère les activités près de chez vous",
      content: {
        intro: "Sport, culture, loisirs, scolarité : tout au même endroit.\n\nVous indiquez votre géolocalisation, on vous montre ce qui existe vraiment autour de vous.",
        bulletPoints: [
          "Activités triées par thématique, âge, secteur et budget",
          "Infos claires : horaires, lieu, contacts",
          "Résultats pensés pour les familles"
        ],
        highlight: "Économies : temps + trajets = moins de CO₂"
      },
      illustration: onboarding2 || PLACEHOLDER_IMAGE,
      navigation: {
        back: { label: "← Retour" },
        skip: { label: "Passer →" },
        continue: { label: "CONTINUER" }
      }
    },
    3: {
      title: "On fait le point sur vos aides",
      content: {
        intro: "Flooow repère les aides financières qui peuvent alléger le coût des activités de vos enfants et ados de 4 à 17 ans.\n\nVous renseignez quelques infos, on vous donne une estimation claire du reste à charge.",
        bulletPoints: [
          "Moins de paperasse, plus de visibilité",
          "Un simulateur pour ne rien rater",
          "Un objectif : soulager votre budget"
        ],
        highlight: "Économies : argent + temps",
        ecoMobilite: "Flooow vous propose également les meilleures solutions transport pour rejoindre vos activités : transports en commun, marche santé et covoiturage, lorsque ces informations sont disponibles sur votre territoire."
      },
      illustration: onboarding3 || PLACEHOLDER_IMAGE,
      navigation: {
        back: { label: "← Retour" },
        skip: { label: "Passer →" },
        continue: { label: "CONTINUER" }
      }
    },
    4: {
      title: "Flooow, votre guichet unique du quotidien",
      content: {
        intro: "Une appli testée avec de vraies familles, pour de vrais besoins.\n\nAu menu aussi : infos pratiques, agenda local, espace parent, notifications.",
        sectionTitle: "Flooow, c'est bon pour :",
        bulletPoints: [
          "Votre portefeuille : aides et bons plans repérés",
          "Votre temps : tout centralisé, sans prise de tête",
          "La planète : des activités de proximité, des trajets malins"
        ],
        closing: "Alors, qu'est-ce qu'on dit ?"
      },
      illustration: onboarding4 || PLACEHOLDER_IMAGE,
      navigation: {
        back: { label: "← Retour" },
        skip: { label: "Passer →" },
        continue: { label: "C'EST PARTI !" }
      }
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <NewOnboardingStep
      title={currentStepData.title}
      content={currentStepData.content}
      illustration={currentStepData.illustration}
      currentStep={currentStep}
      totalSteps={4}
      onNext={handleNext}
      onBack={currentStepData.navigation.back ? handleBack : undefined}
      onSkip={currentStepData.navigation.skip ? handleSkip : undefined}
      navigationLabels={{
        back: currentStepData.navigation.back?.label,
        skip: currentStepData.navigation.skip?.label,
        continue: currentStepData.navigation.continue.label
      }}
    />
  );
};

export default Onboarding;
