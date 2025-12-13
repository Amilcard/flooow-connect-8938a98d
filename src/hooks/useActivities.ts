import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Activity } from "@/types/domain";
import { toActivity } from "@/types/schemas";
import type { ActivityRaw } from "@/types/domain";
import { sanitizeSearchQuery } from "@/utils/sanitize";

export type { Activity } from "@/types/domain";

export async function fetchMockActivities() {
  const { data, error } = await supabase.functions.invoke('mock-activities', {
    headers: { 'Content-Type': 'application/json' }
  });
  if (error) {
    console.error("Error fetching mock activities:", error);
    throw error;
  }
  return data;
}

interface ActivityFilters {
  search?: string;
  category?: string;
  maxPrice?: number;
  hasAccessibility?: boolean;
  hasCovoiturage?: boolean;
  hasFinancialAid?: boolean;
  ageMin?: number;
  ageMax?: number;
  limit?: number;
  vacationPeriod?: string;
  searchQuery?: string;
  territoryId?: string;
  categories?: string[];
  mobilityTypes?: string[];
  periodType?: 'vacances' | 'scolaire' | 'all';
  financialAidsAccepted?: string[];
}

/**
 * FIX: Mapping simplifié - utilise colonnes dénormalisées organism_*
 * - Utilise `images` (array) depuis la table activities
 * - TECH-005: Récupère organism_name et city pour affichage sur cartes
 */
const mapActivityFromDB = (dbActivity: any): Activity => {
  const raw: ActivityRaw = {
    id: dbActivity.id,
    title: dbActivity.title,
    description: dbActivity.description,
    images: dbActivity.images || [],
    age_min: dbActivity.age_min,
    age_max: dbActivity.age_max,
    price_base: dbActivity.price_base || 0,
    category: dbActivity.category || dbActivity.categories?.[0] || null,
    categories: dbActivity.categories || [],
    accessibility_checklist: dbActivity.accessibility_checklist || null,
    accepts_aid_types: dbActivity.accepts_aid_types,
    period_type: dbActivity.period_type,
    // TECH-005: Utilise colonnes dénormalisées organism_* de la table activities
    structures: {
      name: dbActivity.organism_name || null,
      address: dbActivity.address || null,
      city: dbActivity.city || null,
      postal_code: dbActivity.postal_code || null,
      location_lat: dbActivity.latitude || null,
      location_lng: dbActivity.longitude || null,
    },
    lieu: {
      nom: null,
      adresse: null,
      transport: null,
    },
    mobilite: {
      TC: null,
      velo: null,
      covoit: dbActivity.covoiturage_enabled || false,
    },
    vacation_periods: dbActivity.vacation_periods || [],
    vacationType: dbActivity.vacation_type,
    durationDays: dbActivity.duration_days,
    hasAccommodation: dbActivity.has_accommodation,
    date_debut: null,
    date_fin: null,
    jours_horaires: null,
    creneaux: null,
    sessions: null,
    price_unit: dbActivity.price_unit,
    priceUnit: dbActivity.price_unit,
    covoiturage_enabled: dbActivity.covoiturage_enabled || false,
    santeTags: dbActivity.tags || [],
    prerequis: [],
    pieces: [],
  };
  return toActivity(raw);
};

/**
 * FIX: Utilise table `activities` (unifiée) sans jointure problématique
 * - Source unique de données
 * - Pas de jointure structures (évite erreur embed Supabase)
 * - Champ `is_published` (pas `published`) - colonne correcte en BDD
 */
export const useActivities = (filters?: ActivityFilters) => {
  const queryInfo = useQuery<{ activities: Activity[]; isRelaxed: boolean }>({
    queryKey: ["activities", filters],
    staleTime: 300000,
    gcTime: 600000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    queryFn: async () => {
      // FIX: Requête simplifiée sans jointure structures (évite erreur embed)
      const buildBaseQuery = () => {
        return supabase
          .from("activities")
          .select("*")
          .eq("is_published", true);
      };

      let query = buildBaseQuery();

      const rawSearchTerm = filters?.searchQuery || filters?.search;
      let searchTerm: string | null = null;

      if (rawSearchTerm) {
        searchTerm = sanitizeSearchQuery(rawSearchTerm);
        if (searchTerm) {
          query = query.or("title.ilike.%" + searchTerm + "%,description.ilike.%" + searchTerm + "%");
        }
      }

      if (filters?.category) {
        query = query.overlaps("categories", [filters.category]);
      }

      if (filters?.categories && filters.categories.length > 0) {
        query = query.overlaps("categories", filters.categories);
      }

      // REFACTOR: Utilise age_min/age_max de activities (pas session_age_*)
      if (filters?.ageMin !== undefined && filters?.ageMax !== undefined) {
        query = query.lte("age_min", filters.ageMax).gte("age_max", filters.ageMin);
      }

      if (filters?.periodType && filters.periodType !== 'all') {
        query = query.eq("period_type", filters.periodType);
      }

      if (filters?.maxPrice) {
        query = query.lte("price_base", filters.maxPrice);
      }

      // REFACTOR: Utilise accessibility_checklist (pas has_accessibility)
      if (filters?.hasAccessibility) {
        query = query.not("accessibility_checklist", "is", null);
      }

      // REFACTOR: Covoiturage uniquement (mobility_types n'existe pas en BDD)
      if (filters?.mobilityTypes?.includes('Covoiturage')) {
        query = query.eq("covoiturage_enabled", true);
      }

      if (filters?.hasFinancialAid) {
        query = query.not("accepts_aid_types", "is", null);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      } else {
        query = query.limit(50);
      }

      const { data, error } = await query.order("title", { ascending: true });

      if (error) {
        console.error("[useActivities] Error fetching activities:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          filters,
          timestamp: new Date().toISOString()
        });
        throw error;
      }

      return {
        activities: processActivities(data || []),
        isRelaxed: false
      };
    },
  });

  return {
    ...queryInfo,
    activities: queryInfo.data?.activities || [],
    isRelaxed: queryInfo.data?.isRelaxed || false
  };
};

const processActivities = (data: any[]): Activity[] => {
  const seenIds = new Set<string>();
  const uniqueActivities = data.filter((activity) => {
    if (seenIds.has(activity.id)) {
      return false;
    }
    seenIds.add(activity.id);
    return true;
  });

  return uniqueActivities.map((activity) =>
    mapActivityFromDB({
      ...activity,
    })
  );
};
