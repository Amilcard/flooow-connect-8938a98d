import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Train } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AidesMobiliteBlock = () => {
  const navigate = useNavigate();

  return (
    <section className="space-y-4">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground">
        Mes aides & mobilités
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card Calculer mes aides */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate("/aides-mobilite")}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Calculer mes aides</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base">
              Découvrez les aides financières auxquelles vous avez droit pour les activités de vos enfants.
            </CardDescription>
            <Button variant="link" className="mt-2 p-0 h-auto text-primary">
              Évaluer mon aide →
            </Button>
          </CardContent>
        </Card>

        {/* Card Éco-mobilité */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate("/aides-mobilite?tab=mobilite")}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Train className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle className="text-xl">Éco-mobilité</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base">
              Trouvez les meilleures options de transport écologique pour accéder aux activités.
            </CardDescription>
            <Button variant="link" className="mt-2 p-0 h-auto text-secondary">
              Voir mes options →
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
