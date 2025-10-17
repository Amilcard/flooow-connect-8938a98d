import { useState } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { SearchBar } from "@/components/SearchBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GeneralSimulateAidModal } from "@/components/simulations/GeneralSimulateAidModal";
import { DollarSign, HelpCircle, Calculator } from "lucide-react";

const Aides = () => {
  const [showSimulator, setShowSimulator] = useState(false);

  const aides = [
    {
      name: "Pass'Sport 2025-2026",
      amount: "70€",
      description: "70 € sur ma licence sportive",
      eligibility: "Enfants 6-18 ans, allocataires AAH, ARS ou AEEH",
      links: [
        { label: "Info.gouv", url: "https://www.info.gouv.fr/pass-sport" },
        { label: "Service-Public", url: "https://www.service-public.fr/particuliers/vosdroits/F35915" }
      ]
    },
    {
      name: "PASS'Région jeunes",
      amount: "Variable",
      description: "Sport, culture, santé, permis — services multiples",
      eligibility: "15-25 ans, lycéens et apprentis de la région AURA",
      links: [
        { label: "Région AURA", url: "https://www.auvergnerhonealpes.fr/actualite/1183/154-pass-region.htm" }
      ],
      validity: "Septembre 2025 - Août 2026"
    },
    {
      name: "CAF Loire — Loisirs & Séjours",
      amount: "Variable",
      description: "Aides pour loisirs et séjours vacances",
      eligibility: "Allocataires CAF selon quotient familial",
      links: [
        { label: "Service-Public", url: "https://www.service-public.fr/particuliers/vosdroits/F1319" },
        { label: "CAF Loire", url: "https://www.caf.fr/allocataires/caf-de-la-loire/offre-de-service" }
      ]
    },
    {
      name: "La Ricamarie — Transport collégiens + Bourse étudiants",
      amount: "Variable",
      description: "Aide transport collégiens et bourse pour étudiants",
      eligibility: "Résidents La Ricamarie selon critères CCAS",
      links: [
        { label: "Ville La Ricamarie", url: "https://www.ville-laricamarie.fr" }
      ]
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
              Simulez vos aides pour une activité type et découvrez vos économies potentielles
            </p>
            <Button 
              onClick={() => setShowSimulator(true)} 
              variant="secondary" 
              className="bg-white text-primary hover:bg-white/90"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Lancer la simulation
            </Button>
          </CardContent>
        </Card>

        {/* Aides list */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Aides disponibles</h2>
          
          {aides.map((aide) => (
            <Card key={aide.name}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{aide.name}</CardTitle>
                    <CardDescription className="mt-1">{aide.description}</CardDescription>
                    {aide.validity && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Validité : {aide.validity}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="ml-2 shrink-0">
                    {aide.amount}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <HelpCircle className="w-4 h-4" />
                  <span>Éligibilité : {aide.eligibility}</span>
                </div>
                {aide.links && aide.links.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Sources officielles :</p>
                    <div className="flex flex-wrap gap-2">
                      {aide.links.map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          {link.label} →
                        </a>
                      ))}
                    </div>
                  </div>
                )}
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

      {/* Simulateur Modal */}
      <GeneralSimulateAidModal
        open={showSimulator}
        onOpenChange={setShowSimulator}
      />

      <BottomNavigation />
    </div>
  );
};

export default Aides;
