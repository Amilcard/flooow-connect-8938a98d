import { supabase } from '@/integrations/supabase/client';
import { SearchActivitiesSchema } from '@/lib/validations/schemas';
import { z } from 'zod';

export async function searchActivities(rawParams: unknown) {
  try {
    const params = SearchActivitiesSchema.parse(rawParams);
    
    let query = supabase
      .from('activities')
      .select('*', { count: 'exact' });
    
    // FIX: column is 'categories' (array), not 'category'
    if (params.category) {
      query = query.overlaps('categories', [params.category]);
    }
    
    if (params.age) {
      query = query
        .lte('age_min', params.age)
        .gte('age_max', params.age);
    }
    
    if (params.price_max) {
      query = query.lte('price_base', params.price_max);
    }
    
    const offset = (params.page - 1) * params.limit;
    query = query
      .range(offset, offset + params.limit - 1)
      .order('created_at', { ascending: false });
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      success: true,
      data,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / params.limit)
      }
    };
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      };
    }
    throw error;
  }
}
