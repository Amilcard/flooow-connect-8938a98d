import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type Answer = "Oui" | "Non" | "Pas sûr" | null;

export default function NonRecoursQuiz() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<{[key: string]: Answer}>({
    q1: null,
    q2: null,
    q3: null,
    q4: null,
    q5: null
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

  const handleValidate = () => {
    setShowResult(true);
  };

  const hasUncertainty = Object.values(answers).some(a => a === "Non" || a === "Pas sûr");

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-2xl font-bold mb-2">💡 Zéro non-recours</h2>
      <p className="text-gray-600 mb-8">5 questions pour faire le point sur vos droits</p>

      {!showResult ? (
        <>
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="space-y-3">
                <p className="font-medium text-base leading-relaxed">
                  {index + 1}. {question.text}
                </p>
                <div className="flex flex-wrap gap-3">
                  {["Oui", "Non", "Pas sûr"].map((option) => (
                    <Button
                      key={option}
                      onClick={() => handleAnswer(question.id, option as Answer)}
                      className={`min-h-12 px-6 rounded-full border-2 transition-all ${
                        answers[question.id] === option
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-white text-gray-700 border-gray-200 hover:border-orange-300"
                      }`}
                      variant="outline"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {allAnswered && (
            <Button
              onClick={handleValidate}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full py-4 mt-8 text-lg font-semibold"
            >
              Valider mes réponses
            </Button>
          )}
        </>
      ) : (
        <div className="space-y-6 text-center py-8">
          {hasUncertainty ? (
            <>
              <p className="text-lg text-gray-700 leading-relaxed">
                Vous passez peut-être à côté d'aides. On vous aide à y voir clair.
              </p>
              <Button
                onClick={() => navigate('/aides')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full py-4 text-lg font-semibold"
              >
                Découvrir mes aides →
              </Button>
            </>
          ) : (
            <>
              <p className="text-lg text-green-600 leading-relaxed">
                ✓ Bravo, vous avez les bons réflexes ! Flooow regroupe tout au même endroit.
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full py-4 text-lg font-semibold"
              >
                Explorer Flooow
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
