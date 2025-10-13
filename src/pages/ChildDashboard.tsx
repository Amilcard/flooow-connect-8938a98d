import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, CheckCircle, Clock, Trophy, Sparkles } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";

const ChildDashboard = () => {
  const navigate = useNavigate();
  const [showCelebration, setShowCelebration] = useState(false);

  // Fetch child's bookings
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["child-bookings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          activities:activity_id(title, images, category),
          children:child_id(first_name),
          availability_slots:slot_id(start, end)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Check for newly validated bookings to show celebration
  useEffect(() => {
    const recentlyValidated = bookings.find(
      (b) => b.status === "validee" && 
      new Date(b.updated_at).getTime() > Date.now() - 30000 // Last 30 seconds
    );

    if (recentlyValidated && !showCelebration) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [bookings, showCelebration]);

  const pendingBookings = bookings.filter((b) => b.status === "en_attente");
  const validatedBookings = bookings.filter((b) => b.status === "validee");
  const completedBookings = bookings.filter((b) => {
    const slotDate = new Date(b.availability_slots.end);
    return b.status === "validee" && slotDate < new Date();
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short"
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (isLoading) return <LoadingState />;

  const BookingCard = ({ booking, showBadge = false }: any) => (
    <Card
      className="p-4 cursor-pointer hover:bg-accent transition-colors"
      onClick={() => navigate(`/booking-status/${booking.id}`)}
    >
      <div className="flex gap-3">
        {booking.activities.images?.[0] && (
          <img
            src={booking.activities.images[0]}
            alt={booking.activities.title}
            className="w-20 h-20 object-cover rounded-lg"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold truncate">{booking.activities.title}</h3>
            {showBadge && (
              <Badge variant="secondary">
                <Trophy className="w-3 h-3 mr-1" />
                Terminé
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Pour {booking.children.first_name}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(booking.availability_slots.start)}
            </span>
            <span>
              {formatTime(booking.availability_slots.start)} - {formatTime(booking.availability_slots.end)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background relative">
      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-primary/10 rounded-full p-8 animate-scale-in">
            <Sparkles className="w-16 h-16 text-primary animate-pulse" />
          </div>
        </div>
      )}

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
          <h1 className="font-semibold text-lg">Mes activités</h1>
        </div>
      </div>

      <div className="container px-4 py-6">
        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">{pendingBookings.length}</p>
            <p className="text-xs text-muted-foreground">En attente</p>
          </Card>
          <Card className="p-4 text-center">
            <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{validatedBookings.length}</p>
            <p className="text-xs text-muted-foreground">Validées</p>
          </Card>
          <Card className="p-4 text-center">
            <Trophy className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{completedBookings.length}</p>
            <p className="text-xs text-muted-foreground">Terminées</p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              En attente
              {pendingBookings.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendingBookings.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="validated">Validées</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-3">
            {pendingBookings.length === 0 ? (
              <Card className="p-8 text-center">
                <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Aucune activité en attente de validation
                </p>
              </Card>
            ) : (
              pendingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>

          <TabsContent value="validated" className="space-y-3">
            {validatedBookings.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">Aucune activité validée</p>
              </Card>
            ) : (
              validatedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
            {completedBookings.length === 0 ? (
              <Card className="p-8 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Aucune activité terminée pour le moment
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Tes badges apparaîtront ici ! 🎉
                </p>
              </Card>
            ) : (
              completedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} showBadge />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ChildDashboard;
