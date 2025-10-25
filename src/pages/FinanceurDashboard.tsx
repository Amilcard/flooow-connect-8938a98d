import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Users, TrendingUp, Award } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";
import Header from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";

export default function FinanceurDashboard() {
  // Fetch aid usage data (MOCK for demo)
  const { data: aidUsage, isLoading } = useQuery({
    queryKey: ['financeur-dashboard-mock'],
    queryFn: async () => [
      { aid_id: "1", aid_name: "Pass'Sport", territory_level: "National", total_simulations: 142, unique_users: 98, total_children_benefiting: 156, avg_aid_amount: 50, total_simulated_amount: 7100 },
      { aid_id: "2", aid_name: "CAF/VACAF", territory_level: "Départemental", total_simulations: 98, unique_users: 67, total_children_benefiting: 124, avg_aid_amount: 120, total_simulated_amount: 11760 },
      { aid_id: "3", aid_name: "Bourse Collectivité", territory_level: "Local", total_simulations: 87, unique_users: 54, total_children_benefiting: 98, avg_aid_amount: 80, total_simulated_amount: 6960 },
      { aid_id: "4", aid_name: "Pass'Culture", territory_level: "National", total_simulations: 56, unique_users: 42, total_children_benefiting: 67, avg_aid_amount: 30, total_simulated_amount: 1680 },
      { aid_id: "5", aid_name: "ANCV", territory_level: "National", total_simulations: 29, unique_users: 18, total_children_benefiting: 34, avg_aid_amount: 150, total_simulated_amount: 4350 }
    ]
  });

  if (isLoading) {
    return <LoadingState />;
  }

  const totalSimulations = aidUsage?.reduce((sum, aid) => sum + (aid.total_simulations || 0), 0) || 0;
  const totalUsers = aidUsage?.reduce((sum, aid) => sum + (aid.unique_users || 0), 0) || 0;
  const totalChildren = aidUsage?.reduce((sum, aid) => sum + (aid.total_children_benefiting || 0), 0) || 0;
  const totalAmount = aidUsage?.reduce((sum, aid) => sum + Number(aid.total_simulated_amount || 0), 0) || 0;
  const avgAmount = totalSimulations > 0 ? totalAmount / totalSimulations : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pb-24">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Tableau de bord Financeur
            </h1>
            <p className="text-muted-foreground">
              Suivi de l'utilisation des aides financières
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Simulations Totales
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSimulations}</div>
                <p className="text-xs text-muted-foreground">
                  Toutes aides confondues
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Utilisateurs Uniques
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Ayant simulé une aide
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Enfants Bénéficiaires
                </CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalChildren}</div>
                <p className="text-xs text-muted-foreground">
                  Potentiellement aidés
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Montant Moyen
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
                    .format(avgAmount)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Par simulation
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Aid Usage Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Détail par Aide Financière
              </CardTitle>
              <CardDescription>
                Performance et impact de chaque dispositif d'aide
              </CardDescription>
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
                    <TableHead className="text-right">Montant Moyen</TableHead>
                    <TableHead className="text-right">Montant Total</TableHead>
                    <TableHead className="text-right">Taux d'utilisation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aidUsage && aidUsage.length > 0 ? (
                    aidUsage.map((aid) => {
                      const utilizationRate = totalSimulations > 0 
                        ? ((aid.total_simulations / totalSimulations) * 100).toFixed(1) 
                        : '0';

                      return (
                        <TableRow key={aid.aid_id}>
                          <TableCell className="font-medium">{aid.aid_name}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-primary/10 text-primary">
                              {aid.territory_level}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">{aid.total_simulations}</TableCell>
                          <TableCell className="text-right">{aid.unique_users}</TableCell>
                          <TableCell className="text-right">{aid.total_children_benefiting}</TableCell>
                          <TableCell className="text-right">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
                              .format(Number(aid.avg_aid_amount || 0))}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
                              .format(Number(aid.total_simulated_amount || 0))}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="inline-flex items-center">
                              {utilizationRate}%
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        Aucune donnée disponible
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Impact Global</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Montant total simulé :</span>
                <span className="font-bold text-lg">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
                    .format(totalAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nombre d'aides disponibles :</span>
                <span className="font-semibold">{aidUsage?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
