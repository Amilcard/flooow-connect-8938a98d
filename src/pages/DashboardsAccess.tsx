import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, DollarSign, BarChart3 } from "lucide-react";
import Header from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";

export default function DashboardsAccess() {
  const navigate = useNavigate();

  const dashboards = [
    {
      title: "Tableau de bord Collectivité",
      description: "Vue d'ensemble des activités, inscriptions et aides sur votre territoire",
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      path: "/collectivite/dashboard",
      features: [
        "Activités publiées et inscriptions",
        "Simulations d'aides financières",
        "Revenu potentiel du territoire",
        "Statistiques par dispositif d'aide"
      ]
    },
    {
      title: "Tableau de bord Structure",
      description: "Performance et statistiques de vos activités",
      icon: BarChart3,
      color: "text-green-600",
      bgColor: "bg-green-50",
      path: "/structure/analytics",
      features: [
        "Réservations par activité",
        "Chiffre d'affaires validé",
        "Taux de validation",
        "Suivi des réservations en attente"
      ]
    },
    {
      title: "Tableau de bord Financeur",
      description: "Impact et utilisation des aides financières",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      path: "/financeur/dashboard",
      features: [
        "Simulations par dispositif d'aide",
        "Nombre de bénéficiaires",
        "Montants moyens et totaux",
        "Taux d'utilisation des aides"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pb-24">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Tableaux de Bord Analytics
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Accédez aux statistiques et analyses adaptées à votre profil
            </p>
          </div>

          {/* Dashboard Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {dashboards.map((dashboard) => {
              const Icon = dashboard.icon;
              return (
                <Card key={dashboard.path} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${dashboard.bgColor} flex items-center justify-center mb-4`}>
                      <Icon className={`h-6 w-6 ${dashboard.color}`} />
                    </div>
                    <CardTitle className="text-xl">{dashboard.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {dashboard.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {dashboard.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-primary mt-0.5">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      onClick={() => navigate(dashboard.path)}
                      className="w-full"
                      size="lg"
                    >
                      Accéder au tableau de bord
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Info Section */}
          <Card className="mt-12 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Besoin d'aide ?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Chaque tableau de bord est conçu pour un type d'acteur spécifique :
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><strong>Collectivités :</strong> Pilotage territorial et suivi des dispositifs</li>
                <li><strong>Structures :</strong> Gestion opérationnelle des activités</li>
                <li><strong>Financeurs :</strong> Mesure d'impact des aides financières</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
