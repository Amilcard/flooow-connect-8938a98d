import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface WelcomeScreenProps {
  onNext: () => void;
}

export const WelcomeScreen = ({ onNext }: WelcomeScreenProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Bienvenue sur Flooow</h1>
          <p className="text-lg text-primary font-medium">
            Trouver des activités, comprendre les aides, tester le futur guichet unique
          </p>
        </div>

        <div className="space-y-4 max-w-md text-left">
          <p className="text-base text-foreground">
            Flooow t'aide à trouver des activités adaptées aux enfants et aux jeunes, près de chez toi.
          </p>
          <p className="text-base text-foreground">
            L'application calcule aussi les aides financières possibles et te montre les solutions de mobilité pour y aller.
          </p>
          <p className="text-base text-foreground">
            Tu utilises une version bêta : nous testons le fonctionnement sur quelques territoires pilotes.
          </p>
        </div>
      </div>

      <div className="p-6">
        <Button
          onClick={onNext}
          className="w-full h-14"
          size="lg"
        >
          Continuer
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
