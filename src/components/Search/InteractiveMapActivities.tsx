import { useMemo, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Activity } from "@/types/domain";
import { MapPin, Loader2, Info } from "lucide-react";
import { validateCoordinates, safeErrorMessage } from "@/utils/sanitize";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DEFAULT_FRANCE_VIEW, CITY_PROMPT_TEXT } from "@/config/territories";

// Couleurs par catégorie
const CATEGORY_COLORS: Record<string, string> = {
  'Sport': '#EF4444',
  'Culture': '#8B5CF6',
  'Loisirs': '#F59E0B',
  'Scolarité': '#3B82F6',
};

const getCategoryColor = (category: string): string => {
  return CATEGORY_COLORS[category] || '#8B5CF6';
};

/**
 * Interface étendue pour activités avec coordonnées géographiques
 */
interface ActivityWithLocation extends Activity {
  location: {
    nom?: string;
    adresse: string;
    codePostal?: string;
    ville?: string;
    lat: number;
    lng: number;
  };
}

interface InteractiveMapActivitiesProps {
  activities: Activity[];
  centerCoordinates?: [number, number];
  zoom?: number;
  height?: string;
}

/**
 * Carte interactive Google Maps affichant les activités
 *
 * Migré de Leaflet vers Google Maps pour cohérence avec l'écran Itinéraire
 * Utilise le token Google Maps via Supabase Edge Function
 */
