import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight } from "lucide-react";

interface BetaWelcomeScreenProps {
  onNext: () => void;
  onSkip: () => void;
}

export const BetaWelcomeScreen = ({ onNext, onSkip }: BetaWelcomeScreenProps) => {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8">
        {/* Badge Version Test */}
        <Badge variant="secondary" className="px-4 py-2 text-sm font-semibold bg-primary/20 text-primary">
          ✨ Version Test
        </Badge>

        {/* Logo avec badge beta */}
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl">
            <Sparkles className="w-16 h-16 text-white" />
          </div>
        </div>

        {/* Titre principal */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary">
            Bienvenue sur Flooow
          </h1>
          <div className="space-y-2">
            <p className="text-xl md:text-2xl text-primary font-semibold">
              Merci de faire partie des
            </p>
            <p className="text-2xl md:text-3xl font-bold text-primary">
              Flooow testeurs
            </p>
          </div>
        </div>

        {/* Message contexte */}
        <div className="max-w-md space-y-3">
          <p className="text-base text-text-secondary leading-relaxed">
            Tu utilises une version test de Flooow. Certaines fonctionnalités peuvent encore évoluer.
          </p>
          <p className="text-sm text-text-secondary italic">
            Ton avis nous aide à améliorer l'app pour tous ! 💪
          </p>
        </div>
      </div>

      {/* Boutons */}
      <div className="p-6 space-y-3">
        <Button
          onClick={onNext}
          className="w-full h-14 text-base font-semibold shadow-lg"
          size="lg"
        >
          Découvrir Flooow
          <ArrowRight className="ml-2" size={20} />
        </Button>
        
        <Button
          onClick={onSkip}
          variant="ghost"
          className="w-full text-sm text-text-muted hover:text-text-primary"
        >
          Passer et commencer
        </Button>
      </div>
    </div>
  );
};
