import { Button } from "@/components/ui/button";
import { MapPin, Eye, Euro, Bell, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TerritoryNotCoveredScreenProps {
  onDiscoverDemo: () => void;
  onNotifyMe: () => void;
}

export const TerritoryNotCoveredScreen = ({ onDiscoverDemo, onNotifyMe }: TerritoryNotCoveredScreenProps) => {
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-accent/5 to-background">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Icon avec style positif */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-lg">
            <MapPin className="w-14 h-14 text-white" />
          </div>
        </div>

        {/* Titre positif */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Bientôt disponible ! 🚀
          </h2>
          <p className="text-base text-muted-foreground max-w-sm mx-auto">
            Votre territoire n'est pas encore connecté, mais vous pouvez déjà participer
          </p>
        </div>

        {/* Message positif court */}
        <Card className="p-4 bg-card border-accent/20 max-w-md mx-auto">
          <p className="text-sm text-foreground text-center">
            Flooow se déploie progressivement. Vous êtes en avance, c'est une bonne nouvelle ! 
            <span className="font-semibold text-accent"> Aidez-nous à préparer l'arrivée dans votre région.</span>
          </p>
        </Card>

        {/* Ce que vous pouvez faire maintenant */}
        <div className="space-y-3 max-w-md mx-auto">
          <Card className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Explorer en mode démo</p>
                <p className="text-xs text-muted-foreground">Découvrez toutes les fonctionnalités</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-r from-accent/5 to-accent/10 border-accent/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                <Euro className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Aides nationales</p>
                <p className="text-xs text-muted-foreground">Simulations disponibles partout</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-r from-green-success/5 to-green-success/10 border-green-success/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-success flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Être averti en premier</p>
                <p className="text-xs text-muted-foreground">Inscription à la liste d'attente</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Note confidentialité intégrée */}
        <Card className="p-4 bg-muted/30 border-muted max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Vos données sont protégées.</span> Nous ne les revendons pas et vous pouvez les supprimer à tout moment.
            </p>
          </div>
        </Card>
      </div>

      <div className="p-6 border-t bg-card space-y-3">
        <Button
          onClick={onDiscoverDemo}
          className="w-full h-14 text-base font-semibold shadow-lg"
          size="lg"
        >
          Explorer en mode démo
        </Button>
        
        <Button
          onClick={onNotifyMe}
          variant="outline"
          className="w-full h-12"
          size="lg"
        >
          <Bell className="mr-2 h-5 w-5" />
          M'avertir de l'ouverture
        </Button>
      </div>
    </div>
  );
};
