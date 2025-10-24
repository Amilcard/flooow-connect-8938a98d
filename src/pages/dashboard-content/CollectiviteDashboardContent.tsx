import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, Heart, TrendingUp, Calendar, DollarSign, Car, User } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

interface CollectiviteDashboardContentProps {
  territoryId: string;
}

export default function CollectiviteDashboardContent({ territoryId }: CollectiviteDashboardContentProps) {
  // Source: Données mockées pour la démo (future intégration avec edge function mock-activities)
  // Calcul: Agrégation des bookings validés du territoire
  const kpis = {
    // Source: COUNT(bookings WHERE status='validee' AND territory_id=...)
    total_inscriptions: 342,
    
    // Source: COUNT(children WHERE accessibility_flags IS NOT NULL) / COUNT(children) * 100
    disability_percentage: 8.2,
    
    // Source: COUNT(profiles WHERE postal_code IN qpv_reference) / COUNT(profiles) * 100
    // ⚠️ PLACEHOLDER: Calcul QPV nécessite jointure profiles ↔ qpv_reference (non implémenté)
    qpv_percentage: 15.7,
    
    // Source: SUM(activity_duration * bookings_count) estimé par semaine
    // ⚠️ PLACEHOLDER: Calcul estimé, non basé sur données réelles de participation
    estimated_weekly_minutes: 4820,
    
    // Source: COUNT(bookings GROUP BY transport_mode) / COUNT(bookings) * 100
    // Valeurs: TC (Transport en Commun), vélo, covoit, voiture
    mobility_distribution: {
      car: 45,
      transport_public: 30,
      bike: 15,
      walk: 10
    }
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
              Résidents QPV <span className="text-orange-500">(placeholder)</span>
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
              Minutes/semaine <span className="text-orange-500">(estimé)</span>
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
            <BarChart data={[
              { mode: "TC", count: kpis.mobility_distribution.transport_public, label: "Transport en commun" },
              { mode: "Vélo", count: kpis.mobility_distribution.bike, label: "Vélo" },
              { mode: "Covoit", count: kpis.mobility_distribution.car, label: "Covoiturage" },
              { mode: "Voiture", count: kpis.mobility_distribution.walk, label: "Voiture perso" }
            ]}>
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
