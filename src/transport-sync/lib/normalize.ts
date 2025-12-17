/**
 * Normalisation des offres transport brutes
 */

import { RawTransportOffer, NormalizedTransportOffer } from './types';

/**
 * Calcule la distance en mètres entre deux points GPS (formule Haversine)
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Rayon de la Terre en mètres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // Distance en mètres
};

/**
 * Calcule le temps de trajet si departure/arrival fournis, sinon estime via vitesse moyenne
 */
export const calculateTravelTime = (
  departureTime: Date | null,
  arrivalTime: Date | null,
  distanceM: number,
  defaultSpeedKmh: number
): number => {
  if (departureTime && arrivalTime) {
    const diffMs = arrivalTime.getTime() - departureTime.getTime();
    return Math.round(diffMs / 60000); // Convertir ms en minutes
  }

  // Fallback: estimation via vitesse moyenne
  const distanceKm = distanceM / 1000;
  const travelTimeHours = distanceKm / defaultSpeedKmh;
  return Math.round(travelTimeHours * 60);
};

/**
 * Normalise une offre brute en format DB
 */
export const normalizeOffer = (
  raw: RawTransportOffer,
  defaultSpeedKmh: number,
  carbonFactorKgPerKm: number
): NormalizedTransportOffer => {
  // Calcul distance
  const distance_m = raw.distance_m || calculateDistance(
    raw.start_lat,
    raw.start_lon,
    raw.end_lat,
    raw.end_lon
  );

  // Conversion horaires
  const departure_time = raw.departure_time ? new Date(raw.departure_time) : null;
  const arrival_time = raw.arrival_time ? new Date(raw.arrival_time) : null;

  // Calcul temps trajet
  const travel_time_min = raw.travel_time_min || calculateTravelTime(
    departure_time,
    arrival_time,
    distance_m,
    defaultSpeedKmh
  );

  // Calcul carbone économisé
  const distance_km = distance_m / 1000;
  const carbon_saved_kg = raw.carbon_saved_kg || Number.parseFloat((distance_km * carbonFactorKgPerKm).toFixed(4));

  // Prix en centimes (évite float)
  const price_cents = raw.price_cents || 0;
  const price_estimate = price_cents / 100; // Compatibilité ancienne colonne

  return {
    external_id: raw.external_id,
    source: raw.source,
    mode: raw.mode,
    activity_id: null, // À lier manuellement ou via geocoding
    station_id: null,
    
    start_lat: raw.start_lat,
    start_lon: raw.start_lon,
    end_lat: raw.end_lat,
    end_lon: raw.end_lon,
    
    price_cents,
    currency: raw.currency || 'EUR',
    price_estimate,
    
    departure_time,
    arrival_time,
    
    distance_m,
    travel_time_min,
    carbon_saved_kg,
    
    raw: raw.raw || {},
    expired: false,
    updated_at: new Date(),
  };
};
