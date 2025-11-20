import { useState } from "react";
import Header from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/SearchBar";
import { ActivitySection } from "@/components/Activity/ActivitySection";
import { useActivities } from "@/hooks/useActivities";
import { MapPin, Euro, Users, Calendar, ChevronRight, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DemoParent() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);

  // Activités pour la démo (limitées)
  const { activities: proximityActivities, isLoading } = useActivities({ limit: 4 });
  const { activities: budgetActivities } = useActivities({ maxPrice: 50, limit: 4 });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 pb-24">
        {/* Bannière démo */}
        <Card className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg">🎭 Démo - Parcours Parent</p>
              <p className="text-sm text-muted-foreground">
                Découvrez comment un parent recherche et réserve une activité
              </p>
            </div>
            <Badge variant="outline" className="bg-background">
              FRONT (Utilisateur)
            </Badge>
          </div>
        </Card>

        {/* Section Hero */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Trouvez l'activité parfaite pour votre enfant
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Des centaines d'activités sportives, culturelles et de loisirs
          </p>

          {/* Barre de recherche principale */}
          <div className="max-w-2xl mx-auto mb-6">
            <SearchBar />
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <Card className="p-4">
              <div className="text-2xl font-bold text-primary">156</div>
              <div className="text-sm text-muted-foreground">Enfants inscrits</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-primary">87</div>
              <div className="text-sm text-muted-foreground">Activités</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-accent">89</div>
              <div className="text-sm text-muted-foreground">Aides simulées</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-accent">45 680€</div>
              <div className="text-sm text-muted-foreground">Économisés</div>
            </Card>
          </div>
        </div>

        {/* Section Filtres démo */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtres de recherche disponibles
            </CardTitle>
            <CardDescription>
              Les parents peuvent filtrer par catégorie, âge, prix, accessibilité, aides, etc.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">🏃 Sport</Badge>
              <Badge variant="secondary">🎨 Culture</Badge>
              <Badge variant="secondary">🎭 Loisirs</Badge>
              <Badge variant="secondary">📚 Scolarité</Badge>
              <Badge variant="secondary">👶 3-18 ans</Badge>
              <Badge variant="secondary">💰 0-200€</Badge>
              <Badge variant="secondary">♿ Accessibilité INCLUSIVITÉ</Badge>
              <Badge variant="secondary">🚗 Covoiturage</Badge>
              <Badge variant="secondary">💳 Aides financières</Badge>
              <Badge variant="secondary">🏖️ Vacances scolaires</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Section Activités à proximité */}
        {proximityActivities && proximityActivities.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <MapPin className="w-6 h-6 text-primary" />
                Activités à proximité
              </h2>
              <Button variant="outline" onClick={() => navigate('/activities')}>
                Voir tout
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <ActivitySection
              title=""
              activities={proximityActivities}
              onActivityClick={(id) => navigate(`/activity/${id}`)}
            />
          </div>
        )}

        {/* Section Petits budgets */}
        {budgetActivities && budgetActivities.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Euro className="w-6 h-6 text-accent" />
                Activités Petits budgets
              </h2>
              <Button variant="outline" onClick={() => navigate('/activities')}>
                Voir tout
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <ActivitySection
              title=""
              activities={budgetActivities}
              onActivityClick={(id) => navigate(`/activity/${id}`)}
            />
          </div>
        )}

        {/* Section Parcours type */}
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle>📋 Parcours type d'un parent</CardTitle>
            <CardDescription>
              Démonstration des étapes clés de l'inscription à une activité
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <p className="font-semibold">Recherche d'activité</p>
                  <p className="text-sm text-muted-foreground">
                    Utilise la barre de recherche ou les filtres (catégorie, âge, prix, accessibilité)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <p className="font-semibold">Consultation fiche activité</p>
                  <p className="text-sm text-muted-foreground">
                    Voit les détails : horaires, prix, accessibilité, documents requis
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <p className="font-semibold">Simulation des aides financières</p>
                  <p className="text-sm text-muted-foreground">
                    Calcul automatique CAF, Pass'Sport, aides locales → Voit le reste à charge réel
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <p className="font-semibold">Réservation</p>
                  <p className="text-sm text-muted-foreground">
                    Sélectionne enfant, créneau, option transport → Réservation confirmée
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  5
                </div>
                <div>
                  <p className="font-semibold">Suivi dans "Mon compte"</p>
                  <p className="text-sm text-muted-foreground">
                    Accède à l'historique, modifie le profil, gère les enfants, voit les notifications
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <Button onClick={() => navigate('/activities')} className="flex-1">
                <Users className="w-4 h-4 mr-2" />
                Voir toutes les activités
              </Button>
              <Button onClick={() => navigate('/aides')} variant="outline" className="flex-1">
                <Euro className="w-4 h-4 mr-2" />
                Simuler mes aides
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Fonctionnalités clés */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">✨ Fonctionnalités clés</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🎯 Filtres avancés</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>✓ Catégories multiples</li>
                  <li>✓ Tranche d'âge précise</li>
                  <li>✓ Budget maximum</li>
                  <li>✓ Accessibilité INCLUSIVITÉ</li>
                  <li>✓ Aides financières</li>
                  <li>✓ Périodes vacances</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💰 Aides automatiques</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>✓ CAF selon QF</li>
                  <li>✓ Pass'Sport national</li>
                  <li>✓ Aides locales</li>
                  <li>✓ Cumul automatique</li>
                  <li>✓ Reste à charge calculé</li>
                  <li>✓ Paiement échelonné</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">♿ Inclusion</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>✓ Accessibilité INCLUSIVITÉ</li>
                  <li>✓ Handicaps pris en compte</li>
                  <li>✓ Transport adapté</li>
                  <li>✓ Critères QPV</li>
                  <li>✓ Multi-enfants</li>
                  <li>✓ Covoiturage</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
