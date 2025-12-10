/**
 * Eco-Mobility Page
 * Updated with plain text contacts (telephone, permanence, url_info)
 * Aligned with FinancialAid page style
 */

import PageLayout from "@/components/PageLayout";
import { MobilityHeader } from "@/components/EcoMobility/MobilityHeader";
import { MobilitySolutionCard } from "@/components/EcoMobility/MobilitySolutionCard";
import { MobilityDataSources } from "@/components/EcoMobility/MobilityDataSources";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, MapPin, Info } from "lucide-react";
import { MobilitySolution, DataSource } from "@/types/Mobility";
import { useUserTerritory } from "@/hooks/useUserTerritory";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

// Mobility Solutions Data
const MOBILITY_SOLUTIONS: MobilitySolution[] = [
  {
    code: "STAS_TC",
    name: "STAS – Réseau tram et bus",
    short_label: "Transport en commun",
    modes: ["tram", "bus", "trolleybus"],
    category: "transport_en_commun",
    description_courte: "Lignes de tram et bus de Saint-Étienne Métropole pour accéder aux activités sans voiture.",
    telephone: "Allo STAS (information voyageurs) : 0800 041 042",
    permanence: "Du lundi au samedi (horaires exacts à vérifier sur le site STAS).",
    url_info: "https://www.reseau-stas.fr"
  },
  {
    code: "VELIVERT_VLS",
    name: "VéliVert – vélos en libre-service",
    short_label: "Vélos en libre-service",
    modes: ["velo_libre_service"],
    category: "velo",
    description_courte: "Service de vélos en libre-service et location sur Saint-Étienne Métropole.",
    telephone: "VéliVert : 04 77 37 18 36",
    permanence: "Horaires d'accueil indiqués sur le site VéliVert.",
    url_info: "https://www.velivert.fr"
  },
  {
    code: "MOOVIZY_MAAS",
    name: "Moovizy Saint-Étienne",
    short_label: "Appli mobilité",
    modes: ["infos_transports"],
    category: "application_mobilite",
    description_courte: "Application de mobilité pour planifier ses trajets (tram, bus, vélo, covoiturage, autopartage...).",
    telephone: "Renseignements via Allo STAS : 0800 041 042",
    permanence: "Du lundi au samedi (voir précisions STAS).",
    url_info: "Page d'information : rechercher « Moovizy Saint-Étienne »"
  },
  {
    code: "MOVICI_COVOITURAGE",
    name: "Mov'ici – covoiturage",
    short_label: "Covoiturage",
    modes: ["covoiturage"],
    category: "covoiturage",
    description_courte: "Plateforme de covoiturage du quotidien en Auvergne-Rhône-Alpes.",
    telephone: "Coordonnées selon le territoire (voir rubrique Contact sur le site Mov'ici).",
    permanence: "Selon les services partenaires.",
    url_info: "https://movici.auvergnerhonealpes.fr"
  },
  {
    code: "CITIZ_AUTOPARTAGE",
    name: "Citiz – voitures en autopartage",
    short_label: "Autopartage",
    modes: ["autopartage"],
    category: "autopartage",
    description_courte: "Voitures partagées disponibles sur réservation pour les trajets ponctuels.",
    telephone: "Contact Citiz : numéro indiqué pour l'agence locale sur le site Citiz.",
    permanence: "Selon l'agence Citiz (horaires consultables en ligne).",
    url_info: "https://citiz.coop"
  },
  {
    code: "MOBILISE_VILLE",
    name: "MobiliSÉ – application Ville de Saint-Étienne",
    short_label: "Appli services ville",
    modes: ["infos_ville"],
    category: "infos_ville",
    description_courte: "Application d'information de la Ville, incluant des rubriques mobilité et déplacements.",
    telephone: "Standard Ville de Saint-Étienne (voir contact sur le site de la Ville).",
    permanence: "Horaires d'ouverture des services municipaux.",
    url_info: "https://www.saint-etienne.fr (rechercher « application MobiliSÉ »)"
  },
  {
    code: "CO2_SIMULATOR",
    name: "Simulateur CO₂ transport",
    short_label: "Calculer impact CO₂",
    modes: ["information_CO2"],
    category: "information_CO2",
    description_courte: "Outil en ligne pour comparer l'impact carbone des différents modes de transport.",
    telephone: "Pas de permanence téléphonique dédiée.",
    permanence: "Service en ligne accessible 7j/7.",
    url_info: "https://monimpacttransport.fr"
  }
];

// Data Sources
const DATA_SOURCES: DataSource[] = [
  {
    code: "DATA_GOUV",
    label: "Open data transports et mobilités",
    description_parent: "Jeux de données publics (horaires, arrêts, lignes, etc.) potentiellement mobilisables à terme dans l'appli.",
    website: "https://www.data.gouv.fr"
  },
  {
    code: "ADEME_BASE_CARBONE",
    label: "Base Carbone – ADEME",
    description_parent: "Référentiel officiel français des facteurs d'émission pour calculer les impacts CO₂ des déplacements.",
    website: "https://basecarbone.ademe.fr"
  }
];

const EcoMobilite = () => {
  const { data: userTerritory, isLoading } = useUserTerritory();
  const { isAuthenticated } = useAuth();

  // Filtrer les solutions selon le territoire de l'utilisateur
  // Pour l'instant on affiche toutes les solutions
  const filteredSolutions = MOBILITY_SOLUTIONS;

  return (
    <PageLayout showHeader={false}>
      {/* Header */}
      <MobilityHeader />

      <div className="max-w-5xl mx-auto px-4 pb-24">
        {/* Simulateur CO2 - Highlighted Banner */}
        <Card className="mb-8 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-500 text-white">
                <Calculator className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-xl font-poppins">Calculer mon impact transport</CardTitle>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">
                    Gratuit
                  </Badge>
                </div>
                <CardDescription className="text-base font-poppins">
                  Estimez le CO₂ évité grâce à vos déplacements éco-responsables.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Info size={14} className="text-blue-600 shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground font-poppins">
                  monimpacttransport.fr
                </p>
              </div>
              <p className="text-xs text-muted-foreground font-poppins ml-5">
                Service en ligne accessible 7j/7
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mobility Solutions Grid */}
        <section className="space-y-6 mb-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground mb-1">Aides et mobilité</h2>
              {!isAuthenticated ? (
                <p className="text-sm text-muted-foreground font-poppins">
                  Connectez-vous pour voir les solutions disponibles sur votre territoire.
                </p>
              ) : userTerritory ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="font-poppins">
                    {userTerritory.name || "Saint-Étienne"}
                  </span>
                </div>
              ) : null}
            </div>
            <Badge variant="outline" className="text-xs whitespace-nowrap">
              Phase de test
            </Badge>
          </div>

          {/* Info note for beta phase */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground font-poppins">
              En phase de test, seules les données de Saint-Étienne Métropole sont affichées.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSolutions.map((solution) => (
              <MobilitySolutionCard key={solution.code} solution={solution} />
            ))}
          </div>
        </section>

        {/* Data Sources - Styled like AidsInfoBox */}
        <MobilityDataSources sources={DATA_SOURCES} />
      </div>
    </PageLayout>
  );
};

export default EcoMobilite;
