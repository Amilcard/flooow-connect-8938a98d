import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEventStats } from "@/hooks/useEventStats";
import { useAuth } from "@/hooks/useAuth";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  MailOpen, 
  MousePointerClick, 
  Users, 
  Heart, 
  TrendingUp,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function EventStatistics() {
  const { user } = useAuth();
  const userTerritoryId = (user as any)?.territory_id;
  
  const { data: stats, isLoading, error } = useEventStats(userTerritoryId);

  if (isLoading) {
    return (
      <PageLayout>
        <LoadingState />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <ErrorState message="Erreur lors du chargement des statistiques" />
      </PageLayout>
    );
  }

  if (!stats || stats.length === 0) {
    return (
      <PageLayout>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              Aucune statistique disponible pour le moment.
            </p>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  // Calculer les statistiques globales
  const totalStats = stats.reduce(
    (acc, stat) => ({
      total_registrations: acc.total_registrations + Number(stat.total_registrations),
      emails_sent: acc.emails_sent + Number(stat.emails_sent),
      emails_opened: acc.emails_opened + Number(stat.emails_opened),
      emails_clicked: acc.emails_clicked + Number(stat.emails_clicked),
      favorites_count: acc.favorites_count + Number(stat.favorites_count),
    }),
    { total_registrations: 0, emails_sent: 0, emails_opened: 0, emails_clicked: 0, favorites_count: 0 }
  );

  const avgOpenRate = totalStats.emails_sent > 0
    ? ((totalStats.emails_opened / totalStats.emails_sent) * 100).toFixed(1)
    : 0;

  const avgClickRate = totalStats.emails_sent > 0
    ? ((totalStats.emails_clicked / totalStats.emails_sent) * 100).toFixed(1)
    : 0;

  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Statistiques des événements</h1>
        {/* Statistiques globales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emails envoyés</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.emails_sent}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux d'ouverture</CardTitle>
              <MailOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgOpenRate}%</div>
              <p className="text-xs text-muted-foreground">
                {totalStats.emails_opened} ouvertures
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de clic</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgClickRate}%</div>
              <p className="text-xs text-muted-foreground">
                {totalStats.emails_clicked} clics
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inscriptions totales</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.total_registrations}</div>
              <p className="text-xs text-muted-foreground">
                {totalStats.favorites_count} favoris
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tableau détaillé des événements */}
        <Card>
          <CardHeader>
            <CardTitle>Détail par événement</CardTitle>
            <CardDescription>
              Performance de chaque événement en termes d'engagement et d'emails
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Événement</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Envoyés
                    </TableHead>
                    <TableHead className="text-center">
                      <MailOpen className="h-4 w-4 inline mr-1" />
                      Ouverts
                    </TableHead>
                    <TableHead className="text-center">
                      <MousePointerClick className="h-4 w-4 inline mr-1" />
                      Cliqués
                    </TableHead>
                    <TableHead className="text-center">
                      <Users className="h-4 w-4 inline mr-1" />
                      Inscrits
                    </TableHead>
                    <TableHead className="text-center">
                      <Heart className="h-4 w-4 inline mr-1" />
                      Favoris
                    </TableHead>
                    <TableHead className="text-center">
                      <TrendingUp className="h-4 w-4 inline mr-1" />
                      Taux
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.map((stat) => (
                    <TableRow key={stat.event_id}>
                      <TableCell className="font-medium max-w-xs">
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                          <span className="line-clamp-2">{stat.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(stat.start_date), "d MMM yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell className="text-center">{stat.emails_sent}</TableCell>
                      <TableCell className="text-center">{stat.emails_opened}</TableCell>
                      <TableCell className="text-center">{stat.emails_clicked}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{stat.total_registrations}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{stat.favorites_count}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="space-y-1">
                          <div className="text-xs">
                            <span className="font-medium">{stat.email_open_rate}%</span>
                            <span className="text-muted-foreground"> ouv.</span>
                          </div>
                          <div className="text-xs">
                            <span className="font-medium">{stat.email_click_rate}%</span>
                            <span className="text-muted-foreground"> clic</span>
                          </div>
                          <div className="text-xs">
                            <span className="font-medium">{stat.conversion_rate}%</span>
                            <span className="text-muted-foreground"> conv.</span>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
