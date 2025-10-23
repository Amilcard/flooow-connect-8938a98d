import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Users, Activity, Calendar, TrendingUp } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { LoadingState } from "@/components/LoadingState";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";

export default function DashboardAnalytics() {
  // Statistiques générales
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['analytics-stats'],
    queryFn: async () => {
      const [activitiesRes, bookingsRes, usersRes, simulationsRes] = await Promise.all([
        supabase.from('activities').select('id', { count: 'exact', head: true }),
        supabase.from('bookings').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('aid_simulations').select('id', { count: 'exact', head: true }),
      ]);

      return {
        activities: activitiesRes.count || 0,
        bookings: bookingsRes.count || 0,
        users: usersRes.count || 0,
        simulations: simulationsRes.count || 0,
      };
    },
  });

  // Évolution des réservations sur 30 jours
  const { data: bookingsTrend, isLoading: loadingTrend } = useQuery({
    queryKey: ['bookings-trend'],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30);
      
      const { data, error } = await supabase
        .from('bookings')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Grouper par jour
      const grouped = data.reduce((acc, booking) => {
        const date = format(new Date(booking.created_at), 'dd/MM', { locale: fr });
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(grouped).map(([date, count]) => ({
        date,
        reservations: count,
      }));
    },
  });

  if (loadingStats || loadingTrend) {
    return <LoadingState />;
  }

  return (
    <PageLayout>
      <div className="container mx-auto py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics Globales</h1>
          <p className="text-muted-foreground mt-2">
            Vue d'ensemble de l'activité de la plateforme
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Activités"
            value={stats?.activities || 0}
            icon={Activity}
            description="Activités publiées"
          />
          <StatsCard
            title="Réservations"
            value={stats?.bookings || 0}
            icon={Calendar}
            description="Total des réservations"
          />
          <StatsCard
            title="Utilisateurs"
            value={stats?.users || 0}
            icon={Users}
            description="Comptes créés"
          />
          <StatsCard
            title="Simulations"
            value={stats?.simulations || 0}
            icon={TrendingUp}
            description="Aides simulées"
          />
        </div>

        {/* Évolution des réservations */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution des Réservations (30 derniers jours)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={bookingsTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="reservations"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                  name="Réservations"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* KPIs rapides */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Taux de Conversion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats?.users && stats?.bookings 
                  ? ((stats.bookings / stats.users) * 100).toFixed(1)
                  : 0
                }%
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Réservations par utilisateur
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Taux de Simulation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats?.bookings && stats?.simulations 
                  ? ((stats.simulations / stats.bookings) * 100).toFixed(1)
                  : 0
                }%
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Simulations d'aides par réservation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Activités par Utilisateur</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats?.users && stats?.activities 
                  ? (stats.activities / stats.users).toFixed(1)
                  : 0
                }
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Ratio activités/utilisateurs
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}