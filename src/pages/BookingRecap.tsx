import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LoadingState } from "@/components/LoadingState";
import { BackButton } from "@/components/BackButton";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, User, Euro, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LocationState {
  childId: string;
  aids: any[];
  totalAids: number;
  remainingPrice: number;
}

const BookingRecap = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const slotId = searchParams.get("slotId");
  const state = location.state as LocationState;

  useEffect(() => {
    if (!state || !state.childId) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord calculer vos aides sur la page activité",
        variant: "destructive"
      });
      navigate(`/activity/${id}`);
    }
  }, [state, id, navigate, toast]);

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

  // Fetch child
  const { data: child, isLoading: loadingChild } = useQuery({
    queryKey: ["child", state?.childId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("id", state.childId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!state?.childId
  });

  const handleConfirm = async () => {
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Non authentifié",
          description: "Veuillez vous connecter",
          variant: "destructive"
        });
        navigate("/login");
        return;
      }

      // Generate idempotency key
      const compact = (s: string) => s.replace(/-/g, "").slice(0, 8);
      const idempotencyKey = `bkg_${compact(id!)}_${compact(slotId!)}_${compact(state.childId)}_${Date.now().toString(36)}`;

      // Call bookings edge function
      const { data, error } = await supabase.functions.invoke("bookings", {
        body: {
          activity_id: id,
          slot_id: slotId,
          child_id: state.childId,
          idempotency_key: idempotencyKey,
          express_flag: false
        }
      });

      if (!error && data && (data as any).success === false) {
        const err = (data as any).error || {};
        toast({
          title: "Réservation non éligible",
          description: err.message || "Cette réservation n'est pas possible",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (error) {
        const errorData = error.context?.body;
        throw new Error(errorData?.message || errorData?.error || error.message);
      }

      toast({
        title: "Demande envoyée",
        description: "Votre demande de réservation a bien été enregistrée"
      });

      navigate(`/booking-status/${data.id}`);
    } catch (error: any) {
      toast({
        title: "Erreur lors de la réservation",
        description: error.message || "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/activity/${id}`);
  };

  if (loadingActivity || loadingSlot || loadingChild) {
    return <LoadingState />;
  }

  if (!activity || !slot || !child || !state) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="text-center">
          <p className="text-muted-foreground">Données manquantes</p>
          <Button onClick={() => navigate(`/activity/${id}`)} className="mt-4">
            Retour à l'activité
          </Button>
        </div>
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

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const TERRITORY_ICONS = {
    national: "🇫🇷",
    region: "🌍",
    metropole: "🏙️",
    commune: "🏘️"
  } as const;

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container flex items-center gap-3 py-3 px-4">
          <BackButton fallback={`/activity/${id}`} variant="ghost" size="icon" />
          <h1 className="font-semibold text-lg">Récapitulatif de la demande</h1>
        </div>
      </div>

      <div className="container px-4 py-6 space-y-6 max-w-2xl mx-auto">
        {/* Info Alert */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Vérifiez les informations ci-dessous avant de confirmer votre demande d'inscription
          </AlertDescription>
        </Alert>

        {/* Activité */}
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <CheckCircle2 size={20} className="text-primary" />
            Activité
          </h2>
          <div className="space-y-3">
            <p className="font-medium text-lg">{activity.title}</p>
            
            {activity.structures?.address && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin size={16} />
                <span>{activity.structures.address}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar size={16} />
              <span>
                {formatDate(slot.start)} · {formatTime(slot.start)} - {formatTime(slot.end)}
              </span>
            </div>
          </div>
        </Card>

        {/* Enfant */}
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <User size={20} className="text-primary" />
            Enfant inscrit
          </h2>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User size={24} className="text-primary" />
            </div>
            <div>
              <p className="font-medium">{child.first_name}</p>
              <p className="text-sm text-muted-foreground">{calculateAge(child.dob)} ans</p>
            </div>
          </div>
        </Card>

        {/* Tarification */}
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Euro size={20} className="text-primary" />
            Tarification
          </h2>

          <div className="space-y-3">
            {/* Prix initial */}
            <div className="flex justify-between text-sm">
              <span>Prix initial</span>
              <span className="font-medium">{activity.price_base.toFixed(2)}€</span>
            </div>

            {/* Aides */}
            {state.aids.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Aides appliquées</p>
                  {state.aids.map((aid: any, index: number) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{aid.aid_name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {TERRITORY_ICONS[aid.territory_level as keyof typeof TERRITORY_ICONS]}
                        </Badge>
                      </div>
                      <span className="font-medium text-primary">
                        - {Number(aid.amount).toFixed(2)}€
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Total */}
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-semibold">Reste à payer</span>
              <span className="text-2xl font-bold text-primary">
                {state.remainingPrice.toFixed(2)}€
              </span>
            </div>
          </div>
        </Card>

        {/* Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="w-full h-12"
            size="lg"
          >
            {isSubmitting ? "Envoi en cours..." : "Confirmer ma demande"}
          </Button>

          <Button
            onClick={handleCancel}
            variant="outline"
            className="w-full h-12"
            size="lg"
            disabled={isSubmitting}
          >
            Annuler et retour à la fiche
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Votre demande sera transmise à la structure organisatrice.
          Vous recevrez une confirmation par email.
        </p>
      </div>
    </div>
  );
};

export default BookingRecap;
