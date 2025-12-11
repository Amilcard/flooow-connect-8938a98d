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
 * REFACTOR: Mapping unifié depuis table `activities` + jointure `structures`
 * - Utilise `images` (array) au lieu de `image_url`
 * - Utilise `structures` (jointure) au lieu de `organism_*`
 * - Utilise `accessibility_checklist` au lieu de `accessibility`
 */
const mapActivityFromDB = (dbActivity: any): Activity => {
  const raw: ActivityRaw = {
    id: dbActivity.id,
    title: dbActivity.title,
    description: dbActivity.description,
    // REFACTOR: images est un array, pas image_url
    images: dbActivity.images || [],
    age_min: dbActivity.age_min,
    age_max: dbActivity.age_max,
    price_base: dbActivity.price_base || 0,
    category: dbActivity.category || dbActivity.categories?.[0] || null,
    categories: dbActivity.categories || [],
    // REFACTOR: accessibility_checklist (Json)
    accessibility_checklist: dbActivity.accessibility_checklist || null,
    accepts_aid_types: dbActivity.accepts_aid_types,
    period_type: dbActivity.period_type,
    // REFACTOR: structures via jointure structure_id
    structures: {
      name: dbActivity.structures?.name || null,
      address: dbActivity.structures?.address || null,
      city: null,
      postal_code: null,
      location_lat: null,
      location_lng: null,
    },
    lieu: {
      nom: dbActivity.structures?.name || null,
      adresse: dbActivity.structures?.address || null,
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
 * REFACTOR: Utilise table `activities` (unifiée) au lieu de vue `activities_with_sessions`
 * - Source unique de données
 * - Jointure `structures:structure_id` pour les infos organisme
 * - Champ `published` (pas `is_published`)
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
      // REFACTOR: Table `activities` avec jointure `structures`
      const buildBaseQuery = () => {
        return supabase
          .from("activities")
          .select(`
            id, title, description, category, categories, images,
            age_min, age_max, price_base, price_unit, accepts_aid_types, tags,
            period_type, vacation_periods, vacation_type, duration_days, has_accommodation,
            covoiturage_enabled, accessibility_checklist, payment_echelonned,
            structures:structure_id (name, address)
          `)
          .eq("published", true);
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
        console.error("[useActivities] Error fetching activities:", { error, filters, timestamp: new Date().toISOString() });
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
