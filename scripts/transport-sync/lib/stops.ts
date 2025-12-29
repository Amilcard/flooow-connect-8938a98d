/**
 * Gestion des arrêts transport en commun (STAS, GTFS)
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface RawTransportStop {
  stop_id: string;
  source: string; // 'stas', 'gtfs', 'moovizy'
  name: string;
  lat: number;
  lon: number;
  lines?: string[]; // Lignes desservies (ex: ['L1', 'L2'])
  raw?: Record<string, any>;
}

export interface NormalizedTransportStop {
  stop_id: string;
  source: string;
  name: string;
  lat: number;
  lon: number;
  lines: string[];
  raw: Record<string, any>;
  updated_at: Date;
}

/**
 * Calcule la distance en mètres entre deux points GPS (Haversine)
 */
export const calculateDistanceMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Rayon Terre en mètres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};

/**
 * Normalise un arrêt brut
 */
export const normalizeStop = (raw: RawTransportStop): NormalizedTransportStop => {
  return {
    stop_id: raw.stop_id,
    source: raw.source,
    name: raw.name,
    lat: raw.lat,
    lon: raw.lon,
    lines: raw.lines || [],
    raw: raw.raw || {},
    updated_at: new Date(),
  };
};

/**
 * Upsert des arrêts en base (batch)
 */
export const upsertStops = async (
  client: SupabaseClient,
  stops: NormalizedTransportStop[],
  chunkSize: number
): Promise<{ inserted: number; errors: string[] }> => {
  let inserted = 0;
  const errors: string[] = [];

  for (let i = 0; i < stops.length; i += chunkSize) {
    const chunk = stops.slice(i, i + chunkSize);

    try {
      const { data, error } = await client
        .from('transport_stops')
        .upsert(chunk, {
          onConflict: 'stop_id,source',
          ignoreDuplicates: false,
        })
        .select('id');

      if (error) {
        errors.push(`Stops chunk ${i}: ${error.message}`);
        continue;
      }

      inserted += data?.length || 0;
    } catch (err) {
      errors.push(`Stops chunk ${i}: ${String(err)}`);
    }
  }

  return { inserted, errors };
};

/**
 * Trouve les N arrêts les plus proches d'une origine (lat, lon)
 */
export const findNearestStops = async (
  client: SupabaseClient,
  originLat: number,
  originLon: number,
  radiusMeters = 2000,
  limit = 5
): Promise<Array<NormalizedTransportStop & { distance_m: number }>> => {
  // Approximation rapide: 1 degré ≈ 111km
  const latDelta = radiusMeters / 111000;
  const lonDelta = radiusMeters / (111000 * Math.cos((originLat * Math.PI) / 180));

  const { data, error } = await client
    .from('transport_stops')
    .select('*')
    .gte('lat', originLat - latDelta)
    .lte('lat', originLat + latDelta)
    .gte('lon', originLon - lonDelta)
    .lte('lon', originLon + lonDelta);

  if (error || !data) {
    console.error('[findNearestStops] Error:', error);
    return [];
  }

  // Calcul distance réelle (Haversine) et tri
  const withDistance = data.map((stop: any) => ({
    ...stop,
    distance_m: calculateDistanceMeters(originLat, originLon, stop.lat, stop.lon),
  }));

  return withDistance
    .filter((s) => s.distance_m <= radiusMeters)
    .sort((a, b) => a.distance_m - b.distance_m)
    .slice(0, limit);
};
