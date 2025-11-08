import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Users, Building2, TrendingUp, AlertCircle, Heart, Bus, DollarSign, GraduationCap, Activity, UserMinus, CheckCircle, AlertTriangle, MapPin, Car, Target } from "lucide-react";
import { useState } from "react";
import { 
  territoriesData, 
  metropoleData,
  evolutionData,
  evolutionByActivityMetropole,
  evolutionByActivityLaRicamarie,
  evolutionByActivityGrandClos,
  evolutionByActivityCretDeRoch,
  genderEvolutionMetropole,
  genderEvolutionLaRicamarie,
  genderEvolutionGrandClos,
  genderEvolutionCretDeRoch,
  structuresData,
  ageGroupsMetropole,
  ageGroupsLaRicamarie,
  ageGroupsGrandClos,
  ageGroupsCretDeRoch,
  comparisonData,
  type TerritoryData
} from "@/lib/dashboardMockData";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

interface CollectiviteDashboardContentProps {
  territoryId?: string;
}

export default function CollectiviteDashboardContent({ territoryId }: CollectiviteDashboardContentProps) {
  const [selectedTerritory, setSelectedTerritory] = useState<string>("metropole");

  // Récupération des données selon le territoire sélectionné
  const getTerritoryData = (): TerritoryData => {
    if (selectedTerritory === "metropole") return metropoleData;
    if (selectedTerritory === "la_ricamarie") return territoriesData.la_ricamarie;
    if (selectedTerritory === "grand_clos") return territoriesData.grand_clos;
    if (selectedTerritory === "cret_de_roch") return territoriesData.cret_de_roch;
    return metropoleData;
  };

  const getActivityEvolution = () => {
    if (selectedTerritory === "metropole") return evolutionByActivityMetropole;
    if (selectedTerritory === "la_ricamarie") return evolutionByActivityLaRicamarie;
    if (selectedTerritory === "grand_clos") return evolutionByActivityGrandClos;
    if (selectedTerritory === "cret_de_roch") return evolutionByActivityCretDeRoch;
    return evolutionByActivityMetropole;
  };

  const getGenderEvolution = () => {
    if (selectedTerritory === "metropole") return genderEvolutionMetropole;
    if (selectedTerritory === "la_ricamarie") return genderEvolutionLaRicamarie;
    if (selectedTerritory === "grand_clos") return genderEvolutionGrandClos;
    if (selectedTerritory === "cret_de_roch") return genderEvolutionCretDeRoch;
    return genderEvolutionMetropole;
  };

  const getAgeGroups = () => {
    if (selectedTerritory === "metropole") return ageGroupsMetropole;
    if (selectedTerritory === "la_ricamarie") return ageGroupsLaRicamarie;
    if (selectedTerritory === "grand_clos") return ageGroupsGrandClos;
    if (selectedTerritory === "cret_de_roch") return ageGroupsCretDeRoch;
    return ageGroupsMetropole;
  };

  const getStructures = () => {
    if (selectedTerritory === "metropole") return structuresData;
    return structuresData.filter(s => {
      if (selectedTerritory === "la_ricamarie") return s.territoire === "La Ricamarie";
      if (selectedTerritory === "grand_clos") return s.territoire === "Grand Clos";
      if (selectedTerritory === "cret_de_roch") return s.territoire === "Crêt de Roch";
      return true;
    });
  };

  const data = getTerritoryData();
  const activityEvolution = getActivityEvolution();
  const genderEvolution = getGenderEvolution();
  const ageGroups = getAgeGroups();
  const structures = getStructures();

  // Préparation des données
  const activitiesByUnivers = [
    { name: "Sport", value: data.univers_sport },
    { name: "Culture", value: data.univers_culture },
    { name: "Loisirs", value: data.univers_loisirs },
    { name: "Vacances", value: data.univers_vacances },
    { name: "Scolaire", value: data.univers_scolaire }
  ];

  const cspData = [
    { name: "Très modestes (QF<500)", value: data.csp_tres_modestes },
    { name: "Modestes (500-1000)", value: data.csp_modestes },
    { name: "Intermédiaires (1000-1500)", value: data.csp_intermediaires },
    { name: "Aisées (>1500)", value: data.csp_aisees }
  ];

  const mobilityData = [
    { mode: "Bus", count: data.transport_bus, percentage: ((data.transport_bus / data.total_inscrits) * 100).toFixed(1) },
    { mode: "Vélo", count: data.transport_velo, percentage: ((data.transport_velo / data.total_inscrits) * 100).toFixed(1) },
    { mode: "Voiture", count: data.transport_voiture, percentage: ((data.transport_voiture / data.total_inscrits) * 100).toFixed(1) },
    { mode: "Covoiturage", count: data.transport_covoiturage, percentage: ((data.transport_covoiturage / data.total_inscrits) * 100).toFixed(1) },
    { mode: "Marche", count: data.transport_marche, percentage: ((data.transport_marche / data.total_inscrits) * 100).toFixed(1) }
  ];

  const genderData = [
    { name: "Filles", value: data.filles },
    { name: "Garçons", value: data.garcons }
  ];

  const compareData = Object.values(territoriesData).map(t => ({
    name: t.name,
    inscrits: t.total_inscrits,
    qpv_pct: t.taux_qpv,
    handicap: t.enfants_handicap,
    abandon_pct: t.taux_abandon,
    non_recours_pct: t.taux_non_recours_estime,
    remplissage_pct: t.taux_remplissage_moyen
  }));

  // Données pour le graphique radar comparatif
  const radarData = [
    {
      indicator: "Participation",
      "Saint-Étienne Métropole": comparisonData[0].taux_participation,
      "Moyenne Nationale": comparisonData[1].taux_participation,
      "Métropole Type": comparisonData[2].taux_participation
    },
    {
      indicator: "Recours aides",
      "Saint-Étienne Métropole": comparisonData[0].taux_recours_aides,
      "Moyenne Nationale": comparisonData[1].taux_recours_aides,
      "Métropole Type": comparisonData[2].taux_recours_aides
    },
    {
      indicator: "QPV",
      "Saint-Étienne Métropole": comparisonData[0].part_qpv,
      "Moyenne Nationale": comparisonData[1].part_qpv,
      "Métropole Type": comparisonData[2].part_qpv
    },
    {
      indicator: "Handicap",
      "Saint-Étienne Métropole": comparisonData[0].part_handicap,
      "Moyenne Nationale": comparisonData[1].part_handicap,
      "Métropole Type": comparisonData[2].part_handicap
    },
    {
      indicator: "Mobilité éco",
      "Saint-Étienne Métropole": comparisonData[0].part_mobilite_eco,
      "Moyenne Nationale": comparisonData[1].part_mobilite_eco,
      "Métropole Type": comparisonData[2].part_mobilite_eco
    }
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* En-tête */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tableau de bord Collectivité</h1>
          <p className="text-muted-foreground">Pilotage territorial des activités jeunesse - Période : Juin 2026 → Juin 2027</p>
        </div>
        
        {/* Barre d'onglets TERRITOIRES centrée en haut */}
        <div className="flex justify-center gap-3 py-4">
          <Button
            variant={selectedTerritory === "metropole" ? "default" : "outline"}
            size="lg"
            className="rounded-full px-6"
            onClick={() => setSelectedTerritory("metropole")}
          >
            <MapPin className="w-4 h-4 mr-2" />
            Agglomération
          </Button>
          <Button
            variant={selectedTerritory === "la_ricamarie" ? "default" : "outline"}
            size="lg"
            className="rounded-full px-6"
            onClick={() => setSelectedTerritory("la_ricamarie")}
          >
            La Ricamarie
          </Button>
          <Button
            variant={selectedTerritory === "grand_clos" ? "default" : "outline"}
            size="lg"
            className="rounded-full px-6"
            onClick={() => setSelectedTerritory("grand_clos")}
          >
            Grand Clos / Côte-Chaude
          </Button>
          <Button
            variant={selectedTerritory === "cret_de_roch" ? "default" : "outline"}
            size="lg"
            className="rounded-full px-6"
            onClick={() => setSelectedTerritory("cret_de_roch")}
          >
            Crêt de Roch
          </Button>
        </div>
      </div>

      {/* Onglets thématiques */}
      <Tabs defaultValue="synthese" className="w-full">
        <TabsList className="grid w-full grid-cols-8 mb-6 sticky top-0 z-10 bg-background">
          <TabsTrigger value="synthese">Synthèse</TabsTrigger>
          <TabsTrigger value="acces">Accès & Équité</TabsTrigger>
          <TabsTrigger value="parcours">Parcours</TabsTrigger>
          <TabsTrigger value="aides">Aides</TabsTrigger>
          <TabsTrigger value="mobilite">Mobilité</TabsTrigger>
          <TabsTrigger value="evolutions">Évolutions</TabsTrigger>
          <TabsTrigger value="structures">Structures</TabsTrigger>
          <TabsTrigger value="comparaisons">Comparaisons</TabsTrigger>
        </TabsList>

        {/* ONGLET 1: SYNTHÈSE */}
        <TabsContent value="synthese" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>📊 Synthèse - {data.name}</CardTitle>
              <CardDescription>Indicateurs clés de pilotage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-3xl font-bold">{data.total_inscrits}</div>
                  <p className="text-xs text-muted-foreground">Enfants inscrits</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Building2 className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-3xl font-bold">{data.total_structures}</div>
                  <p className="text-xs text-muted-foreground">Structures</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
                  <div className="text-3xl font-bold text-green-600">{data.taux_remplissage_moyen}%</div>
                  <p className="text-xs text-muted-foreground">Taux remplissage</p>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                  <div className="text-3xl font-bold text-orange-600">{data.taux_non_recours_estime}%</div>
                  <p className="text-xs text-muted-foreground">Non-recours estimé</p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <UserMinus className="w-6 h-6 mx-auto mb-2 text-red-600" />
                  <div className="text-3xl font-bold text-red-600">{data.taux_abandon.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">Taux d'abandon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>🎯 Inclusion & Équité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{data.taux_qpv.toFixed(1)}%</div>
                    <p className="text-sm text-muted-foreground">QPV ({data.enfants_qpv})</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{data.taux_handicap.toFixed(1)}%</div>
                    <p className="text-sm text-muted-foreground">Handicap ({data.enfants_handicap})</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-pink-600">{data.taux_filles.toFixed(1)}%</div>
                    <p className="text-sm text-muted-foreground">Filles ({data.filles})</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold">{data.nb_moyen_activites_par_enfant.toFixed(1)}</div>
                    <p className="text-sm text-muted-foreground">Activités/enfant</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>💰 Aides & Finances</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold">{data.familles_aidees}</div>
                    <p className="text-sm text-muted-foreground">Familles aidées</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold">{data.familles_eligibles}</div>
                    <p className="text-sm text-muted-foreground">Familles éligibles</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold">{data.aide_moyenne}€</div>
                    <p className="text-sm text-muted-foreground">Aide moyenne</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold">{data.reste_a_charge_moyen}€</div>
                    <p className="text-sm text-muted-foreground">Reste à charge</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ONGLET 2: ACCÈS & ÉQUITÉ */}
        <TabsContent value="acces" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🎯 Accès & Équité - {data.name}</CardTitle>
              <CardDescription>Inclusion et équité territoriale</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border-2 border-orange-200 dark:border-orange-800">
                  <div className="text-2xl font-bold text-orange-600">{data.taux_qpv.toFixed(1)}%</div>
                  <p className="text-sm text-muted-foreground">QPV ({data.enfants_qpv} enfants)</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <div className="text-2xl font-bold text-blue-600">{data.taux_handicap.toFixed(1)}%</div>
                  <p className="text-sm text-muted-foreground">Handicap ({data.enfants_handicap} enfants)</p>
                </div>
                <div className="text-center p-4 bg-pink-50 dark:bg-pink-950/20 rounded-lg border-2 border-pink-200 dark:border-pink-800">
                  <div className="text-2xl font-bold text-pink-600">{data.taux_filles.toFixed(1)}%</div>
                  <p className="text-sm text-muted-foreground">Filles ({data.filles})</p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border-2 border-red-200 dark:border-red-800">
                  <div className="text-2xl font-bold text-red-600">{data.taux_non_recours_estime}%</div>
                  <p className="text-sm text-muted-foreground">Non-recours estimé</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Répartition socio-professionnelle (CSP)</h4>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={cspData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name.split('(')[0]}: ${entry.value}`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {cspData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Répartition Filles/Garçons</h4>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#ec4899" />
                        <Cell fill="#3b82f6" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ONGLET 3: PARCOURS & ASSIDUITÉ */}
        <TabsContent value="parcours" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>📈 Parcours & Assiduité - {data.name}</CardTitle>
              <CardDescription>Suivi de l'engagement et des abandons</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border-2 border-red-200 dark:border-red-800">
                  <UserMinus className="w-6 h-6 mx-auto mb-2 text-red-600" />
                  <div className="text-2xl font-bold text-red-600">{data.taux_abandon.toFixed(1)}%</div>
                  <p className="text-sm text-muted-foreground">{data.nb_abandons} abandons</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                  <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-green-600">{(100 - data.taux_abandon).toFixed(1)}%</div>
                  <p className="text-sm text-muted-foreground">Assiduité</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Activity className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{data.nb_moyen_activites_par_enfant.toFixed(1)}</div>
                  <p className="text-sm text-muted-foreground">Activités/enfant</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Répartition par univers</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={activitiesByUnivers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: "Nombre d'inscrits", angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ONGLET 4: AIDES & FINANCES */}
        <TabsContent value="aides" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>💰 Aides & Finances - {data.name}</CardTitle>
              <CardDescription>Recours aux aides et reste à charge</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                  <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-green-600">{data.familles_aidees}</div>
                  <p className="text-sm text-muted-foreground">Familles aidées</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{data.familles_eligibles}</div>
                  <p className="text-sm text-muted-foreground">Familles éligibles</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <DollarSign className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{data.aide_moyenne}€</div>
                  <p className="text-sm text-muted-foreground">Aide moyenne</p>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border-2 border-orange-200 dark:border-orange-800">
                  <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold text-orange-600">{data.reste_a_charge_moyen}€</div>
                  <p className="text-sm text-muted-foreground">Reste à charge</p>
                </div>
              </div>

              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Taux de recours aux aides
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {((data.familles_aidees / data.familles_eligibles) * 100).toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {data.familles_aidees} familles aidées sur {data.familles_eligibles} éligibles
                  </p>
                  {data.familles_aidees < data.familles_eligibles && (
                    <p className="text-sm text-orange-600 mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {data.familles_eligibles - data.familles_aidees} familles éligibles non aidées
                    </p>
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ONGLET 5: MOBILITÉ */}
        <TabsContent value="mobilite" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🚴 Mobilité & Transport - {data.name}</CardTitle>
              <CardDescription>Modes de déplacement vers les activités</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-5 gap-4">
                {mobilityData.map((item, idx) => (
                  <div key={idx} className="text-center p-4 bg-muted/30 rounded-lg">
                    {item.mode === "Bus" && <Bus className="w-6 h-6 mx-auto mb-2 text-primary" />}
                    {item.mode === "Vélo" && <Activity className="w-6 h-6 mx-auto mb-2 text-green-600" />}
                    {item.mode === "Voiture" && <Car className="w-6 h-6 mx-auto mb-2 text-orange-600" />}
                    {item.mode === "Covoiturage" && <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />}
                    {item.mode === "Marche" && <Activity className="w-6 h-6 mx-auto mb-2 text-purple-600" />}
                    <div className="text-2xl font-bold">{item.count}</div>
                    <p className="text-xs text-muted-foreground">{item.mode}</p>
                    <p className="text-xs text-muted-foreground">({item.percentage}%)</p>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-semibold mb-3">Répartition des modes de transport</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mobilityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mode" />
                    <YAxis label={{ value: "Nombre d'utilisateurs", angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {data.abandons_mobilite > 0 && (
                <Card className="bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-200 dark:border-orange-800">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-orange-700 dark:text-orange-400">
                      <AlertTriangle className="w-5 h-5" />
                      Abandons liés à la mobilité
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                      {data.abandons_mobilite} abandons
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      soit {((data.abandons_mobilite / data.nb_abandons) * 100).toFixed(1)}% des abandons totaux
                    </p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ONGLET 6: ÉVOLUTIONS */}
        <TabsContent value="evolutions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>📈 Évolutions - {data.name}</CardTitle>
              <CardDescription>Période : Janvier 2026 → Décembre 2026</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Évolution des inscriptions par univers d'activité</h4>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={activityEvolution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" angle={-45} textAnchor="end" height={80} />
                    <YAxis label={{ value: "Nombre d'inscrits", angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sport" stroke="#6366f1" name="Sport" strokeWidth={2} />
                    <Line type="monotone" dataKey="culture" stroke="#8b5cf6" name="Culture" strokeWidth={2} />
                    <Line type="monotone" dataKey="loisirs" stroke="#ec4899" name="Loisirs" strokeWidth={2} />
                    <Line type="monotone" dataKey="vacances" stroke="#f59e0b" name="Vacances" strokeWidth={2} />
                    <Line type="monotone" dataKey="scolaire" stroke="#10b981" name="Scolaire" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Évolution de la participation Filles/Garçons</h4>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={genderEvolution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" angle={-45} textAnchor="end" height={80} />
                    <YAxis label={{ value: "Nombre de participants", angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="filles" stroke="#ec4899" name="Filles" strokeWidth={2} />
                    <Line type="monotone" dataKey="garcons" stroke="#3b82f6" name="Garçons" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
                <Card className="bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-200 dark:border-orange-800 mt-4">
                  <CardContent className="pt-4">
                    <p className="text-sm flex items-center gap-2 text-orange-700 dark:text-orange-400">
                      <AlertTriangle className="w-4 h-4" />
                      <strong>Signal faible détecté :</strong> Baisse de la participation des filles entre novembre 2026 et février 2027 (-5.5%)
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ONGLET 7: STRUCTURES & PUBLICS */}
        <TabsContent value="structures" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🏢 Structures & Publics - {data.name}</CardTitle>
              <CardDescription>Répartition par structures et tranches d'âge</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Répartition par tranches d'âge</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ageGroups}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tranche" />
                    <YAxis label={{ value: "Nombre d'enfants", angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="nombre" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Liste des structures</h4>
                <div className="border rounded-lg overflow-auto max-h-[400px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead>Structure</TableHead>
                        <TableHead>Territoire</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Enfants 3-10</TableHead>
                        <TableHead className="text-right">Ados 11-17</TableHead>
                        <TableHead className="text-right">Capacité</TableHead>
                        <TableHead className="text-right">Remplissage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {structures.map((structure, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{structure.nom}</TableCell>
                          <TableCell>{structure.territoire}</TableCell>
                          <TableCell>{structure.type}</TableCell>
                          <TableCell className="text-right">{structure.enfants_3_10}</TableCell>
                          <TableCell className="text-right">{structure.ados_11_17}</TableCell>
                          <TableCell className="text-right">{structure.capacite_totale}</TableCell>
                          <TableCell className="text-right">
                            <span className={structure.taux_remplissage > 90 ? "text-red-600 font-bold" : ""}>
                              {structure.taux_remplissage}%
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ONGLET 8: COMPARAISONS */}
        <TabsContent value="comparaisons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>📊 Comparaisons - Saint-Étienne Métropole vs Moyennes</CardTitle>
              <CardDescription>Positionnement par rapport aux références nationales et inter-métropoles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                {comparisonData.map((entity, idx) => (
                  <Card key={idx} className={idx === 0 ? "border-2 border-primary" : ""}>
                    <CardHeader>
                      <CardTitle className="text-base">{entity.entity}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Taux participation:</span>
                        <span className="font-bold">{entity.taux_participation}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Nb activités/enfant:</span>
                        <span className="font-bold">{entity.nb_moyen_activites}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Recours aides:</span>
                        <span className="font-bold">{entity.taux_recours_aides}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Part QPV:</span>
                        <span className="font-bold">{entity.part_qpv}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Part handicap:</span>
                        <span className="font-bold">{entity.part_handicap}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Taux abandon:</span>
                        <span className="font-bold">{entity.taux_abandon}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Mobilité éco:</span>
                        <span className="font-bold">{entity.part_mobilite_eco}%</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div>
                <h4 className="font-semibold mb-3">Radar comparatif - Positionnement multi-critères</h4>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="indicator" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Saint-Étienne Métropole" dataKey="Saint-Étienne Métropole" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                    <Radar name="Moyenne Nationale" dataKey="Moyenne Nationale" stroke="#ec4899" fill="#ec4899" fillOpacity={0.3} />
                    <Radar name="Métropole Type" dataKey="Métropole Type" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-base">📌 Points clés du positionnement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                    <span><strong>Recours aux aides :</strong> Saint-Étienne Métropole (+13.5 pts vs nationale) - Excellente mobilisation</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                    <span><strong>Mobilité éco-responsable :</strong> +32.4 pts vs nationale - Leadership en éco-mobilité</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 text-orange-600 flex-shrink-0" />
                    <span><strong>Taux d'abandon :</strong> 10% (légèrement inférieur à la moyenne nationale)</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                    <span><strong>Part QPV :</strong> 74.6% (concentration élevée de publics prioritaires)</span>
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🏘️ Comparaison des 3 territoires vs Métropole</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Comparatif multi-indicateurs</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={compareData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="inscrits" fill="#6366f1" name="Inscrits" />
                    <Bar dataKey="handicap" fill="#8b5cf6" name="Enfants handicap" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Taux comparés (%)</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={compareData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="qpv_pct" fill="#f59e0b" name="% QPV" />
                    <Bar dataKey="remplissage_pct" fill="#10b981" name="% Remplissage" />
                    <Bar dataKey="abandon_pct" fill="#ef4444" name="% Abandon" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
