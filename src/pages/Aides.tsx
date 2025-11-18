/**
 * LOT 5 - Financial Aid Page Complete Redesign
 * Refonte complète avec design system Flooow
 * Components: FinancialAidHeader, SimulatorCTABanner, AidsSectionsList, AidsInfoBox
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
    id: "PASS_SPORT",
    title: "Pass'Sport",
    amount: "70€",
    age_range: "6-30 ans",
    type: "Sport",
    description: "Réduction de 70 € sur l'inscription dans un club sportif partenaire.",
    organizer: "Ministère des Sports",
    category: "school_year",
    eligibility_criteria: {
      is_qpv_required: false,
      other_requirements: ["Bénéficiaire de certaines allocations"]
    },
    external_url: "https://www.pass.sports.gouv.fr",
    check_eligibility_needed: true
  },
  {
    id: "BOURSE_COLLEGE",
    title: "Bourse des collèges",
    amount: "Variable",
    age_range: "11-15 ans",
    type: "Scolarité",
    description: "Aide annuelle pour les familles d'élèves de collège, calculée selon les revenus du foyer.",
    organizer: "Éducation nationale",
    category: "school_year",
    eligibility_criteria: {
      is_qpv_required: false,
      income_ceiling: 25000
    },
    external_url: "https://www.education.gouv.fr",
    check_eligibility_needed: true
  },
  {
    id: "ARS",
    title: "ARS - Aide de rentrée scolaire",
    amount: "Variable",
    age_range: "6-18 ans",
    type: "Rentrée",
    description: "Aide pour les dépenses de rentrée scolaire : fournitures, équipement sportif et activités périscolaires.",
    organizer: "CAF / MSA",
    category: "school_year",
    eligibility_criteria: {
      is_qpv_required: false,
      income_ceiling: 25000
    },
    external_url: "https://www.caf.fr",
    check_eligibility_needed: true
  },
  {
    id: "PASS_CULTURE",
    title: "Pass Culture",
    amount: "50€",
    age_range: "15-18 ans",
    type: "Culture",
    description: "Crédit pour financer livres, cinéma, concerts, musées et sorties culturelles.",
    organizer: "Ministère de la Culture",
    category: "school_year",
    eligibility_criteria: {
      is_qpv_required: false
    },
    external_url: "https://pass.culture.fr"
  },
  {
    id: "PASS_REGION",
    title: "PASS'Région Jeunes",
    amount: "Variable",
    age_range: "15-25 ans",
    type: "Lycée",
    description: "Aides pour manuels scolaires, équipement sportif, activités culturelles et parfois le permis de conduire.",
    organizer: "Région Auvergne-Rhône-Alpes",
    category: "school_year",
    eligibility_criteria: {
      is_qpv_required: false,
      other_requirements: ["Lycéen ou apprenti en AURA"]
    },
    external_url: "https://www.auvergnerhonealpes.fr/passregionjeunes",
    check_eligibility_needed: true
  }
];

// Vacations & Holidays Aids Data
const vacationsAids: FinancialAid[] = [
  {
    id: "PASS_COLO",
    title: "Pass Colo",
    amount: "200-350€",
    age_range: "11-17 ans",
    type: "Colonie",
    description: "Aide de 200 à 350 € pour participer à une colonie de vacances labellisée.",
    organizer: "État / VACAF",
    category: "vacations",
    eligibility_criteria: {
      is_qpv_required: false,
      income_ceiling: 30000
    },
    external_url: "https://www.jeunes.gouv.fr/la-foire-aux-questions-pass-colo-pour-les-familles-2127",
    check_eligibility_needed: true
  },
  {
    id: "VACAF",
    title: "Aides vacances CAF (VACAF)",
    amount: "Variable",
    age_range: "0-18 ans",
    type: "Vacances",
    description: "Participation au coût des séjours en famille, colonies de vacances et centres de loisirs agréés.",
    organizer: "CAF",
    category: "vacations",
    eligibility_criteria: {
      is_qpv_required: false,
      other_requirements: ["Allocataire CAF"]
    },
    external_url: "https://www.caf.fr",
    check_eligibility_needed: true
  },
  {
    id: "DEPART_18_25",
    title: "Départ 18-25",
    amount: "Jusqu'à 200€",
    age_range: "18-25 ans",
    type: "Voyage",
    description: "Jusqu'à 200 € d'aide pour partir en vacances avec un budget limité. Séjours en France et Europe.",
    organizer: "ANCV",
    category: "vacations",
    eligibility_criteria: {
      is_qpv_required: false,
      income_ceiling: 17280
    },
    external_url: "https://depart1825.com",
    check_eligibility_needed: true
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
