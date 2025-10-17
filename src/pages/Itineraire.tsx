import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Navigation, MapPin, Clock, Route, Bike, Bus, Footprints } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState(destination);
  const [travelMode, setTravelMode] = useState(
    transportType === 'bike' ? 'BICYCLING' : 
    transportType === 'walk' ? 'WALKING' :
    'WALKING'
  );
  const [routeData, setRouteData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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
        strokeColor: transportType === 'bike' ? '#10b981' : '#3b82f6',
        strokeWeight: 5,
        strokeOpacity: 0.75,
      },
    });

    return () => {
      if (directionsRenderer.current) {
        directionsRenderer.current.setMap(null);
      }
    };
  }, [googleMapsLoaded, transportType]);

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
                  <SelectItem value="WALKING">À pied</SelectItem>
                  <SelectItem value="BICYCLING">À vélo</SelectItem>
                  {transportType === 'bus' && (
                    <SelectItem value="TRANSIT">En transport</SelectItem>
                  )}
                  <SelectItem value="DRIVING">En voiture</SelectItem>
                </SelectContent>
              </Select>
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
