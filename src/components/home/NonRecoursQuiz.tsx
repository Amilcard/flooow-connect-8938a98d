import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type Answer = "yes" | "no" | "unsure" | null;

export default function NonRecoursQuiz() {
  const [answers, setAnswers] = useState<Answer[]>([null, null, null]);
  const [showResult, setShowResult] = useState(false);

  const questions = [
    "Savez-vous si des aides existent pour les activités de vos enfants ?",
    "Avez-vous déjà renoncé à une activité à cause du prix ?",
    "Connaissez-vous les aides possibles pour les colonies ou séjours ?"
  ];

  const handleAnswer = (questionIndex: number, answer: Answer) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answer;
    setAnswers(newAnswers);

    if (newAnswers.every(a => a !== null)) {
      setShowResult(true);
    }
  };

  const shouldShowCTA = answers.some(a => a === "no" || a === "unsure");

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>💡 À retenir</CardTitle>
        <CardDescription>
          Répondez à ces 3 questions pour mieux connaître vos droits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((question, index) => (
          <div key={index} className="space-y-2">
            <p className="font-medium text-sm">{question}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={answers[index] === "yes" ? "default" : "outline"}
                onClick={() => handleAnswer(index, "yes")}
              >
                Oui
              </Button>
              <Button
                size="sm"
                variant={answers[index] === "no" ? "default" : "outline"}
                onClick={() => handleAnswer(index, "no")}
              >
                Non
              </Button>
              <Button
                size="sm"
                variant={answers[index] === "unsure" ? "default" : "outline"}
                onClick={() => handleAnswer(index, "unsure")}
              >
                Pas sûr
              </Button>
            </div>
          </div>
        ))}

        {showResult && shouldShowCTA && (
          <div className="pt-4 border-t space-y-3">
            <p className="text-sm text-muted-foreground">
              Flooow peut vous aider à y voir plus clair.
            </p>
            <Button asChild className="w-full">
              <Link to="/aides">Découvrir les aides</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
