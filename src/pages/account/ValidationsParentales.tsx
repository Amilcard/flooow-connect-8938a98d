import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { ArrowLeft, User, Calendar, MapPin, CheckCircle, XCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSmartBack } from "@/hooks/useSmartBack";

const ValidationsParentales = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [rejectReason, setRejectReason] = useState("");

  // Fetch bookings awaiting parental validation
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["validations-parentales"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          activities:activity_id(title, images, category, structures:structure_id(name, address)),
          children:child_id(first_name, dob),
          availability_slots:slot_id(start, end),
          validations_parentales!validations_parentales_booking_id_fkey(*)
        `)
        .eq("user_id", user.id)
        .eq("status", "en_attente")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Validation mutation
  const validateMutation = useMutation({
    mutationFn: async ({ bookingId, action, reason }: { bookingId: string; action: "validee" | "refusee"; reason?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Create or update validation
      await supabase
        .from("validations_parentales")
        .upsert({
          booking_id: bookingId,
          parent_id: user.id,
          status: action,
          validated_at: new Date().toISOString(),
          reason_refus: action === "refusee" ? reason : null
        });

      // Update booking status
      await supabase
        .from("bookings")
        .update({ status: action })
        .eq("id", bookingId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["validations-parentales"] });
      
      toast({
        title: variables.action === "validee" ? "Inscription validée" : "Inscription refusée",
        description: "La décision a été enregistrée"
      });

      setShowRejectDialog(false);
      setRejectReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive"
      });
    }
  });

  const handleAccept = (bookingId: string) => {
    validateMutation.mutate({ bookingId, action: "validee" });
  };

  const handleReject = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setShowRejectDialog(true);
  };

  const confirmReject = () => {
    validateMutation.mutate({ 
      bookingId: selectedBookingId, 
      action: "refusee",
      reason: rejectReason 
    });
  };

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

  if (isLoading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-background">
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
          <h1 className="font-semibold text-lg">Demandes d'inscription</h1>
          {bookings.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {bookings.length}
            </Badge>
          )}
        </div>
      </div>

      <div className="container px-4 py-6 space-y-4 max-w-2xl mx-auto">
        {bookings.length === 0 ? (
          <EmptyState 
            icon={Clock}
            title="Aucune demande en attente"
            description="Les demandes d'inscription de vos enfants apparaîtront ici"
          />
        ) : (
          bookings.map((booking) => (
            <Card key={booking.id} className="p-5 space-y-4">
              {/* Child info */}
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
                <Badge variant="outline" className="ml-auto">
                  <Clock className="w-3 h-3 mr-1" />
                  En attente
                </Badge>
              </div>

              <Separator />

              {/* Activity info */}
              <div className="space-y-3">
                {booking.activities.images?.[0] && (
                  <img
                    src={booking.activities.images[0]}
                    alt={booking.activities.title}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                )}

                <div>
                  <p className="font-medium text-lg">{booking.activities.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.activities.structures?.name}
                  </p>
                </div>

                {booking.activities.structures?.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {booking.activities.structures.address}
                    </span>
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

                <p className="text-xs text-muted-foreground">
                  Demande envoyée le {new Date(booking.created_at).toLocaleDateString("fr-FR")}
                </p>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => handleReject(booking.id)}
                  disabled={validateMutation.isPending}
                  className="w-full"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Refuser
                </Button>
                <Button
                  onClick={() => handleAccept(booking.id)}
                  disabled={validateMutation.isPending}
                  className="w-full"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Valider
                </Button>
              </div>
            </Card>
          ))
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
              onClick={confirmReject}
              disabled={validateMutation.isPending}
            >
              Confirmer le refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ValidationsParentales;
