import { BottomNavigation } from "@/components/BottomNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calculator, ExternalLink, Bike, Bus, UsersRound, Car, TramFront, MapPin } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import PageLayout from "@/components/PageLayout";
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

// Aides générales à l'éco-mobilité (nationales)
interface GeneralMobilityAid {
  id: string;
  title: string;
  badges: string[];
  text: string;
  footer: string;
  cta_label: string;
  cta_action?: string;
}

const GENERAL_MOBILITY_AIDS: GeneralMobilityAid[] = [
  {
    id: "TARIFICATION_SOLIDAIRE_TC",
    title: "Tarification solidaire (transports)",
    badges: ["Abonnement", "Selon revenus"],
    text: "Réductions ou gratuité sur les abonnements bus/tram selon le QF ou le statut (étudiant, invalidité, etc.).",
    footer: "Réseaux de transport locaux",
    cta_label: "Voir sur le site de mon réseau",
    cta_action: "open_local_transport_site"
  },
  {
    id: "FREEVELOV",
    title: "Prêt de vélo gratuit (exemple FreeVélo'v Lyon)",
    badges: ["Vélo longue durée", "14–25 ans"],
    text: "Prêt de vélo 100 % gratuit pendant 3 à 12 mois pour les jeunes qui habitent ou étudient sur le territoire.",
    footer: "Métropoles (Lyon, Grenoble, etc.)",
    cta_label: "En savoir plus",
    cta_action: "scroll_to_territory_options"
  },
  {
    id: "VAE_SOLIDAIRE",
    title: "Location VAE solidaire",
    badges: ["Vélo électrique", "+16 ans"],
    text: "Location de vélo électrique à tarif réduit pour les publics boursiers ou à faible revenu.",
    footer: "Métropoles / Régions",
    cta_label: "Voir les conditions",
    cta_action: "scroll_to_territory_options"
  },
  {
    id: "COVOIT_QUOTIDIEN",
    title: "Covoiturage quotidien",
    badges: ["Domicile–activité"],
    text: "Covoiturage subventionné : trajets gratuits ou à petit prix dans les zones partenaires.",
    footer: "Collectivités & plateformes",
    cta_label: "Voir les solutions près de chez moi",
    cta_action: "scroll_to_territory_options"
  },
  {
    id: "COVOIT_LIGNES",
    title: "Lignes de covoiturage",
    badges: ["Sans réservation", "Trajets garantis"],
    text: "Lignes organisées de covoiturage avec trajets passagers offerts et départs garantis.",
    footer: "Autorités organisatrices de mobilité",
    cta_label: "Découvrir ce dispositif",
    cta_action: "scroll_to_territory_options"
  }
];

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
        name: "STAS – Bus & Tram",
        mode: "public_transport",
        provider: "STAS - Réseau de Saint-Étienne Métropole",
        age_min: 6,
        age_max: null,
        eligibility_notes: "Réseau de transports en commun de Saint-Étienne Métropole pour rejoindre ton activité en bus ou en tram. Tarification solidaire selon ta situation.",
        pricing: "110€/an (tarif solidaire) • Tarifs réduits disponibles",
        official_url: "https://www.reseau-stas.fr/tarifs"
      },
      {
        name: "VéliVert – Vélos en libre-service",
        mode: "bike_sharing",
        provider: "STAS - Service VéliVert",
        age_min: 14,
        age_max: null,
        eligibility_notes: "Vélos en libre-service pour les trajets courts en ville, pratique pour rejoindre ton club ou ton activité. Consulte les stations proches de chez toi.",
        pricing: "10€/an avec abonnement STAS • 30 min gratuites par trajet",
        official_url: "https://www.reseau-stas.fr"
      },
      {
        name: "Covoiturage local",
        mode: "carpooling",
        provider: "Région Auvergne-Rhône-Alpes (Mov'ici)",
        age_min: 18,
        age_max: null,
        eligibility_notes: "Partage de trajets entre familles ou habitants pour aller aux mêmes activités. À organiser avec ton club, ta structure ou ton entourage.",
        pricing: "Gratuit pour les passagers",
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
  const { data: userTerritory, isLoading } = useUserTerritory();

  // Détermine les options de mobilité selon le territoire
  const territoryMobility = userTerritory?.key ? TERRITORY_MOBILITY[userTerritory.key] : null;

  const dataSources = [
    { label: "data.gouv.fr", url: "https://www.data.gouv.fr" },
    { label: "ADEME Base Carbone", url: "https://basecarbone.ademe.fr" }
  ];

  const handleGeneralAidCTA = (action?: string) => {
    if (action === "scroll_to_territory_options") {
      document.getElementById("territory-options")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <PageLayout showHeader={false}>
      {/* PageHeader blanc standard */}
      <PageHeader
        title="Solutions de mobilité"
        subtitle="Découvrez les aides pour vos déplacements éco-responsables"
        backFallback="/"
        tourId="mobility-page-header"
      />

      <div className="container mx-auto px-4 py-6 pb-24" data-tour-id="mobility-page">
        {/* Intro */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Faites du bien à la planète</h2>
          <p className="text-muted-foreground">
            Pour aller à votre activité, plusieurs options de transport s'offrent à vous : transports en commun, vélos en libre-service ou covoiturage.
          </p>
        </div>

        {/* Territory indicator */}
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-48" />
          </div>
        ) : territoryMobility ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <MapPin className="w-4 h-4" />
            <span>Territoire : <strong>{territoryMobility.label}</strong></span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <MapPin className="w-4 h-4" />
            <span>Solutions de mobilité disponibles</span>
          </div>
        )}

        {/* Simulateur ADEME */}
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
              onClick={() => window.open('https://nosgestesclimat.fr/simulateur/bilan', '_blank')}
            >
              <Calculator className="mr-2 h-4 w-4" />
              Lancer le simulateur
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Section Aides générales */}
        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold">Aides et solutions d'éco-mobilité</h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {GENERAL_MOBILITY_AIDS.map((card) => (
              <Card key={card.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {card.badges.map((badge, idx) => (
                      <Badge key={idx} variant="secondary">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <CardDescription className="text-sm leading-relaxed">
                    {card.text}
                  </CardDescription>
                </CardContent>

                <CardFooter className="flex flex-col items-start gap-3">
                  <p className="text-xs text-muted-foreground">{card.footer}</p>
                  <Button
                    onClick={() => handleGeneralAidCTA(card.cta_action)}
                    variant="outline"
                    className="w-full"
                  >
                    {card.cta_label}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* Section Solutions par territoire */}
        <section className="space-y-4 mb-10" id="territory-options">
          <h2 className="text-2xl font-semibold">
            {territoryMobility ? `Solutions spécifiques à ${territoryMobility.city}` : "Solutions par territoire"}
          </h2>

          {territoryMobility && territoryMobility.options.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {territoryMobility.options.map((option) => {
                const IconComponent = getModeIcon(option.mode);
                const modeColor = getModeColor(option.mode);
                return (
                  <Card key={option.name} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-accent">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{option.name}</CardTitle>
                          <Badge variant="secondary" className={modeColor}>
                            {getModeLabel(option.mode)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm leading-relaxed">{option.eligibility_notes}</p>
                      <div className="pt-2 border-t">
                        <p className="text-sm font-semibold text-primary">{option.pricing}</p>
                        <p className="text-xs text-muted-foreground mt-1">{option.provider}</p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(option.official_url, '_blank')}
                      >
                        En savoir plus
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="text-center py-8">
              <CardContent>
                <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Connectez-vous pour voir les solutions de mobilité disponibles sur votre territoire.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

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

      <BottomNavigation />
    </PageLayout>
  );
};

export default EcoMobilite;
