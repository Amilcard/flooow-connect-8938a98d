import { useEffect, useRef, useState, useMemo } from 'react';
import { Activity } from '@/types/activity';
import { useNavigate } from 'react-router-dom';
import { MapPin, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_MAP_CENTER } from '@/constants/locations';
import { safeErrorMessage } from '@/utils/sanitize';

interface ActivityLocation {
  lat: number;
  lng: number;
}

interface ActivityWithLocation extends Activity {
  location?: ActivityLocation | null;
}

interface ActivityMapProps {
  activities: Activity[];
}

/**
 * Carte interactive Google Maps affichant les activités
 *
 * Migré de Leaflet vers Google Maps pour cohérence UI
 * Utilise le token Google Maps via Supabase Edge Function
 */
export const ActivityMap = ({ activities }: ActivityMapProps) => {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Category color configuration
  const getCategoryColor = (category: string): string => {
    const normalized = category?.toLowerCase();
    switch (normalized) {
      case 'sport': return '#F97316';
      case 'culture': return '#A855F7';
      case 'loisirs': return '#EC4899';
      case 'scolarité': return '#3B82F6';
      case 'vacances': return '#10B981';
      case 'activités innovantes': return '#06B6D4';
      default: return '#8B5CF6';
    }
  };

  // Filter activities with valid coordinates
  const activitiesWithCoords = useMemo(() => {
    return (activities as ActivityWithLocation[]).filter((activity) => {
      return activity.location?.lat && activity.location?.lng;
    });
  }, [activities]);

  // Calculate center based on available activities
  const mapCenter = useMemo((): { lat: number; lng: number } => {
    if (activitiesWithCoords.length === 0) {
      return { lat: DEFAULT_MAP_CENTER[0], lng: DEFAULT_MAP_CENTER[1] };
    }

    const avgLat = activitiesWithCoords.reduce((sum, a) => {
      return sum + (a.location?.lat ?? 0);
    }, 0) / activitiesWithCoords.length;

    const avgLng = activitiesWithCoords.reduce((sum, a) => {
      return sum + (a.location?.lng ?? 0);
    }, 0) / activitiesWithCoords.length;

    return { lat: avgLat, lng: avgLng };
  }, [activitiesWithCoords]);

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
    if (!googleMapsLoaded || !mapContainer.current) return;

    // Create map
    mapRef.current = new google.maps.Map(mapContainer.current, {
      center: mapCenter,
      zoom: 13,
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
      const activityLocation = activity.location;
      if (!activityLocation) return;
      const color = getCategoryColor(activity.category);

      const marker = new google.maps.Marker({
        position: { lat: activityLocation.lat, lng: activityLocation.lng },
        map: mapRef.current,
        title: activity.title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        animation: google.maps.Animation.DROP,
      });

      // InfoWindow content
      const priceText = activity.price_base === 0
        ? 'Gratuit'
        : activity.price_base == null
          ? 'Tarif non communiqué'
          : `${activity.price_base}€`;
      const infoContent = `
        <div style="min-width: 200px; max-width: 280px; font-family: system-ui, sans-serif; padding: 4px;">
          <h3 style="font-weight: 700; font-size: 14px; margin: 0 0 8px 0; color: #1a1a1a; line-height: 1.3;">
            ${activity.title}
          </h3>
          <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 12px;">
            <span style="background: ${color}20; color: ${color}; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: capitalize;">
              ${activity.category || 'Activité'}
            </span>
            <span style="font-weight: 700; color: #8B5CF6; font-size: 14px;">
              ${priceText}
            </span>
          </div>
          <button
            onclick="window.location.href='/activity/${activity.id}'"
            style="width: 100%; background: #8B5CF6; color: white; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer;"
          >
            Voir la fiche
          </button>
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
        if (activity.location) {
          bounds.extend({ lat: activity.location.lat, lng: activity.location.lng });
        }
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
  }, [googleMapsLoaded, activitiesWithCoords, mapCenter, navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-[calc(100vh-200px)] w-full rounded-lg overflow-hidden border border-border flex flex-col items-center justify-center bg-muted/20">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-[calc(100vh-200px)] w-full rounded-lg overflow-hidden border border-destructive/20 flex flex-col items-center justify-center bg-destructive/10">
        <MapPin className="w-12 h-12 text-destructive/40 mb-4" />
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  // Empty state
  if (activitiesWithCoords.length === 0) {
    return (
      <div className="h-[calc(100vh-200px)] w-full rounded-lg overflow-hidden border-2 border-dashed border-muted flex flex-col items-center justify-center bg-muted/20">
        <MapPin className="w-16 h-16 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Aucune localisation disponible
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Les activités n'ont pas d'informations géographiques.
          <br />
          Consultez la vue liste pour voir tous les résultats.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] w-full rounded-lg overflow-hidden border border-border relative z-0">
      <div
        ref={mapContainer}
        style={{ height: '100%', width: '100%' }}
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
};
