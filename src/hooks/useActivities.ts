import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Activity {
  id: string;
  title: string;
  image: string;
  distance?: string;
  ageRange: string;
  category: string;
  price: number;
  hasAccessibility: boolean;
  hasFinancialAid: boolean;
  periodType?: string;
}

interface ActivityFilters {
  category?: string;
  maxPrice?: number;
  hasAccessibility?: boolean;
  ageMin?: number;
  ageMax?: number;
  limit?: number;
}

const mapActivityFromDB = (dbActivity: any): Activity => {
  // Use first image from images array if available
  const imageUrl = dbActivity.images && dbActivity.images.length > 0 
    ? dbActivity.images[0] 
    : dbActivity.cover;
  
  return {
    id: dbActivity.id,
    title: dbActivity.title,
    image: imageUrl || "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=600&fit=crop",
    ageRange: `${dbActivity.age_min}-${dbActivity.age_max} ans`,
    category: dbActivity.category,
    price: Number(dbActivity.price_base) || 0,
    hasAccessibility: dbActivity.accessibility_checklist?.wheelchair === true,
    hasFinancialAid: Array.isArray(dbActivity.accepts_aid_types) && dbActivity.accepts_aid_types.length > 0,
    periodType: dbActivity.period_type,
  };
};

export const useActivities = (filters?: ActivityFilters) => {
  return useQuery({
    queryKey: ["activities", filters],
    queryFn: async () => {
      let query = supabase
        .from("activities")
        .select(`
          id, title, category, age_min, age_max, price_base,
          images, accessibility_checklist, accepts_aid_types,
          capacity_policy, covoiturage_enabled, structure_id, period_type
        `)
        .eq("published", true);

      if (filters?.category) {
        query = query.eq("category", filters.category);
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
