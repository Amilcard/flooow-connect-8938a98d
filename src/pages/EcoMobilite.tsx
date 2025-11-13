import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/ui/app-icon";
import { Bus, Bike, UsersRound, Calculator, MapPin, ExternalLink, HelpCircle, TramFront } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTerritory } from "@/hooks/useUserTerritory";
import { Skeleton } from "@/components/ui/skeleton";

// Types
interface MobilityOption {
  name: string;
  mode: "public_transport" | "bike_sharing" | "long_term_bike_loan" | "carpooling";
  provider: string;
  age_min: number;
  age_max: number | null;
  eligibility_notes: string;
  pricing: string;
  official_url: string;
}

interface TerritoryMobility {
  label: string;
  city: string;
  options: MobilityOption[];
}

// Données de mobilité par territoire
const TERRITORY_MOBILITY: Record<string, TerritoryMobility> = {
  "lyon": {
    label: "Lyon Métropole / Région Auvergne-Rhône-Alpes",
    city: "Lyon",
    options: [
      {
        name: "TCL – Abonnement 18–25 ans illimité",
        mode: "public_transport",
        provider: "TCL",
        age_min: 18,
        age_max: 25,
        eligibility_notes: "Jeunes 18–25 ans et étudiants 26–27 ans, sans condition de domicile. Accès à tout le réseau TCL.",
        pricing: "25€/mois ou 250€/an (contribution employeur possible 50%)",
        official_url: "https://www.tcl.fr/titres-et-tarifs/tous-les-titres-et-abonnements"
      },
      {
        name: "Free Vélo'v – prêt de vélo gratuit",
        mode: "long_term_bike_loan",
        provider: "Métropole de Lyon",
        age_min: 14,
        age_max: 25,
        eligibility_notes: "Jeunes 14–25 ans qui habitent ou étudient dans la Métropole de Lyon (ou +26 ans en insertion).",
        pricing: "Gratuit • Prêt de 3 à 12 mois",
        official_url: "https://freevelov.grandlyon.com/"
      },
      {
        name: "Vélo'v – vélos en libre-service",
        mode: "bike_sharing",
        provider: "Vélo'v",
        age_min: 14,
        age_max: null,
        eligibility_notes: "Tout public, formules adaptées aux usages réguliers ou occasionnels.",
        pricing: "30 minutes gratuites par trajet",
        official_url: "https://www.velov.grandlyon.com/"
      },
      {
        name: "En Covoit' Lignes / En Covoit' Rendez-vous",
        mode: "carpooling",
        provider: "Métropole de Lyon / SYTRAL Mobilités (Karos)",
        age_min: 18,
        age_max: null,
        eligibility_notes: "Trajets quotidiens avec départ ou arrivée dans une commune de la Métropole de Lyon.",
        pricing: "0,50€ base + 0,10€/km au-delà de 20km (2€ pour le conducteur par passager)",
        official_url: "https://www.grandlyon.com/mes-services-au-quotidien/se-deplacer/faire-du-covoiturage"
      },
      {
        name: "MOV'ICI – covoiturage régional AURA",
        mode: "carpooling",
        provider: "Région Auvergne-Rhône-Alpes",
        age_min: 18,
        age_max: null,
        eligibility_notes: "Tout public sur le territoire régional, y compris trajets vers clubs et associations.",
        pricing: "Gratuit pour les passagers",
        official_url: "https://www.movici.auvergnerhonealpes.fr/"
      }
    ]
  },
  "grenoble": {
    label: "Grenoble Alpes Métropole / Isère",
    city: "Grenoble",
    options: [
      {
        name: "M réso / TAG – Abonnement 11–17 ans & 18–25 ans en études",
        mode: "public_transport",
        provider: "M réso (TAG)",
        age_min: 11,
        age_max: 25,
        eligibility_notes: "Collégiens, lycéens, étudiants, apprentis de 11 à 25 ans avec justificatif de scolarité.",
        pricing: "18,70€/mois ou 187€/an",
        official_url: "https://www.reso-m.fr/779-nouveaux-tarifs-septembre-2024.htm"
      },
      {
        name: "M covoit' Lignes+",
        mode: "carpooling",
        provider: "Département de l'Isère",
        age_min: 18,
        age_max: null,
        eligibility_notes: "Lignes de covoiturage entre bassins de vie (Voironnais, Grésivaudan, etc.) et Grenoble.",
        pricing: "Gratuit pour passagers (0,50€ + 2€ par passager pour conducteur)",
        official_url: "https://www.lignesplus-m.fr/"
      },
      {
        name: "M réso – titres unitaires & SMS",
        mode: "public_transport",
        provider: "M réso",
        age_min: 3,
        age_max: null,
        eligibility_notes: "Tout public sur le réseau de la métropole grenobloise.",
        pricing: "2€ le trajet (1€ en SMS intra-Grésivaudan, 1,30€ intra-Voironnais)",
        official_url: "https://www.reso-m.fr/67-un-tarif-pour-chacun.htm"
      }
    ]
  },
  "marseille": {
    label: "Marseille / Métropole Aix-Marseille-Provence",
    city: "Marseille",
    options: [
      {
        name: "RTM – Pass 30 jours Scolaire Solidarité Boursier (11–25 ans)",
        mode: "public_transport",
        provider: "RTM",
        age_min: 11,
        age_max: 25,
        eligibility_notes: "Élèves / étudiants boursiers 11–25 ans sur la zone métropolitaine.",
        pricing: "24,70€/mois",
        official_url: "https://www.rtm.fr/tarifs/pass-30-jours-scolaire-solidarite-boursier-11-25-ans"
      },
      {
        name: "RTM – Pass Annuel Scolaire Solidarité Boursier (11–25 ans)",
        mode: "public_transport",
        provider: "RTM",
        age_min: 11,
        age_max: 25,
        eligibility_notes: "Même public que le pass 30 jours, mais sur 12 mois.",
        pricing: "110€/an (soit 9,17€/mois)",
        official_url: "https://www.rtm.fr/tarifs/pass-annuel-scolaire-solidarite-boursier-11-25-ans"
      },
      {
        name: "Levélo – vélos en libre-service",
        mode: "bike_sharing",
        provider: "Levélo / Métropole AMP",
        age_min: 14,
        age_max: null,
        eligibility_notes: "Tout public, avec avantages pour titulaires de certains abonnements RTM.",
        pricing: "6€/mois • 30 min gratuites + 0,05€/min après",
        official_url: "https://levelo.ampmetropole.fr/fr/blog/la-tarification"
      },
      {
        name: "LeVélo+ – location longue durée vélo électrique",
        mode: "long_term_bike_loan",
        provider: "LeVélo+ / Métropole AMP",
        age_min: 16,
        age_max: null,
        eligibility_notes: "Résidents de la Métropole AMP; tarifs préférentiels pour détenteurs d'un abonnement TC annuel.",
        pricing: "De 20€ à 39€/mois selon profil (solidaire/mobilité/standard)",
        official_url: "https://www.leveloplus.com/abonnements"
      }
    ]
  },
  "paris": {
    label: "Paris / Île-de-France",
    city: "Paris",
    options: [
      {
        name: "Imagine R Scolaire / Étudiant",
        mode: "public_transport",
        provider: "Île-de-France Mobilités",
        age_min: 11,
        age_max: 26,
        eligibility_notes: "Collégiens, lycéens et étudiants franciliens jusqu'à 26 ans.",
        pricing: "384,30€/an + 8€ frais de dossier",
        official_url: "https://www.iledefrance-mobilites.fr/titres-et-tarifs/detail/forfait-imagine-r-etudiant"
      },
      {
        name: "Vélib' – Abonnement V-Plus",
        mode: "bike_sharing",
        provider: "Vélib' Métropole",
        age_min: 14,
        age_max: null,
        eligibility_notes: "Jeunes <27 ans, seniors, publics en situation de précarité (offre solidaire).",
        pricing: "4,30€/mois (-25% jeunes, -50% solidaire) • 30 min gratuites vélo mécanique",
        official_url: "https://www.velib-metropole.fr/offers"
      },
      {
        name: "Covoiturage Île-de-France Mobilités",
        mode: "carpooling",
        provider: "Île-de-France Mobilités (BlaBlaCar Daily, Klaxit, etc.)",
        age_min: 18,
        age_max: null,
        eligibility_notes: "Trajets domicile–travail subventionnés pour occupants de véhicules partagés, sur l'ensemble de l'Île-de-France.",
        pricing: "0-2€ par trajet passager (jusqu'à 2€ pour conducteur par passager)",
        official_url: "https://www.iledefrance-mobilites.fr/covoiturage"
      }
    ]
  },
  "saint-etienne": {
    label: "Saint-Étienne (42) / Loire / AURA",
    city: "Saint-Étienne",
    options: [
      {
        name: "STAS 10 €/mois",
        mode: "public_transport",
        provider: "STAS",
        age_min: 6,
        age_max: null,
        eligibility_notes: "Étudiants, demandeurs d'emploi, bénéficiaires RSA",
        pricing: "110€/an",
        official_url: "https://www.reseau-stas.fr/tarifs"
      },
      {
        name: "VéliVert",
        mode: "bike_sharing",
        provider: "STAS",
        age_min: 14,
        age_max: null,
        eligibility_notes: "Accessible à tous",
        pricing: "10€/an avec abonnement STAS • 30 min gratuites par trajet",
        official_url: "https://www.reseau-stas.fr"
      },
      {
        name: "Covoiturage Mov'ici",
        mode: "carpooling",
        provider: "Région Auvergne-Rhône-Alpes",
        age_min: 18,
        age_max: null,
        eligibility_notes: "Tous les habitants de la région AURA",
        pricing: "Gratuit",
        official_url: "https://www.movici.auvergnerhonealpes.fr/"
      }
    ]
  }
};

