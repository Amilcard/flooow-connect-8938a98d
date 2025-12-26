import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Train, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTerritory } from "@/hooks/useTerritory";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const AidesMobiliteBlock = () => {
  const navigate = useNavigate();
  const { territory, territoryKey, hasTerritory } = useTerritory();

  return (
    <section
      className="space-y-8 p-10 rounded-3xl border-2 my-12 shadow-lg"
      style={{
        background: 'hsl(var(--accent-blue))',
        borderColor: 'hsl(var(--accent-blue))'
      }}
    >
      {/* Accroche principale - Style WeTransfer avec police display */}
      <div className="text-center mb-2">
        <p className="text-2xl font-bold mb-3 text-white drop-shadow-sm">
          💰 Jusqu'à 80% de réduction sur vos activités
        </p>
        <h2 className="font-display text-4xl md:text-5xl text-foreground">
          Mes aides & mobilités
        </h2>
        {hasTerritory && territory && (
          <p className="text-sm text-muted-foreground mt-2 flex items-center justify-center gap-1">
            <MapPin className="h-4 w-4" />
            {territory.name}
          </p>
        )}
      </div>

      {/* Message si pas de territoire */}
      {!hasTerritory && (
        <Alert>
          <AlertDescription>
            📍 Choisissez votre territoire pour découvrir les aides et options de mobilité près de chez vous.
          </AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calculer mes aides - Orange gradient WeTransfer style */}
        <Card 
          className="group cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-1 border-0 bg-white min-h-[200px] flex flex-col rounded-2xl overflow-hidden"
          onClick={() => navigate('/aides-mobilite')}
        >
          <CardHeader className="flex-1 pb-3">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 rounded-2xl bg-gradient-orange shadow-md">
                <Calculator className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-display">Calculer mes aides</CardTitle>
                <CardDescription className="text-sm mt-1">
                  Découvrez vos aides financières
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-6">
            <Button 
              className="w-full text-white font-semibold border-0 h-12 rounded-xl bg-gradient-orange shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              Accéder au calculateur
            </Button>
          </CardContent>
        </Card>

        {/* Éco-mobilité - Green gradient WeTransfer style */}
        <Card 
          className="group cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-1 border-0 bg-white min-h-[200px] flex flex-col rounded-2xl overflow-hidden"
          onClick={() => navigate('/aides-mobilite?tab=mobilite')}
        >
          <CardHeader className="flex-1 pb-3">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 rounded-2xl bg-gradient-green shadow-md">
                <Train className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-display">Éco-mobilité</CardTitle>
                <CardDescription className="text-sm mt-1">
                  Transport écologique et économique
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-6">
            <Button 
              className="w-full text-white font-semibold border-0 h-12 rounded-xl bg-gradient-green shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              Voir les options
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
