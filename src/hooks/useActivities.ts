import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Activity } from "@/types/domain";
import { toActivity } from "@/types/schemas";
import type { ActivityRaw } from "@/types/domain";
import { sanitizeSearchQuery } from "@/utils/sanitize";

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
  territoryId?: string; // Nouveau: filtre par territoire
  categories?: string[]; // Nouveau: support multi-catégories
  mobilityTypes?: string[]; // Nouveau: support mobilité
}

const mapActivityFromDB = (dbActivity: any): Activity => {
  // Use first image from images array if available (now using Unsplash URLs directly)
  const imageUrl = dbActivity.images && dbActivity.images.length > 0
    ? dbActivity.images[0]
    : dbActivity.cover;

  // Parse PostGIS location (GeoJSON format) to extract lat/lng
  let location_lat: number | undefined;
  let location_lng: number | undefined;

  if (dbActivity.structures?.location) {
    try {
      const location = dbActivity.structures.location;
      // PostGIS returns GeoJSON: { type: "Point", coordinates: [lng, lat] }
      if (location.type === "Point" && Array.isArray(location.coordinates)) {
        location_lng = location.coordinates[0]; // Longitude (x)
        location_lat = location.coordinates[1]; // Latitude (y)
      }
    } catch (e) {
      console.warn("Failed to parse location from structures:", e);
    }
  }

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
    structures: {
      ...dbActivity.structures,
      location_lat,
      location_lng,
    },
    vacation_periods: dbActivity.vacation_periods,
    covoiturage_enabled: dbActivity.covoiturage_enabled,
    // Nouveaux champs pour tarification vacances
    priceUnit: dbActivity.price_unit,
    vacationType: dbActivity.vacation_type,
    durationDays: dbActivity.duration_days,
    hasAccommodation: dbActivity.has_accommodation,
  };

  return toActivity(raw);
};

export const useActivities = (filters?: ActivityFilters) => {
  const queryInfo = useQuery<{ activities: Activity[]; isRelaxed: boolean }>({
    queryKey: ["activities", filters],
    staleTime: 300000, // 5min
    gcTime: 600000, // 10min
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    queryFn: async () => {
      // Date limite dynamique - Activités à partir d'aujourd'hui
      const CUTOFF_DATE = new Date().toISOString().split('T')[0];
      
      // Fonction helper pour construire la requête de base
      const buildBaseQuery = () => {
        return supabase
          .from("activities")
          .select(`
            id, title, description, category, categories, age_min, age_max, price_base,
            images, accessibility_checklist, accepts_aid_types, tags,
            capacity_policy, covoiturage_enabled, structure_id, period_type,
            vacation_periods, price_unit, vacation_type, duration_days, has_accommodation,
            structures:structure_id (name, address, territory_id, location),
            availability_slots(start)
          `)
          .eq("published", true);
          
        // Only filter by date if availability_slots exists (handled by application logic or specific filter)
        // For now, we remove the strict inner join date filter to allow activities without slots to appear
        // .gte("availability_slots.start", CUTOFF_DATE);
      };

      let query = buildBaseQuery();

      // Filtrer par territoire si spécifié
      if (filters?.territoryId) {
        query = query.eq("structures.territory_id", filters.territoryId);
      }

      // Support both search and searchQuery for compatibility
      const rawSearchTerm = filters?.searchQuery || filters?.search;
      let searchTerm: string | null = null;
      
      if (rawSearchTerm) {
        // Sanitize search query to prevent LIKE wildcard abuse
        searchTerm = sanitizeSearchQuery(rawSearchTerm);
        if (searchTerm) {
          // Recherche insensible aux accents et casse dans title, description ET tags (exact match pour tags)
          query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`);
        }
      }

      if (filters?.category) {
        // Legacy support for single category
        query = query.overlaps("categories", [filters.category]);
      }

      if (filters?.categories && filters.categories.length > 0) {
        // Multi-category support
        query = query.overlaps("categories", filters.categories);
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

      if (filters?.mobilityTypes && filters.mobilityTypes.includes('Covoiturage')) {
        query = query.eq("covoiturage_enabled", true);
      }

      if (filters?.hasFinancialAid) {
        query = query.not("accepts_aid_types", "is", null);
      }

      // Filtre par aides financières spécifiques (OR logic)
      if (filters?.financialAidsAccepted && filters.financialAidsAccepted.length > 0) {
        // Construire une requête OR pour chaque aide
        // Format: accepts_aid_types @> '["pass_sport"]' OR accepts_aid_types @> '["pass_culture"]'
        const aidsConditions = filters.financialAidsAccepted.map(aid => 
          `accepts_aid_types.cs.{"${aid}"}`
        ).join(',');
        
        query = query.or(aidsConditions);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      } else {
        query = query.limit(50); // Augmenté pour afficher toutes les activités réelles
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("[useActivities] Error fetching activities:", {
          error,
          filters,
          timestamp: new Date().toISOString()
        });
        throw error;
      }

      // --- LOGIQUE RELAXED SEARCH ---
      // Si on a 0 résultat, qu'on a un terme de recherche, et qu'on a d'autres filtres actifs
      const hasOtherFilters = !!(
        filters?.category || 
        filters?.maxPrice !== undefined || 
        filters?.hasAccessibility || 
        (filters?.ageMin !== undefined && filters?.ageMax !== undefined) ||
        filters?.vacationPeriod ||
        filters?.hasCovoiturage ||
        filters?.hasFinancialAid
      );

      if ((!data || data.length === 0) && searchTerm && hasOtherFilters) {
        console.log("No strict results, trying relaxed search for:", searchTerm);
        
        // On relance une recherche "élargie" : juste le terme, sans les filtres restrictifs
        let relaxedQuery = buildBaseQuery();
        
        // On garde quand même le filtre territoire s'il est là, car c'est structurel
        if (filters?.territoryId) {
          relaxedQuery = relaxedQuery.eq("structures.territory_id", filters.territoryId);
        }

        // On réapplique la recherche texte
        relaxedQuery = relaxedQuery.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`);
        
        // On limite aussi
        relaxedQuery = relaxedQuery.limit(10);
        
        const { data: relaxedData, error: relaxedError } = await relaxedQuery.order("created_at", { ascending: false });
        
        if (!relaxedError && relaxedData && relaxedData.length > 0) {
          // On a trouvé des résultats en élargissant !
          return {
            activities: processActivities(relaxedData),
            isRelaxed: true
          };
        }
      }

      return {
        activities: processActivities(data || []),
        isRelaxed: false
      };
    },
  });

  return {
    ...queryInfo,
    // Helper pour accéder directement aux activités (rétro-compatibilité partielle via destructuring adapté)
    activities: queryInfo.data?.activities || [],
    isRelaxed: queryInfo.data?.isRelaxed || false
  };
};

// Helper pour traiter les données brutes DB
const processActivities = (data: any[]): Activity[] => {
  // Dédupliquer les activités par ID
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
      cover: activity.images?.[0],
    })
  );
};
