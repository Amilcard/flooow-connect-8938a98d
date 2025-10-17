/**
 * Interface Supabase pour upsert/réconciliation
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NormalizedTransportOffer } from './types';

/**
 * Crée un client Supabase avec service role (admin)
 */
export const createSyncClient = (url: string, serviceRoleKey: string): SupabaseClient => {
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
};

/**
 * Upsert par batch (chunk) pour performance
 */
export const upsertOffers = async (
  client: SupabaseClient,
  offers: NormalizedTransportOffer[],
  chunkSize: number
): Promise<{ inserted: number; updated: number; errors: string[] }> => {
  let inserted = 0;
  let updated = 0;
  const errors: string[] = [];

  // Découpage en chunks
  for (let i = 0; i < offers.length; i += chunkSize) {
    const chunk = offers.slice(i, i + chunkSize);

    try {
      const { data, error } = await client
        .from('transport_offers')
        .upsert(chunk, {
          onConflict: 'external_id,source',
          ignoreDuplicates: false,
        })
        .select('id');

      if (error) {
        errors.push(`Chunk ${i}-${i + chunk.length}: ${error.message}`);
        continue;
      }

      // Estimation insert vs update (Supabase ne retourne pas le détail)
      // On suppose: si data.length < chunk.length => certains étaient déjà là (update)
      const upserted = data?.length || 0;
      inserted += upserted;
      // Approx: updated = chunk.length - inserted
      // (Note: Supabase ne distingue pas insert/update dans upsert)
    } catch (err) {
      errors.push(`Chunk ${i}-${i + chunk.length}: ${String(err)}`);
    }
  }

  return { inserted, updated: 0, errors }; // updated=0 car non distinguable
};

/**
 * Marque comme expired les offres non mises à jour depuis N jours
 */
export const reconcileExpired = async (
  client: SupabaseClient,
  reconcileDays: number
): Promise<{ expired: number; errors: string[] }> => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - reconcileDays);

  try {
    const { data, error } = await client
      .from('transport_offers')
      .update({ expired: true })
      .lt('updated_at', cutoffDate.toISOString())
      .eq('expired', false)
      .select('id');

    if (error) {
      return { expired: 0, errors: [error.message] };
    }

    return { expired: data?.length || 0, errors: [] };
  } catch (err) {
    return { expired: 0, errors: [String(err)] };
  }
};
