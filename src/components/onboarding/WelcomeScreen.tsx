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

        {/* Message bêta testeurs */}
        <div className="space-y-3 text-sm text-muted-foreground max-w-md px-4">
          <p className="font-medium text-foreground text-base">Bienvenue aux Flooow testeurs !</p>
          <p>Merci de participer à cette version bêta d'InKlusif Flooow ! Cette application vous permet de simuler vos aides financières (Pass'Sport, aides CAF, aides locales…) pour rendre les activités accessibles à toute la famille.</p>
          <p>Vous pouvez aussi consulter les meilleurs trajets pour vous rendre aux activités grâce à nos solutions d'éco-mobilité.</p>
          <p>L'app évolue en continu et vos retours sont précieux pour l'améliorer. N'hésitez pas à nous faire part de vos remarques !</p>
        </div>
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
