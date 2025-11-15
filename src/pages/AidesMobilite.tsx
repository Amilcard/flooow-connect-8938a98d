import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppIcon } from "@/components/ui/app-icon";
import { HelpCircle, Calculator, ExternalLink, Bus, Bike, UsersRound, MapPin } from "lucide-react";
import { BackButton } from "@/components/BackButton";

const AidesMobilite = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("aides");
  const navigate = useNavigate();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "mobilite") {
      setActiveTab("mobilite");
    }
  }, [searchParams]);

  const aides = [
    {
      name: "Pass'Sport 2025-2026",
      amount: "70€",
      description: "70 € sur ma licence sportive",
      eligibility: "Enfants 6-18 ans, allocataires AAH, ARS ou AEEH",
      links: [
        { label: "Service-Public", url: "https://www.service-public.fr/particuliers/vosdroits/F35915" },
        { label: "Sports.gouv.fr", url: "https://www.sports.gouv.fr/pass-sport" }
      ]
    },
    {
      name: "PASS'Région jeunes",
      amount: "Variable",
      description: "Sport, culture, santé, permis — services multiples",
      eligibility: "15-25 ans, lycéens et apprentis de la région AURA",
      links: [
        { label: "Région AURA", url: "https://www.auvergnerhonealpes.fr" }
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
        { label: "CAF.fr", url: "https://www.caf.fr" }
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

  const mobilityOptions = [
    {
      name: "STAS 10 €/mois",
      amount: "110 €/an",
      description: "Abonnement annuel pour publics éligibles",
      mode: "public_transport" as const,
      eligibility: "Étudiants, demandeurs d'emploi, bénéficiaires RSA",
      cta: "Choisir mon abonnement",
      links: [
        { label: "Réseau STAS", url: "https://www.reseau-stas.fr/tarifs" }
      ]
    },
    {
      name: "VéliVert",
      amount: "10 €/an",
      description: "30 minutes offertes par trajet • 10 €/an si abonnement STAS annuel",
      mode: "bike" as const,
      eligibility: "Accessible à tous",
      cta: "Activer VéliVert",
      links: [
        { label: "VéliVert STAS", url: "https://www.reseau-stas.fr" }
      ]
    },
    {
      name: "Moovizy",
      amount: "Gratuit",
      description: "Itinéraires multimodaux + achats + post-paiement",
      mode: "itinerary" as const,
      eligibility: "Téléchargement gratuit",
      cta: "En savoir plus",
      links: [
        { label: "Transdev", url: "https://www.transdev.com" }
      ]
    },
    {
      name: "La Ricamarie — Bus M1/70",
      amount: "Gratuit",
      description: "Venir en bus depuis/vers La Ricamarie",
      mode: "bus" as const,
      eligibility: "Tous les voyageurs STAS",
      cta: "Voir les horaires",
      links: [
        { label: "Réseau STAS", url: "https://www.reseau-stas.fr" }
      ]
    },
    {
      name: "Covoiturage Mov'ici",
      amount: "Gratuit",
      description: "Service régional de covoiturage",
      mode: "carpooling" as const,
      eligibility: "Tous les habitants de la région AURA",
      cta: "Rejoindre Mov'ici",
      links: [
        { label: "Région AURA", url: "https://www.auvergnerhonealpes.fr" }
      ],
      note: "Prime nationale covoiturage terminée au 01/01/2025"
    }
  ];

  const getMobilityIcon = (mode: string) => {
    switch (mode) {
      case "public_transport":
      case "bus":
        return Bus;
      case "bike":
        return Bike;
      case "carpooling":
        return UsersRound;
      case "itinerary":
        return MapPin;
      default:
        return MapPin;
    }
  };

  return (
    <PageLayout>
      <div className="container py-6 space-y-6">
        {/* Bouton de retour amélioré */}
        <div className="mb-4">
          <BackButton fallback="/" showText={true} label="Retour à l'accueil" />
        </div>
        
        <div>
          <h1 className="text-3xl font-bold mb-2">Mes aides & mobilités</h1>
          <p className="text-muted-foreground">
            Découvrez vos aides financières et vos moyens de transport pour accéder aux activités
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="aides">Aides financières</TabsTrigger>
            <TabsTrigger value="mobilite">Éco-mobilité</TabsTrigger>
          </TabsList>

          {/* Onglet Aides Financières */}
          <TabsContent value="aides" className="space-y-6 mt-6">
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
                  onClick={() => navigate('/aides/simulateur')} 
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
                        <p className="text-xs text-muted-foreground mb-2">
                          <span className="inline-flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            Sources officielles (ouverture externe) :
                          </span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {aide.links.map((link) => (
                          <a
                            key={link.url}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline px-2 py-1 rounded bg-primary/5 hover:bg-primary/10 transition-colors"
                            title="Ouvre un site partenaire dans un nouvel onglet"
                          >
                            {link.label}
                            <ExternalLink className="w-3 h-3" />
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
          </TabsContent>

          {/* Onglet Éco-mobilité */}
          <TabsContent value="mobilite" className="space-y-6 mt-6">
            {/* Impact Calculator CTA */}
            <Card className="bg-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Calculer mon impact transport
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Estimez le CO2 évité grâce à vos déplacements éco-responsables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  Utilisez le simulateur de l'ADEME pour mesurer votre impact transport
                </p>
                <Button 
                  variant="secondary" 
                  className="bg-white text-primary hover:bg-white/90"
                  onClick={() => window.open("https://nosgestesclimat.fr/simulateur/bilan", "_blank")}
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Lancer le simulateur
                </Button>
              </CardContent>
            </Card>

            {/* Mobility options */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Options de mobilité</h2>
              
              {mobilityOptions.map((option) => (
                <Card key={option.name}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3 flex-1">
                        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                          <AppIcon 
                            Icon={getMobilityIcon(option.mode)} 
                            size="sm" 
                            color="primary"
                            data-testid={`icon-eco-${option.mode}`}
                          />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base">{option.name}</CardTitle>
                          <CardDescription className="mt-1">{option.description}</CardDescription>
                          {option.note && (
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              ℹ️ {option.note}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-2 shrink-0">
                        {option.amount}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Éligibilité :</span> {option.eligibility}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        if (option.links && option.links.length > 0) {
                          window.open(option.links[0].url, "_blank");
                        }
                      }}
                    >
                      {option.cta}
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>

                    {option.links && option.links.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-2">
                          <span className="inline-flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            Sources (ouverture externe) :
                          </span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {option.links.map((link) => (
                            <a
                              key={link.url}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline px-2 py-1 rounded bg-primary/5 hover:bg-primary/10 transition-colors"
                              title="Ouvre un site partenaire dans un nouvel onglet"
                            >
                              {link.label}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Data sources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sources des données CO2</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  <a 
                    href="https://www.data.gouv.fr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    data.gouv.fr
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  <a 
                    href="https://bilans-ges.ademe.fr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    ADEME Base Carbone
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default AidesMobilite;
