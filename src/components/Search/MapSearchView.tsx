/**
 * MapSearchView - Refonte vue Carte
 * 
 * P0-01: Carte plein cadre
 * P0-02: Recherche/filtres non redondants
 * P0-03: Pattern carte + liste (desktop split / mobile bottom sheet)
 * P0-04: Sync pin <-> card + preview
 * P1-01: Bouton "Rechercher dans cette zone"
 * P1-02: Marker clustering
 */
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Loader2, Search, ChevronUp, ChevronDown, X } from 'lucide-react';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ActivityCardCompact } from './ActivityCardCompact';
import { MapPreviewCard } from './MapPreviewCard';
import { DEFAULT_MAP_CENTER } from '@/constants/locations';
import { getCategoryStyle } from '@/constants/categories';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  title: string;
  category: string;
  price_base: number;
  age_min?: number;
  age_max?: number;
  period_type?: string;
  images?: string[];
  organism_name?: string;
  organism_city?: string;
  location?: { lat: number; lng: number };
}

interface MapSearchViewProps {
  activities: Activity[];
  isLoading?: boolean;
  onSearchInArea?: (bounds: google.maps.LatLngBounds) => void;
}

// Bottom sheet states for mobile
type BottomSheetState = 'collapsed' | 'half' | 'full';

