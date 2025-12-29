/**
 * LOT 5 - Financial Aid Page Complete Redesign
 * Updated with plain text contacts (telephone, permanence, url_info)
 */

import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { SharedAidCalculator } from "@/components/aids/SharedAidCalculator";
import { AidsSectionsList } from "@/components/FinancialAid/AidsSectionsList";
import { AidsInfoBox } from "@/components/FinancialAid/AidsInfoBox";
import { FinancialAid } from "@/types/FinancialAid";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

// School Year Aids Data
const schoolYearAids: FinancialAid[] = [
  {
    code: "PASS_SPORT",
    name: "Pass'Sport",
    short_label: "70€",
    category: "sport",
    description_courte: "Aide nationale pour réduire le coût d'une licence ou adhésion sportive dans un club partenaire.",
    telephone: "Standard ministère des Sports (orientation Pass'Sport) : 01 40 45 90 00",
    permanence: "Du lundi au vendredi en heures ouvrées (horaires à vérifier sur le site officiel).",
    url_info: "https://www.pass.sports.gouv.fr"
  },
  {
    code: "PASS_REGION_JEUNES",
    name: "Pass'Région – Jeunes Auvergne-Rhône-Alpes",
    short_label: "Variable",
    category: "sport_culture_permis",
    description_courte: "Aide régionale pour les jeunes scolarisés en Auvergne-Rhône-Alpes (sport, culture, manuels scolaires, permis...).",
    telephone: "Plateforme d'information jeunes AURA : 04 86 27 98 50",
    permanence: "Du lundi au vendredi, horaires indicatifs de bureau (à vérifier sur le site régional).",
    url_info: "https://jeunes.auvergnerhonealpes.fr"
  },
  {
    code: "PASS_CULTURE",
    name: "Pass Culture",
    short_label: "50€",
    category: "culture",
    description_courte: "Crédit pour les jeunes afin de financer activités et achats culturels via l'application Pass Culture.",
    telephone: "Assistance Pass Culture (voir numéro mis à jour dans la rubrique Aide du site).",
    permanence: "Horaires variables selon le canal de contact, à vérifier sur le site.",
    url_info: "https://pass.culture.fr"
  },
  {
    code: "ARS_RENTREE",
    name: "Allocation de rentrée scolaire (ARS)",
    short_label: "Variable",
    category: "scolarite",
    description_courte: "Aide de la Caf pour les dépenses de rentrée des enfants de 6 à 18 ans, sous conditions de ressources.",
    telephone: "Numéro national Caf : 3230",
    permanence: "Du lundi au vendredi, horaires variables selon les Caf départementales.",
    url_info: "https://www.caf.fr (rubrique Allocation de rentrée scolaire)"
  },
  {
    code: "BOURSE_COLLEGE",
    name: "Bourse des collèges",
    short_label: "Variable",
    category: "scolarite",
    description_courte: "Aide annuelle pour les élèves de collège, sous conditions de ressources.",
    telephone: "Contact via le secrétariat du collège ou le service départemental de l'Éducation nationale.",
    permanence: "Horaires d'ouverture de l'établissement scolaire ou des services académiques.",
    url_info: "https://www.service-public.fr/particuliers/vosdroits/F2442"
  }
];

// Vacations & Holidays Aids Data
const vacationsAids: FinancialAid[] = [
  {
    code: "VACAF_FAMILLE",
    name: "VACAF – Aide aux vacances familles",
    short_label: "Variable",
    category: "vacances",
    description_courte: "Aide des Caf pour financer des séjours en famille dans des structures labellisées VACAF.",
    telephone: "Numéro national Caf : 3230 (VACAF via la Caf de votre département).",
    permanence: "Du lundi au vendredi, selon les Caf.",
    url_info: "https://www.vacaf.org"
  },
  {
    code: "PASS_COLO",
    name: "Pass colo",
    short_label: "200-350€",
    category: "vacances_enfants",
    description_courte: "Aide pour les enfants l'année de leurs 11 ans afin de partir en colonie de vacances.",
    telephone: "Renseignements via la Caf (3230) ou la structure en charge du Pass colo mentionnée sur le site officiel.",
    permanence: "Horaires Caf ou organisme Pass colo (à vérifier en ligne).",
    url_info: "https://www.jeunes.gouv.fr/passcolo"
  },
  {
    code: "DEPART_18_25",
    name: "Départ 18:25 – ANCV",
    short_label: "Jusqu'à 200€",
    category: "vacances_jeunes",
    description_courte: "Programme d'aide aux vacances pour les jeunes de 18 à 25 ans sous conditions.",
    telephone: "Service bénéficiaires ANCV Départ 18:25 : 09 69 32 06 16",
    permanence: "En général du lundi au vendredi en journée (à vérifier sur le site ANCV).",
    url_info: "https://depart1825.com"
  }
];

interface Child {
  id: string;
  first_name: string;
  dob: string;
}

const Aides = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<{
    quotient_familial?: number;
    postal_code?: string;
  } | undefined>(undefined);
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      // Récupérer le profil utilisateur
      const { data: profile } = await supabase
        .from('profiles')
        .select('quotient_familial, postal_code')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setUserProfile({
          quotient_familial: profile.quotient_familial,
          postal_code: profile.postal_code
        });
      }

      // Récupérer les enfants
      const { data: childrenData } = await supabase
        .from('children')
        .select('id, first_name, dob')
        .eq('user_id', user.id);

      if (childrenData) {
        setChildren(childrenData);
      }
    };

    fetchUserData();
  }, [user]);

  return (
    <PageLayout showHeader={false}>
      <PageHeader
        title="Nos aides"
        subtitle="On simule. On économise."
        backFallback="/home"
      />

      {/* Main Content Container with max-width and horizontal padding */}
      <div className="max-w-5xl mx-auto px-4">
        {/* Simulateur d'aides avec reset automatique - periodType removed: user chooses period */}
        <SharedAidCalculator
          resetOnMount={true}
          userProfile={userProfile}
          children={children}
          activityPrice={100}
        />


        {/* Aids Sections List with Redesigned Cards */}
        <AidsSectionsList
          schoolYearAids={schoolYearAids}
          vacationsAids={vacationsAids}
        />

        {/* Info Box - Bon à savoir */}
        <AidsInfoBox />
      </div>

    </PageLayout>
  );
};

export default Aides;
