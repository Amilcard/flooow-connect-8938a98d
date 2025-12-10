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

const mapActivityFromDB = (dbActivity: any): Activity => {
  const raw: ActivityRaw = {
    id: dbActivity.id,
    title: dbActivity.title,
    description: dbActivity.description,
    images: dbActivity.image_url ? [dbActivity.image_url] : [],
    age_min: dbActivity.age_min,
    age_max: dbActivity.age_max,
    price_base: dbActivity.price_base || 0,
    category: dbActivity.category || null,
    categories: dbActivity.categories,
    accessibility_checklist: dbActivity.accessibility || null,
    accepts_aid_types: dbActivity.accepts_aid_types,
    period_type: dbActivity.period_type,
    structures: {
      name: dbActivity.organism_name || dbActivity.lieu_nom || null,
      address: dbActivity.address,
      city: dbActivity.city,
      postal_code: dbActivity.postal_code,
      location_lat: dbActivity.latitude,
      location_lng: dbActivity.longitude,
    },
    lieu: {
      nom: dbActivity.lieu_nom,
      adresse: dbActivity.address,
      transport: dbActivity.transport_info,
    },
    mobilite: {
      TC: dbActivity.mobility_tc,
      velo: dbActivity.mobility_velo,
      covoit: dbActivity.mobility_covoit || dbActivity.covoiturage_enabled,
    },
    vacation_periods: dbActivity.vacation_periods,
    vacationType: dbActivity.vacation_type,
    durationDays: dbActivity.duration_days,
    hasAccommodation: dbActivity.has_accommodation,
    date_debut: dbActivity.date_debut,
    date_fin: dbActivity.date_fin,
    jours_horaires: dbActivity.jours_horaires,
    creneaux: dbActivity.creneaux,
    sessions: dbActivity.sessions_json,
    price_unit: dbActivity.price_unit,
    priceUnit: dbActivity.price_unit,
    covoiturage_enabled: dbActivity.covoiturage_enabled || dbActivity.mobility_covoit,
    santeTags: dbActivity.sante_tags,
    prerequis: dbActivity.prerequis,
    pieces: dbActivity.pieces_a_fournir,
  };
  return toActivity(raw);
};

export const useActivities = (filters?: ActivityFilters) => {
  const queryInfo = useQuery<{ activities: Activity[]; isRelaxed: boolean }>({
    queryKey: ["activities", filters],
    staleTime: 300000,
    gcTime: 600000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    queryFn: async () => {
      const buildBaseQuery = () => {
        return supabase
          .from("activities_with_sessions")
          .select(`
            id, title, description, category, categories,
            age_min, age_max, price_base, price_unit, accepts_aid_types, tags,
            period_type, vacation_periods, vacation_type, duration_days, has_accommodation,
            address, city, postal_code, latitude, longitude,
            date_debut, date_fin, jours_horaires, creneaux, sessions_json,
            image_url, is_published,
            lieu_nom, transport_info, mobility_tc, mobility_velo, mobility_covoit,
            sante_tags, prerequis, pieces_a_fournir,
            organism_name, organism_type, organism_phone, organism_email, organism_website,
            covoiturage_enabled, accessibility, has_accessibility, mobility_types
          `)
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

      if (filters?.ageMin !== undefined && filters?.ageMax !== undefined) {
        query = query.lte("session_age_min", filters.ageMax).gte("session_age_max", filters.ageMin);
      }

      if (filters?.periodType && filters.periodType !== 'all') {
        query = query.eq("period_type", filters.periodType);
      }

      if (filters?.maxPrice) {
        query = query.lte("price_base", filters.maxPrice);
      }

      if (filters?.hasAccessibility) {
        query = query.eq("has_accessibility", true);
      }

      if (filters?.mobilityTypes && filters.mobilityTypes.length > 0) {
        query = query.overlaps("mobility_types", filters.mobilityTypes);
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
