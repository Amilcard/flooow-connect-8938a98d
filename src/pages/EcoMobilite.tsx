import { BottomNavigation } from "@/components/BottomNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calculator, ExternalLink, Bike, Bus, UsersRound, Car } from "lucide-react";
import { BackButton } from "@/components/BackButton";

const EcoMobilite = () => {
  // Solutions de mobilité à Saint-Étienne
  const mobilityAids = [
    {
      id: "STAS_TC",
      title: "STAS – Bus & Tram",
      badges: [],
      description: "Réseau de transports en commun de Saint-Étienne Métropole pour rejoindre ton activité en bus ou en tram.",
      footer: "Tarification solidaire possible selon ta situation.",
      icon: Bus
    },
    {
      id: "VELIVERT",
      title: "VéliVert – Vélos en libre-service",
      badges: [],
      description: "Vélos en libre-service pour les trajets courts en ville, pratique pour rejoindre ton club ou ton activité.",
      footer: "Consulte les stations proches de chez toi.",
      icon: Bike
    },
    {
      id: "COVOIT_STE",
      title: "Covoiturage local",
      badges: [],
      description: "Partage de trajets entre familles ou habitants pour aller aux mêmes activités.",
      footer: "À organiser avec ton club, ta structure ou ton entourage.",
      icon: Car
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
              Comment se rendre sur mon lieu d'activité ?
            </h1>
            <p className="text-lg text-text-muted">
              Découvre les solutions de mobilité disponibles pour aller à ton activité.
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

          {/* Section Solutions Saint-Étienne */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-text-main mb-6">
              Solutions de mobilité à Saint-Étienne
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
