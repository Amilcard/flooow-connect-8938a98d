import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SlotPicker } from "@/components/SlotPicker";
import { SimulateAidModal } from "@/components/SimulateAidModal";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { BottomNavigation } from "@/components/BottomNavigation";
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Accessibility, 
  Euro,
  Car,
  CreditCard
} from "lucide-react";
import { useState } from "react";

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedSlotId, setSelectedSlotId] = useState<string>();
  const [showAidModal, setShowAidModal] = useState(false);

  // Fetch activity details
  const { data: activity, isLoading, error } = useQuery({
    queryKey: ["activity", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          structures:structure_id (
            name,
            address
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Fetch availability slots
  const { data: slots = [] } = useQuery({
    queryKey: ["slots", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("availability_slots")
        .select("*")
        .eq("activity_id", id)
        .gt("seats_remaining", 0)
        .order("start", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  if (isLoading) return <LoadingState />;
  if (error || !activity) {
    return (
      <div className="min-h-screen bg-background p-4">
        <ErrorState 
          message="Activité introuvable" 
          onRetry={() => navigate("/")} 
        />
      </div>
    );
  }

  const handleBooking = () => {
    if (!selectedSlotId) {
      alert("Veuillez sélectionner un créneau");
      return;
    }
    navigate(`/booking/${id}?slotId=${selectedSlotId}`);
  };

  const displayImage = activity.images?.[0] || "/placeholder.svg";
  const ageRange = `${activity.age_min}-${activity.age_max} ans`;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with back button */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container flex items-center gap-3 py-3 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Retour"
          >
            <ArrowLeft />
          </Button>
          <h1 className="font-semibold text-lg truncate">{activity.title}</h1>
        </div>
      </div>

      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={displayImage}
          alt={activity.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          {typeof activity.accessibility_checklist === 'object' && 
           activity.accessibility_checklist !== null && 
           'wheelchair' in activity.accessibility_checklist &&
           activity.accessibility_checklist.wheelchair && (
            <Badge className="bg-white/90 text-foreground">
              <Accessibility size={14} className="mr-1" />
              Accessible
            </Badge>
          )}
        </div>
      </div>

      <div className="container px-4 py-6 space-y-6">
        {/* Title and category */}
        <div>
          <Badge className="mb-2">{activity.category}</Badge>
          <h2 className="text-2xl font-bold mb-2">{activity.title}</h2>
          
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users size={16} />
              {ageRange}
            </span>
            {activity.structures?.address && (
              <span className="flex items-center gap-1">
                <MapPin size={16} />
                {activity.structures.address}
              </span>
            )}
          </div>
        </div>

        {/* Price and aids */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-3xl font-bold text-primary">
                {activity.price_base === 0 ? "Gratuit" : `${activity.price_base}€`}
              </p>
              <p className="text-sm text-muted-foreground">par enfant</p>
            </div>
            
            {Array.isArray(activity.accepts_aid_types) && activity.accepts_aid_types.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAidModal(true)}
              >
                <Euro size={16} className="mr-1" />
                Aides disponibles
              </Button>
            )}
          </div>

          {activity.payment_echelonned && (
            <Badge variant="secondary" className="bg-accent/10 text-accent">
              <CreditCard size={14} className="mr-1" />
              Paiement échelonné possible
            </Badge>
          )}
        </Card>

        {/* Description */}
        {activity.description && (
          <div>
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-line">
              {activity.description}
            </p>
          </div>
        )}

        {/* Features */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Services inclus</h3>
          <div className="space-y-2">
            {activity.covoiturage_enabled && (
              <div className="flex items-center gap-2 text-sm">
                <Car size={16} className="text-primary" />
                <span>Covoiturage disponible</span>
              </div>
            )}
            {typeof activity.accessibility_checklist === 'object' && 
             activity.accessibility_checklist !== null && 
             'sensory_support' in activity.accessibility_checklist &&
             activity.accessibility_checklist.sensory_support && (
              <div className="flex items-center gap-2 text-sm">
                <Accessibility size={16} className="text-primary" />
                <span>Accompagnement sensoriel adapté</span>
              </div>
            )}
          </div>
        </div>

        {/* Slot picker */}
        <SlotPicker
          slots={slots}
          onSelectSlot={setSelectedSlotId}
          selectedSlotId={selectedSlotId}
        />

        {/* Booking button */}
        <Button
          onClick={handleBooking}
          disabled={!selectedSlotId || slots.length === 0}
          className="w-full h-14 text-lg"
          size="lg"
        >
          Réserver cette activité
        </Button>
      </div>

      <SimulateAidModal
        open={showAidModal}
        onOpenChange={setShowAidModal}
        activityPrice={activity.price_base || 0}
        acceptedAids={Array.isArray(activity.accepts_aid_types) ? activity.accepts_aid_types as string[] : []}
      />

      <BottomNavigation />
    </div>
  );
};

export default ActivityDetail;
