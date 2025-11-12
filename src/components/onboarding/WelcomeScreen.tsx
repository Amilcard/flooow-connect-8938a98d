import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface WelcomeScreenProps {
  onNext: () => void;
}

export const WelcomeScreen = ({ onNext }: WelcomeScreenProps) => {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8">
        {/* Icône hero avec gradient */}
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-hero flex items-center justify-center shadow-lg">
            <Sparkles className="w-14 h-14 text-white" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center shadow-md">
            <span className="text-white text-xs font-bold">β</span>
          </div>
        </div>

        {/* Titre principal */}
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Bienvenue sur Flooow
          </h1>
          <p className="text-lg md:text-xl text-primary font-medium max-w-md">
            Des activités pour tous les jeunes, près de chez toi
          </p>
        </div>

        {/* Promesse courte */}
        <p className="text-base text-muted-foreground max-w-sm">
          Trouve des activités adaptées, calcule tes aides et découvre comment t'y rendre facilement
        </p>
      </div>

      <div className="p-6">
        <Button
          onClick={onNext}
          className="w-full h-14 text-base font-semibold shadow-lg"
          size="lg"
        >
          Commencer
        </Button>
      </div>
    </div>
  );
};
