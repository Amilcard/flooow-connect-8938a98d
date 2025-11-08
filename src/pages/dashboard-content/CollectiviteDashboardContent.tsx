import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, Building2, TrendingUp, AlertCircle, Heart, Bus, DollarSign, GraduationCap, Activity, UserMinus, CheckCircle, AlertTriangle, MapPin, Car } from "lucide-react";
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

  return (
    <div className="space-y-6">
      {/* Titre et sélecteur de territoire */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tableau de bord Collectivité</h1>
          <p className="text-muted-foreground">Pilotage territorial des activités jeunesse - Saint-Étienne Métropole</p>
        </div>
        
        {/* Sélecteur de territoire */}
        <div className="flex gap-2 flex-wrap">
          <Badge 
            variant={selectedTerritory === "metropole" ? "default" : "outline"}
            className="cursor-pointer px-4 py-2"
            onClick={() => setSelectedTerritory("metropole")}
          >
            Vue Métropole
          </Badge>
          <Badge 
            variant={selectedTerritory === "la_ricamarie" ? "default" : "outline"}
            className="cursor-pointer px-4 py-2"
            onClick={() => setSelectedTerritory("la_ricamarie")}
          >
            La Ricamarie
          </Badge>
          <Badge 
            variant={selectedTerritory === "grand_clos" ? "default" : "outline"}
            className="cursor-pointer px-4 py-2"
            onClick={() => setSelectedTerritory("grand_clos")}
          >
            Grand Clos / Côte-Chaude
          </Badge>
          <Badge 
            variant={selectedTerritory === "cret_de_roch" ? "default" : "outline"}
            className="cursor-pointer px-4 py-2"
            onClick={() => setSelectedTerritory("cret_de_roch")}
          >
            Crêt de Roch
          </Badge>
        </div>
      </div>

      {/* Onglets */}
      <Tabs defaultValue="synthese" className="w-full">
        <TabsList className="grid w-full grid-cols-7 mb-6">
          <TabsTrigger value="synthese">Synthèse</TabsTrigger>
          <TabsTrigger value="acces">Accès & Équité</TabsTrigger>
          <TabsTrigger value="parcours">Parcours</TabsTrigger>
          <TabsTrigger value="aides">Aides</TabsTrigger>
          <TabsTrigger value="mobilite">Mobilité</TabsTrigger>
          <TabsTrigger value="evolutions">Évolutions</TabsTrigger>
          <TabsTrigger value="structures">Structures</TabsTrigger>
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
                <div className="text-center">
                  <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-3xl font-bold">{data.total_inscrits}</div>
                  <p className="text-xs text-muted-foreground">Enfants inscrits</p>
                </div>
                <div className="text-center">
                  <Activity className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-3xl font-bold">{data.total_structures}</div>
                  <p className="text-xs text-muted-foreground">Structures</p>
                </div>
                <div className="text-center">
                  <CheckCircle className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-3xl font-bold">{data.taux_remplissage_moyen}%</div>
                  <p className="text-xs text-muted-foreground">Taux remplissage</p>
                </div>
                <div className="text-center">
                  <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                  <div className="text-3xl font-bold">{data.taux_non_recours_estime}%</div>
                  <p className="text-xs text-muted-foreground">Non-recours estimé</p>
                </div>
                <div className="text-center">
                  <UserMinus className="w-6 h-6 mx-auto mb-2 text-red-500" />
                  <div className="text-3xl font-bold">{data.taux_abandon.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">Taux d'abandon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎯 Vue d'ensemble rapide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{data.taux_qpv.toFixed(1)}%</div>
                  <p className="text-sm text-muted-foreground">QPV ({data.enfants_qpv} enfants)</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{data.taux_handicap.toFixed(1)}%</div>
                  <p className="text-sm text-muted-foreground">Handicap ({data.enfants_handicap} enfants)</p>
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
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{data.taux_qpv.toFixed(1)}%</div>
                  <p className="text-sm text-muted-foreground">QPV ({data.enfants_qpv} enfants)</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{data.taux_handicap.toFixed(1)}%</div>
                  <p className="text-sm text-muted-foreground">Handicap ({data.enfants_handicap} enfants)</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-pink-600">{data.taux_filles.toFixed(1)}%</div>
                  <p className="text-sm text-muted-foreground">Filles ({data.filles})</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
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
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold">{data.familles_aidees}</div>
                  <p className="text-sm text-muted-foreground">Familles aidées</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold">{data.familles_eligibles}</div>
                  <p className="text-sm text-muted-foreground">Familles éligibles</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{data.aide_moyenne}€</div>
                  <p className="text-sm text-muted-foreground">Aide moyenne</p>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{data.reste_a_charge_moyen}€</div>
                  <p className="text-sm text-muted-foreground">Reste à charge moyen</p>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  Taux de non-recours: {data.taux_non_recours_estime}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(data.familles_eligibles - data.familles_aidees)} familles éligibles n'ont pas bénéficié d'aides
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ONGLET 5: MOBILITÉ */}
        <TabsContent value="mobilite" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                Mobilité & Transport - {data.name}
              </CardTitle>
              <CardDescription>Modes de transport et abandons liés</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mobilityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mode" />
                  <YAxis label={{ value: "Nombre d'usagers", angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => `${value} enfants`} />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>

              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Abandons pour raison de mobilité: {data.abandons_mobilite}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {((data.abandons_mobilite / data.total_inscrits) * 100).toFixed(1)}% des inscrits
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ONGLET 6: ÉVOLUTIONS */}
        <TabsContent value="evolutions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>📊 Évolutions temporelles - {data.name}</CardTitle>
              <CardDescription>Dynamiques sur 12 mois (Sept 2024 - Août 2025)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Évolution par activité */}
              <div>
                <h4 className="font-semibold mb-3">Évolution par univers d'activités</h4>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={activityEvolution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" />
                    <YAxis label={{ value: 'Inscriptions', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sport" stroke="#3b82f6" name="Sport" strokeWidth={2} />
                    <Line type="monotone" dataKey="culture" stroke="#ec4899" name="Culture" strokeWidth={2} />
                    <Line type="monotone" dataKey="loisirs" stroke="#f59e0b" name="Loisirs" strokeWidth={2} />
                    <Line type="monotone" dataKey="vacances" stroke="#10b981" name="Vacances" strokeWidth={2} />
                    <Line type="monotone" dataKey="scolaire" stroke="#8b5cf6" name="Scolaire" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-muted-foreground">
                    ✓ Hausses visibles pendant les vacances (février, avril, juillet-août) • Baisse hivernale en janvier • Progression globale modérée
                  </p>
                </div>
              </div>

              {/* Évolution filles/garçons */}
              <div>
                <h4 className="font-semibold mb-3">Évolution de la participation Filles/Garçons</h4>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={genderEvolution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" />
                    <YAxis label={{ value: 'Nombre', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="filles" stroke="#ec4899" name="Filles" strokeWidth={3} />
                    <Line type="monotone" dataKey="garcons" stroke="#3b82f6" name="Garçons" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-2 p-3 bg-pink-50 dark:bg-pink-950/20 rounded-lg border border-pink-200 dark:border-pink-800">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-pink-600" />
                    Signal faible détecté: baisse de la participation filles entre novembre et janvier (hiver). Rebond progressif à partir de mars.
                  </p>
                </div>
              </div>

              {/* Comparaison des 3 territoires */}
              <div>
                <h4 className="font-semibold mb-3">Comparaison des 3 territoires</h4>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" />
                    <YAxis label={{ value: 'Inscriptions', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="la_ricamarie" stroke="#3b82f6" name="La Ricamarie" strokeWidth={2} />
                    <Line type="monotone" dataKey="grand_clos" stroke="#ec4899" name="Grand Clos" strokeWidth={2} />
                    <Line type="monotone" dataKey="cret_de_roch" stroke="#f59e0b" name="Crêt de Roch" strokeWidth={2} />
                    <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} name="Total Métropole" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ONGLET 7: STRUCTURES & PUBLICS */}
        <TabsContent value="structures" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Structures & Publics - {data.name}
              </CardTitle>
              <CardDescription>Répartition par structures, types et tranches d'âge</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Répartition par tranches d'âge */}
              <div>
                <h4 className="font-semibold mb-3">Répartition par tranches d'âge</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ageGroups}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tranche" />
                    <YAxis label={{ value: "Nombre d'enfants", angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="nombre" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Tableau des structures */}
              <div>
                <h4 className="font-semibold mb-3">Liste des structures ({structures.length})</h4>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">3-10 ans</TableHead>
                        <TableHead className="text-right">11-17 ans</TableHead>
                        <TableHead className="text-right">Capacité</TableHead>
                        <TableHead className="text-right">Remplissage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {structures.map((structure, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{structure.nom}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{structure.type}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{structure.enfants_3_10}</TableCell>
                          <TableCell className="text-right">{structure.ados_11_17}</TableCell>
                          <TableCell className="text-right">{structure.capacite_totale}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={structure.taux_remplissage >= 85 ? "default" : "secondary"}>
                              {structure.taux_remplissage}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Statistiques structures */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold">{structures.length}</div>
                  <p className="text-sm text-muted-foreground">Structures totales</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold">
                    {structures.reduce((sum, s) => sum + s.enfants_3_10 + s.ados_11_17, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Places occupées</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold">
                    {Math.round((structures.reduce((sum, s) => sum + s.taux_remplissage, 0) / structures.length))}%
                  </div>
                  <p className="text-sm text-muted-foreground">Remplissage moyen</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comparaison des 3 quartiers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Comparaison des 3 Quartiers
              </CardTitle>
              <CardDescription>Vue comparative des indicateurs clés par territoire</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Territoire</TableHead>
                    <TableHead className="text-right">Inscrits</TableHead>
                    <TableHead className="text-right">QPV %</TableHead>
                    <TableHead className="text-right">Handicap</TableHead>
                    <TableHead className="text-right">Abandon %</TableHead>
                    <TableHead className="text-right">Non-recours %</TableHead>
                    <TableHead className="text-right">Remplissage %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {compareData.map((terr, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{terr.name}</TableCell>
                      <TableCell className="text-right">{terr.inscrits}</TableCell>
                      <TableCell className="text-right">{terr.qpv_pct.toFixed(1)}%</TableCell>
                      <TableCell className="text-right">{terr.handicap}</TableCell>
                      <TableCell className="text-right">{terr.abandon_pct.toFixed(1)}%</TableCell>
                      <TableCell className="text-right">{terr.non_recours_pct}%</TableCell>
                      <TableCell className="text-right">{terr.remplissage_pct}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-3">Inscrits par territoire</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={compareData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="inscrits" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Taux de remplissage</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={compareData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="remplissage_pct" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
