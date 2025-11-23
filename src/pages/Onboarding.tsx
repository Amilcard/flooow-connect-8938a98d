import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NewOnboardingStep, OnboardingContent } from "@/components/onboarding/NewOnboardingStep";
import { Sparkles, MapPin, Calculator, Smartphone } from "lucide-react";
import logoFlooow from "@/assets/logo-flooow.svg";
import logoNananere from "@/assets/logo-nananere.svg";

type OnboardingStepId = 1 | 2 | 3 | 4;

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStepId>(1);
  const navigate = useNavigate();
  
  // Récupérer le compteur de visites pour afficher conditionnellement le bouton de désactivation
  const viewCount = parseInt(localStorage.getItem("onboardingViewCount") || "0");
  const showDisableButton = viewCount >= 2;

  const handleComplete = () => {
    navigate("/home", { replace: true });
  };

  const handleSkip = () => {
    navigate("/home", { replace: true });
  };

  const handleDisableOnboarding = () => {
    localStorage.setItem("hasDisabledOnboarding", "true");
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

  // Composant Logo en transparence pour les écrans 1 et 4
  const LogoIllustration = ({ logo }: { logo: string; gradient?: string }) => (
    <div className="relative inline-block mb-6">
      <div className="w-48 h-48 flex items-center justify-center">
        <img src={logo} alt="Flooow" className="w-full h-full object-contain" />
      </div>
      <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-md">
        <span className="text-white text-sm font-bold">β</span>
      </div>
    </div>
  );

  // Composant Icon pour les écrans 2 et 3
  const IconIllustration = ({ icon: Icon, gradient }: { icon: any; gradient: string }) => (
    <div className="relative inline-block mb-6">
      <div className={`w-32 h-32 rounded-3xl ${gradient} flex items-center justify-center shadow-xl`}>
        <Icon className="w-20 h-20 text-white" strokeWidth={1.5} />
      </div>
    </div>
  );



  // Configuration des étapes
  const steps: Record<OnboardingStepId, {
    title: string;
    content: OnboardingContent;
    logo?: string;
    icon?: any;
    gradient: string;
    navigation: {
      back?: { label: string };
      skip?: { label: string };
      continue: { label: string };
    };
  }> = {
    1: {
      title: "Bienvenue les Flooow Testeurs",
      content: {
        intro: "Vous faites partie des premiers à tester l'appli. On a une idée simple : vous aider à trouver des activités pour vos enfants sans exploser le budget.",
        bulletPoints: [
          "Vous testez, on écoute, on ajuste",
          "Bugs, idées, remarques : on note tout",
          "L'objectif : une appli pensée pour les familles"
        ],
        closing: "Tout n'est pas encore parfait, c'est justement le principe de cette version. Merci de jouer le jeu !"
      },
      logo: logoFlooow,
      gradient: "bg-gradient-to-br from-orange-500 to-pink-500",
      navigation: {
        continue: { label: "CONTINUER" }
      }
    },
    2: {
      title: "On repère les activités près de chez vous",
      content: {
        intro: "Sport, culture, loisirs, scolarité : tout au même endroit.\n\nVous vous géolocalisez, on vous montre ce qui existe vraiment autour de vous.",
        bulletPoints: [
          "Activités triées par thématique, âge, secteur et budget",
          "Infos claires : horaires, lieu, contacts",
          "Résultats pensés pour les familles"
        ],
        highlight: "Économies : temps + trajets = moins de CO₂"
      },
      icon: MapPin,
      gradient: "bg-gradient-to-br from-blue-500 to-cyan-500",
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
      icon: Calculator,
      gradient: "bg-gradient-to-br from-purple-500 to-indigo-500",
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
      logo: logoNananere,
      gradient: "bg-gradient-to-br from-green-500 to-emerald-500",
      navigation: {
        back: { label: "← Retour" },
        skip: { label: "Passer →" },
        continue: { label: "C'EST PARTI !" }
      }
    }
  };

  const currentStepData = steps[currentStep];

  // Choisir l'illustration appropriée selon l'écran
  const illustration = currentStepData.logo 
    ? <LogoIllustration logo={currentStepData.logo} />
    : <IconIllustration icon={currentStepData.icon} gradient={currentStepData.gradient} />;

  return (
    <NewOnboardingStep
      data-tour-id={`onboarding-step-${currentStep}`}
      title={currentStepData.title}
      content={currentStepData.content}
      illustration={illustration}
      currentStep={currentStep}
      totalSteps={4}
      onNext={handleNext}
      onBack={currentStepData.navigation.back ? handleBack : undefined}
      onSkip={currentStepData.navigation.skip ? handleSkip : undefined}
      onDisable={handleDisableOnboarding}
      showDisableButton={showDisableButton}
      navigationLabels={{
        back: currentStepData.navigation.back?.label,
        skip: currentStepData.navigation.skip?.label,
        continue: currentStepData.navigation.continue.label
      }}
    />
  );
};

export default Onboarding;
