/**
 * LOT 5 - Financial Aid Page Complete Redesign
 * Updated with new data structure: contacts, CTAs, territory scope
 */

import { BottomNavigation } from "@/components/BottomNavigation";
import PageLayout from "@/components/PageLayout";
import { FinancialAidHeader } from "@/components/FinancialAid/FinancialAidHeader";
import { SimulatorCTABanner } from "@/components/FinancialAid/SimulatorCTABanner";
import { AidsSectionsList } from "@/components/FinancialAid/AidsSectionsList";
import { AidsInfoBox } from "@/components/FinancialAid/AidsInfoBox";
import { FinancialAid } from "@/types/FinancialAid";

// School Year Aids Data
const schoolYearAids: FinancialAid[] = [
  {
    code: "PASS_SPORT",
    name: "Pass'Sport",
    short_label: "70€",
    category: "Sport",
    who: "Pour les jeunes de 6 à 30 ans dont la famille bénéficie de l'allocation de rentrée scolaire (ARS) ou de l'allocation d'éducation de l'enfant handicapé (AEEH).",
    description_parent: "Une réduction de 70 € pour l'inscription dans un club sportif ou une association sportive affiliée à une fédération agréée.",
    territory_scope: "National",
    primary_cta: {
      label: "Vérifier mon éligibilité",
      type: "link",
      url: "https://www.pass.sports.gouv.fr",
      open_mode: "in_app_webview"
    },
    secondary_ctas: [
      {
        label: "Liste des clubs partenaires",
        type: "link",
        url: "https://www.pass.sports.gouv.fr/clubs",
        open_mode: "in_app_webview"
      }
    ],
    contacts: {
      website: "https://www.pass.sports.gouv.fr",
      phone: {
        display: "0 806 000 278",
        tel_href: "tel:0806000278",
        note: "Numéro vert (gratuit)"
      },
      email: "contact@sports.gouv.fr"
    }
  },
  {
    code: "PASS_REGION_JEUNES",
    name: "PASS'Région Jeunes",
    short_label: "Variable",
    category: "Lycée",
    who: "Pour les lycéens et apprentis de 15 à 25 ans inscrits dans un établissement de la région Auvergne-Rhône-Alpes.",
    description_parent: "Aide régionale pour financer les manuels scolaires, l'équipement sportif, les activités culturelles et dans certains cas, le permis de conduire.",
    territory_scope: "Auvergne-Rhône-Alpes",
    primary_cta: {
      label: "Demander le Pass'Région",
      type: "link",
      url: "https://www.auvergnerhonealpes.fr/passregionjeunes",
      open_mode: "in_app_webview"
    },
    secondary_ctas: [
      {
        label: "Guide d'utilisation",
        type: "link",
        url: "https://www.auvergnerhonealpes.fr/guide-passregion",
        open_mode: "in_app_webview"
      }
    ],
    contacts: {
      website: "https://www.auvergnerhonealpes.fr",
      phone: {
        display: "04 26 73 40 00",
        tel_href: "tel:0426734000"
      },
      email: "passregion@auvergnerhonealpes.fr"
    }
  },
  {
    code: "PASS_CULTURE",
    name: "Pass Culture",
    short_label: "50€",
    category: "Culture",
    who: "Pour tous les jeunes de 15 à 18 ans résidant en France, scolarisés ou non.",
    description_parent: "Crédit de 20€ à 30€ par an (selon l'âge) pour financer livres, cinéma, concerts, musées et sorties culturelles. 300€ offerts à 18 ans.",
    territory_scope: "National",
    primary_cta: {
      label: "Activer mon Pass Culture",
      type: "link",
      url: "https://pass.culture.fr",
      open_mode: "in_app_webview"
    },
    secondary_ctas: [
      {
        label: "Découvrir les offres",
        type: "link",
        url: "https://pass.culture.fr/offres",
        open_mode: "in_app_webview"
      }
    ],
    contacts: {
      website: "https://pass.culture.fr",
      phone: {
        display: "01 85 73 58 00",
        tel_href: "tel:0185735800",
        note: "Du lundi au vendredi, 10h-19h"
      },
      email: "support@passculture.app"
    }
  },
  {
    code: "ARS_RENTREE",
    name: "ARS - Aide de rentrée scolaire",
    short_label: "Variable",
    category: "Rentrée",
    who: "Pour les familles avec enfants scolarisés de 6 à 18 ans, sous conditions de ressources (plafonds CAF/MSA).",
    description_parent: "Aide annuelle pour les dépenses de rentrée scolaire : fournitures, équipement sportif et activités périscolaires. Montant variable selon l'âge de l'enfant.",
    territory_scope: "National",
    primary_cta: {
      label: "Vérifier mes droits CAF",
      type: "link",
      url: "https://www.caf.fr",
      open_mode: "in_app_webview"
    },
    secondary_ctas: [
      {
        label: "Simulateur ARS",
        type: "link",
        url: "https://www.caf.fr/allocataires/mes-services-en-ligne/estimer-vos-droits",
        open_mode: "in_app_webview"
      }
    ],
    contacts: {
      website: "https://www.caf.fr",
      phone: {
        display: "3230",
        tel_href: "tel:3230",
        note: "Numéro non surtaxé"
      }
    }
  },
  {
    code: "BOURSE_COLLEGE",
    name: "Bourse des collèges",
    short_label: "Variable",
    category: "Scolarité",
    who: "Pour les familles d'élèves de collège (11-15 ans) dont les ressources sont inférieures aux plafonds fixés par l'Éducation nationale.",
    description_parent: "Aide annuelle pour les familles d'élèves de collège, calculée selon les revenus du foyer et le nombre d'enfants à charge. Versée en 3 trimestres.",
    territory_scope: "National",
    primary_cta: {
      label: "Demander la bourse",
      type: "link",
      url: "https://www.education.gouv.fr/les-aides-financieres-au-college-4970",
      open_mode: "in_app_webview"
    },
    secondary_ctas: [
      {
        label: "Simulateur de bourse",
        type: "link",
        url: "https://www.education.gouv.fr/cid88/les-aides-financieres-au-college.html#simulateur",
        open_mode: "in_app_webview"
      }
    ],
    contacts: {
      website: "https://www.education.gouv.fr",
      phone: {
        display: "Votre collège",
        tel_href: null,
        note: "Contactez le secrétariat de votre établissement"
      }
    }
  }
];