const getModeIcon = (mode: string) => {
  switch (mode) {
    case "public_transport":
      return TramFront;
    case "bike_sharing":
    case "long_term_bike_loan":
      return Bike;
    case "carpooling":
      return UsersRound;
    default:
      return MapPin;
  }
};

const getModeLabel = (mode: string) => {
  switch (mode) {
    case "public_transport":
      return "Transport en commun";
    case "bike_sharing":
      return "Vélos en libre-service";
    case "long_term_bike_loan":
      return "Prêt de vélo longue durée";
    case "carpooling":
      return "Covoiturage";
    default:
      return "Mobilité";
  }
};

const getModeColor = (mode: string) => {
  switch (mode) {
    case "public_transport":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "bike_sharing":
    case "long_term_bike_loan":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "carpooling":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  }
};

const EcoMobilite = () => {
  const navigate = useNavigate();

  // Récupérer le territoire de l'utilisateur (avec mapping automatique)
  const { data: userTerritory, isLoading } = useUserTerritory();

  // Sélectionner les options de mobilité du territoire ou null si non configuré
  const territoryKey = userTerritory?.key;
  const territoryMobility = territoryKey ? TERRITORY_MOBILITY[territoryKey] : null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="border-b bg-card">
        <div className="container flex items-center gap-4 py-4">
          <BackButton fallback="/" />
          <div>
            <h1 className="text-xl font-semibold">Éco-Mobilité</h1>
          </div>
        </div>
      </header>
      
      <div className="container py-6 space-y-6">
        {/* Intro */}
        <div>
          <h2 className="text-2xl font-bold mb-2">🌱 Comment venir à l'activité sans voiture ?</h2>
          <p className="text-muted-foreground">
            Découvrez les solutions de mobilité écologique disponibles pour vos déplacements
          </p>
        </div>

        {/* Territory indicator */}
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-48" />
          </div>
        ) : territoryMobility ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>Territoire : <strong>{territoryMobility.label}</strong></span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>Solutions de mobilité disponibles</span>
          </div>
        )}

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
          <h2 className="text-lg font-semibold">
            {territoryMobility ? `Solutions de mobilité à ${territoryMobility.city}` : "Solutions de mobilité"}
          </h2>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : territoryMobility ? (
            <>
              {territoryMobility.options.map((option, index) => (
                <Card key={`${option.name}-${index}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3 flex-1">
                        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                          <AppIcon 
                            Icon={getModeIcon(option.mode)} 
                            size="sm" 
                            color="primary"
                            data-testid={`icon-eco-${option.mode}`}
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-base">{option.name}</CardTitle>
                            <Badge className={getModeColor(option.mode)} variant="secondary">
                              {getModeLabel(option.mode)}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {option.provider}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-2 shrink-0 text-sm font-semibold">
                        {option.pricing.split('•')[0].trim()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span><strong>Éligibilité :</strong> {option.eligibility_notes}</span>
                    </div>
                    
                    {option.pricing.includes('•') && (
                      <p className="text-xs text-muted-foreground">
                        {option.pricing.split('•').slice(1).join('•').trim()}
                      </p>
                    )}

                    <div className="pt-2 border-t">
                      <a
                        href={option.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        Voir le détail sur le site officiel
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">
                  Aucune donnée de mobilité spécifique pour votre territoire. Les solutions nationales s'appliquent.
                </p>
              </CardContent>
            </Card>
          )}
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