/**
 * Adaptateurs pour APIs externes (STAS/Moovizy, GTFS, Vélivert)
 * Mode mock par défaut, implémentation réelle TODO
 */

import { RawTransportStop } from './stops';
import { RawBikeStation } from './stations';

/**
 * Adaptateur STAS/Moovizy (arrêts bus/tram)
 */
export const fetchSTASStops = async (
  apiUrl: string,
  apiKey: string
): Promise<RawTransportStop[]> => {
  // TODO: Implémenter appel API STAS/Moovizy
  console.warn('[fetchSTASStops] Non implémenté - retourne mock');
  return [];
};

/**
 * Adaptateur GTFS (téléchargement + parsing)
 */
export const fetchGTFSStops = async (
  gtfsUrl: string
): Promise<RawTransportStop[]> => {
  // TODO: Télécharger GTFS zip, parser stops.txt
  console.warn('[fetchGTFSStops] Non implémenté - retourne mock');
  return [];
};

/**
 * Adaptateur Vélivert (stations vélos)
 */
export const fetchVelivertStations = async (
  apiUrl: string,
  apiKey: string
): Promise<RawBikeStation[]> => {
  // TODO: Implémenter appel API Vélivert
  console.warn('[fetchVelivertStations] Non implémenté - retourne mock');
  return [];
};

/**
 * Récupère les horaires temps réel pour un arrêt (STAS/GTFS-RT)
 */
export interface NextDeparture {
  line: string;
  destination: string;
  departure_time: Date;
  delay_min: number;
}

export const fetchNextDepartures = async (
  stopId: string,
  source: string,
  apiUrl: string,
  apiKey: string
): Promise<NextDeparture[]> => {
  // TODO: Implémenter appel API temps réel
  console.warn('[fetchNextDepartures] Non implémenté - retourne mock');
  return [
    {
      line: 'L1',
      destination: 'Terminus Nord',
      departure_time: new Date(Date.now() + 5 * 60 * 1000), // +5min
      delay_min: 0,
    },
    {
      line: 'L3',
      destination: 'Terminus Sud',
      departure_time: new Date(Date.now() + 12 * 60 * 1000), // +12min
      delay_min: 2,
    },
  ];
};
