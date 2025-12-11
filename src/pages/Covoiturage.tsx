import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BottomNavigation } from "@/components/BottomNavigation";
import { PageHeader } from "@/components/PageHeader";
import PageLayout from "@/components/PageLayout";
import { LoadingState } from "@/components/LoadingState";
import { Car, MapPin, Users, Clock, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const Covoiturage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activityId = searchParams.get("activityId");
  const slotId = searchParams.get("slotId");

  // Fetch activity details
  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ["activity", activityId],
    queryFn: async () => {
      if (!activityId) return null;
      // FIX: Removed structures join to avoid Supabase embed error
      const { data } = await supabase
        .from("activities")
        .select(`*`)
        .eq("id", activityId)
        .single();
      return data;
    },
    enabled: !!activityId,
  });

  // Fetch slot details
  const { data: slot } = useQuery({
    queryKey: ["slot", slotId],
    queryFn: async () => {
      if (!slotId) return null;
      const { data } = await supabase
        .from("availability_slots")
        .select("*")
        .eq("id", slotId)
        .single();
      return data;
    },
    enabled: !!slotId,
  });

  // Mock carpooling offers (to be replaced with real data)
  const mockOffers = [
    {
      id: "1",
      driverName: "Marie L.",
      departureLocation: "Place de la République",
      availableSeats: 2,
      departureTime: "14:00",
      verified: true,
    },
    {
      id: "2",
      driverName: "Thomas D.",
      departureLocation: "Gare Saint-Lazare",
      availableSeats: 1,
      departureTime: "13:45",
      verified: true,
    },
  ];

  const handleOfferRide = () => {
    toast.success("Votre proposition de covoiturage a été enregistrée !");
  };

  const handleJoinRide = (offerId: string) => {
    toast.success("Demande envoyée au conducteur !");
  };

  if (activityLoading) return <LoadingState />;

  return (
    <PageLayout showHeader={false}>
      <PageHeader
        title="Covoiturage"
        subtitle="Partagez vos trajets avec d'autres familles"
        backFallback={activityId ? `/activity/${activityId}` : "/home"}
      />

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Activity info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{activity?.title}</CardTitle>
            <CardDescription className="space-y-1">
              {activity?.structures?.address && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} />
                  <span>{activity.structures.address}</span>
                </div>
              )}
              {slot?.start && (
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span>{new Date(slot.start).toLocaleString("fr-FR")}</span>
                </div>
              )}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Offer ride */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Car size={18} />
              Proposer un covoiturage
            </CardTitle>
            <CardDescription>
              Partagez votre trajet avec d'autres familles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleOfferRide} className="w-full">
              Je propose mon trajet
            </Button>
          </CardContent>
        </Card>

        {/* Available rides */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Covoiturages disponibles</h2>
            <Badge variant="secondary">{mockOffers.length}</Badge>
          </div>

          {mockOffers.map((offer) => (
            <Card key={offer.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      {offer.driverName}
                      {offer.verified && (
                        <Badge variant="secondary" className="text-xs">
                          Vérifié
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        <span>{offer.departureLocation}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>Départ à {offer.departureTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={14} />
                        <span>{offer.availableSeats} place(s) disponible(s)</span>
                      </div>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Separator className="mb-4" />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleJoinRide(offer.id)}
                >
                  <Phone size={16} className="mr-2" />
                  Contacter le conducteur
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info card */}
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle className="text-base">💡 Bon à savoir</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Les coordonnées sont partagées uniquement après acceptation</p>
            <p>• Vérifiez toujours l'identité des personnes</p>
            <p>• Partagez les frais équitablement entre parents</p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Covoiturage;
