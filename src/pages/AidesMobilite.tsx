import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppIcon } from "@/components/ui/app-icon";
import { HelpCircle, Calculator, ExternalLink, Bus, Bike, UsersRound, MapPin, Phone, Clock } from "lucide-react";

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
      telephone: "0 800 882 224 (gratuit)",
      horaires: "Lun-Sam 7h-19h",
      infoContact: "Agences STAS : Châteaucreux, Bellevue, Carnot. Infos et titres de transport en agence.",
      urlInfo: "reseau-stas.fr/tarifs"
    },
    {
      name: "VéliVert",
      amount: "10 €/an",
      description: "30 minutes offertes par trajet • 10 €/an si abonnement STAS annuel",
      mode: "bike" as const,
      eligibility: "Accessible à tous",
      telephone: "0 800 882 224 (via STAS)",
      horaires: "Service 24h/24",
      infoContact: "Inscription en ligne ou en agence STAS. Application VéliVert pour localiser les vélos.",
      urlInfo: "reseau-stas.fr/velivert"
    },
    {
      name: "Mov'ici (covoiturage régional)",
      amount: "Gratuit",
      description: "Service régional de covoiturage Auvergne-Rhône-Alpes",
      mode: "carpooling" as const,
      eligibility: "Tous les habitants de la région AURA",
      telephone: "04 26 73 40 00 (Région AURA)",
      horaires: "Lun-Ven 9h-12h / 14h-17h",
      infoContact: "Inscription gratuite sur la plateforme. Application mobile disponible.",
      urlInfo: "movici.auvergnerhonealpes.fr",
      note: "Prime nationale covoiturage terminée au 01/01/2025"
    },
    {
      name: "Citiz (autopartage)",
      amount: "Variable",
      description: "Location de voitures partagées à l'heure ou à la journée",
      mode: "carpooling" as const,
      eligibility: "À partir de 18 ans",
      telephone: "04 77 93 30 99",
      horaires: "Véhicules disponibles 24h/24",
      infoContact: "Inscription en ligne. Stations à Saint-Étienne centre, Carnot, Châteaucreux.",
      urlInfo: "citiz.coop"
    },
    {
      name: "MobilisÉ (centrale mobilité)",
      amount: "Gratuit",
      description: "Accompagnement personnalisé pour vos solutions de déplacement",
      mode: "itinerary" as const,
      eligibility: "Tous publics",
      telephone: "04 77 49 77 99",
      horaires: "Lun-Ven 9h-12h / 14h-17h",
      infoContact: "Rendez-vous sur place ou par téléphone. Conseils transport, covoiturage, vélo.",
      urlInfo: "Maison des mobilités, place Fourneyron"
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
    <PageLayout showHeader={false}>
      <PageHeader
        title="Nos trajets éco-mobilité"
        subtitle="On pense planète et santé."
        backFallback="/home"
      />

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

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

                    {/* Contact Information - Text Only */}
                    <div className="pt-2 border-t space-y-2">
                      {/* Telephone */}
                      {'telephone' in option && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-primary shrink-0" />
                          <a
                            href={`tel:${option.telephone.replace(/\s/g, '')}`}
                            className="text-primary hover:underline font-medium"
                          >
                            {option.telephone}
                          </a>
                        </div>
                      )}

                      {/* Horaires */}
                      {'horaires' in option && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 shrink-0" />
                          <span>{option.horaires}</span>
                        </div>
                      )}

                      {/* Info Contact */}
                      {'infoContact' in option && (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {option.infoContact}
                        </p>
                      )}

                      {/* URL Info - Text only, not clickable */}
                      {'urlInfo' in option && (
                        <p className="text-xs text-muted-foreground italic">
                          Infos en ligne : {option.urlInfo}
                        </p>
                      )}
                    </div>
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
