import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { ArrowLeft, User, Calendar, MapPin, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBookingDraft } from "@/hooks/useBookingDraft";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Booking = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const slotId = searchParams.get("slotId");

  const { draft, saveDraft, clearDraft, hasDraft } = useBookingDraft(id!, slotId!);
  const [selectedChildId, setSelectedChildId] = useState<string>(draft?.childId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-save draft when child selection changes
  useEffect(() => {
    if (selectedChildId && id && slotId) {
      saveDraft(selectedChildId);
    }
  }, [selectedChildId, id, slotId]);

  // Fetch activity
  const { data: activity, isLoading: loadingActivity } = useQuery({
    queryKey: ["activity", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*, structures:structure_id(name, address)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    }
  });

  // Fetch slot
  const { data: slot, isLoading: loadingSlot } = useQuery({
    queryKey: ["slot", slotId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("availability_slots")
        .select("*")
        .eq("id", slotId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slotId
  });

  // Fetch user's children (mock for now - will need auth)
  const { data: children = [], isLoading: loadingChildren } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      // TODO: Replace with actual auth user ID
      const { data, error } = await supabase
        .from("children")
        .select("*");
      if (error) throw error;
      return data;
    }
  });

  const handleSubmit = async () => {
    if (!selectedChildId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un enfant",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Non authentifié",
          description: "Veuillez vous connecter",
          variant: "destructive"
        });
        navigate("/");
        return;
      }

      // Generate idempotency key
      const idempotencyKey = `booking_${id}_${slotId}_${selectedChildId}_${Date.now()}`;

      // Call edge function instead of direct insert
      const { data, error } = await supabase.functions.invoke("bookings", {
        body: {
          activity_id: id,
          slot_id: slotId,
          child_id: selectedChildId,
          idempotency_key: idempotencyKey,
          express_flag: false
        }
      });

      if (error) throw error;

      toast({
        title: "Demande envoyée",
        description: "Votre demande de réservation a bien été enregistrée"
      });

      navigate(`/booking-status/${data.id}`);
      clearDraft();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingActivity || loadingSlot || loadingChildren) {
    return <LoadingState />;
  }

  if (!activity || !slot) {
    return (
      <div className="min-h-screen bg-background p-4">
        <ErrorState 
          message="Données introuvables" 
          onRetry={() => navigate(-1)} 
        />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
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
          <h1 className="font-semibold text-lg">Réservation</h1>
        </div>
      </div>

      <div className="container px-4 py-6 space-y-6">
        {/* Draft recovery alert */}
        {hasDraft && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Réservation en cours récupérée. Vous pouvez continuer là où vous vous êtes arrêté.
            </AlertDescription>
          </Alert>
        )}

        {/* Activity summary */}
        <Card className="p-4">
          <h2 className="font-semibold text-lg mb-3">Récapitulatif</h2>
          <div className="space-y-2 text-sm">
            <p className="font-medium">{activity.title}</p>
            
            {activity.structures?.address && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={14} />
                <span>{activity.structures.address}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar size={14} />
              <span>
                {formatDate(slot.start)} · {formatTime(slot.start)} - {formatTime(slot.end)}
              </span>
            </div>

            <div className="pt-2 border-t">
              <p className="text-2xl font-bold text-primary">
                {activity.price_base === 0 ? "Gratuit" : `${activity.price_base}€`}
              </p>
            </div>
          </div>
        </Card>

        {/* Child selection */}
        <Card className="p-4">
          <h2 className="font-semibold text-lg mb-4">Sélectionner un enfant</h2>
          
          {children.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Vous devez d'abord ajouter un enfant à votre compte
              </p>
              <Button onClick={() => navigate("/mon-compte")}>
                Ajouter un enfant
              </Button>
            </div>
          ) : (
            <RadioGroup value={selectedChildId} onValueChange={setSelectedChildId}>
              <div className="space-y-3">
                {children.map((child) => {
                  const age = new Date().getFullYear() - new Date(child.dob).getFullYear();
                  return (
                    <div key={child.id} className="flex items-center space-x-3">
                      <RadioGroupItem value={child.id} id={child.id} />
                      <Label
                        htmlFor={child.id}
                        className="flex-1 flex items-center gap-3 cursor-pointer p-3 rounded-lg border"
                      >
                        <User size={20} className="text-muted-foreground" />
                        <div>
                          <p className="font-medium">{child.first_name}</p>
                          <p className="text-sm text-muted-foreground">{age} ans</p>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          )}
        </Card>

        {/* Submit button */}
        <Button
          onClick={handleSubmit}
          disabled={!selectedChildId || isSubmitting || children.length === 0}
          className="w-full h-14 text-lg"
          size="lg"
        >
          {isSubmitting ? "En cours..." : "Confirmer la demande"}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Votre demande sera transmise à la structure. Vous recevrez une confirmation par email.
        </p>
      </div>
    </div>
  );
};

export default Booking;
