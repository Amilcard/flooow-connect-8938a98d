import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, Heart, TrendingUp, Calendar, DollarSign, Car, User } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useDashboardKPIs } from "@/hooks/useDashboardStats";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

interface CollectiviteDashboardContentProps {
  territoryId: string;
}

export default function CollectiviteDashboardContent({ territoryId }: CollectiviteDashboardContentProps) {
  const { data: kpisData, isLoading, error } = useDashboardKPIs();

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="Erreur lors du chargement des KPIs" />;

  const kpis = {
    total_inscriptions: kpisData?.kpis?.inscriptions?.total || 0,
    disability_percentage: parseFloat(kpisData?.kpis?.handicap?.percentage || '0'),
    qpv_percentage: parseFloat(kpisData?.kpis?.qpv?.percentage || '0'),
    estimated_weekly_minutes: parseInt(kpisData?.kpis?.sante?.weeklyMinutes || '0'),
    mobility_distribution: kpisData?.kpis?.mobilite?.distribution || []
  };

  const overview = {
    total_activities: 87,
    unique_children_registered: 156,
    total_aid_simulations: 89,
    total_revenue_potential: 45680
  };

  const activitiesByCategory = [
    { name: "Sport", value: 32 },
    { name: "Culture", value: 25 },
    { name: "Loisirs", value: 18 },
    { name: "Vacances", value: 12 }
  ];

  const topStructures = [
    { name: "Maison des Jeunes", count: 12 },
    { name: "Club Sportif Municipal", count: 9 },
    { name: "Centre Culturel", count: 8 },
    { name: "Association Arts & Loisirs", count: 6 },
    { name: "Espace Jeunesse", count: 5 }
  ];

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Tableau de bord Collectivité</h1>
        <p className="text-muted-foreground">Vue d'ensemble des activités et inscriptions du territoire</p>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inscriptions</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.total_inscriptions}</div>
            <p className="text-xs text-muted-foreground mt-1">Total validées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Accessibilité</CardTitle>
            <User className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.disability_percentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Enfants en situation handicap</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">QPV</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.qpv_percentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Résidents QPV
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Activité hebdo</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.estimated_weekly_minutes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Minutes/semaine
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats générales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Activités</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total_activities}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Enfants uniques</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.unique_children_registered}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Simulations aides</CardTitle>
            <Heart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total_aid_simulations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CA potentiel</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total_revenue_potential.toFixed(0)}€</div>
          </CardContent>
        </Card>
      </div>

      {/* Répartition Mobilité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Répartition Mobilité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={kpis.mobility_distribution.map((item: any) => ({
              mode: item.mode,
              count: parseFloat(item.percentage),
              label: item.mode
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mode" />
              <YAxis label={{ value: '% inscrits', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="count" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2">
            Source: transport_mode enregistré lors des réservations
          </p>
        </CardContent>
      </Card>

      {/* Analyses détaillées */}
      <Tabs defaultValue="activities" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="activities">Activités</TabsTrigger>
          <TabsTrigger value="structures">Structures</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Répartition par catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={activitiesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {activitiesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top structures par activités</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Structure</TableHead>
                    <TableHead className="text-right">Activités</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topStructures.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{item.count}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