// Vacations & Holidays Aids Data
const vacationsAids: FinancialAid[] = [
  {
    code: "VACAF_FAMILLE",
    name: "Aides vacances CAF (VACAF)",
    short_label: "Variable",
    category: "Vacances",
    who: "Pour les allocataires CAF avec enfants de 0 à 18 ans, sous conditions de ressources (quotient familial).",
    description_parent: "Participation au coût des séjours en famille, colonies de vacances et centres de loisirs agréés. Montant variable selon le quotient familial.",
    territory_scope: "National (CAF départementales)",
    primary_cta: {
      label: "Consulter mon espace CAF",
      type: "link",
      url: "https://www.caf.fr",
      open_mode: "in_app_webview"
    },
    secondary_ctas: [
      {
        label: "Trouver un séjour agréé",
        type: "link",
        url: "https://www.vacaf.org",
        open_mode: "in_app_webview"
      }
    ],
    contacts: {
      website: "https://www.caf.fr",
      phone: {
        display: "3230",
        tel_href: "tel:3230",
        note: "Numéro non surtaxé"
      }
    }
  },
  {
    code: "PASS_COLO",
    name: "Pass Colo",
    short_label: "200-350€",
    category: "Colonie",
    who: "Pour les jeunes de 11 à 17 ans dont la famille bénéficie de l'ARS ou a un quotient familial CAF inférieur à 1200€.",
    description_parent: "Aide de 200 à 350 € pour participer à une colonie de vacances labellisée. Montant variable selon le quotient familial et la durée du séjour.",
    territory_scope: "National",
    primary_cta: {
      label: "Demander le Pass Colo",
      type: "link",
      url: "https://www.jeunes.gouv.fr/la-foire-aux-questions-pass-colo-pour-les-familles-2127",
      open_mode: "in_app_webview"
    },
    secondary_ctas: [
      {
        label: "Liste des séjours éligibles",
        type: "link",
        url: "https://www.jeunes.gouv.fr/sejours-pass-colo",
        open_mode: "in_app_webview"
      }
    ],
    contacts: {
      website: "https://www.jeunes.gouv.fr",
      phone: {
        display: "01 40 45 90 00",
        tel_href: "tel:0140459000",
        note: "Ministère de l'Éducation"
      },
      email: "pass-colo@jeunesse-sports.gouv.fr"
    }
  },
  {
    code: "DEPART_18_25",
    name: "Départ 18-25",
    short_label: "Jusqu'à 200€",
    category: "Voyage",
    who: "Pour les jeunes de 18 à 25 ans résidant en France avec des ressources inférieures à 17 280 € par an.",
    description_parent: "Jusqu'à 200 € d'aide pour partir en vacances avec un budget limité. Séjours en France et en Europe, en autonomie ou organisés.",
    territory_scope: "National",
    primary_cta: {
      label: "Créer mon dossier",
      type: "link",
      url: "https://depart1825.com",
      open_mode: "in_app_webview"
    },
    secondary_ctas: [
      {
        label: "Découvrir les destinations",
        type: "link",
        url: "https://depart1825.com/destinations",
        open_mode: "in_app_webview"
      }
    ],
    contacts: {
      website: "https://depart1825.com",
      phone: {
        display: "09 69 32 24 06",
        tel_href: "tel:0969322406",
        note: "Du lundi au vendredi, 9h-18h"
      },
      email: "contact@depart1825.com"
    }
  }
];

const Aides = () => {
  return (
    <PageLayout showHeader={false}>
      {/* Enhanced Header with Gradient Orange */}
      <FinancialAidHeader />

      {/* Main Content Container with max-width and horizontal padding */}
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Prominent Simulator CTA Banner (Blue) */}
        <SimulatorCTABanner />

        {/* Aids Sections List with Redesigned Cards */}
        <AidsSectionsList
          schoolYearAids={schoolYearAids}
          vacationsAids={vacationsAids}
        />

        {/* Info Box - Bon à savoir */}
        <AidsInfoBox />
      </div>

      {/* Bottom margin for navigation */}
      <div className="h-20" />

      <BottomNavigation />
    </PageLayout>
  );
};

export default Aides;
