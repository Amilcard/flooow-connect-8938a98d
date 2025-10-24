import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Euro } from "lucide-react";

export default function FinanceurDashboardContent() {
  // Données mockées pour la démo
  const mockAidUsage = [
    {
      aid_id: "1",
      aid_name: "Pass Culture & Sport",
      territory_level: "national",
      total_simulations: 156,
      unique_users: 89,
      total_children_benefiting: 112,
      avg_aid_amount: 50,
      total_simulated_amount: 7800,
      utilization_rate: 72
    },
    {
      aid_id: "2",
      aid_name: "Aide Vacances CAF",
      territory_level: "metropole",
      total_simulations: 98,
      unique_users: 67,
      total_children_benefiting: 78,
      avg_aid_amount: 120,
      total_simulated_amount: 11760,
      utilization_rate: 68
    },
    {
      aid_id: "3",
      aid_name: "Bon Loisirs Municipal",
      territory_level: "commune",
      total_simulations: 145,
      unique_users: 92,
      total_children_benefiting: 123,
      avg_aid_amount: 30,
      total_simulated_amount: 4350,
      utilization_rate: 85
    },
    {
      aid_id: "4",
      aid_name: "Subvention Sport Régional",
      territory_level: "region",
      total_simulations: 67,
      unique_users: 45,
      total_children_benefiting: 56,
      avg_aid_amount: 80,
      total_simulated_amount: 5360,
      utilization_rate: 54
    }
  ];

  // Calculs agrégés
  const totalSimulations = mockAidUsage.reduce((sum, aid) => sum + aid.total_simulations, 0);
  const totalUsers = mockAidUsage.reduce((sum, aid) => sum + aid.unique_users, 0);
  const totalChildren = mockAidUsage.reduce((sum, aid) => sum + aid.total_children_benefiting, 0);
  const totalAmount = mockAidUsage.reduce((sum, aid) => sum + aid.total_simulated_amount, 0);
  const avgAmount = totalSimulations > 0 ? totalAmount / totalSimulations : 0;

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Tableau de bord Financeur</h1>
        <p className="text-muted-foreground">Suivi de l'utilisation des aides financières</p>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Simulations</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSimulations}</div>
            <p className="text-xs text-muted-foreground mt-1">Total réalisées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Uniques</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Enfants</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalChildren}</div>
            <p className="text-xs text-muted-foreground mt-1">Bénéficiaires</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Montant moyen</CardTitle>
            <Euro className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgAmount.toFixed(0)}€</div>
            <p className="text-xs text-muted-foreground mt-1">Par simulation</p>
          </CardContent>
        </Card>
      </div>

      {/* Tableau détaillé */}
      <Card>
        <CardHeader>
          <CardTitle>Détail par aide</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aide</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead className="text-right">Simulations</TableHead>
                <TableHead className="text-right">Utilisateurs</TableHead>
                <TableHead className="text-right">Enfants</TableHead>
                <TableHead className="text-right">Montant moy.</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Taux util.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAidUsage.map((aid) => (
                <TableRow key={aid.aid_id}>
                  <TableCell className="font-medium">{aid.aid_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{aid.territory_level}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{aid.total_simulations}</TableCell>
                  <TableCell className="text-right">{aid.unique_users}</TableCell>
                  <TableCell className="text-right">{aid.total_children_benefiting}</TableCell>
                  <TableCell className="text-right">{aid.avg_aid_amount.toFixed(0)}€</TableCell>
                  <TableCell className="text-right font-bold">{aid.total_simulated_amount.toFixed(0)}€</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={aid.utilization_rate > 50 ? "default" : "secondary"}>
                      {aid.utilization_rate.toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Résumé */}
      <Card className="bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Montant total simulé</p>
              <p className="text-3xl font-bold">{totalAmount.toFixed(0)}€</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Aides disponibles</p>
              <p className="text-3xl font-bold">{mockAidUsage.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
