import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Navigation, MapPin, Clock, Route, Bike, Bus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const Itineraire = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>("");
  
  const transportType = searchParams.get('type') || 'bus'; // 'bus' or 'bike'
  const destination = searchParams.get('destination') || '';
  
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState(destination);
  const [travelMode, setTravelMode] = useState(transportType === 'bike' ? 'cycling' : 'walking');
  const [routeData, setRouteData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Get Mapbox token from environment
  useEffect(() => {
    const getMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('mapbox-token');
        if (error) throw error;
        if (data?.token) {
          setMapboxToken(data.token);
          mapboxgl.accessToken = data.token;
        }
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
        toast.error("Erreur de configuration de la carte");
      }
    };
    getMapboxToken();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [4.3872, 45.4397], // Saint-Étienne coordinates
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?proximity=4.3872,45.4397&country=fr&access_token=${mapboxToken}`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        return data.features[0].center;
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const calculateRoute = async () => {
    if (!departure || !arrival) {
      toast.error("Veuillez renseigner le départ et l'arrivée");
      return;
    }

    setLoading(true);
    try {
      // Geocode addresses
      const startCoords = await geocodeAddress(departure + ", Saint-Étienne");
      const endCoords = await geocodeAddress(arrival + ", Saint-Étienne");

      if (!startCoords || !endCoords) {
        toast.error("Impossible de localiser une ou plusieurs adresses");
        setLoading(false);
        return;
      }

      // Call our edge function for directions
      const { data, error } = await supabase.functions.invoke('mapbox-directions', {
        body: {
          start: startCoords,
          end: endCoords,
          profile: travelMode,
        },
      });

      if (error) throw error;

      if (data.routes && data.routes.length > 0) {
        setRouteData(data.routes[0]);
        
        // Display route on map
        if (map.current) {
          // Remove existing route if any
          if (map.current.getSource('route')) {
            map.current.removeLayer('route');
            map.current.removeSource('route');
          }

          // Add route
          map.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: data.routes[0].geometry,
            },
          });

          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': transportType === 'bike' ? '#10b981' : '#3b82f6',
              'line-width': 5,
              'line-opacity': 0.75,
            },
          });

          // Add markers
          new mapboxgl.Marker({ color: '#22c55e' })
            .setLngLat(startCoords)
            .setPopup(new mapboxgl.Popup().setHTML('<p>Départ</p>'))
            .addTo(map.current);

          new mapboxgl.Marker({ color: '#ef4444' })
            .setLngLat(endCoords)
            .setPopup(new mapboxgl.Popup().setHTML('<p>Arrivée</p>'))
            .addTo(map.current);

          // Fit bounds to route
          const bounds = new mapboxgl.LngLatBounds(startCoords, endCoords);
          map.current.fitBounds(bounds, { padding: 50 });
        }

        toast.success("Itinéraire calculé !");
      } else {
        toast.error("Aucun itinéraire trouvé");
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      toast.error("Erreur lors du calcul de l'itinéraire");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container flex items-center gap-3 py-4 px-4 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            {transportType === 'bike' ? (
              <Bike className="w-5 h-5 text-green-600" />
            ) : (
              <Bus className="w-5 h-5 text-blue-600" />
            )}
            <h1 className="text-xl font-semibold">
              Itinéraire {transportType === 'bike' ? 'Vélivert' : 'STAS'}
            </h1>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-6 space-y-6">
        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation size={20} />
              Calculer votre itinéraire
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="departure">Point de départ</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="departure"
                  placeholder="Ex: 10 rue de la République"
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="arrival">Point d'arrivée</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="arrival"
                  placeholder="Ex: 5 rue Massenet"
                  value={arrival}
                  onChange={(e) => setArrival(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mode">Mode de déplacement</Label>
              <Select value={travelMode} onValueChange={setTravelMode}>
                <SelectTrigger id="mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walking">
                    À pied
                  </SelectItem>
                  <SelectItem value="cycling">
                    À vélo
                  </SelectItem>
                  {transportType === 'bus' && (
                    <SelectItem value="driving-traffic">
                      En transport
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={calculateRoute} 
              disabled={loading || !mapboxToken}
              className="w-full"
            >
              <Route className="w-4 h-4 mr-2" />
              {loading ? "Calcul en cours..." : "Calculer l'itinéraire"}
            </Button>
          </CardContent>
        </Card>

        {/* Route Info */}
        {routeData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} />
                Détails de l'itinéraire
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Distance</p>
                  <p className="text-2xl font-semibold">
                    {formatDistance(routeData.distance)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Durée estimée</p>
                  <p className="text-2xl font-semibold">
                    {formatDuration(routeData.duration)}
                  </p>
                </div>
              </div>

              {transportType === 'bus' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-sm font-medium mb-2">
                    ℹ️ Informations complémentaires
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Pour les horaires détaillés des bus STAS, consultez{' '}
                    <a
                      href="https://www.reseau-stas.fr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      www.reseau-stas.fr
                    </a>
                  </p>
                </div>
              )}

              {transportType === 'bike' && (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <p className="text-sm font-medium mb-2">
                    🚲 Stations Vélivert
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Localisez les stations disponibles sur{' '}
                    <a
                      href="https://www.velivert.fr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline font-medium"
                    >
                      www.velivert.fr
                    </a>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Map Container */}
        <Card className="overflow-hidden">
          <div ref={mapContainer} className="w-full h-[500px]" />
        </Card>
      </div>
    </div>
  );
};

export default Itineraire;
