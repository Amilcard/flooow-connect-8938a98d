import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Activity, CheckCircle, Calendar, TrendingUp, Euro } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";
import Header from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";

export default function StructureAnalytics() {
  // Fetch structure's activities and bookings
  const { data: structureData, isLoading } = useQuery({
    queryKey: ['structure-analytics'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get structure info
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('territory_id')
        .eq('user_id', user.id)
        .eq('role', 'structure')
        .single();

      if (!userRole) throw new Error('Not a structure user');

      // Get structure
      const { data: structure } = await supabase
        .from('structures')
        .select('*')
        .eq('territory_id', userRole.territory_id)
        .single();

      // Get activities with bookings
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select(`
          *,
          bookings (
            id,
            status,
            created_at,
            child_id,
            slot_id
          )
        `)
        .eq('structure_id', structure.id);

      if (activitiesError) throw activitiesError;

      return { structure, activities };
    }
  });

  if (isLoading) {
    return <LoadingState />;
  }

  const activities = structureData?.activities || [];
  const totalActivities = activities.length;
  const publishedActivities = activities.filter(a => a.published).length;
  const totalBookings = activities.reduce((sum, a) => sum + (a.bookings?.length || 0), 0);
  const validatedBookings = activities.reduce((sum, a) => 
    sum + (a.bookings?.filter(b => b.status === 'validee').length || 0), 0);
  const pendingBookings = activities.reduce((sum, a) => 
    sum + (a.bookings?.filter(b => b.status === 'en_attente').length || 0), 0);
  const totalRevenue = activities.reduce((sum, a) => {
    const validatedCount = a.bookings?.filter(b => b.status === 'validee').length || 0;
    return sum + (Number(a.price_base || 0) * validatedCount);
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pb-24">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Tableau de bord Structure
            </h1>
            <p className="text-muted-foreground">
              {structureData?.structure?.name}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Activités
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalActivities}</div>
                <p className="text-xs text-muted-foreground">
                  {publishedActivities} publiées
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Réservations Totales
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalBookings}</div>
                <p className="text-xs text-muted-foreground">
                  Toutes périodes confondues
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Validées / En attente
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{validatedBookings}</div>
                <p className="text-xs text-muted-foreground">
                  {pendingBookings} en attente
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Chiffre d'affaires
                </CardTitle>
                <Euro className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
                    .format(totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Réservations validées
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Activities Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Détail des Activités
              </CardTitle>
              <CardDescription>
                Performance de vos activités
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activité</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead className="text-right">Réservations</TableHead>
                    <TableHead className="text-right">Validées</TableHead>
                    <TableHead className="text-right">En attente</TableHead>
                    <TableHead className="text-right">Chiffre d'affaires</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.length > 0 ? (
                    activities.map((activity) => {
                      const bookings = activity.bookings || [];
                      const validated = bookings.filter(b => b.status === 'validee').length;
                      const pending = bookings.filter(b => b.status === 'en_attente').length;
                      const revenue = validated * Number(activity.price_base || 0);

                      return (
                        <TableRow key={activity.id}>
                          <TableCell className="font-medium">{activity.title}</TableCell>
                          <TableCell>{activity.category}</TableCell>
                          <TableCell>
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
                              .format(Number(activity.price_base || 0))}
                          </TableCell>
                          <TableCell className="text-right">{bookings.length}</TableCell>
                          <TableCell className="text-right">{validated}</TableCell>
                          <TableCell className="text-right">{pending}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
                              .format(revenue)}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              activity.published 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {activity.published ? 'Publiée' : 'Brouillon'}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        Aucune activité
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
