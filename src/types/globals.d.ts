/**
 * Global type declarations for third-party libraries
 * loaded via script tags (Google Maps, etc.)
 */

// Google Maps types (subset used in the app)
interface GoogleMapsGeocodeResult {
  formatted_address: string;
  geometry: {
    location: {
      lat(): number;
      lng(): number;
    };
  };
}

interface GoogleMapsDirectionsLeg {
  distance?: { value: number; text: string };
  duration?: { value: number; text: string };
  start_address?: string;
  end_address?: string;
  steps?: Array<{
    travel_mode: string;
    instructions?: string;
    distance?: { value: number; text: string };
    duration?: { value: number; text: string };
  }>;
}

interface GoogleMapsDirectionsResult {
  routes: Array<{
    legs: GoogleMapsDirectionsLeg[];
    overview_polyline?: { points: string };
  }>;
}

type GoogleMapsDirectionsStatus =
  | 'OK'
  | 'ZERO_RESULTS'
  | 'NOT_FOUND'
  | 'OVER_QUERY_LIMIT'
  | 'REQUEST_DENIED'
  | 'INVALID_REQUEST'
  | 'UNKNOWN_ERROR';

interface GoogleMapsGeocoder {
  geocode(
    request: { location?: { lat: number; lng: number }; address?: string },
    callback: (results: GoogleMapsGeocodeResult[], status: string) => void
  ): void;
}

interface GoogleMapsDirectionsService {
  route(
    request: {
      origin: string;
      destination: string;
      travelMode: string;
    },
    callback: (result: GoogleMapsDirectionsResult | null, status: GoogleMapsDirectionsStatus) => void
  ): void;
}

interface GoogleMapsDirectionsRenderer {
  setMap(map: GoogleMapsMap | null): void;
  setDirections(result: GoogleMapsDirectionsResult): void;
  setOptions(options: { polylineOptions?: { strokeColor: string; strokeWeight: number } }): void;
}

interface GoogleMapsMarker {
  setMap(map: GoogleMapsMap | null): void;
}

interface GoogleMapsMap {
  setCenter(latLng: { lat: number; lng: number }): void;
  setZoom(zoom: number): void;
}

interface GoogleMapsNamespace {
  maps: {
    Map: new (element: HTMLElement, options: { center: { lat: number; lng: number }; zoom: number }) => GoogleMapsMap;
    Geocoder: new () => GoogleMapsGeocoder;
    DirectionsService: new () => GoogleMapsDirectionsService;
    DirectionsRenderer: new () => GoogleMapsDirectionsRenderer;
    Marker: new (options: { position: { lat: number; lng: number }; map: GoogleMapsMap; title?: string }) => GoogleMapsMarker;
  };
}

// Usetiful types

// Extend Window interface
declare global {
  interface Window {
    google?: GoogleMapsNamespace;
  }
}

export {};
