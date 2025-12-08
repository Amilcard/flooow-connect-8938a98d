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

  const questions = [
    { id: "q1", text: "Vous savez s'il existe des aides pour les activités de vos enfants ?" },
    { id: "q2", text: "Vous avez déjà renoncé à une activité à cause du prix ?" },
    { id: "q3", text: "Vous voyez où demander des infos (CAF, mairie, club)… ou pas vraiment ?" },
    { id: "q4", text: "Les aides colonies/séjours, ça vous parle un peu… ou pas du tout ?" },
    { id: "q5", text: "Aujourd'hui, vous utilisez ces aides : bien, un peu, ou quasiment pas ?" }
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
          <p className="text-muted-foreground text-sm mb-6 italic">Flooow, c'est l'appli qui vous aide à ne pas passer à côté des aides pour les activités de vos enfants.</p>
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
          {isDejaAuClair ? (
            <>
              <div className="fixed inset-0 pointer-events-none z-50">
                <Lottie animationData={confetiAnimation} loop={false} className="w-full h-full" />
              </div>
              <img src={smileyIcon} alt="" className="h-16 w-16 mx-auto animate-bounce-slow" />
              <h3 className="text-xl font-bold text-foreground">Bravo, vous êtes au taquet sur les aides</h3>
              <p className="text-muted-foreground text-sm">
                Vous connaissez déjà bien les bons plans. On vous aide à trouver les activités qui collent à votre famille.
              </p>
              <Button
                type="button"
                onClick={() => navigate('/search')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full py-4 text-lg font-semibold"
              >
                C'est parti pour les activités
              </Button>
              <Button
                type="button"
                onClick={() => navigate('/aides')}
                variant="ghost"
                className="w-full text-orange-500 hover:text-orange-600"
              >
                Refaire une estimation de mes aides
              </Button>
            </>
          ) : (
            <>
              <img src={smileyIcon} alt="" className="h-12 w-12 mx-auto" />
              <h3 className="text-xl font-bold text-foreground">Zéro non-recours, on s'y met ?</h3>
              <p className="text-muted-foreground text-sm">
                Vous passez peut-être à côté de coups de pouce. On vous aide à faire le tri.
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
