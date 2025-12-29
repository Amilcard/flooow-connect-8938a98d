/**
 * Configuration du système de synchronisation transport
 * Mode par défaut: mock (safe, ne touche pas la DB)
 */

export type TransportSyncMode = 'mock' | 'auto';

export interface TransportSyncConfig {
  mode: TransportSyncMode;
  supabaseUrl?: string;
  supabaseServiceRoleKey?: string;
  chunkSize: number;
  reconcileDays: number;
  defaultSpeedKmh: number;
  carbonFactorKgPerKm: number;
}

export const getConfig = (): TransportSyncConfig => {
  const mode = (process.env.TS_MODE || 'mock') as TransportSyncMode;

  // Validation: en mode auto, les variables d'environnement sont requises
  if (mode === 'auto') {
    if (!process.env.TS_SUPABASE_URL || !process.env.TS_SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error(
        'Mode auto requiert TS_SUPABASE_URL et TS_SUPABASE_SERVICE_ROLE_KEY'
      );
    }
  }

  return {
    mode,
    supabaseUrl: process.env.TS_SUPABASE_URL,
    supabaseServiceRoleKey: process.env.TS_SUPABASE_SERVICE_ROLE_KEY,
    chunkSize: Number.parseInt(process.env.TS_CHUNK_SIZE || '200', 10),
    reconcileDays: Number.parseInt(process.env.TS_RECONCILE_DAYS || '1', 10),
    defaultSpeedKmh: Number.parseInt(process.env.TS_DEFAULT_SPEED_KMH || '40', 10),
    carbonFactorKgPerKm: 0.12, // 120g CO2/km économisé vs voiture
  };
};
