/**
 * Quiz Zéro non-recours - Refonte UX
 * Layout aéré : 1 question = 1 écran
 * Progress bar + grands tap targets + "Je ne sais pas"
 * Respecte prefers-reduced-motion
 */
import { useState, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

// Lazy load Lottie pour optimisation bundle
const Lottie = lazy(() => import("lottie-react"));

type Answer = "Oui" | "Non" | "Je ne sais pas" | null;

const questions = [
  { id: "q1", text: "Connaissez-vous les coups de pouce qui existent pour les activités des enfants ?" },
  { id: "q2", text: "Avez-vous déjà hésité devant le prix d'une activité ?" },
  { id: "q3", text: "Savez-vous à qui vous adresser pour obtenir des infos sur les aides ?" },
  { id: "q4", text: "Les aides pour les colos et séjours, vous connaissez ?" },
  { id: "q5", text: "Utilisez-vous déjà certaines de ces aides ?" },
  { id: "q6", text: "Aimeriez-vous découvrir les aides auxquelles vous avez droit ?" }
];

export default function NonRecoursQuiz() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<{[key: string]: Answer}>({});
  const [showResult, setShowResult] = useState(false);
  const [confettiData, setConfettiData] = useState<object | null>(null);

  const totalSteps = questions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const currentQuestion = questions[currentStep];
  const currentAnswer = answers[currentQuestion?.id] || null;

  const handleAnswer = (answer: Answer) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
  };

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Dernière question - afficher résultat
      setShowResult(true);
      const ouiCount = Object.values(answers).filter(a => a === "Oui").length;
      if (ouiCount >= 3) {
        const data = await import("@/assets/lottie/confeti.json");
        setConfettiData(data.default);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const ouiCount = Object.values(answers).filter(a => a === "Oui").length;
  const isDejaAuClair = ouiCount >= 3;

  if (showResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] max-w-[560px] mx-auto px-6 py-8 text-center space-y-6">
        {/* Confetti animation - lazy loaded, motion-safe */}
        {confettiData && (
          <div className="fixed inset-0 pointer-events-none z-50 motion-safe:block motion-reduce:hidden">
            <Suspense fallback={null}>
              <Lottie animationData={confettiData} loop={false} className="w-full h-full" />
            </Suspense>
          </div>
        )}

        {/* Icône résultat */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isDejaAuClair ? 'bg-emerald-100' : 'bg-orange-100'}`}>
          <Check className={`w-10 h-10 ${isDejaAuClair ? 'text-emerald-600' : 'text-orange-600'}`} />
        </div>

        {isDejaAuClair ? (
          <>
            <h3 className="text-2xl font-bold text-foreground">
              Super, vous êtes déjà bien informé !
            </h3>
            <p className="text-muted-foreground leading-relaxed max-w-md">
              Vous connaissez les bons plans pour les activités de vos enfants.
              Continuez comme ça !
            </p>
            <div className="flex flex-col gap-3 w-full max-w-xs pt-4">
              <Button
                onClick={() => navigate('/search')}
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6 text-base font-semibold"
              >
                Trouver une activité
              </Button>
              <Button
                onClick={() => navigate('/aides')}
                variant="outline"
                className="w-full rounded-full py-6 text-base"
              >
                Voir le détail de mes aides
              </Button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-2xl font-bold text-foreground">
              Il y a des pistes à explorer !
            </h3>
            <p className="text-muted-foreground leading-relaxed max-w-md">
              Bonne nouvelle : des aides existent pour les activités des enfants.
              On vous aide à y voir plus clair.
            </p>
            <div className="flex flex-col gap-3 w-full max-w-xs pt-4">
              <Button
                onClick={() => navigate('/aides')}
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6 text-base font-semibold"
              >
                Découvrir mes aides
              </Button>
              <Button
                onClick={() => navigate('/search')}
                variant="outline"
                className="w-full rounded-full py-6 text-base"
              >
                Voir les activités près de moi
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[450px] max-w-[560px] mx-auto">
      {/* Header avec progress */}
      <div className="px-6 pt-6 pb-4 space-y-4">
        {/* Étape indicator */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Étape {currentStep + 1}/{totalSteps}</span>
          <span className="text-muted-foreground font-medium">Quiz aides</span>
        </div>
        
        {/* Progress bar */}
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-300 motion-reduce:transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question area - centré verticalement */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <h3 className="text-xl md:text-2xl font-semibold text-foreground leading-relaxed mb-8 text-center">
          {currentQuestion.text}
        </h3>

        {/* Options - grands boutons pleine largeur */}
        <div className="space-y-3">
          {(["Oui", "Non", "Je ne sais pas"] as Answer[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleAnswer(option)}
              className={`w-full p-4 md:p-5 rounded-2xl border-2 text-left font-medium text-base md:text-lg transition-all duration-200 motion-reduce:transition-none ${
                currentAnswer === option
                  ? "bg-primary text-white border-primary shadow-lg"
                  : "bg-background text-foreground border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Footer avec navigation */}
      <div className="px-6 pb-6 pt-4 border-t border-border/50">
        <div className="flex items-center gap-3">
          {/* Bouton Retour */}
          {currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="rounded-full px-4 py-6"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}

          {/* Bouton Continuer */}
          <Button
            type="button"
            onClick={handleNext}
            disabled={!currentAnswer}
            className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-full py-6 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === totalSteps - 1 ? "Voir mon résultat" : "Continuer"}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
