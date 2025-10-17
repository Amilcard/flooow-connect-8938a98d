/**
 * Logique de réconciliation (marquer expired)
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { reconcileExpired } from './supabase';

/**
 * Exécute la réconciliation (marque expired=true les anciennes offres)
 */
export const runReconciliation = async (
  client: SupabaseClient,
  reconcileDays: number
): Promise<{ expired: number; errors: string[] }> => {
  console.log(`[Reconcile] Marquage expired pour offres > ${reconcileDays} jours...`);
  
  const result = await reconcileExpired(client, reconcileDays);
  
  if (result.expired > 0) {
    console.log(`[Reconcile] ✓ ${result.expired} offres marquées expired`);
  } else {
    console.log('[Reconcile] Aucune offre à marquer expired');
  }

  if (result.errors.length > 0) {
    console.error('[Reconcile] Erreurs:', result.errors);
  }

  return result;
};
