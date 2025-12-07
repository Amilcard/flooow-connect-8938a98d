import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation, MapPin, Clock, Route, Bike, Bus, Footprints } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Constantes éco-mobilité
const CO2_CAR_PER_KM = 120; // grammes CO2 par km en voiture
const STEPS_PER_KM = 1350; // pas moyens par km
const CALORIES_WALK_PER_MIN = 5; // kcal par minute de marche
const CALORIES_BIKE_PER_MIN = 8; // kcal par minute de vélo

const Itineraire = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const directionsRenderer = useRef<any>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [googleMapsToken, setGoogleMapsToken] = useState<string>("");
  
  const transportType = searchParams.get('type') || 'bus';
  const destination = searchParams.get('destination') || '';
  const returnUrl = searchParams.get('return') || null;
  
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState(destination);
  const [travelMode, setTravelMode] = useState(
    transportType === 'bike' ? 'BICYCLING' : 
    transportType === 'walk' ? 'WALKING' :
    'TRANSIT'
  );
  const [routeData, setRouteData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const markersRef = useRef<any[]>([]);

  // Get Google Maps API key
  useEffect(() => {
    const getGoogleMapsToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('google-maps-token');
        if (error) throw error;
        if (data?.token) {
          setGoogleMapsToken(data.token);
          loadGoogleMapsScript(data.token);
        }
      } catch (error) {
        console.error('Error fetching Google Maps token:', error);
        toast.error("Erreur de configuration de la carte");
      }
    };
    getGoogleMapsToken();
  }, []);

  // Load Google Maps script
  const loadGoogleMapsScript = (apiKey: string) => {
    if ((window as any).google && (window as any).google.maps) {
      setGoogleMapsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleMapsLoaded(true);
    script.onerror = () => {
      console.error('Error loading Google Maps script');
      toast.error("Erreur de chargement de Google Maps");
    };
    document.head.appendChild(script);
  };

  // Fetch transport stops for STAS
  const { data: busStops = [] } = useQuery({
    queryKey: ["transport-stops"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transport_stops")
        .select("*")
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: transportType === 'bus'
  });

  // Fetch bike stations for Vélivert
  const { data: bikeStations = [] } = useQuery({
    queryKey: ["bike-stations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bike_stations")
        .select("*")
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: transportType === 'bike'
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !googleMapsLoaded) return;

    const google = (window as any).google;
    mapRef.current = new google.maps.Map(mapContainer.current, {
      center: { lat: 45.4397, lng: 4.3872 }, // Saint-Étienne
      zoom: 12,
    });

    directionsRenderer.current = new google.maps.DirectionsRenderer({
      map: mapRef.current,
      polylineOptions: {
        strokeColor: transportType === 'bike' ? '#10b981' : transportType === 'walk' ? '#9333ea' : '#3b82f6',
        strokeWeight: 5,
        strokeOpacity: 0.75,
      },
    });

    return () => {
      if (directionsRenderer.current) {
        directionsRenderer.current.setMap(null);
      }
      // Clear markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [googleMapsLoaded, transportType]);

  // Add markers for stops/stations
  useEffect(() => {
    if (!mapRef.current || !googleMapsLoaded) return;

    const google = (window as any).google;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    if (transportType === 'bus' && busStops.length > 0) {
      // Add bus stop markers
      busStops.forEach(stop => {
        const marker = new google.maps.Marker({
          position: { lat: stop.lat, lng: stop.lon },
          map: mapRef.current,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#3b82f6',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
          title: stop.name || 'Arrêt de bus'
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-semibold text-sm">${stop.name || 'Arrêt de bus'}</h3>
              ${stop.lines ? `<p class="text-xs text-gray-600 mt-1">Lignes: ${Array.isArray(stop.lines) ? stop.lines.join(', ') : stop.lines}</p>` : ''}
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(mapRef.current, marker);
        });

        markersRef.current.push(marker);
      });
    } else if (transportType === 'bike' && bikeStations.length > 0) {
      // Add bike station markers
      bikeStations.forEach(station => {
        const marker = new google.maps.Marker({
          position: { lat: station.lat, lng: station.lon },
          map: mapRef.current,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#10b981',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
          title: station.name || 'Station Vélivert'
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-semibold text-sm">${station.name || 'Station Vélivert'}</h3>
              <p class="text-xs text-gray-600 mt-1">
                🚲 Vélos: ${station.available_bikes || 0} | 
                📍 Places: ${station.available_slots || 0}
              </p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(mapRef.current, marker);
        });

        markersRef.current.push(marker);
      });
    }
  }, [googleMapsLoaded, transportType, busStops, bikeStations]);

  const calculateRoute = async () => {
    if (!departure || !arrival) {
      toast.error("Veuillez renseigner le départ et l'arrivée");
      return;
    }

    if (!googleMapsLoaded) {
      toast.error("Chargement de la carte en cours...");
      return;
    }

    setLoading(true);
    try {
      const google = (window as any).google;
      const directionsService = new google.maps.DirectionsService();
      
      const request = {
        origin: departure + ", Saint-Étienne",
        destination: arrival + ", Saint-Étienne",
        travelMode: travelMode,
      };

      directionsService.route(request, (result: any, status: any) => {
        if (status === 'OK' && result) {
          setRouteData(result.routes[0].legs[0]);
          if (directionsRenderer.current) {
            directionsRenderer.current.setDirections(result);
          }
          toast.success("Itinéraire calculé !");
        } else {
          console.error('Directions request failed:', status);
          toast.error("Aucun itinéraire trouvé");
        }
        setLoading(false);
      });
    } catch (error) {
      console.error('Error calculating route:', error);
      toast.error("Erreur lors du calcul de l'itinéraire");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container flex items-center gap-3 py-4 px-4 md:px-6">
          <BackButton 
            fallback={returnUrl || `/activity/${searchParams.get('activityId') || ''}`}
            variant="ghost"
            size="icon"
          />
          <div className="flex items-center gap-2">
            {transportType === 'bike' ? (
              <Bike className="w-5 h-5 text-green-600" />
            ) : transportType === 'walk' ? (
              <Footprints className="w-5 h-5 text-purple-600" />
            ) : (
              <Bus className="w-5 h-5 text-blue-600" />
            )}
            <h1 className="text-xl font-semibold">
              Itinéraire {
                transportType === 'bike' ? 'Vélivert' : 
                transportType === 'walk' ? 'Marche santé' : 
                'STAS'
              }
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
                  disabled
                />
              </div>
            </div>

            <Button 
              onClick={calculateRoute} 
              disabled={loading || !googleMapsLoaded}
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
                    {routeData.distance?.text}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Durée estimée</p>
                  <p className="text-2xl font-semibold">
                    {routeData.duration?.text}
                  </p>
                </div>
              </div>
              
              {/* Économies CO2 et santé */}
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <span className="text-lg">🌱</span>
                  <span className="font-medium">
                    ≈ {Math.round((routeData.distance?.value || 0) / 1000 * CO2_CAR_PER_KM / 10) / 100} kg CO₂ évités vs voiture
                  </span>
                </div>
                {(transportType === 'walk' || transportType === 'bike') && (
                  <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                    <span className="text-lg">💪</span>
                    <span className="font-medium">
                      ≈ {Math.round((routeData.duration?.value || 0) / 60 * (transportType === 'walk' ? CALORIES_WALK_PER_MIN : CALORIES_BIKE_PER_MIN))} kcal brûlées
                    </span>
                  </div>
                )}
                {transportType === 'walk' && (
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <span className="text-lg">👟</span>
                    <span className="font-medium">
                      ≈ {Math.round((routeData.distance?.value || 0) / 1000 * STEPS_PER_KM)} pas
                    </span>
                  </div>
                )}
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

              {transportType === 'walk' && (
                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <p className="text-sm font-medium mb-2">
                    👟 Marche santé
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Excellent pour la santé ! Profitez d'une balade active et découvrez votre quartier autrement.
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
