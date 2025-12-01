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
    images: [],
    age_min: dbActivity.age_min,
    age_max: dbActivity.age_max,
    price_base: dbActivity.price_base || 0,
    category: null,
    categories: dbActivity.categories,
    accessibility_checklist: null,
    accepts_aid_types: dbActivity.accepts_aid_types,
    period_type: dbActivity.period_type,
    structures: {
      name: null,
      address: dbActivity.address,
      city: dbActivity.city,
      postal_code: dbActivity.postal_code,
      location_lat: dbActivity.latitude,
      location_lng: dbActivity.longitude,
    },
    vacation_periods: dbActivity.vacation_periods,
    date_debut: dbActivity.date_debut,
    date_fin: dbActivity.date_fin,
    jours_horaires: dbActivity.jours_horaires,
    sessions: dbActivity.sessions,
    price_unit: dbActivity.price_unit,
    covoiturage_enabled: false,
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
          .from("activities")
          .select("id, title, description, categories, age_min, age_max, price_base, accepts_aid_types, tags, period_type, vacation_periods, address, city, postal_code, latitude, longitude, date_debut, date_fin, jours_horaires, sessions, price_unit")
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
        query = query.lte("age_min", filters.ageMax).gte("age_max", filters.ageMin);
      }

      if (filters?.periodType && filters.periodType !== 'all') {
        query = query.eq("period_type", filters.periodType);
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
