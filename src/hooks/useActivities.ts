import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Activity } from "@/types/domain";
import { toActivity } from "@/types/schemas";
import type { ActivityRaw } from "@/types/domain";

// Export le type depuis domain pour rétro-compatibilité
export type { Activity } from "@/types/domain";

// Fetch mock activities from edge function
export async function fetchMockActivities() {
  const { data, error } = await supabase.functions.invoke('mock-activities', {
    headers: { 'Content-Type': 'application/json' }
  });
  if (error) {
    console.error("Error fetching mock activities:", error);
    throw error;
  }
  return data; // array de 40 activités
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
}

const mapActivityFromDB = (dbActivity: any): Activity => {
  // Use first image from images array if available (now using Unsplash URLs directly)
  const imageUrl = dbActivity.images && dbActivity.images.length > 0 
    ? dbActivity.images[0] 
    : dbActivity.cover;
  
  // Mapper les données DB vers ActivityRaw puis utiliser toActivity
  const raw: ActivityRaw = {
    id: dbActivity.id,
    title: dbActivity.title,
    images: dbActivity.images,
    age_min: dbActivity.age_min,
    age_max: dbActivity.age_max,
    price_base: dbActivity.price_base,
    category: dbActivity.category,
    categories: dbActivity.categories,
    accessibility_checklist: dbActivity.accessibility_checklist,
    accepts_aid_types: dbActivity.accepts_aid_types,
    period_type: dbActivity.period_type,
    structures: dbActivity.structures,
    vacation_periods: dbActivity.vacation_periods,
    covoiturage_enabled: dbActivity.covoiturage_enabled,
  };

  return toActivity(raw);
};

export const useActivities = (filters?: ActivityFilters) => {
  return useQuery({
    queryKey: ["activities", filters],
    staleTime: 300000, // 5min
    gcTime: 600000, // 10min
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    queryFn: async () => {
      // Date limite ajustée pour afficher toutes les activités
      const CUTOFF_DATE = '2024-01-01';
      
      let query = supabase
        .from("activities")
        .select(`
          id, title, description, category, categories, age_min, age_max, price_base,
          images, accessibility_checklist, accepts_aid_types,
          capacity_policy, covoiturage_enabled, structure_id, period_type,
          vacation_periods,
          structures:structure_id (name, address),
          availability_slots!inner(start)
        `)
        .eq("published", true)
        .gte("availability_slots.start", CUTOFF_DATE);

      // Support both search and searchQuery for compatibility
      const searchTerm = filters?.searchQuery || filters?.search;
      if (searchTerm) {
        // Recherche insensible aux accents et casse dans title ET description
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (filters?.category) {
        // Use overlaps for array intersection (at least one match)
        query = query.overlaps("categories", [filters.category]);
      }

      if (filters?.maxPrice !== undefined) {
        query = query.lte("price_base", filters.maxPrice);
      }

      if (filters?.hasAccessibility) {
        query = query.eq("accessibility_checklist->>wheelchair", "true");
      }

      if (filters?.ageMin !== undefined && filters?.ageMax !== undefined) {
        query = query.lte("age_min", filters.ageMax).gte("age_max", filters.ageMin);
      }

      // Filtrer par période selon les DATES réelles des sessions
      if (filters?.vacationPeriod) {
        const periodDates = {
          printemps_2026: { start: "2026-04-04", end: "2026-04-20" },
          été_2026: { start: "2026-07-04", end: "2026-08-31" },
        }[filters.vacationPeriod];

        if (periodDates) {
          // Filtrer les activités qui ont au moins une session dans la période
          query = query
            .gte("availability_slots.start", periodDates.start)
            .lte("availability_slots.start", periodDates.end);
        }
      }

      if (filters?.hasCovoiturage) {
        query = query.eq("covoiturage_enabled", true);
      }

      if (filters?.hasFinancialAid) {
        query = query.not("accepts_aid_types", "is", null);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      } else {
        query = query.limit(10);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching activities:", error);
        throw error;
      }

      return (data || []).map((activity) => 
        mapActivityFromDB({
          ...activity,
          cover: activity.images?.[0],
        })
      );
    },
  });
};
