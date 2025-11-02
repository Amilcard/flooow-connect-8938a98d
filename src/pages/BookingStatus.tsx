import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { Clock, CheckCircle2, XCircle, AlertCircle, Home } from "lucide-react";

const BookingStatus = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: booking, isLoading, error } = useQuery({
    queryKey: ["booking", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          activities:activity_id (
            title,
            images
          ),
          children:child_id (
            first_name
          ),
          availability_slots:slot_id (
            start,
            end
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return <LoadingState />;
  if (error || !booking) {
    return (
      <div className="min-h-screen bg-background p-4">
        <ErrorState 
          message="Réservation introuvable" 
          onRetry={() => navigate("/")} 
        />
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "en_attente":
        return {
          icon: <Clock className="w-16 h-16 text-orange-500" />,
          title: "En attente de validation",
          description: "Votre demande a été transmise à la structure. Vous recevrez une réponse dans les prochains jours.",
          color: "bg-orange-100 text-orange-700"
        };
      case "validee":
        return {
          icon: <CheckCircle2 className="w-16 h-16 text-green-500" />,
          title: "Réservation confirmée",
          description: "Votre réservation a été validée ! Vous recevrez toutes les informations par email.",
          color: "bg-green-100 text-green-700"
        };
      case "refusee":
        return {
          icon: <XCircle className="w-16 h-16 text-red-500" />,
          title: "Réservation refusée",
          description: booking.reason_code || "Malheureusement, votre demande n'a pas pu être acceptée.",
          color: "bg-red-100 text-red-700"
        };
      case "annulee":
        return {
          icon: <AlertCircle className="w-16 h-16 text-gray-500" />,
          title: "Réservation annulée",
          description: "Cette réservation a été annulée.",
          color: "bg-gray-100 text-gray-700"
        };
      default:
        return {
          icon: <AlertCircle className="w-16 h-16 text-gray-500" />,
          title: "Statut inconnu",
          description: "",
          color: "bg-gray-100 text-gray-700"
        };
    }
  };

  const config = getStatusConfig(booking.status);
  const b = booking as any;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long"
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-12 max-w-md mx-auto">
        <div className="text-center space-y-6">
          {/* Status icon */}
          <div className="flex justify-center">
            {config.icon}
          </div>

          {/* Status title */}
          <div>
            <h1 className="text-2xl font-bold mb-2">{config.title}</h1>
            <p className="text-muted-foreground">{config.description}</p>
          </div>

          {/* Booking details */}
          <Card className="p-6 text-left space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Activité</p>
              <p className="font-semibold">{booking.activities?.title}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Enfant</p>
              <p className="font-medium">{booking.children?.first_name}</p>
            </div>

            {booking.availability_slots && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date et horaire</p>
                <p className="font-medium">
                  {formatDate(booking.availability_slots.start)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatTime(booking.availability_slots.start)} - {formatTime(booking.availability_slots.end)}
                </p>
              </div>
            )}

            {/* Pricing section - only show if activity has a price */}
            {b?.base_price_cents > 0 && (
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-2">Tarification</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Prix initial</span>
                    <span className="font-medium">{((b.base_price_cents || 0) / 100).toFixed(2)}€</span>
                  </div>
                  {(b.aids_total_cents || 0) > 0 && (
                    <>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Aides financières</span>
                        <span className="font-medium">- {((b.aids_total_cents || 0) / 100).toFixed(2)}€</span>
                      </div>
                      {Array.isArray(b.aids_applied) && b.aids_applied.length > 0 && (
                        <div className="ml-4 mt-1 space-y-0.5">
                          {b.aids_applied.map((aid: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-xs text-muted-foreground">
                              <span>• {aid.aid_name}</span>
                              <span>-{((aid.amount_cents || 0) / 100).toFixed(2)}€</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                    <span>Reste à payer</span>
                    <span className="text-primary">{((b.final_price_cents || 0) / 100).toFixed(2)}€</span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground mb-1">Numéro de réservation</p>
              <p className="text-xs font-mono">{booking.id}</p>
            </div>

            <div>
              <Badge className={config.color}>{booking.status}</Badge>
            </div>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate("/")}
              className="w-full h-12"
              size="lg"
            >
              <Home className="mr-2" size={20} />
              Retour à l'accueil
            </Button>

            {booking.status === "en_attente" && (
              <Button
                onClick={() => navigate("/mes-reservations")}
                variant="outline"
                className="w-full h-12"
              >
                Voir mes réservations
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingStatus;