export const MapSearchView = ({ 
  activities, 
  isLoading = false,
  onSearchInArea 
}: MapSearchViewProps) => {
  const navigate = useNavigate();
  
  // Map refs
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  
  // State
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [bottomSheetState, setBottomSheetState] = useState<BottomSheetState>('half');
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter activities with valid coordinates
  const activitiesWithCoords = useMemo(() => {
    return activities.filter((activity) => {
      return activity.location?.lat && activity.location?.lng;
    });
  }, [activities]);

  // Calculate map center
  const mapCenter = useMemo((): { lat: number; lng: number } => {
    if (activitiesWithCoords.length === 0) {
      return { lat: DEFAULT_MAP_CENTER[0], lng: DEFAULT_MAP_CENTER[1] };
    }
    const avgLat = activitiesWithCoords.reduce((sum, a) => sum + (a.location?.lat || 0), 0) / activitiesWithCoords.length;
    const avgLng = activitiesWithCoords.reduce((sum, a) => sum + (a.location?.lng || 0), 0) / activitiesWithCoords.length;
    return { lat: avgLat, lng: avgLng };
  }, [activitiesWithCoords]);

  // Selected activity data
  const selectedActivity = useMemo(() => {
    if (!selectedActivityId) return null;
    return activities.find(a => a.id === selectedActivityId) || null;
  }, [selectedActivityId, activities]);

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = async () => {
      if (window.google?.maps) {
        setGoogleMapsLoaded(true);
        setMapLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('google-maps-token');
        if (error) throw error;

        if (data?.token) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${data.token}&libraries=places,marker`;
          script.async = true;
          script.defer = true;
          script.onload = () => {
            setGoogleMapsLoaded(true);
            setMapLoading(false);
          };
          script.onerror = () => {
            setError("Erreur de chargement de Google Maps");
            setMapLoading(false);
          };
          document.head.appendChild(script);
        } else {
          throw new Error("Token Google Maps non disponible");
        }
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError("Erreur de configuration de la carte");
        setMapLoading(false);
      }
    };

    loadGoogleMaps();
  }, []);

  // Category color mapping (user-requested colors)
  const CATEGORY_COLORS: Record<string, string> = {
    'Sport': '#EF4444',      // Rouge
    'Vacances': '#22C55E',   // Vert
    'Culture': '#8B5CF6',    // Violet
    'Loisirs': '#EAB308',    // Jaune
  };

  // Category letter for accessibility
  const CATEGORY_LETTERS: Record<string, string> = {
    'Sport': 'S',
    'Vacances': 'V',
    'Culture': 'C',
    'Loisirs': 'L',
  };

  // Get category color for marker
  const getCategoryColor = (category: string): string => {
    return CATEGORY_COLORS[category] || '#8B5CF6';
  };

  // Get category letter for accessibility
  const getCategoryLetter = (category: string): string => {
    return CATEGORY_LETTERS[category] || '?';
  };

  // Create custom SVG marker with letter for accessibility
  const createMarkerIcon = (category: string, isSelected: boolean): google.maps.Icon => {
    const color = getCategoryColor(category);
    const letter = getCategoryLetter(category);
    const size = isSelected ? 40 : 32;
    const fontSize = isSelected ? 14 : 12;
    
    // SVG marker with letter inside
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="${color}" stroke="white" stroke-width="${isSelected ? 3 : 2}"/>
        <text x="20" y="25" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold">${letter}</text>
      </svg>
    `;
    
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new google.maps.Size(size, size),
      anchor: new google.maps.Point(size / 2, size / 2),
    };
  };

  // Initialize map and markers
  useEffect(() => {
    if (!googleMapsLoaded || !mapContainer.current) return;

    // Create map
    mapRef.current = new google.maps.Map(mapContainer.current, {
      center: mapCenter,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    // Create single InfoWindow instance
    infoWindowRef.current = new google.maps.InfoWindow();

    // Track map movement for "Search this area" button
    mapRef.current.addListener('dragend', () => {
      setShowSearchButton(true);
    });
    mapRef.current.addListener('zoom_changed', () => {
      setShowSearchButton(true);
    });

    // Close preview when clicking on map (not on marker)
    mapRef.current.addListener('click', () => {
      setSelectedActivityId(null);
    });

  }, [googleMapsLoaded, mapCenter]);

  // Update markers when activities or selection changes
  useEffect(() => {
    if (!googleMapsLoaded || !mapRef.current) return;

    // Clear existing clusterer and markers
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
    }
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Create markers
    activitiesWithCoords.forEach((activity) => {
      if (!activity.location) return;

      const isSelected = activity.id === selectedActivityId;

      const marker = new google.maps.Marker({
        position: { lat: activity.location.lat, lng: activity.location.lng },
        title: activity.title,
        icon: createMarkerIcon(activity.category, isSelected),
        zIndex: isSelected ? 100 : 1,
        animation: isSelected ? google.maps.Animation.BOUNCE : undefined,
      });

      // Click: select activity and show full preview
      marker.addListener('click', () => {
        setSelectedActivityId(activity.id);
        // Center map on selected marker
        if (mapRef.current && activity.location) {
          mapRef.current.panTo({ lat: activity.location.lat, lng: activity.location.lng });
        }
      });

      // Hover: show mini preview tooltip
      marker.addListener('mouseover', () => {
        if (infoWindowRef.current && mapRef.current) {
          const style = getCategoryStyle(activity.category);
          const priceDisplay = activity.price_base 
            ? `${activity.price_base.toFixed(0)}€` 
            : 'Gratuit';
          const ageRange = activity.age_min && activity.age_max 
            ? `${activity.age_min}-${activity.age_max} ans` 
            : '';
          
          const content = `
            <div style="font-family: system-ui, sans-serif; padding: 8px; max-width: 220px;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                <span style="background: ${style.bg}; color: ${style.color}; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 12px;">
                  ${style.label}
                </span>
                ${ageRange ? `<span style="font-size: 10px; color: #6b7280;">${ageRange}</span>` : ''}
              </div>
              <div style="font-weight: 600; font-size: 13px; color: #1f2937; line-height: 1.3; margin-bottom: 4px;">
                ${activity.title}
              </div>
              ${activity.organism_name ? `<div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">${activity.organism_name}</div>` : ''}
              <div style="font-size: 13px; font-weight: 700; color: #8B5CF6;">
                ${priceDisplay}
              </div>
            </div>
          `;
          
          infoWindowRef.current.setContent(content);
          infoWindowRef.current.open(mapRef.current, marker);
        }
      });

      marker.addListener('mouseout', () => {
        // Don't close if this marker is selected
        if (activity.id !== selectedActivityId && infoWindowRef.current) {
          infoWindowRef.current.close();
        }
      });

      markersRef.current.push(marker);
    });

    // P1-02: Create clusterer with custom renderer
    if (markersRef.current.length > 0 && mapRef.current) {
      clustererRef.current = new MarkerClusterer({
        map: mapRef.current,
        markers: markersRef.current,
        renderer: {
          render: ({ count, position }) => {
            return new google.maps.Marker({
              position,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 20 + Math.min(count, 20),
                fillColor: '#8B5CF6',
                fillOpacity: 0.9,
                strokeColor: '#ffffff',
                strokeWeight: 3,
              },
              label: {
                text: String(count),
                color: 'white',
                fontWeight: 'bold',
                fontSize: '12px',
              },
              zIndex: 50,
            });
          },
        },
      });
    }

    // Fit bounds if multiple markers
    if (activitiesWithCoords.length > 1 && mapRef.current) {
      const bounds = new google.maps.LatLngBounds();
      activitiesWithCoords.forEach((activity) => {
        if (activity.location) {
          bounds.extend({ lat: activity.location.lat, lng: activity.location.lng });
        }
      });
      mapRef.current.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }

  }, [googleMapsLoaded, activitiesWithCoords, selectedActivityId]);

  // Handle card click (from list)
  const handleCardClick = useCallback((activityId: string) => {
    setSelectedActivityId(activityId);
    const activity = activities.find(a => a.id === activityId);
    if (activity?.location && mapRef.current) {
      mapRef.current.panTo({ lat: activity.location.lat, lng: activity.location.lng });
      mapRef.current.setZoom(15);
    }
  }, [activities]);

  // Handle view detail
  const handleViewDetail = useCallback((activityId: string) => {
    navigate(`/activity/${activityId}`);
  }, [navigate]);

  // Handle search in area
  const handleSearchInArea = useCallback(() => {
    if (mapRef.current && onSearchInArea) {
      const bounds = mapRef.current.getBounds();
      if (bounds) {
        onSearchInArea(bounds);
        setShowSearchButton(false);
      }
    }
  }, [onSearchInArea]);

  // Format activity for card
  const formatActivityForCard = (activity: Activity) => ({
    id: activity.id,
    title: activity.title,
    image: activity.images?.[0],
    category: activity.category,
    price: activity.price_base || 0,
    ageRange: activity.age_min && activity.age_max ? `${activity.age_min}-${activity.age_max} ans` : undefined,
    periodType: activity.period_type,
    structureName: activity.organism_name,
    structureCity: activity.organism_city,
  });

  // Bottom sheet height based on state
  const getBottomSheetHeight = () => {
    switch (bottomSheetState) {
      case 'collapsed': return 'h-16';
      case 'half': return 'h-[45vh]';
      case 'full': return 'h-[85vh]';
      default: return 'h-[45vh]';
    }
  };

  // Loading state
  if (mapLoading || isLoading) {
    return (
      <div className="h-[calc(100vh-8rem)] w-full flex flex-col items-center justify-center bg-muted/20">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-[calc(100vh-8rem)] w-full flex flex-col items-center justify-center bg-destructive/10">
        <MapPin className="w-12 h-12 text-destructive/40 mb-4" />
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full">
      {/* Desktop: Split view */}
      {!isMobile && (
        <div className="flex h-full">
          {/* Left panel: Activity list */}
          <div className="w-[380px] flex-shrink-0 border-r bg-background overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
              <h2 className="font-semibold text-base">
                <span className="text-primary font-bold">{activities.length}</span> activité{activities.length > 1 ? 's' : ''}
              </h2>
            </div>
            
            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {activities.map((activity) => (
                <ActivityCardCompact
                  key={activity.id}
                  {...formatActivityForCard(activity)}
                  isSelected={activity.id === selectedActivityId}
                  onClick={() => handleCardClick(activity.id)}
                  onViewDetail={() => handleViewDetail(activity.id)}
                />
              ))}
              
              {activities.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>Aucune activité trouvée</p>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Map */}
          <div className="flex-1 relative">
            <div ref={mapContainer} className="w-full h-full" />

            {/* Category legend (desktop only) */}
            <div className="absolute bottom-6 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-md px-3 py-2 flex gap-3">
              {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                <div key={cat} className="flex items-center gap-1.5">
                  <div 
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {CATEGORY_LETTERS[cat]}
                  </div>
                  <span className="text-xs text-muted-foreground">{cat}</span>
                </div>
              ))}
            </div>

            {/* Search this area button */}
            {showSearchButton && onSearchInArea && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                <Button
                  onClick={handleSearchInArea}
                  className="shadow-lg"
                  size="sm"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Rechercher dans cette zone
                </Button>
              </div>
            )}

            {/* Preview card on map */}
            {selectedActivity && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                <MapPreviewCard
                  activity={formatActivityForCard(selectedActivity)}
                  onClose={() => setSelectedActivityId(null)}
                  onViewDetail={() => handleViewDetail(selectedActivity.id)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile: Full map + bottom sheet */}
      {isMobile && (
        <>
          {/* Full map */}
          <div ref={mapContainer} className="w-full h-full" />

          {/* Search this area button */}
          {showSearchButton && onSearchInArea && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
              <Button
                onClick={handleSearchInArea}
                className="shadow-lg"
                size="sm"
              >
                <Search className="w-4 h-4 mr-2" />
                Rechercher ici
              </Button>
            </div>
          )}

          {/* Preview card on map (when pin selected and sheet collapsed) */}
          {selectedActivity && bottomSheetState === 'collapsed' && (
            <div className="absolute bottom-20 left-4 right-4 z-20">
              <MapPreviewCard
                activity={formatActivityForCard(selectedActivity)}
                onClose={() => setSelectedActivityId(null)}
                onViewDetail={() => handleViewDetail(selectedActivity.id)}
              />
            </div>
          )}

          {/* Bottom sheet */}
          <div 
            className={cn(
              "absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl shadow-2xl border-t transition-all duration-300 z-30",
              getBottomSheetHeight()
            )}
          >
            {/* Handle */}
            <div
              role="button"
              tabIndex={0}
              aria-label="Basculer le panneau de liste"
              className="flex justify-center py-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
              onClick={() => {
                if (bottomSheetState === 'collapsed') setBottomSheetState('half');
                else if (bottomSheetState === 'half') setBottomSheetState('full');
                else setBottomSheetState('collapsed');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  if (bottomSheetState === 'collapsed') setBottomSheetState('half');
                  else if (bottomSheetState === 'half') setBottomSheetState('full');
                  else setBottomSheetState('collapsed');
                }
              }}
            >
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-4 pb-3 flex items-center justify-between">
              <h2 className="font-semibold text-sm">
                <span className="text-primary font-bold">{activities.length}</span> activité{activities.length > 1 ? 's' : ''}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => {
                  if (bottomSheetState === 'full') setBottomSheetState('half');
                  else if (bottomSheetState === 'half') setBottomSheetState('collapsed');
                  else setBottomSheetState('half');
                }}
              >
                {bottomSheetState === 'collapsed' ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* List (hidden when collapsed) */}
            {bottomSheetState !== 'collapsed' && (
              <div className="flex-1 overflow-y-auto px-4 pb-20 space-y-3">
                {activities.map((activity) => (
                  <ActivityCardCompact
                    key={activity.id}
                    {...formatActivityForCard(activity)}
                    isSelected={activity.id === selectedActivityId}
                    onClick={() => handleCardClick(activity.id)}
                    onViewDetail={() => handleViewDetail(activity.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
