/**
 * Gestion des stations vélos partagés (Vélivert)
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { calculateDistanceMeters } from './stops';

export interface RawBikeStation {
  station_id: string;
  source: string; // 'velivert'
  name: string;
  lat: number;
  lon: number;
  available_bikes?: number;
  available_slots?: number;
  raw?: Record<string, any>;
}

export interface NormalizedBikeStation {
  station_id: string;
  source: string;
  name: string;
  lat: number;
  lon: number;
  available_bikes: number;
  available_slots: number;
  raw: Record<string, any>;
  updated_at: Date;
}

/**
 * Normalise une station brute
 */
export const normalizeStation = (raw: RawBikeStation): NormalizedBikeStation => {
  return {
    station_id: raw.station_id,
    source: raw.source,
    name: raw.name,
    lat: raw.lat,
    lon: raw.lon,
    available_bikes: raw.available_bikes || 0,
    available_slots: raw.available_slots || 0,
    raw: raw.raw || {},
    updated_at: new Date(),
  };
};

/**
 * Upsert des stations en base (batch)
 */
export const upsertStations = async (
  client: SupabaseClient,
  stations: NormalizedBikeStation[],
  chunkSize: number
): Promise<{ inserted: number; errors: string[] }> => {
  let inserted = 0;
  const errors: string[] = [];

  for (let i = 0; i < stations.length; i += chunkSize) {
    const chunk = stations.slice(i, i + chunkSize);

    try {
      const { data, error } = await client
        .from('bike_stations')
        .upsert(chunk, {
          onConflict: 'station_id,source',
          ignoreDuplicates: false,
        })
        .select('id');

      if (error) {
        errors.push(`Stations chunk ${i}: ${error.message}`);
        continue;
      }

      inserted += data?.length || 0;
    } catch (err) {
      errors.push(`Stations chunk ${i}: ${String(err)}`);
    }
  }

  return { inserted, errors };
};

/**
 * Trouve les N stations les plus proches d'une origine (lat, lon)
 */
export const findNearestStations = async (
  client: SupabaseClient,
  originLat: number,
  originLon: number,
  radiusMeters = 2000,
  limit = 5
): Promise<Array<NormalizedBikeStation & { distance_m: number }>> => {
  // Approximation rapide bbox
  const latDelta = radiusMeters / 111000;
  const lonDelta = radiusMeters / (111000 * Math.cos((originLat * Math.PI) / 180));

  const { data, error } = await client
    .from('bike_stations')
    .select('*')
    .gte('lat', originLat - latDelta)
    .lte('lat', originLat + latDelta)
    .gte('lon', originLon - lonDelta)
    .lte('lon', originLon + lonDelta);

  if (error || !data) {
    console.error('[findNearestStations] Error:', error);
    return [];
  }

  // Calcul distance réelle + tri
  const withDistance = data.map((station: any) => ({
    ...station,
    distance_m: calculateDistanceMeters(originLat, originLon, station.lat, station.lon),
  }));

  return withDistance
    .filter((s) => s.distance_m <= radiusMeters)
    .sort((a, b) => a.distance_m - b.distance_m)
    .slice(0, limit);
};

/**
 * Calcule l'économie carbone pour un trajet vélo
 * @param distanceKm Distance en km
 * @param carbonFactorKgPerKm Facteur carbone (kg CO2/km)
 */
export const calculateBikeCarbonSaved = (
  distanceKm: number,
  carbonFactorKgPerKm = 0.12
): number => {
  return Number.parseFloat((distanceKm * carbonFactorKgPerKm).toFixed(4));
};
