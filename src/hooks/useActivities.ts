import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Import generated activity images
import activityJudo69 from "@/assets/activity-judo-6-9.jpg";
import activityNatation69 from "@/assets/activity-natation-6-9.jpg";
import activityMultisports1013 from "@/assets/activity-multisports-10-13.jpg";
import activityEscalade1417 from "@/assets/activity-escalade-14-17.jpg";
import activityHiphop1417 from "@/assets/activity-hiphop-14-17.jpg";
import activityMusique69 from "@/assets/activity-musique-6-9.jpg";
import activityTheatre69 from "@/assets/activity-theatre-6-9.jpg";
import activityArts1013 from "@/assets/activity-arts-10-13.jpg";
import activityPhoto1417 from "@/assets/activity-photo-14-17.jpg";
import activityRobotique1013 from "@/assets/activity-robotique-10-13.jpg";
import activityJeux69 from "@/assets/activity-jeux-6-9.jpg";
import activityCuisine69 from "@/assets/activity-cuisine-6-9.jpg";
import activityJardinage1013 from "@/assets/activity-jardinage-10-13.jpg";
import activitySoutien69 from "@/assets/activity-soutien-6-9.jpg";
import activityCode1013 from "@/assets/activity-code-10-13.jpg";
import activityStageFoot69 from "@/assets/activity-stage-foot-6-9.jpg";
import activityCamp1013 from "@/assets/activity-camp-10-13.jpg";
import activitySejour1417 from "@/assets/activity-sejour-14-17.jpg";

// Image mapping for database paths
const imageMap: Record<string, string> = {
  '/src/assets/activity-judo-6-9.jpg': activityJudo69,
  '/src/assets/activity-natation-6-9.jpg': activityNatation69,
  '/src/assets/activity-multisports-10-13.jpg': activityMultisports1013,
  '/src/assets/activity-escalade-14-17.jpg': activityEscalade1417,
  '/src/assets/activity-hiphop-14-17.jpg': activityHiphop1417,
  '/src/assets/activity-musique-6-9.jpg': activityMusique69,
  '/src/assets/activity-theatre-6-9.jpg': activityTheatre69,
  '/src/assets/activity-arts-10-13.jpg': activityArts1013,
  '/src/assets/activity-photo-14-17.jpg': activityPhoto1417,
  '/src/assets/activity-robotique-10-13.jpg': activityRobotique1013,
  '/src/assets/activity-jeux-6-9.jpg': activityJeux69,
  '/src/assets/activity-cuisine-6-9.jpg': activityCuisine69,
  '/src/assets/activity-jardinage-10-13.jpg': activityJardinage1013,
  '/src/assets/activity-soutien-6-9.jpg': activitySoutien69,
  '/src/assets/activity-code-10-13.jpg': activityCode1013,
  '/src/assets/activity-stage-foot-6-9.jpg': activityStageFoot69,
  '/src/assets/activity-camp-10-13.jpg': activityCamp1013,
  '/src/assets/activity-sejour-14-17.jpg': activitySejour1417,
};

export interface Activity {
  id: string;
  title: string;
  image: string;
  distance?: string;
  ageRange: string;
  category: string;
  categories?: string[];
  price: number;
  hasAccessibility: boolean;
  hasFinancialAid: boolean;
  periodType?: string;
  structureName?: string;
  structureAddress?: string;
  vacationPeriods?: string[];
}

interface ActivityFilters {
  category?: string;
  maxPrice?: number;
  hasAccessibility?: boolean;
  ageMin?: number;
  ageMax?: number;
  limit?: number;
  vacationPeriod?: string;
}

const mapActivityFromDB = (dbActivity: any): Activity => {
  // Use first image from images array if available
  let imageUrl = dbActivity.images && dbActivity.images.length > 0 
    ? dbActivity.images[0] 
    : dbActivity.cover;
  
  // Map database path to imported image
  if (imageUrl && imageMap[imageUrl]) {
    imageUrl = imageMap[imageUrl];
  }
  
  return {
    id: dbActivity.id,
    title: dbActivity.title,
    image: imageUrl || "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=600&fit=crop",
    ageRange: `${dbActivity.age_min}-${dbActivity.age_max} ans`,
    category: dbActivity.category,
    categories: dbActivity.categories || [dbActivity.category],
    price: Number(dbActivity.price_base) || 0,
    hasAccessibility: dbActivity.accessibility_checklist?.wheelchair === true,
    hasFinancialAid: Array.isArray(dbActivity.accepts_aid_types) && dbActivity.accepts_aid_types.length > 0,
    periodType: dbActivity.period_type,
    structureName: dbActivity.structures?.name,
    structureAddress: dbActivity.structures?.address,
    vacationPeriods: dbActivity.vacation_periods,
  };
};

export const useActivities = (filters?: ActivityFilters) => {
  return useQuery({
    queryKey: ["activities", filters],
    queryFn: async () => {
      let query = supabase
        .from("activities")
        .select(`
          id, title, category, categories, age_min, age_max, price_base,
          images, accessibility_checklist, accepts_aid_types,
          capacity_policy, covoiturage_enabled, structure_id, period_type,
          vacation_periods,
          structures:structure_id (name, address)
        `)
        .eq("published", true);

      if (filters?.category) {
        query = query.contains("categories", [filters.category]);
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

      if (filters?.vacationPeriod) {
        query = query.contains("vacation_periods", [filters.vacationPeriod]);
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
