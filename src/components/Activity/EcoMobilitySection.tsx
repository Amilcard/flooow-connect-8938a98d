import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Bus, 
  Bike, 
  Footprints, 
  Car, 
  Leaf, 
  MapPin,
  Mail,
  Phone,
  User,
  Clock,
  CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Mock coherent durations for eco-mobility (12-45 min range)
// Rule: Walk > Bike ≈ Bus
const getCoherentDurations = (activityId: string) => {
  // Generate consistent durations based on activity ID for demo
  const hash = activityId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseDuration = 18 + (hash % 18); // 18-35 min base
  
  return {
    walk: baseDuration + 8, // Longest: +8 to +26 min → 26-43 min
    bike: baseDuration - 4, // Shorter: -4 to +14 min → 14-31 min
    bus: baseDuration // Middle: +0 to +18 min → 18-35 min
  };
};

interface EcoMobilitySectionProps {
  activityId: string;
  activityAddress?: string;
  structureName?: string;
  structureContactJson?: any;
  onTransportModeSelected?: (mode: { type: "bus" | "bike" | "walk"; label: string; duration: number; details?: string }) => void;
  selectedTransportMode?: { type: "bus" | "bike" | "walk"; label: string; duration: number; details?: string } | null;
}

export const EcoMobilitySection = ({ 
  activityId, 
  activityAddress,
  structureName,
  structureContactJson,
  onTransportModeSelected,
  selectedTransportMode
}: EcoMobilitySectionProps) => {
  const navigate = useNavigate();
  const [showCarpoolForm, setShowCarpoolForm] = useState(false);
  const [carpoolType, setCarpoolType] = useState<"search" | "offer">("search");
  const [carpoolFormData, setCarpoolFormData] = useState({
    name: "",
    email: "",
    phone: "",
    departureLocation: "",
    availableSeats: "1",
    departureTime: "",
    message: ""
  });

  const durations = getCoherentDurations(activityId);

  // Fetch nearest STAS stop
  const { data: nearestStop } = useQuery({
    queryKey: ["nearest-stop", activityAddress],
    queryFn: async () => {
      if (!activityAddress) return null;
      
      // For now, mock data - will be replaced with actual API call
      return {
        name: "Arrêt Carnot",
        distance_m: 150,
        lines: ["L1", "L3", "L5"]
      };
    },
    enabled: !!activityAddress
  });

  // Fetch nearest Vélivert station
  const { data: nearestStation } = useQuery({
    queryKey: ["nearest-station", activityAddress],
    queryFn: async () => {
      if (!activityAddress) return null;
      
      // For now, mock data - will be replaced with actual API call
      return {
        name: "Station République",
        distance_m: 200,
        available_bikes: 5
      };
    },
    enabled: !!activityAddress
  });

  const handleSelectTransport = async (type: "bus" | "bike" | "walk", label: string, details?: string) => {
    const duration = type === "bus" ? durations.bus : type === "bike" ? durations.bike : durations.walk;
    const mode = { type, label, duration, details };
    onTransportModeSelected?.(mode);
    // Persister en base
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("mobility_choices").upsert({
        user_id: user.id,
        activity_id: activityId,
        transport_mode: type,
        station_name: details || null
      }, { onConflict: "user_id,activity_id" });
    }
    toast.success(`Mode de transport sélectionné : ${label}`);
  };

  const handleCarpoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const action = carpoolType === "search" ? "recherche" : "offre";
    toast.success(`Votre ${action} de covoiturage a été transmise à ${structureName || "l'organisateur"} !`);
    
    // Reset form
    setShowCarpoolForm(false);
    setCarpoolFormData({
      name: "",
      email: "",
      phone: "",
      departureLocation: "",
      availableSeats: "1",
      departureTime: "",
      message: ""
    });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Leaf className="w-6 h-6 text-green-600" />
        <h2 className="text-2xl font-bold text-foreground">
          Économe carbone, fais du bien à la planète 🌍
        </h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Choisissez un mode de transport écologique pour vous rendre à l'activité
      </p>

      <div className="grid gap-4">
        {/* 1. Transport en commun STAS */}
        <Card className={`border-2 transition-colors ${selectedTransportMode?.type === 'bus' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-950">
                <Bus size={24} className="text-blue-600" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Transport en commun STAS</h3>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Éco-responsable
                    </Badge>
                    {selectedTransportMode?.type === 'bus' && (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 size={14} />
                        Choisi
                      </Badge>
                    )}
                  </div>
                </div>
                
                {nearestStop && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin size={16} className="text-muted-foreground" />
                      <span className="font-medium">{nearestStop.name}</span>
                      <span className="text-muted-foreground">• {nearestStop.distance_m}m</span>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {nearestStop.lines.map((line: string) => (
                        <Badge key={line} variant="outline" className="text-xs">
                          {line}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock size={14} />
                      <span>Temps estimé : {durations.bus} min</span>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activityAddress || "")}&travelmode=transit`, "_blank")}
                    className="mt-2"
                  >
                    Calculer mon itinéraire →
                  </Button>
                  <Button
                    variant={selectedTransportMode?.type === 'bus' ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => handleSelectTransport('bus', 'STAS', nearestStop?.name)}
                    className="mt-2"
                  >
                    {selectedTransportMode?.type === 'bus' ? 'Sélectionné' : 'Choisir ce mode'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Vélivert */}
        <Card className={`border-2 transition-colors ${selectedTransportMode?.type === 'bike' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-950">
                <Bike size={24} className="text-emerald-600" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Vélivert</h3>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Zéro émission
                    </Badge>
                    {selectedTransportMode?.type === 'bike' && (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 size={14} />
                        Choisi
                      </Badge>
                    )}
                  </div>
                </div>
                
                {nearestStation && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin size={16} className="text-muted-foreground" />
                      <span className="font-medium">{nearestStation.name}</span>
                      <span className="text-muted-foreground">• {nearestStation.distance_m}m</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {nearestStation.available_bikes} vélos disponibles
                    </p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock size={14} />
                      <span>Temps estimé : {durations.bike} min</span>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/itineraire?type=bike&destination=${encodeURIComponent(activityAddress || '')}&activityId=${activityId}&return=${encodeURIComponent(window.location.pathname + '?tab=trajets')}`)}
                    className="mt-2"
                  >
                    Calculer mon itinéraire →
                  </Button>
                  <Button
                    variant={selectedTransportMode?.type === 'bike' ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => handleSelectTransport('bike', 'Vélivert', nearestStation?.name)}
                    className="mt-2"
                  >
                    {selectedTransportMode?.type === 'bike' ? 'Sélectionné' : 'Choisir ce mode'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Marche santé */}
        <Card className={`border-2 transition-colors ${selectedTransportMode?.type === 'walk' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-950">
                <Footprints size={24} className="text-purple-600" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Marche santé</h3>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      100% nature
                    </Badge>
                    {selectedTransportMode?.type === 'walk' && (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 size={14} />
                        Choisi
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Idéal pour les enfants et adolescents ! Profitez d'une balade active.
                </p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock size={14} />
                  <span>Temps estimé : {durations.walk} min</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/itineraire?type=walk&destination=${encodeURIComponent(activityAddress || '')}&activityId=${activityId}&return=${encodeURIComponent(window.location.pathname + '?tab=trajets')}`)}
                    className="mt-2"
                  >
                    Calculer mon itinéraire →
                  </Button>
                  <Button
                    variant={selectedTransportMode?.type === 'walk' ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => handleSelectTransport('walk', 'Marche santé')}
                    className="mt-2"
                  >
                    {selectedTransportMode?.type === 'walk' ? 'Sélectionné' : 'Choisir ce mode'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Covoiturage */}
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-950">
                <Car size={24} className="text-orange-600" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Covoiturage</h3>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Partage solidaire
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Recherchez une formule de covoiturage ou proposez la vôtre. 
                  Rapprochez-vous de votre club préféré.
                </p>

                {!showCarpoolForm ? (
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCarpoolType("search");
                        setShowCarpoolForm(true);
                      }}
                      className="flex-1"
                    >
                      Je cherche un covoiturage
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCarpoolType("offer");
                        setShowCarpoolForm(true);
                      }}
                      className="flex-1"
                    >
                      Je propose mon trajet
                    </Button>
                  </div>
                ) : (
                  <div className="mt-4 space-y-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">
                        {carpoolType === "search" 
                          ? "Recherche de covoiturage" 
                          : "Proposition de covoiturage"}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCarpoolForm(false)}
                      >
                        Annuler
                      </Button>
                    </div>

                    <form onSubmit={handleCarpoolSubmit} className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="carpool-name">Votre nom *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="carpool-name"
                            required
                            value={carpoolFormData.name}
                            onChange={(e) => setCarpoolFormData({...carpoolFormData, name: e.target.value})}
                            className="pl-10"
                            placeholder="Jean Dupont"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="carpool-email">Email *</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="carpool-email"
                              type="email"
                              required
                              value={carpoolFormData.email}
                              onChange={(e) => setCarpoolFormData({...carpoolFormData, email: e.target.value})}
                              className="pl-10"
                              placeholder="email@exemple.fr"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="carpool-phone">Téléphone</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="carpool-phone"
                              type="tel"
                              value={carpoolFormData.phone}
                              onChange={(e) => setCarpoolFormData({...carpoolFormData, phone: e.target.value})}
                              className="pl-10"
                              placeholder="06..."
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="carpool-departure">Lieu de départ</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="carpool-departure"
                            value={carpoolFormData.departureLocation}
                            onChange={(e) => setCarpoolFormData({...carpoolFormData, departureLocation: e.target.value})}
                            className="pl-10"
                            placeholder="Adresse ou quartier"
                          />
                        </div>
                      </div>

                      {carpoolType === "offer" && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="carpool-seats">Places disponibles</Label>
                            <Input
                              id="carpool-seats"
                              type="number"
                              min="1"
                              max="8"
                              value={carpoolFormData.availableSeats}
                              onChange={(e) => setCarpoolFormData({...carpoolFormData, availableSeats: e.target.value})}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="carpool-time">Heure de départ</Label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="carpool-time"
                                type="time"
                                value={carpoolFormData.departureTime}
                                onChange={(e) => setCarpoolFormData({...carpoolFormData, departureTime: e.target.value})}
                                className="pl-10"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="carpool-message">Message (optionnel)</Label>
                        <Textarea
                          id="carpool-message"
                          value={carpoolFormData.message}
                          onChange={(e) => setCarpoolFormData({...carpoolFormData, message: e.target.value})}
                          placeholder="Informations complémentaires..."
                          rows={3}
                        />
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          ℹ️ Votre demande sera transmise directement à <strong>{structureName || "l'organisateur"}</strong> qui gérera les mises en relation.
                        </p>
                      </div>

                      <Button type="submit" className="w-full">
                        Envoyer ma {carpoolType === "search" ? "demande" : "proposition"}
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
