import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Navigation, MapPin, Clock, Route, Bike, Bus, Footprints, Loader2, AlertCircle, CheckCircle2, Leaf, Trophy, Sparkles } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import PageLayout from "@/components/PageLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { safeErrorMessage } from "@/utils/sanitize";
import { DEFAULT_FRANCE_VIEW, DEFAULT_CITY_ZOOM, CITY_PLACEHOLDER } from "@/config/territories";
import {
  EcoMobilityBadges,
  logLocalTrip,
  getLocalEcoStats,
  getEarnedBadges,
  type EcoStats
} from "@/components/EcoMobility/EcoMobilityBadges";

// Constantes éco-mobilité
const CO2_CAR_PER_KM = 120; // grammes CO2 par km en voiture
const STEPS_PER_KM = 1350; // pas moyens par km
const CALORIES_WALK_PER_MIN = 5; // kcal par minute de marche
const CALORIES_BIKE_PER_MIN = 8; // kcal par minute de vélo

// HELPERS: Reduce cognitive complexity

type TransportType = 'bike' | 'walk' | 'bus';
type TravelMode = 'BICYCLING' | 'WALKING' | 'TRANSIT';

const TRANSPORT_TO_TRAVEL_MODE: Record<string, TravelMode> = {
  bike: 'BICYCLING',
  walk: 'WALKING',
  bus: 'TRANSIT'
};

const TRANSPORT_COLORS: Record<TransportType, string> = {
  bike: '#10b981',
  walk: '#9333ea',
  bus: '#3b82f6'
};

/**
 * Get travel mode from transport type
 */
const getTravelMode = (transportType: string): TravelMode => {
  return TRANSPORT_TO_TRAVEL_MODE[transportType] || 'TRANSIT';
};

/**
 * Get route color for transport type
 */
const getRouteColor = (transportType: string): string => {
  return TRANSPORT_COLORS[transportType as TransportType] || '#3b82f6';
};

/**
 * Build full address from activity data
 */
const buildActivityAddress = (activity: { venue_name?: string; address?: string; city?: string; postal_code?: string } | null): string => {
  if (!activity) return '';
  return [activity.venue_name, activity.address, activity.city, activity.postal_code]
    .filter(Boolean)
    .join(', ');
};

