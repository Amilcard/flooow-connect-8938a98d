import { Database } from '@/integrations/supabase/types';

export type Activity = Database['public']['Tables']['activities']['Row'] & {
  structures?: {
    name: string;
    location?: { lat: number; lon: number } | null;
    address?: string | null;
  } | null;
  price_is_free?: boolean;
};
