import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Activity } from "@/types/domain";
import { toActivity } from "@/types/schemas";
import type { ActivityRaw } from "@/types/domain";
import { sanitizeSearchQuery, safeErrorMessage } from "@/utils/sanitize";

export type { Activity } from "@/types/domain";

// HELPERS: Reduce cognitive complexity by extracting filter application logic

/**
 * Apply search filter to query
 */
const applySearchFilter = (
  query: ReturnType<typeof supabase.from>,
  searchQuery: string | undefined,
  search: string | undefined
): ReturnType<typeof supabase.from> => {
  const rawSearchTerm = searchQuery || search;
  if (!rawSearchTerm) return query;

  const searchTerm = sanitizeSearchQuery(rawSearchTerm);
  if (!searchTerm) return query;

  return query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
};

/**
 * Apply category filters to query
 */
const applyCategoryFilters = (
  query: ReturnType<typeof supabase.from>,
  category: string | undefined,
  categories: string[] | undefined
): ReturnType<typeof supabase.from> => {
  if (category) {
    query = query.overlaps("categories", [category]);
  }
  if (categories && categories.length > 0) {
    query = query.overlaps("categories", categories);
  }
  return query;
};

/**
 * Apply age and period filters to query
 */
const applyAgeAndPeriodFilters = (
  query: ReturnType<typeof supabase.from>,
  ageMin: number | undefined,
  ageMax: number | undefined,
  periodType: 'vacances' | 'scolaire' | 'all' | undefined
): ReturnType<typeof supabase.from> => {
  if (ageMin !== undefined && ageMax !== undefined) {
    query = query.lte("age_min", ageMax).gte("age_max", ageMin);
  }
  if (periodType && periodType !== 'all') {
    query = query.eq("period_type", periodType);
  }
  return query;
};

/**
 * Apply miscellaneous filters to query
 */
const applyMiscFilters = (
  query: ReturnType<typeof supabase.from>,
  maxPrice: number | undefined,
  hasAccessibility: boolean | undefined,
  mobilityTypes: string[] | undefined,
  hasFinancialAid: boolean | undefined
): ReturnType<typeof supabase.from> => {
  if (maxPrice) {
    query = query.lte("price_base", maxPrice);
  }
  if (hasAccessibility) {
    query = query.not("accessibility_checklist", "is", null);
  }
  if (mobilityTypes?.includes('Covoiturage')) {
    query = query.eq("covoiturage_enabled", true);
  }
  if (hasFinancialAid) {
    query = query.not("accepts_aid_types", "is", null);
  }
  return query;
};

export async function fetchMockActivities() {
  const { data, error } = await supabase.functions.invoke('mock-activities', {
    headers: { 'Content-Type': 'application/json' }
  });
  if (error) {
    console.error(safeErrorMessage(error, 'Fetch mock activities'));
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- DB response has dynamic shape
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
    date_debut: dbActivity.date_debut || null,
    date_fin: dbActivity.date_fin || null,
    jours_horaires: dbActivity.jours_horaires || null,
    lieuNom: dbActivity.lieu_nom || null,
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
      let query = supabase.from("activities").select("*").eq("is_published", true);

      // Apply filters using helper functions to reduce cognitive complexity
      query = applySearchFilter(query, filters?.searchQuery, filters?.search);
      query = applyCategoryFilters(query, filters?.category, filters?.categories);
      query = applyAgeAndPeriodFilters(query, filters?.ageMin, filters?.ageMax, filters?.periodType);
      query = applyMiscFilters(query, filters?.maxPrice, filters?.hasAccessibility, filters?.mobilityTypes, filters?.hasFinancialAid);

      // Apply limit
      query = query.limit(filters?.limit || 50);

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- DB response array has dynamic shape
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
