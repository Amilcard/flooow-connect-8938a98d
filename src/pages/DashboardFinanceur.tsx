import { useFinanceurDashboard } from "@/hooks/useDashboardStats";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DollarSign, Users, TrendingUp, Award } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

export default function DashboardFinanceur() {
  const { data: aidsUsage, isLoading } = useFinanceurDashboard();

  if (isLoading) {
    return <LoadingState />;
  }

  if (!aidsUsage || aidsUsage.length === 0) {
    return <ErrorState message="Aucune donnée d'aide disponible" />;
  }

  const totalSimulations = aidsUsage.reduce((sum, aid) => sum + (aid.total_simulations || 0), 0);
  const totalAmount = aidsUsage.reduce((sum, aid) => sum + (aid.total_simulated_amount || 0), 0);
  const totalBeneficiaries = aidsUsage.reduce((sum, aid) => sum + (aid.total_children_benefiting || 0), 0);
  const avgAid = totalAmount / totalSimulations;

  const chartData = aidsUsage.slice(0, 10).map(aid => ({
    name: aid.aid_name?.substring(0, 20) + '...' || 'Aide',
    simulations: aid.total_simulations || 0,
    montant: Number(aid.total_simulated_amount) || 0,
    beneficiaires: aid.total_children_benefiting || 0,
  }));

  return (
    <PageLayout>
      <div className="container mx-auto py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Financeur</h1>
          <p className="text-muted-foreground mt-2">
            Analyse de l'utilisation des aides financières
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Simulations"
            value={totalSimulations}
            icon={TrendingUp}
            description="Demandes d'aides simulées"
          />
          <StatsCard
            title="Montant Total"
            value={`${totalAmount.toFixed(0)}€`}
            icon={DollarSign}
            description="Aides potentielles"
          />
          <StatsCard
            title="Enfants Bénéficiaires"
            value={totalBeneficiaries}
            icon={Users}
            description="Enfants éligibles"
          />
          <StatsCard
            title="Aide Moyenne"
            value={`${avgAid.toFixed(0)}€`}
            icon={Award}
            description="Par simulation"
          />
        </div>

        {/* Chart: Top Aides */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 des Aides les Plus Demandées</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="simulations" fill="#8884d8" name="Simulations" />
                <Bar yAxisId="right" dataKey="montant" fill="#82ca9d" name="Montant (€)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Table: Détails des aides */}
        <Card>
          <CardHeader>
            <CardTitle>Détail par Aide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Aide</th>
                    <th className="text-left py-3 px-4">Niveau</th>
                    <th className="text-right py-3 px-4">Simulations</th>
                    <th className="text-right py-3 px-4">Bénéficiaires</th>
                    <th className="text-right py-3 px-4">Montant Total</th>
                    <th className="text-right py-3 px-4">Moyenne</th>
                  </tr>
                </thead>
                <tbody>
                  {aidsUsage.map((aid) => (
                    <tr key={aid.aid_id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{aid.aid_name}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {aid.territory_level}
                        </span>
                      </td>
                      <td className="text-right py-3 px-4">{aid.total_simulations || 0}</td>
                      <td className="text-right py-3 px-4">{aid.total_children_benefiting || 0}</td>
                      <td className="text-right py-3 px-4">
                        {Number(aid.total_simulated_amount || 0).toFixed(0)}€
                      </td>
                      <td className="text-right py-3 px-4">
                        {Number(aid.avg_aid_amount || 0).toFixed(0)}€
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}