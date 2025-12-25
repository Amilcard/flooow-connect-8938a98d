import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Euro, Calculator, TrendingDown, CheckCircle2, ArrowRight } from "lucide-react";

interface UnderstandCostsScreenProps {
  onNext: () => void;
  onSkip: () => void;
}

export const UnderstandCostsScreen = ({ onNext, onSkip }: UnderstandCostsScreenProps) => {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Progression */}
        <div className="flex justify-center gap-2">
          <div className="w-8 h-1.5 rounded-full bg-primary" />
          <div className="w-8 h-1.5 rounded-full bg-primary" />
          <div className="w-8 h-1.5 rounded-full bg-muted" />
        </div>

        {/* Icône header */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-green-500/10 to-green-600/20 flex items-center justify-center shadow-lg">
            <Calculator className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Titre */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Comprenez ce que <br/>vous allez payer
          </h2>
          <p className="text-base text-muted-foreground max-w-sm mx-auto">
            Estimez automatiquement vos aides financières
          </p>
        </div>

        {/* Visual Example */}
        <div className="max-w-sm mx-auto">
          <Card className="p-5 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/10 border-green-200 dark:border-green-800">
            <div className="space-y-4">
              {/* Prix initial */}
              <div className="flex justify-between items-center pb-3 border-b border-green-200 dark:border-green-800">
                <span className="text-sm font-medium text-muted-foreground">Prix de l'activité</span>
                <span className="text-lg font-bold text-foreground">150 €</span>
              </div>

              {/* Aides */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-green-700 dark:text-green-400 font-medium">Pass' Sport</span>
                  <span className="ml-auto text-green-700 dark:text-green-400">- 70 €</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-green-700 dark:text-green-400 font-medium">Aide CAF</span>
                  <span className="ml-auto text-green-700 dark:text-green-400">- 30 €</span>
                </div>
              </div>

              {/* Reste à charge */}
              <div className="flex justify-between items-center pt-3 border-t border-green-200 dark:border-green-800">
                <span className="text-base font-semibold text-foreground">Reste à charge</span>
                <span className="text-2xl font-bold text-green-600">50 €</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Features */}
        <div className="space-y-3 max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">CAF, Pass' Sport, aides locales...</strong> automatiquement calculées
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <Euro className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Reste à charge transparent</strong> avant l'inscription
            </p>
          </div>
        </div>
      </div>

      {/* Boutons */}
      <div className="p-6 space-y-3 border-t">
        <Button
          onClick={onNext}
          className="w-full h-14 text-base font-semibold"
          size="lg"
        >
          Suivant
          <ArrowRight className="ml-2" size={20} />
        </Button>
        
        <Button
          onClick={onSkip}
          variant="ghost"
          className="w-full text-sm text-muted-foreground hover:text-foreground"
        >
          Passer
        </Button>
      </div>
    </div>
  );
};
