import { BottomNavigation } from "@/components/BottomNavigation";
import { SearchBar } from "@/components/SearchBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, HelpCircle, Calculator } from "lucide-react";

const Aides = () => {
  const aides = [
    {
      name: "Pass'Sport",
      amount: "50€",
      description: "Aide pour la pratique sportive des 6-18 ans",
      eligibility: "QF < 13500€",
    },
    {
      name: "CAF - Aide Vacances",
      amount: "Variable",
      description: "Aide pour les séjours vacances",
      eligibility: "Allocataire CAF",
    },
    {
      name: "ANCV - Chèques Vacances",
      amount: "Variable",
      description: "Chèques vacances pour les familles",
      eligibility: "Selon revenus",
    },
    {
      name: "Aide Locale",
      amount: "Variable",
      description: "Aides territoriales spécifiques",
      eligibility: "Selon territoire",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <SearchBar />
      
      <div className="container py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Aides Financières</h1>
          <p className="text-muted-foreground">
            Découvrez les aides disponibles pour financer les activités de vos enfants
          </p>
        </div>

        {/* Simulator CTA */}
        <Card className="bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Simulateur d'aides
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Estimez le montant des aides auxquelles vous avez droit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Le simulateur est accessible lors de la réservation d'une activité
            </p>
          </CardContent>
        </Card>

        {/* Aides list */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Aides disponibles</h2>
          
          {aides.map((aide) => (
            <Card key={aide.name}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{aide.name}</CardTitle>
                    <CardDescription>{aide.description}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {aide.amount}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <HelpCircle className="w-4 h-4" />
                  <span>Éligibilité : {aide.eligibility}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Questions fréquentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">Comment bénéficier des aides ?</h3>
              <p className="text-sm text-muted-foreground">
                Les aides sont automatiquement calculées lors de votre réservation en fonction de votre quotient familial.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Puis-je cumuler plusieurs aides ?</h3>
              <p className="text-sm text-muted-foreground">
                Oui, certaines aides sont cumulables. Le simulateur vous indiquera les combinaisons possibles.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Aides;
