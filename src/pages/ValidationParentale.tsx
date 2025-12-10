import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { User, Calendar, MapPin, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";

const ValidationParentale = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Fetch booking details
  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking-validation", bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          activities:activity_id(title, images, structures:structure_id(name, address)),
          children:child_id(first_name, dob),
          availability_slots:slot_id(start, end),
          validations_parentales!validations_parentales_booking_id_fkey(*)
        `)
        .eq("id", bookingId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Validate mutation
  const validateMutation = useMutation({
    mutationFn: async (action: "validee" | "refusee") => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Non authentifié");

      // Create or update validation
      const { data, error } = await supabase
        .from("validations_parentales")
        .upsert({
          booking_id: bookingId,
          parent_id: user.id,
          status: action,
          validated_at: new Date().toISOString(),
          reason_refus: action === "refusee" ? rejectReason : null
        })
        .select()
        .single();

      if (error) throw error;

      // Update booking status
      await supabase
        .from("bookings")
        .update({ status: action })
        .eq("id", bookingId);

      return data;
    },
    onSuccess: (_, action) => {
      queryClient.invalidateQueries({ queryKey: ["booking-validation", bookingId] });
      
      toast({
        title: action === "validee" ? "Inscription validée" : "Inscription refusée",
        description: "Un email de confirmation a été envoyé"
      });

      // TODO: Send email notification via edge function
      
      navigate("/mon-compte/validations");
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive"
      });
    }
  });

  if (isLoading) return <LoadingState />;
  
  if (!booking) {
    return (
      <div className="min-h-screen bg-background p-4">
        <ErrorState message="Réservation introuvable" onRetry={() => navigate(-1)} />
      </div>
    );
  }

  const validation = booking.validations_parentales?.[0];
  const isAlreadyValidated = validation && validation.status !== "en_attente";

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

  const calculateAge = (dob: string) => {
    return new Date().getFullYear() - new Date(dob).getFullYear();
  };

  return (
    <PageLayout showHeader={false}>
      <PageHeader
        title="Validation Parentale"
        backFallback="/mon-compte/validations"
      />

      <div className="container px-4 py-6 space-y-6 max-w-2xl mx-auto pb-24">
        {/* Status badge */}
        {isAlreadyValidated && (
          <Card className={`p-4 ${
            validation.status === "validee" 
              ? "bg-green-50 border-green-200" 
              : "bg-red-50 border-red-200"
          }`}>
            <div className="flex items-center gap-3">
              {validation.status === "validee" ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <div>
                <p className="font-semibold">
                  {validation.status === "validee" ? "Inscription validée" : "Inscription refusée"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Le {new Date(validation.validated_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Child info */}
        <Card className="p-5">
          <h2 className="font-semibold text-lg mb-4">Enfant concerné</h2>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">{booking.children.first_name}</p>
              <p className="text-sm text-muted-foreground">
                {calculateAge(booking.children.dob)} ans
              </p>
            </div>
          </div>
        </Card>

        {/* Activity info */}
        <Card className="p-5">
          <h2 className="font-semibold text-lg mb-4">Détails de l'activité</h2>
          
          {booking.activities.images?.[0] && (
            <img
              src={booking.activities.images[0]}
              alt={booking.activities.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}

          <div className="space-y-3">
            <div>
              <p className="font-medium text-lg">{booking.activities.title}</p>
              <p className="text-sm text-muted-foreground">
                {booking.activities.structures?.name}
              </p>
            </div>

            {booking.activities.structures?.address && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span>{booking.activities.structures.address}</span>
              </div>
            )}

            <div className="flex items-start gap-2 text-sm">
              <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div>
                <p>{formatDate(booking.availability_slots.start)}</p>
                <p className="text-muted-foreground">
                  {formatTime(booking.availability_slots.start)} - {formatTime(booking.availability_slots.end)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action buttons */}
        {!isAlreadyValidated && (
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              size="lg"
              className="h-14"
              onClick={() => setShowRejectDialog(true)}
              disabled={validateMutation.isPending}
            >
              <XCircle className="w-5 h-5 mr-2" />
              Refuser
            </Button>
            <Button
              size="lg"
              className="h-14"
              onClick={() => validateMutation.mutate("validee")}
              disabled={validateMutation.isPending}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Valider
            </Button>
          </div>
        )}
      </div>

      {/* Reject dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser l'inscription</DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison du refus (optionnel)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Raison du refus</Label>
            <Textarea
              id="reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ex: Conflit d'horaire, activité non adaptée..."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Annuler
            </Button>
            <Button
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                validateMutation.mutate("refusee");
                setShowRejectDialog(false);
              }}
              disabled={validateMutation.isPending}
            >
              Confirmer le refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default ValidationParentale;
