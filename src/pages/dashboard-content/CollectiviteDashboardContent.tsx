import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Activity, Heart, TrendingUp, Calendar, DollarSign, Car, User, MapPin } from "lucide-react";
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

  const neighborhoodData = [
    {
      name: "La Ricamarie",
      inscriptions_totales: 89,
      enfants_qpv: 67,
      taux_qpv_pct: 75.3,
      activites_disponibles: 24,
      taux_remplissage_pct: 82,
      aide_moyenne_euros: 145,
      reste_charge_moyen: 68,
      transport_bus_pct: 58,
      transport_velo_pct: 12,
      abandon_mobilite: 8,
      enfants_handicap: 14,
    },
    {
      name: "Grand Clos / Côte-Chaude",
      inscriptions_totales: 124,
      enfants_qpv: 98,
      taux_qpv_pct: 79.0,
      activites_disponibles: 18,
      taux_remplissage_pct: 94,
      aide_moyenne_euros: 168,
      reste_charge_moyen: 52,
      transport_bus_pct: 72,
      transport_velo_pct: 8,
      abandon_mobilite: 14,
      enfants_handicap: 19,
    },
    {
      name: "Crêt de Roch",
      inscriptions_totales: 76,
      enfants_qpv: 51,
      taux_qpv_pct: 67.1,
      activites_disponibles: 21,
      taux_remplissage_pct: 71,
      aide_moyenne_euros: 132,
      reste_charge_moyen: 78,
      transport_bus_pct: 48,
      transport_velo_pct: 18,
      abandon_mobilite: 11,
      enfants_handicap: 10,
    }
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
      <Tabs defaultValue="neighborhoods" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="neighborhoods">
            <MapPin className="w-4 h-4 mr-1" />
            Quartiers
          </TabsTrigger>
          <TabsTrigger value="activities">Activités</TabsTrigger>
          <TabsTrigger value="structures">Structures</TabsTrigger>
        </TabsList>

        <TabsContent value="neighborhoods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Vue par quartier prioritaire
              </CardTitle>
              <CardDescription>
                Comparaison des 3 quartiers : La Ricamarie, Grand Clos/Côte-Chaude, Crêt de Roch
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Graphique: Inscriptions */}
              <div>
                <h4 className="font-semibold mb-3">Inscriptions totales</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={neighborhoodData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="inscriptions_totales" fill={COLORS[0]} name="Inscriptions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Graphique: Taux QPV */}
              <div>
                <h4 className="font-semibold mb-3">Proportion QPV (%)</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={neighborhoodData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="taux_qpv_pct" fill={COLORS[2]} name="% QPV" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Graphique: Aides vs RAC */}
              <div>
                <h4 className="font-semibold mb-3">Aide moyenne et reste à charge (€)</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={neighborhoodData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="aide_moyenne_euros" fill={COLORS[4]} name="Aide moyenne" />
                    <Bar dataKey="reste_charge_moyen" fill={COLORS[3]} name="Reste à charge" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Graphique: Transport */}
              <div>
                <h4 className="font-semibold mb-3">Modes de transport (%)</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={neighborhoodData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="transport_bus_pct" fill={COLORS[5]} name="Bus" />
                    <Bar dataKey="transport_velo_pct" fill={COLORS[1]} name="Vélo" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Tableau récapitulatif */}
              <div>
                <h4 className="font-semibold mb-3">Tableau de synthèse</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quartier</TableHead>
                      <TableHead className="text-right">Inscriptions</TableHead>
                      <TableHead className="text-right">% QPV</TableHead>
                      <TableHead className="text-right">Activités</TableHead>
                      <TableHead className="text-right">Taux remplissage</TableHead>
                      <TableHead className="text-right">Handicap</TableHead>
                      <TableHead className="text-right">Abandon mobilité</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {neighborhoodData.map((neighborhood, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-semibold">{neighborhood.name}</TableCell>
                        <TableCell className="text-right">{neighborhood.inscriptions_totales}</TableCell>
                        <TableCell className="text-right">{neighborhood.taux_qpv_pct.toFixed(1)}%</TableCell>
                        <TableCell className="text-right">{neighborhood.activites_disponibles}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={neighborhood.taux_remplissage_pct >= 85 ? "destructive" : "secondary"}>
                            {neighborhood.taux_remplissage_pct}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{neighborhood.enfants_handicap}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={neighborhood.abandon_mobilite >= 12 ? "destructive" : "outline"}>
                            {neighborhood.abandon_mobilite}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Points d'attention */}
              <Card className="bg-muted/30 border-l-4 border-l-orange-500">
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2">🎯 Points d'attention</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• <strong>Grand Clos/Côte-Chaude</strong>: Saturation à 94% avec 79% QPV → Besoin urgent d'augmenter l'offre</li>
                    <li>• <strong>La Ricamarie</strong>: 8 abandons pour mobilité → Renforcer les transports en commun</li>
                    <li>• <strong>Crêt de Roch</strong>: Reste à charge élevé (78€) → Vérifier recours aux aides disponibles</li>
                  </ul>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

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
