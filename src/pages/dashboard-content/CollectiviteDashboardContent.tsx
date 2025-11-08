import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Activity, Heart, TrendingUp, Calendar, DollarSign, Car, User, MapPin, UserMinus, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { useDashboardKPIs } from "@/hooks/useDashboardStats";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { territoriesData, metropoleData, evolutionData, type TerritoryData } from "@/lib/dashboardMockData";
import { useState } from "react";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

interface CollectiviteDashboardContentProps {
  territoryId: string;
}

export default function CollectiviteDashboardContent({ territoryId }: CollectiviteDashboardContentProps) {
  const { data: kpisData, isLoading, error } = useDashboardKPIs();
  const [selectedTerritory, setSelectedTerritory] = useState<string>("metropole");

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="Erreur lors du chargement des KPIs" />;

  // Sélectionner les données du territoire
  const currentTerritory: TerritoryData = selectedTerritory === "metropole" 
    ? metropoleData 
    : territoriesData[selectedTerritory];

  // Préparer les données pour les graphiques
  const activitiesByUnivers = [
    { name: "Sport", value: currentTerritory.univers_sport },
    { name: "Culture", value: currentTerritory.univers_culture },
    { name: "Loisirs", value: currentTerritory.univers_loisirs },
    { name: "Vacances", value: currentTerritory.univers_vacances },
    { name: "Scolaire", value: currentTerritory.univers_scolaire }
  ];

  const cspData = [
    { name: "Très modestes (QF<500)", value: currentTerritory.csp_tres_modestes },
    { name: "Modestes (500-1000)", value: currentTerritory.csp_modestes },
    { name: "Intermédiaires (1000-1500)", value: currentTerritory.csp_intermediaires },
    { name: "Aisées (>1500)", value: currentTerritory.csp_aisees }
  ];

  const mobilityData = [
    { mode: "Bus", count: currentTerritory.transport_bus, percentage: ((currentTerritory.transport_bus / currentTerritory.total_inscrits) * 100).toFixed(1) },
    { mode: "Vélo", count: currentTerritory.transport_velo, percentage: ((currentTerritory.transport_velo / currentTerritory.total_inscrits) * 100).toFixed(1) },
    { mode: "Voiture", count: currentTerritory.transport_voiture, percentage: ((currentTerritory.transport_voiture / currentTerritory.total_inscrits) * 100).toFixed(1) },
    { mode: "Covoiturage", count: currentTerritory.transport_covoiturage, percentage: ((currentTerritory.transport_covoiturage / currentTerritory.total_inscrits) * 100).toFixed(1) },
    { mode: "Marche", count: currentTerritory.transport_marche, percentage: ((currentTerritory.transport_marche / currentTerritory.total_inscrits) * 100).toFixed(1) }
  ];

  const genderData = [
    { name: "Filles", value: currentTerritory.filles },
    { name: "Garçons", value: currentTerritory.garcons }
  ];

  // Données comparatives des 3 quartiers
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

      {/* Section 1: SYNTHÈSE */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Synthèse - {currentTerritory.name}</CardTitle>
          <CardDescription>Indicateurs clés de pilotage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-3xl font-bold">{currentTerritory.total_inscrits}</div>
              <p className="text-xs text-muted-foreground">Enfants inscrits</p>
            </div>
            <div className="text-center">
              <Activity className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-3xl font-bold">{currentTerritory.total_structures}</div>
              <p className="text-xs text-muted-foreground">Structures</p>
            </div>
            <div className="text-center">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-3xl font-bold">{currentTerritory.taux_remplissage_moyen}%</div>
              <p className="text-xs text-muted-foreground">Taux remplissage</p>
            </div>
            <div className="text-center">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-orange-500" />
              <div className="text-3xl font-bold">{currentTerritory.taux_non_recours_estime}%</div>
              <p className="text-xs text-muted-foreground">Non-recours estimé</p>
            </div>
            <div className="text-center">
              <UserMinus className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <div className="text-3xl font-bold">{currentTerritory.taux_abandon.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Taux d'abandon</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: ACCÈS & ÉQUITÉ */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Accès & Équité</CardTitle>
          <CardDescription>Inclusion et équité territoriale</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{currentTerritory.taux_qpv.toFixed(1)}%</div>
              <p className="text-sm text-muted-foreground">QPV ({currentTerritory.enfants_qpv} enfants)</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{currentTerritory.taux_handicap.toFixed(1)}%</div>
              <p className="text-sm text-muted-foreground">Handicap ({currentTerritory.enfants_handicap} enfants)</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-pink-600">{currentTerritory.taux_filles.toFixed(1)}%</div>
              <p className="text-sm text-muted-foreground">Filles ({currentTerritory.filles})</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{currentTerritory.taux_non_recours_estime}%</div>
              <p className="text-sm text-muted-foreground">Non-recours estimé</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* CSP */}
            <div>
              <h4 className="font-semibold mb-3">Répartition socio-professionnelle (CSP)</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={cspData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name.split('(')[0]}: ${entry.value}`}
                    outerRadius={80}
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

            {/* Filles/Garçons */}
            <div>
              <h4 className="font-semibold mb-3">Répartition Filles/Garçons</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
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

      {/* Section 3: PARCOURS & ASSIDUITÉ */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Parcours & Assiduité</CardTitle>
          <CardDescription>Suivi de l'engagement et des abandons</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border-2 border-red-200 dark:border-red-800">
              <UserMinus className="w-6 h-6 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold text-red-600">{currentTerritory.taux_abandon.toFixed(1)}%</div>
              <p className="text-sm text-muted-foreground">{currentTerritory.nb_abandons} abandons</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border-2 border-green-200 dark:border-green-800">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{(100 - currentTerritory.taux_abandon).toFixed(1)}%</div>
              <p className="text-sm text-muted-foreground">Assiduité</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Activity className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{currentTerritory.nb_moyen_activites_par_enfant.toFixed(1)}</div>
              <p className="text-sm text-muted-foreground">Activités/enfant</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Répartition par univers</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activitiesByUnivers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Nombre d\'inscrits', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: AIDES & FINANCES */}
      <Card>
        <CardHeader>
          <CardTitle>💰 Aides & Finances</CardTitle>
          <CardDescription>Recours aux aides et reste à charge</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold">{currentTerritory.familles_aidees}</div>
              <p className="text-sm text-muted-foreground">Familles aidées</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold">{currentTerritory.familles_eligibles}</div>
              <p className="text-sm text-muted-foreground">Familles éligibles</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{currentTerritory.aide_moyenne}€</div>
              <p className="text-sm text-muted-foreground">Aide moyenne</p>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{currentTerritory.reste_a_charge_moyen}€</div>
              <p className="text-sm text-muted-foreground">Reste à charge moyen</p>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              Taux de non-recours: {currentTerritory.taux_non_recours_estime}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {(currentTerritory.familles_eligibles - currentTerritory.familles_aidees)} familles éligibles n'ont pas bénéficié d'aides
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section 5: MOBILITÉ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Mobilité & Transport
          </CardTitle>
          <CardDescription>Modes de transport et abandons liés</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mobilityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mode" />
              <YAxis label={{ value: 'Nombre d\'usagers', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `${value} enfants`} />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>

          <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Abandons pour raison de mobilité: {currentTerritory.abandons_mobilite}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {((currentTerritory.abandons_mobilite / currentTerritory.total_inscrits) * 100).toFixed(1)}% des inscrits
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section 6: ÉVOLUTION TEMPORELLE */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Évolution sur 12 mois</CardTitle>
          <CardDescription>Inscriptions par territoire (Nov 2024 - Oct 2025)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis label={{ value: 'Inscriptions', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="la_ricamarie" stroke="#3b82f6" name="La Ricamarie" />
              <Line type="monotone" dataKey="grand_clos" stroke="#ec4899" name="Grand Clos" />
              <Line type="monotone" dataKey="cret_de_roch" stroke="#f59e0b" name="Crêt de Roch" />
              <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} name="Total Métropole" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Section 7: COMPARAISON DES 3 QUARTIERS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Comparaison des 3 Quartiers
          </CardTitle>
          <CardDescription>Vue comparative des indicateurs clés par territoire</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tableau comparatif complet */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Indicateur</TableHead>
                <TableHead className="text-right">La Ricamarie</TableHead>
                <TableHead className="text-right">Grand Clos</TableHead>
                <TableHead className="text-right">Crêt de Roch</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold">Inscrits totaux</TableCell>
                {Object.values(territoriesData).map(t => (
                  <TableCell key={t.id} className="text-right">{t.total_inscrits}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Taux QPV</TableCell>
                {Object.values(territoriesData).map(t => (
                  <TableCell key={t.id} className="text-right">
                    <Badge variant={t.taux_qpv > 75 ? "destructive" : "secondary"}>
                      {t.taux_qpv.toFixed(1)}%
                    </Badge>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Handicap</TableCell>
                {Object.values(territoriesData).map(t => (
                  <TableCell key={t.id} className="text-right">{t.enfants_handicap} ({t.taux_handicap.toFixed(1)}%)</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Taux remplissage</TableCell>
                {Object.values(territoriesData).map(t => (
                  <TableCell key={t.id} className="text-right">
                    <Badge variant={t.taux_remplissage_moyen >= 90 ? "destructive" : t.taux_remplissage_moyen >= 75 ? "default" : "outline"}>
                      {t.taux_remplissage_moyen}%
                    </Badge>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Taux abandon</TableCell>
                {Object.values(territoriesData).map(t => (
                  <TableCell key={t.id} className="text-right">
                    <Badge variant={t.taux_abandon >= 10 ? "destructive" : "outline"}>
                      {t.taux_abandon.toFixed(1)}%
                    </Badge>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Non-recours estimé</TableCell>
                {Object.values(territoriesData).map(t => (
                  <TableCell key={t.id} className="text-right">
                    <Badge variant={t.taux_non_recours_estime >= 25 ? "destructive" : "secondary"}>
                      {t.taux_non_recours_estime}%
                    </Badge>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Aide moyenne</TableCell>
                {Object.values(territoriesData).map(t => (
                  <TableCell key={t.id} className="text-right text-green-600 font-semibold">{t.aide_moyenne}€</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Reste à charge moyen</TableCell>
                {Object.values(territoriesData).map(t => (
                  <TableCell key={t.id} className="text-right text-orange-600 font-semibold">{t.reste_a_charge_moyen}€</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Abandons mobilité</TableCell>
                {Object.values(territoriesData).map(t => (
                  <TableCell key={t.id} className="text-right">
                    <Badge variant={t.abandons_mobilite >= 12 ? "destructive" : "outline"}>
                      {t.abandons_mobilite}
                    </Badge>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>

          {/* Graphiques comparatifs */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-3">Comparaison taux QPV & Non-recours</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={compareData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="qpv_pct" fill={COLORS[2]} name="% QPV" />
                  <Bar dataKey="non_recours_pct" fill={COLORS[3]} name="% Non-recours" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Comparaison taux remplissage & abandon</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={compareData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="remplissage_pct" fill={COLORS[4]} name="% Remplissage" />
                  <Bar dataKey="abandon_pct" fill={COLORS[5]} name="% Abandon" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Points d'attention stratégiques */}
          <Card className="bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-300 dark:border-orange-800">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Points d'attention stratégiques
              </h4>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-background rounded-lg">
                  <p className="font-semibold text-red-600">🚨 URGENT - Grand Clos/Côte-Chaude</p>
                  <ul className="mt-1 space-y-1 text-muted-foreground ml-4">
                    <li>• Saturation critique: 94% de remplissage avec forte demande QPV (79%)</li>
                    <li>• Action: Augmenter l'offre de 30-40% dans les 6 prochains mois</li>
                    <li>• 14 abandons mobilité → Renforcer lignes bus vers activités</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-background rounded-lg">
                  <p className="font-semibold text-orange-600">⚠️ PRIORITÉ - Crêt de Roch</p>
                  <ul className="mt-1 space-y-1 text-muted-foreground ml-4">
                    <li>• Non-recours élevé: 31% des familles éligibles n'utilisent pas les aides</li>
                    <li>• Reste à charge le plus élevé: 78€ en moyenne</li>
                    <li>• Action: Campagne d'information sur les aides + accompagnement administratif</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-background rounded-lg">
                  <p className="font-semibold text-blue-600">📊 SUIVI - La Ricamarie</p>
                  <ul className="mt-1 space-y-1 text-muted-foreground ml-4">
                    <li>• Situation équilibrée: 78% remplissage, bonne couverture</li>
                    <li>• Action: Maintenir dynamique actuelle + surveiller évolution mobilité</li>
                    <li>• Opportunité: Développer offre vélo (actuellement 12%)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
