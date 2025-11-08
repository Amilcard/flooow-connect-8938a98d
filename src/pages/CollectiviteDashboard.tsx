import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Activity, DollarSign, TrendingUp, Building2, CheckCircle, Bus, Leaf, BarChart3, Accessibility, MapPin, HeartPulse, GraduationCap, Heart, Shield, Users2, Navigation } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";
import Header from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function CollectiviteDashboard() {
  // Fetch KPIs from edge function (mock version for demo)
  const { data: kpisData, isLoading: loadingKpis } = useQuery({
    queryKey: ['dashboard-kpis-mock'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('dashboard-kpis-mock');
      if (error) throw error;
      return data;
    }
  });

  // Fetch overview data (MOCK for demo)
  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['collectivite-overview-mock'],
    queryFn: async () => ({
      territory_name: "Saint-Étienne Métropole",
      territory_type: "EPCI",
      total_activities: 42,
      published_activities: 40,
      unique_children_registered: 289,
      total_revenue_potential: 48650,
      total_aid_simulations: 412
    })
  });

  // Fetch activities analysis (MOCK for demo)
  const { data: activitiesAnalysis, isLoading: loadingActivities } = useQuery({
    queryKey: ['collectivite-activities-analysis-mock'],
    queryFn: async () => [
      { category: "Sport", structure_name: "AS Saint-Étienne", total_activities: 12, acceptance_rate_pct: 87 },
      { category: "Culture", structure_name: "Conservatoire", total_activities: 8, acceptance_rate_pct: 92 },
      { category: "Loisirs", structure_name: "MJC Beaulieu", total_activities: 10, acceptance_rate_pct: 78 },
      { category: "Scolarité", structure_name: "Centre Soutien", total_activities: 7, acceptance_rate_pct: 95 },
      { category: "Vacances", structure_name: "Centre Aéré", total_activities: 5, acceptance_rate_pct: 81 }
    ]
  });

  // Fetch aids by QF (MOCK for demo)
  const { data: aidsByQF, isLoading: loadingAidsByQF } = useQuery({
    queryKey: ['collectivite-aids-by-qf-mock'],
    queryFn: async () => [
      { qf_range: "0-500", total_simulations: 142, conversion_rate_pct: 68 },
      { qf_range: "501-1000", total_simulations: 98, conversion_rate_pct: 72 },
      { qf_range: "1001-1500", total_simulations: 67, conversion_rate_pct: 65 },
      { qf_range: "1501-2000", total_simulations: 45, conversion_rate_pct: 58 },
      { qf_range: ">2000", total_simulations: 28, conversion_rate_pct: 45 }
    ]
  });

  // Fetch transport analysis (MOCK for demo)
  const { data: transportAnalysis, isLoading: loadingTransport } = useQuery({
    queryKey: ['collectivite-transport-analysis-mock'],
    queryFn: async () => [
      { transport_mode: "bus", total_bookings: 142, co2_saved_kg: 852 },
      { transport_mode: "bike", total_bookings: 67, co2_saved_kg: 201 },
      { transport_mode: "covoiturage", total_bookings: 28, co2_saved_kg: 168 },
      { transport_mode: "walking", total_bookings: 12, co2_saved_kg: 36 }
    ]
  });

  // Fetch demographics (MOCK for demo)
  const { data: demographics, isLoading: loadingDemographics } = useQuery({
    queryKey: ['collectivite-demographics-mock'],
    queryFn: async () => [
      { income_category: "Faibles revenus", marital_status: "parent_solo", total_users: 78, total_children: 142, avg_qf: 420 },
      { income_category: "Revenus modestes", marital_status: "couple", total_users: 112, total_children: 198, avg_qf: 890 },
      { income_category: "Revenus moyens", marital_status: "couple", total_users: 67, total_children: 123, avg_qf: 1450 },
      { income_category: "Revenus élevés", marital_status: "couple", total_users: 32, total_children: 58, avg_qf: 2100 }
    ]
  });

  // THEME 1: Réussite éducative / Décrochage (MOCK for demo)
  const { data: educationData, isLoading: loadingEducation } = useQuery({
    queryKey: ['collectivite-education-mock'],
    queryFn: async () => ({
      total_demandes_scolaire: 87,
      demandes_qpv: 52,
      demandes_hors_qpv: 35,
      places_trouvees: 68,
      sans_solution: 19,
      abandon_reasons: [
        { reason: "Pas de place disponible", count: 8 },
        { reason: "Trop loin du domicile", count: 5 },
        { reason: "Horaires incompatibles", count: 4 },
        { reason: "Paperasse administrative", count: 2 }
      ]
    })
  });

  // THEME 2: Santé / Bien-être (MOCK for demo)
  const { data: healthData, isLoading: loadingHealth } = useQuery({
    queryKey: ['collectivite-health-mock'],
    queryFn: async () => ({
      total_demandes_sante: 124,
      motivations: [
        { motivation: "Bouger plus / santé", count: 58, percentage: 46.8 },
        { motivation: "Détente / stress / anxiété", count: 42, percentage: 33.9 },
        { motivation: "Socialiser / sortir isolement", count: 24, percentage: 19.3 }
      ],
      places_trouvees: 98,
      sans_solution: 26,
      repartition_age: [
        { age_range: "6-10 ans", count: 34 },
        { age_range: "11-14 ans", count: 48 },
        { age_range: "15-17 ans", count: 42 }
      ],
      repartition_qpv: {
        qpv: 48,
        hors_qpv: 76
      }
    })
  });

  // THEME 3: Tranquillité publique / Temps sensibles (MOCK for demo)
  const { data: safetyData, isLoading: loadingSafety } = useQuery({
    queryKey: ['collectivite-safety-mock'],
    queryFn: async () => ({
      jeunes_11_17_creneaux_sensibles: 156,
      repartition_creneaux: [
        { creneau: "Soirs (18h-21h)", count: 67, qpv: 42, hors_qpv: 25 },
        { creneau: "Week-ends", count: 54, qpv: 31, hors_qpv: 23 },
        { creneau: "Vacances", count: 35, qpv: 18, hors_qpv: 17 }
      ],
      taux_saturation_qpv: 89,
      taux_saturation_hors_qpv: 62,
      places_disponibles_total: 178,
      places_occupees: 156
    })
  });

  // THEME 4: Égalité filles-garçons (MOCK for demo)
  const { data: genderData, isLoading: loadingGender } = useQuery({
    queryKey: ['collectivite-gender-mock'],
    queryFn: async () => ({
      acces_sport: {
        filles_demandes: 89,
        filles_places: 72,
        garcons_demandes: 134,
        garcons_places: 118
      },
      acces_culture: {
        filles_demandes: 76,
        filles_places: 68,
        garcons_demandes: 54,
        garcons_places: 48
      },
      focus_qpv_filles: {
        demandes: 52,
        places_trouvees: 38,
        sans_solution: 14
      },
      taux_acces_global: {
        filles: 73.2,
        garcons: 82.5
      }
    })
  });

  // THEME 5: Mobilité / Transport (MOCK for demo)
  const { data: mobilityData, isLoading: loadingMobility } = useQuery({
    queryKey: ['collectivite-mobility-mock'],
    queryFn: async () => ({
      abandons_transport_total: 34,
      abandons_qpv: 23,
      abandons_hors_qpv: 11,
      raisons_abandon: [
        { reason: "Trop loin / pas de transport", count: 18 },
        { reason: "Pas d'accompagnement possible", count: 10 },
        { reason: "Horaires transport incompatibles", count: 6 }
      ],
      temps_moyen_trajet: {
        qpv: 28,
        hors_qpv: 15,
        global: 21
      }
    })
  });

  // THEME 6: Handicap / Accessibilité (MOCK for demo)
  const { data: accessibilityData, isLoading: loadingAccessibility } = useQuery({
    queryKey: ['collectivite-accessibility-mock'],
    queryFn: async () => ({
      enfants_besoins_specifiques: 43,
      repartition_besoins: [
        { type: "Moteur", count: 12 },
        { type: "TSA / Autisme", count: 15 },
        { type: "TDAH / TDA", count: 10 },
        { type: "Autre accompagnement", count: 6 }
      ],
      propositions_accessibles_trouvees: 28,
      sans_solution: 15,
      abandons_accessibilite: 9,
      taux_inclusion: 65.1
    })
  });

  // DONNÉES PAR QUARTIER (MOCK for demo - La Ricamarie, Grand Clos/Côte-Chaude, Crêt de Roch)
  const { data: neighborhoodData, isLoading: loadingNeighborhoods } = useQuery({
    queryKey: ['collectivite-neighborhoods-mock'],
    queryFn: async () => [
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
        soutien_scolaire_demandes: 32,
        soutien_scolaire_places: 24,
        activites_sante: 28,
        jeunes_temps_sensibles: 45
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
        soutien_scolaire_demandes: 48,
        soutien_scolaire_places: 31,
        activites_sante: 42,
        jeunes_temps_sensibles: 67
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
        soutien_scolaire_demandes: 28,
        soutien_scolaire_places: 22,
        activites_sante: 31,
        jeunes_temps_sensibles: 38
      }
    ]
  });

  if (loadingOverview || loadingActivities || loadingAidsByQF || loadingTransport || loadingDemographics || loadingKpis || loadingEducation || loadingHealth || loadingSafety || loadingGender || loadingMobility || loadingAccessibility || loadingNeighborhoods) {
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
          <Tabs defaultValue="neighborhoods" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:grid-cols-11 gap-1">
              <TabsTrigger value="neighborhoods">
                <MapPin className="h-4 w-4 mr-1" />
                Quartiers
              </TabsTrigger>
              <TabsTrigger value="activities">
                <Activity className="h-4 w-4 mr-1" />
                Activités
              </TabsTrigger>
              <TabsTrigger value="aids">
                <DollarSign className="h-4 w-4 mr-1" />
                Aides
              </TabsTrigger>
              <TabsTrigger value="transport">
                <Bus className="h-4 w-4 mr-1" />
                Éco-mobilité
              </TabsTrigger>
              <TabsTrigger value="demographics">
                <Users className="h-4 w-4 mr-1" />
                Démographie
              </TabsTrigger>
              <TabsTrigger value="education">
                <GraduationCap className="h-4 w-4 mr-1" />
                Réussite éduc.
              </TabsTrigger>
              <TabsTrigger value="health">
                <Heart className="h-4 w-4 mr-1" />
                Santé
              </TabsTrigger>
              <TabsTrigger value="safety">
                <Shield className="h-4 w-4 mr-1" />
                Tranquillité
              </TabsTrigger>
              <TabsTrigger value="gender">
                <Users2 className="h-4 w-4 mr-1" />
                Égalité F/G
              </TabsTrigger>
              <TabsTrigger value="mobility">
                <Navigation className="h-4 w-4 mr-1" />
                Mobilité
              </TabsTrigger>
              <TabsTrigger value="accessibility">
                <Accessibility className="h-4 w-4 mr-1" />
                Handicap
              </TabsTrigger>
            </TabsList>

            {/* NOUVEAU TAB: Quartiers prioritaires */}
            <TabsContent value="neighborhoods" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Vue d'ensemble par quartier
                  </CardTitle>
                  <CardDescription>
                    Comparaison des indicateurs clés sur les 3 quartiers prioritaires
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Graphique: Inscriptions par quartier */}
                  <div>
                    <h4 className="font-semibold mb-3">Inscriptions totales</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={neighborhoodData || []}>
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
                      <BarChart data={neighborhoodData || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="taux_qpv_pct" fill={COLORS[2]} name="% QPV" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Graphique: Aide moyenne vs Reste à charge */}
                  <div>
                    <h4 className="font-semibold mb-3">Aide moyenne et reste à charge (€)</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={neighborhoodData || []}>
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

                  {/* Graphique: Mobilité par quartier */}
                  <div>
                    <h4 className="font-semibold mb-3">Modes de transport principaux (%)</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={neighborhoodData || []}>
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
                          <TableHead className="text-right">Activités dispo</TableHead>
                          <TableHead className="text-right">Taux remplissage</TableHead>
                          <TableHead className="text-right">Handicap</TableHead>
                          <TableHead className="text-right">Abandon mobilité</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {neighborhoodData?.map((neighborhood, idx) => (
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
                        <li>• <strong>Grand Clos/Côte-Chaude</strong>: Forte demande (94% remplissage) avec 79% QPV → Besoin d'augmenter l'offre</li>
                        <li>• <strong>Grand Clos/Côte-Chaude</strong>: 17 demandes de soutien scolaire sans solution → Créer créneaux</li>
                        <li>• <strong>La Ricamarie</strong>: 8 abandons pour raisons de mobilité → Renforcer transport</li>
                        <li>• <strong>Crêt de Roch</strong>: Reste à charge moyen élevé (78€) → Vérifier recours aux aides</li>
                      </ul>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

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

            {/* TAB 5: RÉUSSITE ÉDUCATIVE / DÉCROCHAGE */}
            <TabsContent value="education" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* KPIs Réussite éducative */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-purple-600" />
                      Accompagnement scolaire
                    </CardTitle>
                    <CardDescription>Lutte contre le décrochage</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Demandes totales</p>
                        <p className="text-2xl font-bold">{educationData?.total_demandes_scolaire}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Places trouvées</p>
                        <p className="text-2xl font-bold text-green-600">{educationData?.places_trouvees}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Sans solution</p>
                        <p className="text-2xl font-bold text-orange-600">{educationData?.sans_solution}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Taux de succès</p>
                        <p className="text-2xl font-bold">
                          {educationData ? ((educationData.places_trouvees / educationData.total_demandes_scolaire) * 100).toFixed(0) : 0}%
                        </p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Répartition QPV</p>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">QPV</p>
                          <p className="text-xl font-bold text-primary">{educationData?.demandes_qpv}</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Hors QPV</p>
                          <p className="text-xl font-bold">{educationData?.demandes_hors_qpv}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Raisons d'abandon */}
                <Card>
                  <CardHeader>
                    <CardTitle>Raisons d'abandon</CardTitle>
                    <CardDescription>Freins identifiés</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Raison</TableHead>
                          <TableHead className="text-right">Nombre</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {educationData?.abandon_reasons.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{item.reason}</TableCell>
                            <TableCell className="text-right">
                              <span className="font-semibold text-orange-600">{item.count}</span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-xs font-medium text-purple-900 dark:text-purple-100">
                        💡 Besoin d'accompagnement scolaire identifié là où l'offre manque (QPV prioritaire)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 6: SANTÉ / BIEN-ÊTRE */}
            <TabsContent value="health" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* KPIs Santé */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-pink-600" />
                      Prévention santé / bien-être
                    </CardTitle>
                    <CardDescription>Activités physiques adaptées</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Demandes totales</p>
                        <p className="text-2xl font-bold">{healthData?.total_demandes_sante}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Places trouvées</p>
                        <p className="text-2xl font-bold text-green-600">{healthData?.places_trouvees}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Sans solution</p>
                        <p className="text-2xl font-bold text-orange-600">{healthData?.sans_solution}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Taux de succès</p>
                        <p className="text-2xl font-bold">
                          {healthData ? ((healthData.places_trouvees / healthData.total_demandes_sante) * 100).toFixed(0) : 0}%
                        </p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Répartition QPV</p>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">QPV</p>
                          <p className="text-xl font-bold text-primary">{healthData?.repartition_qpv.qpv}</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Hors QPV</p>
                          <p className="text-xl font-bold">{healthData?.repartition_qpv.hors_qpv}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Motivations santé */}
                <Card>
                  <CardHeader>
                    <CardTitle>Motivations des familles</CardTitle>
                    <CardDescription>Pourquoi choisir ces activités ?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {healthData?.motivations.map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{item.motivation}</span>
                            <span className="text-muted-foreground">{item.count} ({item.percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-pink-600 h-2 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                      <p className="text-xs font-medium text-pink-900 dark:text-pink-100">
                        💡 Prévention santé mentale et physique des jeunes prioritaire
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 7: TRANQUILLITÉ PUBLIQUE / TEMPS SENSIBLES */}
            <TabsContent value="safety" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* KPIs Tranquillité publique */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      Occupation jeunes 11-17 ans
                    </CardTitle>
                    <CardDescription>Créneaux sensibles encadrés</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Jeunes occupés</p>
                        <p className="text-3xl font-bold text-blue-600">{safetyData?.jeunes_11_17_creneaux_sensibles}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Taux occupation</p>
                        <p className="text-3xl font-bold">
                          {safetyData ? ((safetyData.places_occupees / safetyData.places_disponibles_total) * 100).toFixed(0) : 0}%
                        </p>
                      </div>
                    </div>
                    <div className="pt-4 border-t space-y-2">
                      <p className="text-sm font-medium mb-2">Saturation par zone</p>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>QPV</span>
                            <span className="font-semibold text-orange-600">{safetyData?.taux_saturation_qpv}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${safetyData?.taux_saturation_qpv}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Hors QPV</span>
                            <span className="font-semibold text-green-600">{safetyData?.taux_saturation_hors_qpv}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{ width: `${safetyData?.taux_saturation_hors_qpv}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Répartition créneaux */}
                <Card>
                  <CardHeader>
                    <CardTitle>Répartition par créneau</CardTitle>
                    <CardDescription>Soirs, week-ends, vacances</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Créneau</TableHead>
                          <TableHead className="text-right">QPV</TableHead>
                          <TableHead className="text-right">Hors QPV</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {safetyData?.repartition_creneaux.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{item.creneau}</TableCell>
                            <TableCell className="text-right text-primary font-semibold">{item.qpv}</TableCell>
                            <TableCell className="text-right">{item.hors_qpv}</TableCell>
                            <TableCell className="text-right font-bold">{item.count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-xs font-medium text-blue-900 dark:text-blue-100">
                        💡 Occupation encadrée des jeunes sur les temps où ça chauffe
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 8: ÉGALITÉ FILLES-GARÇONS */}
            <TabsContent value="gender" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Accès Sport F/G */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users2 className="h-5 w-5 text-purple-600" />
                      Accès aux activités sportives
                    </CardTitle>
                    <CardDescription>Filles vs Garçons</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-purple-600">Filles</p>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Demandes</p>
                          <p className="text-2xl font-bold">{genderData?.acces_sport.filles_demandes}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Places obtenues</p>
                          <p className="text-xl font-bold text-green-600">{genderData?.acces_sport.filles_places}</p>
                        </div>
                        <p className="text-xs font-semibold">
                          Taux: {genderData ? ((genderData.acces_sport.filles_places / genderData.acces_sport.filles_demandes) * 100).toFixed(0) : 0}%
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-blue-600">Garçons</p>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Demandes</p>
                          <p className="text-2xl font-bold">{genderData?.acces_sport.garcons_demandes}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Places obtenues</p>
                          <p className="text-xl font-bold text-green-600">{genderData?.acces_sport.garcons_places}</p>
                        </div>
                        <p className="text-xs font-semibold">
                          Taux: {genderData ? ((genderData.acces_sport.garcons_places / genderData.acces_sport.garcons_demandes) * 100).toFixed(0) : 0}%
                        </p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Taux accès global</p>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Filles</p>
                          <p className="text-xl font-bold text-purple-600">{genderData?.taux_acces_global.filles}%</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Garçons</p>
                          <p className="text-xl font-bold text-blue-600">{genderData?.taux_acces_global.garcons}%</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Écart</p>
                          <p className="text-xl font-bold text-orange-600">
                            {genderData ? Math.abs(genderData.taux_acces_global.filles - genderData.taux_acces_global.garcons).toFixed(1) : 0}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Focus QPV Filles */}
                <Card>
                  <CardHeader>
                    <CardTitle>Focus Filles en QPV</CardTitle>
                    <CardDescription>Accès prioritaire</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Demandes</p>
                        <p className="text-2xl font-bold">{genderData?.focus_qpv_filles.demandes}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Places</p>
                        <p className="text-2xl font-bold text-green-600">{genderData?.focus_qpv_filles.places_trouvees}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Sans solution</p>
                        <p className="text-2xl font-bold text-orange-600">{genderData?.focus_qpv_filles.sans_solution}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-medium mb-2">Accès Culture (F vs G)</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Filles culture</p>
                          <p className="font-semibold">{genderData?.acces_culture.filles_places} / {genderData?.acces_culture.filles_demandes}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Garçons culture</p>
                          <p className="font-semibold">{genderData?.acces_culture.garcons_places} / {genderData?.acces_culture.garcons_demandes}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-xs font-medium text-purple-900 dark:text-purple-100">
                        💡 Accès des filles du quartier aux activités encadrées
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 9: MOBILITÉ / TRANSPORT */}
            <TabsContent value="mobility" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* KPIs Mobilité */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Navigation className="h-5 w-5 text-indigo-600" />
                      Freins mobilité / transport
                    </CardTitle>
                    <CardDescription>Abandons liés au transport</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Abandons total</p>
                        <p className="text-3xl font-bold text-orange-600">{mobilityData?.abandons_transport_total}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Temps trajet moyen</p>
                        <p className="text-3xl font-bold">{mobilityData?.temps_moyen_trajet.global} min</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Répartition par zone</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Abandons QPV</p>
                          <p className="text-2xl font-bold text-primary">{mobilityData?.abandons_qpv}</p>
                          <p className="text-xs">Trajet: {mobilityData?.temps_moyen_trajet.qpv} min</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Abandons hors QPV</p>
                          <p className="text-2xl font-bold">{mobilityData?.abandons_hors_qpv}</p>
                          <p className="text-xs">Trajet: {mobilityData?.temps_moyen_trajet.hors_qpv} min</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Raisons abandon mobilité */}
                <Card>
                  <CardHeader>
                    <CardTitle>Raisons d'abandon</CardTitle>
                    <CardDescription>Pourquoi les familles renoncent</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mobilityData?.raisons_abandon.map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{item.reason}</span>
                            <span className="text-muted-foreground">{item.count}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{ width: `${(item.count / (mobilityData?.abandons_transport_total || 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                      <p className="text-xs font-medium text-indigo-900 dark:text-indigo-100">
                        💡 Manque solutions mobilité / besoin navette / activités dans le quartier
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 10: HANDICAP / ACCESSIBILITÉ */}
            <TabsContent value="accessibility" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* KPIs Handicap */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Accessibility className="h-5 w-5 text-teal-600" />
                      Inclusion handicap
                    </CardTitle>
                    <CardDescription>Besoins spécifiques</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Enfants concernés</p>
                        <p className="text-3xl font-bold">{accessibilityData?.enfants_besoins_specifiques}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Taux inclusion</p>
                        <p className="text-3xl font-bold text-teal-600">{accessibilityData?.taux_inclusion}%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Solutions trouvées</p>
                        <p className="text-2xl font-bold text-green-600">{accessibilityData?.propositions_accessibles_trouvees}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Sans solution</p>
                        <p className="text-2xl font-bold text-orange-600">{accessibilityData?.sans_solution}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground">Abandons accessibilité</p>
                      <p className="text-xl font-bold text-red-600">{accessibilityData?.abandons_accessibilite}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Répartition besoins */}
                <Card>
                  <CardHeader>
                    <CardTitle>Répartition par besoin</CardTitle>
                    <CardDescription>Types de besoins spécifiques</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {accessibilityData?.repartition_besoins.map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{item.type}</span>
                            <span className="text-muted-foreground">{item.count}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-teal-600 h-2 rounded-full"
                              style={{ width: `${(item.count / (accessibilityData?.enfants_besoins_specifiques || 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                      <p className="text-xs font-medium text-teal-900 dark:text-teal-100">
                        💡 Inclusion handicap enfants/adolescents - Cartographie zones sans offre adaptée
                      </p>
                    </div>
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
