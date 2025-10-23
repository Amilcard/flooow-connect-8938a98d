import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Activity, DollarSign, TrendingUp, Building2, CheckCircle, Bus, Leaf, BarChart3, Accessibility, MapPin, HeartPulse } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";
import Header from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function CollectiviteDashboard() {
  // Fetch KPIs from edge function
  const { data: kpisData, isLoading: loadingKpis } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('dashboard-kpis');
      if (error) throw error;
      return data;
    }
  });

  // Fetch overview data
  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['collectivite-overview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_dashboard_collectivite_overview')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch activities analysis
  const { data: activitiesAnalysis, isLoading: loadingActivities } = useQuery({
    queryKey: ['collectivite-activities-analysis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_collectivite_activities_analysis' as any)
        .select('*');
      
      if (error) throw error;
      return data as any[];
    }
  });

  // Fetch aids by QF
  const { data: aidsByQF, isLoading: loadingAidsByQF } = useQuery({
    queryKey: ['collectivite-aids-by-qf'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_collectivite_aids_by_qf' as any)
        .select('*');
      
      if (error) throw error;
      return data as any[];
    }
  });

  // Fetch transport analysis
  const { data: transportAnalysis, isLoading: loadingTransport } = useQuery({
    queryKey: ['collectivite-transport-analysis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_collectivite_transport_analysis' as any)
        .select('*');
      
      if (error) throw error;
      return data as any[];
    }
  });

  // Fetch demographics
  const { data: demographics, isLoading: loadingDemographics } = useQuery({
    queryKey: ['collectivite-demographics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_collectivite_demographics' as any)
        .select('*');
      
      if (error) throw error;
      return data as any[];
    }
  });

  if (loadingOverview || loadingActivities || loadingAidsByQF || loadingTransport || loadingDemographics || loadingKpis) {
    return <LoadingState />;
  }

  const kpis = kpisData?.kpis || {};

  // Prepare chart data
  const activitiesByCategory = activitiesAnalysis?.reduce((acc, item) => {
    const existing = acc.find(a => a.name === item.category);
    if (existing) {
      existing.value += item.total_activities || 0;
    } else {
      acc.push({ name: item.category || 'Non classé', value: item.total_activities || 0 });
    }
    return acc;
  }, [] as Array<{name: string, value: number}>);

  const transportByMode = transportAnalysis?.map(t => ({
    name: t.transport_mode || 'Non renseigné',
    bookings: t.total_bookings || 0,
    co2_saved: Number(t.co2_saved_kg || 0).toFixed(1)
  }));

  const aidsByQFChart = aidsByQF?.map(aid => ({
    name: aid.qf_range,
    simulations: aid.total_simulations || 0,
    conversion: Number(aid.conversion_rate_pct || 0).toFixed(1)
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pb-24">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Tableau de bord Collectivité
            </h1>
            <p className="text-muted-foreground">
              {overview?.territory_name} ({overview?.territory_type})
            </p>
          </div>

          {/* KPIs Spécifiques - Section Santé & Inclusion */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Inscriptions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inscriptions</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.inscriptions?.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {/* Source: bookings.status = 'validee' */}
                  Réservations validées
                </p>
              </CardContent>
            </Card>

            {/* % Handicap */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accessibilité</CardTitle>
                <Accessibility className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.handicap?.percentage || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  {/* Source: children.accessibility_flags */}
                  {kpis.handicap?.count || 0}/{kpis.handicap?.total || 0} avec handicap
                </p>
              </CardContent>
            </Card>

            {/* % QPV */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">QPV</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kpis.qpv?.percentage === "N/A" ? (
                    <Badge variant="outline">N/A</Badge>
                  ) : (
                    `${kpis.qpv?.percentage}%`
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {/* Source: profiles.city_insee (à intégrer) */}
                  Quartiers prioritaires
                </p>
              </CardContent>
            </Card>

            {/* Répartition mobilité (synthèse) */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mobilité</CardTitle>
                <Bus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xs space-y-1">
                  {/* Source: bookings.transport_mode */}
                  {kpis.mobilite?.distribution?.slice(0, 3).map((item: any) => (
                    <div key={item.mode} className="flex justify-between">
                      <span className="capitalize">{item.mode}:</span>
                      <span className="font-semibold">{item.percentage}%</span>
                    </div>
                  )) || <span className="text-muted-foreground">Aucune donnée</span>}
                </div>
              </CardContent>
            </Card>

            {/* Indicateur santé */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activité/Semaine</CardTitle>
                <HeartPulse className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.sante?.weeklyMinutes || 0} min</div>
                <p className="text-xs text-muted-foreground">
                  {/* Source: slots.start/end × bookings */}
                  Moyenne hebdomadaire
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Stats Cards Générales */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Activités Totales
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.total_activities || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {overview?.published_activities || 0} publiées
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Enfants Uniques
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.unique_children_registered || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Bénéficiaires distincts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Simulations d'aides
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.total_aid_simulations || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Simulations effectuées
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Revenu Potentiel
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
                    .format(Number(overview?.total_revenue_potential || 0))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Revenus estimés
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Analyses détaillées par thématique */}
          <Tabs defaultValue="activities" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="activities">
                <Activity className="h-4 w-4 mr-2" />
                Activités
              </TabsTrigger>
              <TabsTrigger value="aids">
                <DollarSign className="h-4 w-4 mr-2" />
                Aides
              </TabsTrigger>
              <TabsTrigger value="transport">
                <Bus className="h-4 w-4 mr-2" />
                Éco-mobilité
              </TabsTrigger>
              <TabsTrigger value="demographics">
                <Users className="h-4 w-4 mr-2" />
                Démographie
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: ACTIVITÉS */}
            <TabsContent value="activities" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Graphique répartition par catégorie */}
                <Card>
                  <CardHeader>
                    <CardTitle>Répartition par Catégorie</CardTitle>
                    <CardDescription>Distribution des activités</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={activitiesByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {activitiesByCategory?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Tableau par structure */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Structures</CardTitle>
                    <CardDescription>Par nombre d'activités</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Structure</TableHead>
                          <TableHead className="text-right">Activités</TableHead>
                          <TableHead className="text-right">Taux acceptation</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activitiesAnalysis?.slice(0, 5).map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{item.structure_name}</TableCell>
                            <TableCell className="text-right">{item.total_activities}</TableCell>
                            <TableCell className="text-right">
                              <span className="font-semibold text-green-600">
                                {item.acceptance_rate_pct || 0}%
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 2: AIDES FINANCIÈRES */}
            <TabsContent value="aids" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Graphique par QF */}
                <Card>
                  <CardHeader>
                    <CardTitle>Simulations par Quotient Familial</CardTitle>
                    <CardDescription>Distribution par tranche de revenus</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={aidsByQFChart}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="simulations" fill="#8884d8" name="Simulations" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Taux de conversion */}
                <Card>
                  <CardHeader>
                    <CardTitle>Taux de Conversion par QF</CardTitle>
                    <CardDescription>Simulation → Réservation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tranche QF</TableHead>
                          <TableHead className="text-right">Simulations</TableHead>
                          <TableHead className="text-right">Conversion</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {aidsByQF?.map((aid, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{aid.qf_range}</TableCell>
                            <TableCell className="text-right">{aid.total_simulations}</TableCell>
                            <TableCell className="text-right">
                              <span className="font-semibold text-primary">
                                {aid.conversion_rate_pct || 0}%
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 3: ÉCO-MOBILITÉ */}
            <TabsContent value="transport" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Graphique modes de transport */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-green-600" />
                      Modes de Transport Utilisés
                    </CardTitle>
                    <CardDescription>Répartition des déplacements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={transportByMode}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="bookings" fill="#82ca9d" name="Réservations" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* CO2 économisé */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-green-600" />
                      Impact Environnemental
                    </CardTitle>
                    <CardDescription>CO₂ économisé par mode de transport</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mode</TableHead>
                          <TableHead className="text-right">Réservations</TableHead>
                          <TableHead className="text-right">CO₂ économisé</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transportAnalysis?.map((transport, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium capitalize">{transport.transport_mode}</TableCell>
                            <TableCell className="text-right">{transport.total_bookings}</TableCell>
                            <TableCell className="text-right">
                              <span className="font-semibold text-green-600">
                                {Number(transport.co2_saved_kg || 0).toFixed(1)} kg
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 4: DÉMOGRAPHIE */}
            <TabsContent value="demographics" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Répartition par revenu */}
                <Card>
                  <CardHeader>
                    <CardTitle>Répartition par Niveau de Revenu</CardTitle>
                    <CardDescription>Basé sur le Quotient Familial</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={demographics?.map(d => ({
                            name: d.income_category,
                            value: d.total_users || 0
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {demographics?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Statistiques par situation */}
                <Card>
                  <CardHeader>
                    <CardTitle>Situation Familiale</CardTitle>
                    <CardDescription>Répartition des utilisateurs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Situation</TableHead>
                          <TableHead className="text-right">Utilisateurs</TableHead>
                          <TableHead className="text-right">Enfants</TableHead>
                          <TableHead className="text-right">QF Moyen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {demographics?.filter(d => d.marital_status).map((demo, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium capitalize">{demo.marital_status}</TableCell>
                            <TableCell className="text-right">{demo.total_users}</TableCell>
                            <TableCell className="text-right">{demo.total_children}</TableCell>
                            <TableCell className="text-right">
                              {Number(demo.avg_qf || 0).toFixed(0)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
