/**
 * Point d'entrée du système de synchronisation transport
 * Usage: TS_MODE=mock node src/transport-sync (safe, mock par défaut)
 *        TS_MODE=auto node src/transport-sync (production, nécessite TS_SUPABASE_URL + TS_SUPABASE_SERVICE_ROLE_KEY)
 */

import fs from 'fs';
import path from 'path';
import { getConfig } from './config';
import { normalizeOffer } from './lib/normalize';
import { createSyncClient, upsertOffers } from './lib/supabase';
import { runReconciliation } from './lib/reconcile';
import { RawTransportOffer, SyncResult } from './lib/types';

/**
 * Synchronisation complète (upsert + réconciliation)
 */
export const runSync = async (): Promise<SyncResult> => {
  const startTime = Date.now();
  const config = getConfig();
  
  console.log(`[TransportSync] Mode: ${config.mode}`);
  console.log(`[TransportSync] Chunk size: ${config.chunkSize}`);
  console.log(`[TransportSync] Reconcile days: ${config.reconcileDays}`);

  const result: SyncResult = {
    mode: config.mode,
    processed: 0,
    inserted: 0,
    updated: 0,
    expired: 0,
    errors: [],
    duration_ms: 0,
  };

  try {
    // 1. Charger les offres brutes
    let rawOffers: RawTransportOffer[] = [];
    const isMockMode = config.mode === 'mock';

    if (isMockMode) {
      // Mode mock: lire mocks/offers_example.json
      const mockPath = path.join(__dirname, 'mocks', 'offers_example.json');
      if (!fs.existsSync(mockPath)) {
        throw new Error(`Mock file not found: ${mockPath}`);
      }
      rawOffers = JSON.parse(fs.readFileSync(mockPath, 'utf-8'));
      console.log(`[Mock] Chargé ${rawOffers.length} offres depuis ${mockPath}`);
    } else {
      // Mode auto: TODO - appeler API externe (BlaBlaCar, SNCF, etc.)
      // Pour l'instant, on lève une erreur explicite
      throw new Error('Mode auto: intégration API externe non implémentée (TODO)');
    }

    result.processed = rawOffers.length;

    // 2. Normaliser les offres
    const normalized = rawOffers.map((raw) =>
      normalizeOffer(raw, config.defaultSpeedKmh, config.carbonFactorKgPerKm)
    );
    console.log(`[Normalize] ${normalized.length} offres normalisées`);

    // 3. Upsert en DB (si mode auto)
    if (!isMockMode) {
      if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
        throw new Error('Mode auto: variables Supabase manquantes');
      }

      const client = createSyncClient(config.supabaseUrl, config.supabaseServiceRoleKey);

      // Upsert
      const upsertResult = await upsertOffers(client, normalized, config.chunkSize);
      result.inserted = upsertResult.inserted;
      result.updated = upsertResult.updated;
      result.errors.push(...upsertResult.errors);

      console.log(`[Upsert] ✓ ${result.inserted} insérées`);

      // Réconciliation
      const reconcileResult = await runReconciliation(client, config.reconcileDays);
      result.expired = reconcileResult.expired;
      result.errors.push(...reconcileResult.errors);
    } else {
      console.log('[Mock] Mode safe: aucune écriture DB');
    }

    result.duration_ms = Date.now() - startTime;
    console.log(`[TransportSync] ✓ Terminé en ${result.duration_ms}ms`);

    return result;
  } catch (error) {
    result.errors.push(String(error));
    result.duration_ms = Date.now() - startTime;
    console.error('[TransportSync] Erreur:', error);
    return result;
  }
};

// Exécution CLI
if (require.main === module) {
  runSync()
    .then((result) => {
      console.log('\n=== RÉSULTAT SYNC ===');
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.errors.length > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error('Erreur fatale:', err);
      process.exit(1);
    });
}
