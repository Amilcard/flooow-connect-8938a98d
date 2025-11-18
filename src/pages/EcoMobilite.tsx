/**
 * Eco-Mobility Page
 * Updated with plain text contacts (telephone, permanence, url_info)
 */

import { BottomNavigation } from "@/components/BottomNavigation";
import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { MobilitySolutionCard } from "@/components/EcoMobility/MobilitySolutionCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, ExternalLink, MapPin } from "lucide-react";
import { MobilitySolution, DataSource } from "@/types/Mobility";
import { useUserTerritory } from "@/hooks/useUserTerritory";
import { Skeleton } from "@/components/ui/skeleton";

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

  // Filtrer les solutions selon le territoire de l'utilisateur
  // Pour l'instant on affiche toutes les solutions
  // TODO: implémenter la règle hide_if_not_available_for_territory
  const filteredSolutions = MOBILITY_SOLUTIONS;

  return (
    <PageLayout showHeader={false}>
      {/* PageHeader */}
      <PageHeader
        title="Solutions de mobilité"
        subtitle="Découvrez les solutions pour vos déplacements éco-responsables"
        backFallback="/"
        tourId="mobility-page-header"
      />

      <div className="max-w-[1200px] mx-auto px-4 py-6 pb-24">
        {/* Intro */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 font-poppins">Faites du bien à la planète</h2>
          <p className="text-gray-600 font-poppins">
            Pour aller à votre activité, plusieurs options de transport s'offrent à vous : transports en commun, vélos en libre-service ou covoiturage.
          </p>
        </div>

        {/* Territory indicator */}
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-48" />
          </div>
        ) : userTerritory ? (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <MapPin className="w-4 h-4" />
            <span className="font-poppins">
              Territoire : <strong>{userTerritory.label || userTerritory.city || "Saint-Étienne"}</strong>
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <MapPin className="w-4 h-4" />
            <span className="font-poppins">Solutions de mobilité disponibles</span>
          </div>
        )}

        {/* Simulateur CO2 - Highlighted Banner */}
        <Card className="mb-8 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-500 text-white">
                <Calculator className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl mb-2 font-poppins">Calculer mon impact transport</CardTitle>
                <CardDescription className="text-base font-poppins">
                  Estimez le CO₂ évité grâce à vos déplacements éco-responsables. Utilisez le simulateur pour mesurer votre impact transport.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-700 font-poppins">
                🌐 https://monimpacttransport.fr
              </p>
              <p className="text-xs text-gray-500 font-poppins">
                Service en ligne accessible 7j/7
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mobility Solutions Grid */}
        <section className="space-y-6 mb-10">
          <h2 className="text-2xl font-semibold font-poppins">Solutions de mobilité</h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSolutions.map((solution) => (
              <MobilitySolutionCard key={solution.code} solution={solution} />
            ))}
          </div>
        </section>

        {/* Data Sources */}
        <Card className="bg-gray-50 border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-poppins">Sources des données</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {DATA_SOURCES.map((source) => (
                <div key={source.code} className="flex items-start gap-3">
                  <ExternalLink className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700 font-poppins">
                      {source.label}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5 font-poppins">
                      {source.description_parent}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 font-poppins break-all">
                      {source.website}
                    </p>
                  </div>
                </div>
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
