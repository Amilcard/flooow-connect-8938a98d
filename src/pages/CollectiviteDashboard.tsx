import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Activity, DollarSign, TrendingUp, Building2, CheckCircle } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";
import Header from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";

export default function CollectiviteDashboard() {
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

  // Fetch aid usage data
  const { data: aidUsage, isLoading: loadingAids } = useQuery({
    queryKey: ['financeur-aid-usage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_dashboard_financeur_aid_usage')
        .select('*')
        .order('total_simulations', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  if (loadingOverview || loadingAids) {
    return <LoadingState />;
  }

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

          {/* Stats Cards */}
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
                  Inscriptions
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.total_registrations || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {overview?.unique_children_registered || 0} enfants uniques
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

          {/* Aid Usage Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Utilisation des Aides Financières
              </CardTitle>
              <CardDescription>
                Détail des aides simulées par dispositif
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aidUsage && aidUsage.length > 0 ? (
                    aidUsage.map((aid) => (
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
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        Aucune donnée disponible
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
