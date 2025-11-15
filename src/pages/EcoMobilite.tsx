import { BottomNavigation } from "@/components/BottomNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calculator, ExternalLink, Bike, Bus, UsersRound, TramFront } from "lucide-react";
import { BackButton } from "@/components/BackButton";

const EcoMobilite = () => {
  // Données des aides et solutions d'éco-mobilité
  const mobilityAids = [
    {
      id: "TARIFICATION_SOLIDAIRE_TC",
      title: "Tarification solidaire (transports)",
      badges: ["Abonnement", "Selon revenus"],
      description: "Réductions ou gratuité sur les abonnements bus/tram selon le QF ou le statut (étudiant, invalidité, etc.).",
      footer: "Réseaux de transport locaux",
      icon: Bus
    },
    {
      id: "FREEVELOV",
      title: "FreeVélo'v (exemple Lyon)",
      badges: ["Vélo longue durée", "14–25 ans"],
      description: "Prêt de vélo 100 % gratuit pendant 3 à 12 mois pour les jeunes qui habitent ou étudient sur le territoire.",
      footer: "Métropole (ex : Lyon)",
      icon: Bike
    },
    {
      id: "VAE_SOLIDAIRE",
      title: "Location VAE solidaire",
      badges: ["Vélo électrique", "+16 ans"],
      description: "Location de vélo électrique à tarif réduit pour les publics boursiers ou à faible revenu.",
      footer: "Métropoles / Régions",
      icon: Bike
    },
    {
      id: "COVOIT_QUOTIDIEN",
      title: "Covoiturage quotidien",
      badges: ["Domicile–activité"],
      description: "Covoiturage subventionné : trajets gratuits ou à petit prix dans les zones partenaires.",
      footer: "Collectivités & plateformes",
      icon: UsersRound
    },
    {
      id: "COVOIT_LIGNES",
      title: "Lignes de covoiturage",
      badges: ["Sans réservation", "Trajets garantis"],
      description: "Lignes organisées de covoiturage avec trajets passagers offerts et départs garantis.",
      footer: "Autorités organisatrices de mobilité",
      icon: TramFront
    }
  ];

  const dataSources = [
    { label: "data.gouv.fr", url: "https://www.data.gouv.fr" },
    { label: "ADEME Base Carbone", url: "https://basecarbone.ademe.fr" }
  ];

  return (
    <>
      <div className="min-h-screen bg-background pb-24">
        <div className="container mx-auto px-4 py-6">
          <BackButton />
          
          {/* Header */}
          <div className="mb-8 space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-text-main">
              Comment venir à l'activité sans voiture ?
            </h1>
            <p className="text-lg text-text-muted">
              Découvrez les solutions de mobilité écologique disponibles pour vos déplacements.
            </p>
          </div>

          {/* Simulateur ADEME - Card en évidence */}
          <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary text-white">
                  <Calculator className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">Calculer mon impact transport</CardTitle>
                  <CardDescription className="text-base">
                    Estimez le CO₂ évité grâce à vos déplacements éco-responsables. Utilisez le simulateur de l'ADEME pour mesurer votre impact transport.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white"
                onClick={() => window.open('https://basecarbone.ademe.fr', '_blank')}
              >
                <Calculator className="mr-2 h-4 w-4" />
                Lancer le simulateur
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Section Aides */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-text-main mb-6">
              Aides et solutions d'éco-mobilité
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              {mobilityAids.map((aid) => {
                const IconComponent = aid.icon;
                return (
                  <Card key={aid.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-accent">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-lg flex-1">{aid.title}</CardTitle>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {aid.badges.map((badge, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {aid.description}
                      </p>
                      <p className="text-xs text-text-muted font-medium">
                        {aid.footer}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Sources des données */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Sources des données CO₂</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {dataSources.map((source, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(source.url, '_blank')}
                    className="text-sm"
                  >
                    {source.label}
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <BottomNavigation />
    </>
  );
};

export default EcoMobilite;
