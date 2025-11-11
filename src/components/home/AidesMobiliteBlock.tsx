import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Train } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AidesMobiliteBlock = () => {
  const navigate = useNavigate();

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mes aides & mobilités</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Calculer mes aides - Orange gradient */}
        <Card 
          className="group cursor-pointer transition-all hover:shadow-lg border-border"
          onClick={() => navigate('/aides-mobilite')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ background: 'var(--gradient-orange)' }}>
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Calculer mes aides</CardTitle>
                <CardDescription>
                  Découvrez vos aides financières
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full text-white font-semibold hover:opacity-90 shadow-md border-0"
              style={{ background: 'var(--gradient-orange)' }}
            >
              Accéder au calculateur
            </Button>
          </CardContent>
        </Card>

        {/* Éco-mobilité - Green gradient */}
        <Card 
          className="group cursor-pointer transition-all hover:shadow-lg border-border"
          onClick={() => navigate('/aides-mobilite?tab=mobilite')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ background: 'var(--gradient-green)' }}>
                <Train className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Éco-mobilité</CardTitle>
                <CardDescription>
                  Transport écologique et économique
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full text-white font-semibold hover:opacity-90 shadow-md border-0"
              style={{ background: 'var(--gradient-green)' }}
            >
              Voir les options
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
