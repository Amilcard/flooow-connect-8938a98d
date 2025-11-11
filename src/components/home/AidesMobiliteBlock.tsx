import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Train } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AidesMobiliteBlock = () => {
  const navigate = useNavigate();

  return (
    <section 
      className="space-y-6 p-8 rounded-2xl border-2 my-10"
      style={{ 
        background: 'linear-gradient(135deg, hsl(var(--background-warm)) 0%, hsl(45 100% 94%) 100%)',
        borderColor: 'hsl(var(--primary-orange))'
      }}
    >
      {/* Accroche principale */}
      <div className="text-center mb-2">
        <p className="text-2xl font-bold mb-2" style={{ color: 'hsl(var(--primary-orange-dark))' }}>
          💰 Jusqu'à 80% de réduction sur vos activités
        </p>
        <h2 className="text-3xl font-bold text-foreground">
          Mes aides & mobilités
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calculer mes aides - Orange gradient */}
        <Card 
          className="group cursor-pointer transition-all hover:shadow-xl border-border bg-white min-h-[180px] flex flex-col"
          onClick={() => navigate('/aides-mobilite')}
        >
          <CardHeader className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl" style={{ background: 'var(--gradient-orange)' }}>
                <Calculator className="h-7 w-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Calculer mes aides</CardTitle>
                <CardDescription className="text-sm">
                  Découvrez vos aides financières
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Button 
              className="w-full text-white font-semibold hover:opacity-90 shadow-md border-0 h-11"
              style={{ background: 'var(--gradient-orange)' }}
            >
              Accéder au calculateur
            </Button>
          </CardContent>
        </Card>

        {/* Éco-mobilité - Green gradient */}
        <Card 
          className="group cursor-pointer transition-all hover:shadow-xl border-border bg-white min-h-[180px] flex flex-col"
          onClick={() => navigate('/aides-mobilite?tab=mobilite')}
        >
          <CardHeader className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl" style={{ background: 'var(--gradient-green)' }}>
                <Train className="h-7 w-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Éco-mobilité</CardTitle>
                <CardDescription className="text-sm">
                  Transport écologique et économique
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Button 
              className="w-full text-white font-semibold hover:opacity-90 shadow-md border-0 h-11"
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
