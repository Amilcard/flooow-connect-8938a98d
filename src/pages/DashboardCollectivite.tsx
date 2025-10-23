import { useCollectiviteDashboard, useTerritoryStats, useBookingsStats } from "@/hooks/useDashboardStats";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, Activity, DollarSign, TrendingUp, Calendar, UserCheck } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/hooks/useAuth";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function DashboardCollectivite() {
  const { user } = useAuth();
  const { data: overview, isLoading: loadingOverview } = useCollectiviteDashboard(user?.id);
  const { data: territoryStats, isLoading: loadingTerritory } = useTerritoryStats(user?.id);
  const { data: bookingsStats, isLoading: loadingBookings } = useBookingsStats();

  if (loadingOverview || loadingTerritory || loadingBookings) {
    return <LoadingState />;
  }

  if (!overview) {
    return <ErrorState message="Impossible de charger les données du dashboard" />;
  }

  const bookingsByStatus = Object.entries(bookingsStats?.byStatus || {}).map(([name, value]) => ({
    name: name === 'en_attente' ? 'En attente' : name === 'validee' ? 'Validées' : name === 'annulee' ? 'Annulées' : name,
    value
  }));

  return (
    <PageLayout>
      <div className="container mx-auto py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Collectivité</h1>
          <p className="text-muted-foreground mt-2">
            Territoire: {overview.territory_name} ({overview.territory_type})
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Activités Publiées"
            value={overview.published_activities || 0}
            icon={Activity}
            description={`${overview.total_activities || 0} au total`}
          />
          <StatsCard
            title="Inscriptions"
            value={overview.total_registrations || 0}
            icon={Calendar}
            description={`${overview.unique_children_registered || 0} enfants uniques`}
          />
          <StatsCard
            title="Simulations d'Aides"
            value={overview.total_aid_simulations || 0}
            icon={DollarSign}
            description="Demandes de financement"
          />
          <StatsCard
            title="Revenus Potentiels"
            value={`${(overview.total_revenue_potential || 0).toFixed(0)}€`}
            icon={TrendingUp}
            description="Chiffre d'affaires estimé"
          />
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Répartition des réservations */}
          <Card>
            <CardHeader>
              <CardTitle>Statut des Réservations</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={bookingsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {bookingsByStatus.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Profil socio-économique */}
          {territoryStats && (
            <Card>
              <CardHeader>
                <CardTitle>Profil des Usagers</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { name: 'Revenus Faibles', value: territoryStats.low_income_count || 0 },
                      { name: 'Revenus Moyens', value: territoryStats.medium_income_count || 0 },
                      { name: 'Revenus Élevés', value: territoryStats.high_income_count || 0 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" name="Nombre de familles" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats démographiques */}
        {territoryStats && (
          <Card>
            <CardHeader>
              <CardTitle>Statistiques Démographiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Usagers</p>
                  <p className="text-2xl font-bold">{territoryStats.total_users || 0}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Quotient Familial Moyen</p>
                  <p className="text-2xl font-bold">
                    {territoryStats.avg_quotient_familial 
                      ? `${Number(territoryStats.avg_quotient_familial).toFixed(0)}€`
                      : 'N/A'
                    }
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Codes Postaux Couverts</p>
                  <p className="text-2xl font-bold">
                    {territoryStats.postal_code_prefixes?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}