export function InteractiveMapActivities({
  activities,
  centerCoordinates = [DEFAULT_FRANCE_VIEW.center.lat, DEFAULT_FRANCE_VIEW.center.lng],
  zoom = DEFAULT_FRANCE_VIEW.zoom,
  height = "400px",
}: InteractiveMapActivitiesProps) {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter activités avec coordonnées valides
  const activitiesWithCoords = useMemo(() => {
    return activities.filter((activity): activity is ActivityWithLocation => {
      const a = activity as ActivityWithLocation;
      if (a.location?.lat === undefined || a.location?.lng === undefined) {
        return false;
      }
      const validation = validateCoordinates(a.location.lat, a.location.lng);
      return validation.isValid;
    });
  }, [activities]);

  // Calculate center basé sur activités disponibles
  const mapCenter = useMemo((): { lat: number; lng: number } => {
    if (activitiesWithCoords.length === 0) {
      return { lat: centerCoordinates[0], lng: centerCoordinates[1] };
    }

    const avgLat =
      activitiesWithCoords.reduce((sum, a) => sum + (a.location?.lat || 0), 0) /
      activitiesWithCoords.length;

    const avgLng =
      activitiesWithCoords.reduce((sum, a) => sum + (a.location?.lng || 0), 0) /
      activitiesWithCoords.length;

    return { lat: avgLat, lng: avgLng };
  }, [activitiesWithCoords, centerCoordinates]);

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = async () => {
      // Check if already loaded
      if (window.google?.maps) {
        setGoogleMapsLoaded(true);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('google-maps-token');
        if (error) throw error;

        if (data?.token) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${data.token}&libraries=places`;
          script.async = true;
          script.defer = true;
          script.onload = () => {
            setGoogleMapsLoaded(true);
            setIsLoading(false);
          };
          script.onerror = () => {
            setError("Erreur de chargement de Google Maps");
            setIsLoading(false);
          };
          document.head.appendChild(script);
        } else {
          throw new Error("Token Google Maps non disponible");
        }
      } catch (err) {
        console.error(safeErrorMessage(err, 'Load Google Maps'));
        setError("Erreur de configuration de la carte");
        setIsLoading(false);
      }
    };

    loadGoogleMaps();
  }, []);

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (!googleMapsLoaded || !mapContainer.current || activitiesWithCoords.length === 0) return;

    // Create map
    mapRef.current = new google.maps.Map(mapContainer.current, {
      center: mapCenter,
      zoom: zoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    // Create single InfoWindow instance (reused for all markers)
    infoWindowRef.current = new google.maps.InfoWindow();

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Create markers for each activity
    activitiesWithCoords.forEach((activity) => {
      const marker = new google.maps.Marker({
        position: { lat: activity.location.lat, lng: activity.location.lng },
        map: mapRef.current,
        title: activity.title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: getCategoryColor(activity.category),
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        animation: google.maps.Animation.DROP,
      });

      // InfoWindow content
      const infoContent = `
        <div style="min-width: 280px; max-width: 320px; font-family: system-ui, sans-serif;">
          ${activity.image ? `
            <img
              src="${activity.image}"
              alt="${activity.title}"
              style="width: 100%; height: 140px; object-fit: cover; border-radius: 8px; margin-bottom: 12px;"
              onerror="this.style.display='none'"
            />
          ` : ''}
          <h3 style="font-weight: 700; font-size: 16px; margin: 0 0 8px 0; color: #1a1a1a; line-height: 1.3;">
            ${activity.title}
          </h3>
          <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
            <span style="background: #f3f4f6; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">
              ${activity.ageRange}
            </span>
            <span style="font-weight: 700; color: #8B5CF6; font-size: 14px;">
              ${activity.price === 0 ? 'Gratuit' : activity.price + '€'}
            </span>
          </div>
          ${activity.categories && activity.categories.length > 0 ? `
            <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px;">
              ${activity.categories.slice(0, 3).map(cat => `
                <span style="border: 1px solid #e5e7eb; padding: 2px 8px; border-radius: 12px; font-size: 11px; color: #6b7280;">
                  ${cat}
                </span>
              `).join('')}
            </div>
          ` : ''}
          ${activity.location?.adresse ? `
            <p style="font-size: 12px; color: #6b7280; margin: 0 0 12px 0; display: flex; align-items: flex-start; gap: 4px;">
              <span style="flex-shrink: 0;">📍</span>
              <span>${activity.location.adresse}</span>
            </p>
          ` : ''}
          <div style="display: flex; gap: 8px;">
            <button
              onclick="window.location.href='/activity/${activity.id}'"
              style="flex: 1; background: #8B5CF6; color: white; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer;"
            >
              Voir détails
            </button>
            <button
              onclick="window.location.href='/activity/${activity.id}?tab=trajets'"
              style="background: white; border: 1px solid #e5e7eb; padding: 10px 12px; border-radius: 8px; cursor: pointer;"
              title="Voir l'itinéraire"
            >
              🧭
            </button>
          </div>
        </div>
      `;

      marker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(infoContent);
          infoWindowRef.current.open(mapRef.current, marker);
        }
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (activitiesWithCoords.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      activitiesWithCoords.forEach((activity) => {
        bounds.extend({ lat: activity.location.lat, lng: activity.location.lng });
      });
      mapRef.current.fitBounds(bounds, { padding: 50 });
    }

    // Cleanup
    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, [googleMapsLoaded, activitiesWithCoords, mapCenter, zoom, navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div
        className="flex flex-col items-center justify-center bg-muted/20 rounded-xl border border-border"
        style={{ height }}
      >
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center bg-destructive/10 rounded-xl border border-destructive/20"
        style={{ height }}
      >
        <MapPin className="w-12 h-12 text-destructive/40 mb-4" />
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  // Fallback si aucune activité avec coordonnées
  if (activitiesWithCoords.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center bg-muted/20 rounded-xl border-2 border-dashed border-muted"
        style={{ height }}
      >
        <Info className="w-16 h-16 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {CITY_PROMPT_TEXT}
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Sélectionnez une ville dans les filtres pour afficher les activités sur la carte.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Map container */}
      <div
        ref={mapContainer}
        className="rounded-xl overflow-hidden shadow-md border border-border"
        style={{ height, width: "100%" }}
      />

      {/* Info overlay - nombre d'activités */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md border border-border">
        <p className="text-sm font-medium text-foreground">
          <span className="font-bold text-primary">
            {activitiesWithCoords.length}
          </span>{" "}
          activité{activitiesWithCoords.length > 1 ? "s" : ""} sur la carte
        </p>
      </div>
    </div>
  );
}
