import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, MapPin, Euro } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function StructureDashboardContent() {
  // Données mockées pour la démo
  const mockActivities = [
    { id: "1", title: "Stage Football 6-9 ans", price: 150, category: "Sport", published: true },
    { id: "2", title: "Atelier Arts Plastiques", price: 80, category: "Culture", published: true },
    { id: "3", title: "Camp Multi-Sports", price: 280, category: "Vacances", published: false },
    { id: "4", title: "Cours de Natation", price: 120, category: "Sport", published: true },
    { id: "5", title: "Stage Théâtre", price: 95, category: "Culture", published: true }
  ];

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Espace Structure</h1>
          <p className="text-muted-foreground">Gérez vos activités et inscriptions</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Créer une activité
        </Button>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Activités</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockActivities.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total publiées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inscriptions</CardTitle>
            <MapPin className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">En attente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenus</CardTitle>
            <Euro className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3450€</div>
            <p className="text-xs text-muted-foreground mt-1">Ce mois</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des activités */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Mes activités</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockActivities.map((activity) => (
            <Card key={activity.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{activity.title}</CardTitle>
                  <Badge variant={activity.published ? "default" : "secondary"}>
                    {activity.published ? "Publiée" : "Brouillon"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Euro className="w-4 h-4" />
                  <span>{activity.price}€</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{activity.category}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
