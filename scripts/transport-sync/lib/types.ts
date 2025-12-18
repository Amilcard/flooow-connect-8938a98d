/**
 * Types pour la synchronisation transport
 */

export interface RawTransportOffer {
  external_id: string;
  source: string; // 'blablacar', 'sncf', 'flixbus', etc.
  mode: string; // 'covoiturage', 'train', 'bus'
  
  // Géolocalisation
  start_lat: number;
  start_lon: number;
  end_lat: number;
  end_lon: number;
  
  // Prix (en centimes pour éviter float)
  price_cents?: number;
  currency?: string; // 'EUR' par défaut
  
  // Horaires
  departure_time?: string; // ISO 8601
  arrival_time?: string; // ISO 8601
  
  // Données calculées
  distance_m?: number;
  travel_time_min?: number;
  carbon_saved_kg?: number;
  
  // Données brutes pour audit
  raw?: Record<string, any>;
}

export interface NormalizedTransportOffer {
  external_id: string;
  source: string;
  mode: string;
  activity_id: string | null;
  station_id: string | null;
  
  start_lat: number;
  start_lon: number;
  end_lat: number;
  end_lon: number;
  
  price_cents: number;
  currency: string;
  price_estimate: number; // En euros, pour compatibilité ancienne colonne
  
  departure_time: Date | null;
  arrival_time: Date | null;
  
  distance_m: number;
  travel_time_min: number;
  carbon_saved_kg: number;
  
  raw: Record<string, any>;
  expired: boolean;
  updated_at: Date;
}

export interface SyncResult {
  mode: 'mock' | 'auto';
  processed: number;
  inserted: number;
  updated: number;
  expired: number;
  errors: string[];
  duration_ms: number;
}
