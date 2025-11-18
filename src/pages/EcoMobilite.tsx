/**
 * Eco-Mobility Page
 * Updated with new data structure: contacts, CTAs, territory scope
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
    name: "STAS – Tram et bus",
    short_label: "Transports en commun",
    modes: ["tram", "bus", "trolleybus"],
    description_parent: "Réseau de transports en commun de Saint-Étienne Métropole : tramways, bus, trolleybus et services adaptés (scolaires, Handi'Stas…).",
    territory_scope: "Saint-Étienne Métropole",
    primary_cta: {
      label: "Voir horaires et plans STAS",
      type: "link",
      url: "https://www.reseau-stas.fr",
      open_mode: "in_app_webview"
    },
    secondary_ctas: [
      {
        label: "Infos accessibilité / Handi'Stas",
        type: "link",
        url: "https://www.reseau-stas.fr/fr/handistas/39",
        open_mode: "in_app_webview"
      }
    ],
    contacts: {
      website: "https://www.reseau-stas.fr",
      phone: {
        display: "0800 041 042",
        tel_href: "tel:+33800041042",
        note: "Allo STAS – appel et service gratuits."
      },
      email: null
    }
  },
  {
    code: "VELIVERT_VLS",
    name: "VéliVert – vélos en libre-service",
    short_label: "Vélos en libre-service",
    modes: ["velo_libre_service"],
    description_parent: "Vélos en libre-service sur Saint-Étienne Métropole : bornes en ville, abonnements courte et longue durée, tarifs réduits possibles.",
    territory_scope: "Saint-Étienne Métropole",
    primary_cta: {
      label: "Voir les stations et tarifs",
      type: "link",
      url: "https://www.velivert.fr",
      open_mode: "in_app_webview"
    },
    secondary_ctas: [],
    contacts: {
      website: "https://www.velivert.fr",
      phone: {
        display: "04 77 37 18 36",
        tel_href: "tel:+33477371836",
        note: "Agence VéliVert – informations abonnements et stations."
      },
      email: "velivert@saint-etienne-metropole.fr"
    }
  },
  {
    code: "MOOVIZY_MAAS",
    name: "Moovizy Saint-Étienne",
    short_label: "Appli tous déplacements",
    modes: ["tram", "bus", "velo", "covoiturage", "autopartage", "train", "taxi"],
    description_parent: "Application MaaS qui regroupe tous les modes de déplacement : itinéraires en temps réel, achat de titres STAS, VéliVert, covoiturage Mov'ici, autopartage Citiz, etc.",
    territory_scope: "Saint-Étienne Métropole + liaisons vers Lyon",
    primary_cta: {
      label: "Découvrir l'appli Moovizy",
      type: "link",
      url: "https://www.reseau-stas.fr/fr/lappli-moovizy/9",
      open_mode: "in_app_webview"
    },
    secondary_ctas: [
      {
        label: "Moovizy sur Google Play",
        type: "link",
        url: "https://play.google.com/store/apps/details?id=fr.cityway.android_v2.stas",
        open_mode: "external_tab"
      },
      {
        label: "Moovizy sur l'App Store",
        type: "link",
        url: "https://apps.apple.com/fr/app/moovizy-saint-etienne/id944230356",
        open_mode: "external_tab"
      }
    ],
    contacts: {
      website: "https://www.reseau-stas.fr/fr/lappli-moovizy/9",
      phone: {
        display: "0800 041 042",
        tel_href: "tel:+33800041042",
        note: "Allo STAS pour toute question sur Moovizy et les titres de transport."
      },
      email: null
    }
  },
  {
    code: "MOVICI_COVOITURAGE",
    name: "Mov'ici – covoiturage Auvergne-Rhône-Alpes",
    short_label: "Covoiturage domicile-loisirs",
    modes: ["covoiturage"],
    description_parent: "Plateforme régionale de covoiturage du quotidien (travail, études, loisirs) soutenue par la Région Auvergne-Rhône-Alpes et intégrée à Moovizy.",
    territory_scope: "Auvergne-Rhône-Alpes (dont Saint-Étienne Métropole)",
    primary_cta: {
      label: "Accéder à Mov'ici",
      type: "link",
      url: "https://movici.auvergnerhonealpes.fr",
      open_mode: "in_app_webview"
    },
    secondary_ctas: [],
    contacts: {
      website: "https://movici.auvergnerhonealpes.fr",
      phone: {
        display: "Voir les contacts sur le site Mov'ici",
        tel_href: null,
        note: "Les coordonnées varient selon les territoires partenaires."
      },
      email: null
    }
  },
  {
    code: "CITIZ_AUTOPARTAGE",
    name: "Citiz – voitures en autopartage",
    short_label: "Voiture en libre-service",
    modes: ["autopartage"],
    description_parent: "Voitures partagées en station pour les trajets ponctuels (week-end, compétition sportive, sortie famille), accessible aussi via Moovizy.",
    territory_scope: "Saint-Étienne Métropole et réseau Citiz national",
    primary_cta: {
      label: "Voir les stations Citiz",
      type: "link",
      url: "https://citiz.coop",
      open_mode: "in_app_webview"
    },
    secondary_ctas: [],
    contacts: {
      website: "https://citiz.coop",
      phone: {
        display: "Voir le contact Citiz Saint-Étienne sur le site",
        tel_href: null,
        note: "Numéros et mails diffèrent selon les agences locales."
      },
      email: null
    }
  },
  {
    code: "MOBILISE_VILLE",
    name: "MobiliSÉ Saint-Étienne",
    short_label: "Appli services ville",
    modes: ["infos_transports", "infos_ville"],
    description_parent: "Application officielle de la Ville de Saint-Étienne : infos de quartier, démarches, actualités, et liens vers les mobilités (transports, parkings, etc.).",
    territory_scope: "Ville de Saint-Étienne",
    primary_cta: {
      label: "Infos sur MobiliSÉ",
      type: "link",
      url: "https://www.saint-etienne.fr/les-applications-et-les-plateformes-numeriques-indispensables-saint-etienne",
      open_mode: "in_app_webview"
    },
    secondary_ctas: [
      {
        label: "MobiliSÉ sur Google Play",
        type: "link",
        url: "https://play.google.com/store/apps/details?id=com.saintetienne.mobilise",
        open_mode: "external_tab"
      },
      {
        label: "MobiliSÉ sur l'App Store",
        type: "link",
        url: "https://apps.apple.com/fr/app/mobilis%C3%A9-saint-%C3%A9tienne/id1100145971",
        open_mode: "external_tab"
      }
    ],
    contacts: {
      website: "https://www.saint-etienne.fr",
      phone: {
        display: "Standard Ville de Saint-Étienne (voir site)",
        tel_href: null,
        note: "Les demandes liées à l'appli sont traitées via les canaux de contact de la Ville."
      },
      email: null
    }
  },
  {
    code: "CO2_SIMULATOR",
    name: "Simulateur CO₂ transport",
    short_label: "Calculer l'impact de mon trajet",
    modes: ["information_CO2"],
    description_parent: "Outil en ligne pour comparer l'empreinte carbone de différents modes de transport (voiture, train, bus, covoiturage, etc.) et encourager les choix éco-responsables.",
    territory_scope: "National",
    primary_cta: {
      label: "Lancer le simulateur",
      type: "link",
      url: "https://monimpacttransport.fr",
      open_mode: "in_app_webview"
    },
    secondary_ctas: [],
    contacts: {
      website: "https://monimpacttransport.fr",
      phone: null,
      email: null
    }
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
            <Button
              className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 font-poppins"
              onClick={() => window.location.href = 'https://monimpacttransport.fr'}
            >
              <Calculator className="mr-2 h-4 w-4" />
              Lancer le simulateur
            </Button>
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
                    <a
                      href={source.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 font-poppins"
                    >
                      {source.label}
                    </a>
                    <p className="text-xs text-gray-600 mt-0.5 font-poppins">
                      {source.description_parent}
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
