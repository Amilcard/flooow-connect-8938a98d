import { BottomNavigation } from "@/components/BottomNavigation";
import { SearchBar } from "@/components/SearchBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bus, Bike, Car, Calculator, MapPin, ExternalLink } from "lucide-react";

const EcoMobilite = () => {
  const mobilityOptions = [
    {
      name: "STAS 10 €/mois",
      amount: "110 €/an",
      description: "Abonnement annuel pour publics éligibles",
      icon: <Bus className="w-5 h-5" />,
      eligibility: "Étudiants, demandeurs d'emploi, bénéficiaires RSA",
      cta: "Choisir mon abonnement",
      links: [
        { label: "Réseau STAS", url: "https://www.reseau-stas.fr" }
      ]
    },
    {
      name: "VéliVert",
      amount: "10 €/an",
      description: "30 minutes offertes par trajet • 10 €/an si abonnement STAS annuel",
      icon: <Bike className="w-5 h-5" />,
      eligibility: "Accessible à tous",
      cta: "Activer VéliVert",
      links: [
        { label: "VéliVert STAS", url: "https://www.reseau-stas.fr/velivert" }
      ]
    },
    {
      name: "Moovizy",
      amount: "Gratuit",
      description: "Itinéraires multimodaux + achats + post-paiement",
      icon: <MapPin className="w-5 h-5" />,
      eligibility: "Téléchargement gratuit",
      cta: "Ouvrir Moovizy",
      links: [
        { label: "App Store", url: "https://apps.apple.com/fr/app/moovizy/id1542684702" },
        { label: "Transdev", url: "https://www.transdev.com/fr/moovizy/" }
      ]
    },
    {
      name: "La Ricamarie — Bus M1/70",
      amount: "Gratuit",
      description: "Venir en bus depuis/vers La Ricamarie",
      icon: <Bus className="w-5 h-5" />,
      eligibility: "Tous les voyageurs STAS",
      cta: "Voir les arrêts proches",
      links: [
        { label: "Ville La Ricamarie", url: "https://www.ville-laricamarie.fr" }
      ]
    },
    {
      name: "Covoiturage Mov'ici",
      amount: "Gratuit",
      description: "Service régional de covoiturage",
      icon: <Car className="w-5 h-5" />,
      eligibility: "Tous les habitants de la région AURA",
      cta: "Rejoindre Mov'ici",
      links: [
        { label: "Région AURA", url: "https://www.auvergnerhonealpes.fr/actualite/1069/154-movici-plateforme-covoiturage.htm" }
      ],
      note: "Prime nationale covoiturage terminée au 01/01/2025"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <SearchBar />
      
      <div className="container py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Éco-Mobilité</h1>
          <p className="text-muted-foreground">
            Solutions de transport écologique pour venir à vos activités
          </p>
        </div>

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
              Utilisez le simulateur Mon Impact Transport de l'ADEME pour mesurer vos efforts
            </p>
            <Button 
              variant="secondary" 
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => window.open("https://monimpacttransport.fr", "_blank")}
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
                      {option.icon}
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
                    <p className="text-xs text-muted-foreground mb-2">Sources :</p>
                    <div className="flex flex-wrap gap-2">
                      {option.links.map((link) => (
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
      </div>

      <BottomNavigation />
    </div>
  );
};

export default EcoMobilite;