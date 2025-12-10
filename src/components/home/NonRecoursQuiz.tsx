/**
 * LOT 4 - T4_2: Quiz Zéro non-recours
 * Ton léger et bienveillant style FamilyCrunch
 * Structure 5 questions Oui/Non/Pas sûr conservée
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import confetiAnimation from "@/assets/lottie/confeti.json";
import smileyIcon from "@/assets/smiley.png";

type Answer = "Oui" | "Non" | "Pas sûr" | null;

export default function NonRecoursQuiz() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<{[key: string]: Answer}>({
    q1: null, q2: null, q3: null, q4: null, q5: null
  });
  const [showResult, setShowResult] = useState(false);

  // LOT 4 - T4_2: Questions réécrites avec un ton plus léger
  const questions = [
    { id: "q1", text: "Connaissez-vous les coups de pouce qui existent pour les activités des enfants ?" },
    { id: "q2", text: "Avez-vous déjà hésité devant le prix d'une activité ?" },
    { id: "q3", text: "Savez-vous à qui vous adresser pour obtenir des infos sur les aides ?" },
    { id: "q4", text: "Les aides pour les colos et séjours, vous connaissez ?" },
    { id: "q5", text: "Utilisez-vous déjà certaines de ces aides ?" }
  ];

  const handleAnswer = (questionId: string, answer: Answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const allAnswered = Object.values(answers).every(a => a !== null);
  const handleValidate = () => setShowResult(true);
  const ouiCount = Object.values(answers).filter(a => a === "Oui").length;
  const isDejaAuClair = ouiCount >= 3;

  return (
    <div className="p-4 max-w-2xl relative">
      {!showResult ? (
        <>
          {/* LOT 4 - T4_2: Intro plus légère et explicative */}
          <div className="mb-6 space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              5 petites questions pour faire le point
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              En moins d'une minute, découvrez si vous passez peut-être à côté de coups de pouce pour les activités de vos enfants.
              À la fin, on vous montre les pistes à explorer.
            </p>
          </div>
          <div className="space-y-8">
            {questions.map((q, i) => (
              <div key={q.id} className="space-y-3">
                <p className="font-medium text-base">{i + 1}. {q.text}</p>
                <div className="flex flex-wrap gap-2">
                  {(["Oui", "Non", "Pas sûr"] as Answer[]).map((opt) => (
                    <Button
                      key={opt}
                      type="button"
                      onClick={() => handleAnswer(q.id, opt)}
                      className={`min-h-11 px-5 rounded-full border-2 transition-all ${
                        answers[q.id] === opt
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-background text-muted-foreground border-border hover:border-orange-300"
                      }`}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {allAnswered && (
            <Button
              type="button"
              onClick={handleValidate}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full py-4 mt-8 text-lg font-semibold"
            >
              Valider mes réponses
            </Button>
          )}
        </>
      ) : (
        <div className="space-y-4 text-center py-4 relative">
          {/* LOT 4 - T4_2: Messages de résultat plus chaleureux */}
          {isDejaAuClair ? (
            <>
              <div className="fixed inset-0 pointer-events-none z-50">
                <Lottie animationData={confetiAnimation} loop={false} className="w-full h-full" />
              </div>
              <img src={smileyIcon} alt="" className="h-16 w-16 mx-auto animate-bounce-slow" />
              <h3 className="text-xl font-bold text-foreground">
                Super, vous êtes déjà bien informé
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Vous connaissez les bons plans pour les activités de vos enfants.
                Continuez comme ça et n'hésitez pas à revenir faire le point.
              </p>
              <Button
                type="button"
                onClick={() => navigate('/search')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full py-4 text-lg font-semibold"
              >
                Trouver une activité
              </Button>
              <Button
                type="button"
                onClick={() => navigate('/aides')}
                variant="ghost"
                className="w-full text-orange-500 hover:text-orange-600"
              >
                Voir le détail de mes aides
              </Button>
            </>
          ) : (
            <>
              <img src={smileyIcon} alt="" className="h-12 w-12 mx-auto" />
              <h3 className="text-xl font-bold text-foreground">
                Il y a peut-être des pistes à explorer
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Bonne nouvelle : des aides existent pour les activités des enfants.
                On vous aide à y voir plus clair et à ne rien laisser passer.
              </p>
              <Button
                type="button"
                onClick={() => navigate('/aides')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full py-4 text-lg font-semibold"
              >
                Découvrir mes aides
              </Button>
              <Button
                type="button"
                onClick={() => navigate('/search')}
                variant="ghost"
                className="w-full text-orange-500 hover:text-orange-600"
              >
                Voir les activités près de chez moi
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