const Itineraire = () => {
  const [searchParams] = useSearchParams();
  const _navigate = useNavigate(); // Reserved for future navigation features
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoogleMapsMap | null>(null);
  const directionsRenderer = useRef<GoogleMapsDirectionsRenderer | null>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [_googleMapsToken, setGoogleMapsToken] = useState(""); // Token stored for potential future API calls

  const transportType = searchParams.get('type') || 'bus';
  const destination = searchParams.get('destination') || '';
  const activityId = searchParams.get('activityId') || '';
  const returnUrl = searchParams.get('return') || null;

  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState(destination);
  // Travel mode state (setter reserved for future mode switching feature)
  const [travelMode, _setTravelMode] = useState(getTravelMode(transportType));
  const [routeData, setRouteData] = useState<GoogleMapsDirectionsLeg | null>(null);
  const [loading, setLoading] = useState(false);
  const [tripValidated, setTripValidated] = useState(false);
  const [departureError, setDepartureError] = useState<string | null>(null);
  const [arrivalError, setArrivalError] = useState<string | null>(null);
  const [geolocating, setGeolocating] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [ecoStats, setEcoStats] = useState<EcoStats>(getLocalEcoStats());
  const [newBadgeUnlocked, setNewBadgeUnlocked] = useState<string | null>(null);
  const markersRef = useRef<GoogleMapsMarker[]>([]);

  // Fetch user profile for pre-filling departure
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile-itineraire"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("postal_code, city")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    staleTime: 300000
  });

  // Fetch activity details to get full address
  const { data: activity } = useQuery({
    queryKey: ["activity-itineraire", activityId],
    queryFn: async () => {
      if (!activityId) return null;
      const { data, error } = await supabase
        .from("activities")
        .select("address, city, postal_code, venue_name, latitude, longitude")
        .eq("id", activityId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!activityId,
    staleTime: 300000
  });

  // Helper: reverse geocode position to address (extracted to reduce nesting)
  const reverseGeocode = (position: GeolocationPosition) => {
    if (!googleMapsLoaded || !window.google) {
      setGeolocating(false);
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    const location = { lat: position.coords.latitude, lng: position.coords.longitude };

    geocoder.geocode({ location }, (results: GoogleMapsGeocodeResult[], status: string) => {
      if (status === 'OK' && results[0]) {
        setDeparture(results[0].formatted_address);
      }
      setGeolocating(false);
    });
  };

  // Helper: handle geolocation success
  const handleGeolocationSuccess = (position: GeolocationPosition) => {
    try {
      reverseGeocode(position);
    } catch (error) {
      console.error(safeErrorMessage(error, 'Geocoding'));
      setGeolocating(false);
    }
  };

  // Pre-fill departure from user profile or try geolocation
  useEffect(() => {
    // Priority 1: User profile with postal code and city
    if (userProfile?.postal_code && userProfile?.city && !departure) {
      setDeparture(`${userProfile.postal_code} ${userProfile.city}`);
      return;
    }

    // Priority 2: Try geolocation if no profile
    if (!userProfile && !departure && navigator.geolocation) {
      setGeolocating(true);
      navigator.geolocation.getCurrentPosition(
        handleGeolocationSuccess,
        () => setGeolocating(false),
        { timeout: 5000 }
      );
    }
  }, [userProfile, googleMapsLoaded, departure]);

  // Pre-fill arrival from activity if better address available (using helper)
  useEffect(() => {
    if (activity && !arrival) {
      const fullAddress = buildActivityAddress(activity);
      if (fullAddress) {
        setArrival(fullAddress);
        return;
      }
    }
    if (!arrival && destination) {
      setArrival(destination);
    }
  }, [activity, destination, arrival]);

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
        console.error(safeErrorMessage(error, 'Google Maps token'));
        toast.error("Erreur de configuration de la carte");
      }
    };
    getGoogleMapsToken();
  }, []);

  // Load Google Maps script
  const loadGoogleMapsScript = (apiKey: string) => {
    if (window.google?.maps) {
      setGoogleMapsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleMapsLoaded(true);
    script.onerror = () => {
      console.error(safeErrorMessage(new Error('Script load failed'), 'Google Maps'));
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

    const google = window.google;
    mapRef.current = new google.maps.Map(mapContainer.current, {
      center: DEFAULT_FRANCE_VIEW.center,
      zoom: DEFAULT_CITY_ZOOM,
    });

    directionsRenderer.current = new google.maps.DirectionsRenderer({
      map: mapRef.current,
      polylineOptions: {
        strokeColor: getRouteColor(transportType),
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

    const google = window.google;

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
              ${stop.lines ? `<p class="text-xs text-muted-foreground mt-1">Lignes: ${Array.isArray(stop.lines) ? stop.lines.join(', ') : stop.lines}</p>` : ''}
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
              <p class="text-xs text-muted-foreground mt-1">
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
    // Clear previous errors
    setDepartureError(null);
    setArrivalError(null);
    setRouteError(null);

    // Inline validation with specific error messages
    let hasError = false;
    if (!departure || departure.trim().length < 3) {
      setDepartureError("Veuillez saisir une adresse de départ (min. 3 caractères)");
      hasError = true;
    }
    if (!arrival || arrival.trim().length < 3) {
      setArrivalError("Veuillez saisir une adresse d'arrivée (min. 3 caractères)");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    if (!googleMapsLoaded) {
      setRouteError("Chargement de la carte en cours, veuillez patienter...");
      return;
    }

    setLoading(true);
    try {
      const google = window.google;
      const directionsService = new google.maps.DirectionsService();

      // Build smart origin/destination (append user's city if no postal code in address)
      const userCity = userProfile?.city;
      const hasPostalCode = (addr: string) => /\d{5}/.test(addr);
      const hasCity = (addr: string, city?: string) => city && addr.toLowerCase().includes(city.toLowerCase());

      const origin = hasPostalCode(departure) || hasCity(departure, userCity)
        ? departure
        : userCity ? `${departure}, ${userCity}` : departure;
      const destinationAddr = hasPostalCode(arrival) || hasCity(arrival, userCity)
        ? arrival
        : userCity ? `${arrival}, ${userCity}` : arrival;

      const request = {
        origin,
        destination: destinationAddr,
        travelMode: travelMode,
      };

      directionsService.route(request, (result: GoogleMapsDirectionsResult | null, status: GoogleMapsDirectionsStatus) => {
        setLoading(false);
        if (status === 'OK' && result) {
          setRouteData(result.routes[0].legs[0]);
          setRouteError(null);
          if (directionsRenderer.current) {
            directionsRenderer.current.setDirections(result);
          }
          toast.success("Itinéraire calculé !");
        } else {
          console.error(safeErrorMessage(new Error(`Directions request failed: ${status}`), 'Google Maps'));
          // Specific error messages based on status
          if (status === 'ZERO_RESULTS') {
            setRouteError("Aucun itinéraire trouvé entre ces deux adresses. Vérifiez les adresses saisies.");
          } else if (status === 'NOT_FOUND') {
            setRouteError("L'une des adresses n'a pas pu être localisée. Essayez une adresse plus précise.");
          } else if (status === 'OVER_QUERY_LIMIT' || status === 'REQUEST_DENIED') {
            setRouteError("Service temporairement indisponible. Réessayez dans quelques instants.");
          } else {
            setRouteError("Impossible de calculer l'itinéraire. Vérifiez les adresses et réessayez.");
          }
        }
      });
    } catch (error) {
      console.error(safeErrorMessage(error, 'Calculate route'));
      setRouteError("Erreur technique lors du calcul. Veuillez réessayer.");
      setLoading(false);
    }
  };

  // Handle trip validation (for CO2 tracking)
  const handleValidateTrip = async () => {
    if (!routeData) return;

    const distanceKm = (routeData.distance?.value || 0) / 1000;
    const co2SavedGrams = Math.round(distanceKm * CO2_CAR_PER_KM);

    // Get badges before logging
    const badgesBefore = getEarnedBadges(ecoStats);

    // Log the trip (localStorage for now, will use eco_travel_logs when table is created)
    const mode = transportType === 'bike' ? 'bike' : transportType === 'walk' ? 'walk' : 'bus';
    const newStats = logLocalTrip(mode, co2SavedGrams);
    setEcoStats(newStats);

    // Check if new badge was unlocked
    const badgesAfter = getEarnedBadges(newStats);
    if (badgesAfter.length > badgesBefore.length) {
      const newBadge = badgesAfter[badgesAfter.length - 1];
      setNewBadgeUnlocked(newBadge.icon + " " + newBadge.name);
      toast.success(
        `🎉 Badge débloqué : ${newBadge.icon} ${newBadge.name}`,
        { duration: 5000 }
      );
    } else {
      toast.success(
        `Bravo ! Vous avez économisé ${(co2SavedGrams / 1000).toFixed(2)} kg de CO₂ 🌱`,
        { duration: 4000 }
      );
    }

    setTripValidated(true);

    // TODO: Persist to eco_travel_logs table when schema is approved
    // This will be implemented in Phase P2 with:
    // await supabase.from('eco_travel_logs').insert({
    //   user_id: userId,
    //   activity_id: activityId,
    //   transport_mode: mode,
    //   distance_meters: routeData.distance?.value,
    //   duration_seconds: routeData.duration?.value,
    //   co2_saved_grams: co2SavedGrams,
    //   departure_address: departure,
    //   arrival_address: arrival
    // });
  };

  return (
    <PageLayout showHeader={false}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container flex items-center gap-3 py-4 px-4">
          <BackButton
            fallback={returnUrl || `/activity/${searchParams.get('activityId') || ''}`}
            positioning="relative"
            size="sm"
            showText={true}
            label="Retour"
          />
          <div className="flex items-center gap-2">
            {transportType === 'bike' ? (
              <Bike className="w-5 h-5 text-green-600" />
            ) : transportType === 'walk' ? (
              <Footprints className="w-5 h-5 text-purple-600" />
            ) : (
              <Bus className="w-5 h-5 text-blue-600" />
            )}
            <h1 className="text-xl font-bold text-foreground">
              Itinéraire {
                transportType === 'bike' ? 'Vélivert' :
                transportType === 'walk' ? 'Marche santé' :
                'STAS'
              }
            </h1>
          </div>
        </div>
      </div>

      <div className="container px-4 py-6 space-y-6">
        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation size={20} />
              Calculer votre itinéraire
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Departure field */}
            <div className="space-y-2">
              <Label htmlFor="departure">Point de départ</Label>
              <div className="relative">
                {geolocating ? (
                  <Loader2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground animate-spin" />
                ) : (
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                )}
                <Input
                  id="departure"
                  placeholder={geolocating ? "Localisation en cours..." : `Ex: 10 rue de la République, ${CITY_PLACEHOLDER}`}
                  value={departure}
                  onChange={(e) => {
                    setDeparture(e.target.value);
                    setDepartureError(null);
                  }}
                  className={`pl-10 ${departureError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  disabled={geolocating}
                />
              </div>
              {departureError && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {departureError}
                </p>
              )}
              {!departure && !geolocating && (
                <p className="text-xs text-muted-foreground">
                  💡 Saisissez votre adresse de départ ou laissez-nous vous localiser
                </p>
              )}
            </div>

            {/* Arrival field */}
            <div className="space-y-2">
              <Label htmlFor="arrival">Point d'arrivée (lieu de l'activité)</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-green-600" />
                <Input
                  id="arrival"
                  placeholder={`Ex: Gymnase Jean Moulin, ${CITY_PLACEHOLDER}`}
                  value={arrival}
                  onChange={(e) => {
                    setArrival(e.target.value);
                    setArrivalError(null);
                  }}
                  className={`pl-10 bg-green-50/50 dark:bg-green-950/20 ${arrivalError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
              </div>
              {arrivalError && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {arrivalError}
                </p>
              )}
            </div>

            {/* Route error message */}
            {routeError && (
              <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{routeError}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={calculateRoute}
              disabled={loading || !googleMapsLoaded || geolocating}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calcul en cours...
                </>
              ) : !googleMapsLoaded ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Chargement de la carte...
                </>
              ) : (
                <>
                  <Route className="w-4 h-4 mr-2" />
                  Calculer l'itinéraire
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Route Info */}
        {routeData && (
          <Card className="border-2 border-green-200 dark:border-green-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} />
                Votre itinéraire écomobile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Récap principal - Distance/Durée/CO2 */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Distance</p>
                  <p className="text-xl font-bold text-foreground">
                    {routeData.distance?.text}
                  </p>
                </div>
                <div className="text-center border-x border-green-200 dark:border-green-700">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Durée</p>
                  <p className="text-xl font-bold text-foreground">
                    {routeData.duration?.text}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">CO₂ évités</p>
                  <p className="text-xl font-bold text-green-600">
                    {Math.round((routeData.distance?.value || 0) / 1000 * CO2_CAR_PER_KM / 10) / 100} kg
                  </p>
                </div>
              </div>

              {/* Phrase explicative - préparation cumul écomobilité */}
              <p className="text-xs text-center text-muted-foreground italic">
                🌍 Flooow vous aide à suivre vos économies de CO₂ à chaque trajet. Bientôt, retrouvez votre cumul mensuel !
              </p>

              {/* Bénéfices santé - second niveau */}
              {(transportType === 'walk' || transportType === 'bike') && (
                <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <p className="text-xs font-medium text-purple-700 dark:text-purple-400 mb-2">💪 Bénéfices santé</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="text-purple-600 dark:text-purple-400">
                      ≈ {Math.round((routeData.duration?.value || 0) / 60 * (transportType === 'walk' ? CALORIES_WALK_PER_MIN : CALORIES_BIKE_PER_MIN) / 10) * 10} kcal
                    </span>
                    {transportType === 'walk' && (
                      <span className="text-purple-600 dark:text-purple-400">
                        ≈ {Math.round((routeData.distance?.value || 0) / 1000 * STEPS_PER_KM / 100) * 100} pas
                      </span>
                    )}
                  </div>
                </div>
              )}

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

              {/* CTA: Validate trip for CO2 tracking */}
              {tripValidated ? (
                <div className="space-y-4">
                  {/* Success message */}
                  <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 rounded-lg border border-green-300 dark:border-green-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500 rounded-full">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-green-800 dark:text-green-200">Trajet validé !</p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Bravo pour votre contribution à la planète 🌱
                        </p>
                      </div>
                      <Trophy className="w-8 h-8 text-yellow-500" />
                    </div>
                  </div>

                  {/* New badge unlocked animation */}
                  {newBadgeUnlocked && (
                    <div className="p-4 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/40 dark:to-amber-900/40 rounded-lg border border-yellow-300 dark:border-yellow-700 animate-pulse">
                      <div className="flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-600" />
                        <span className="font-bold text-yellow-800 dark:text-yellow-200">
                          Nouveau badge : {newBadgeUnlocked}
                        </span>
                        <Sparkles className="w-5 h-5 text-yellow-600" />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  onClick={handleValidateTrip}
                  variant="outline"
                  className="w-full border-green-500 text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30 dark:text-green-400"
                >
                  <Leaf className="w-4 h-4 mr-2" />
                  J'ai réalisé ce trajet éco-responsable
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Eco-mobility badges summary */}
        {ecoStats.totalTrips > 0 && (
          <EcoMobilityBadges stats={ecoStats} />
        )}

        {/* Map Container - hauteur adaptée mobile */}
        <Card className="overflow-hidden">
          <div ref={mapContainer} className="w-full h-[350px] md:h-[450px]" />
        </Card>
      </div>
    </PageLayout>
  );
};

export default Itineraire;
