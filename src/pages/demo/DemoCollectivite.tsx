import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CollectiviteDashboardContent from "../dashboard-content/CollectiviteDashboardContent";

export default function DemoCollectivite() {
  // Mock territory ID pour la démo
  const mockTerritoryId = "550e8400-e29b-41d4-a716-446655440000";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Bannière démo */}
        <Card className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg">🏛️ Démo - Dashboard Collectivité Locale</p>
              <p className="text-sm text-muted-foreground">
                Vue d'ensemble territoriale : Inscriptions, inclusion, santé publique
              </p>
            </div>
            <Badge variant="outline" className="bg-background">
              BACK (Collectivité)
            </Badge>
          </div>
        </Card>

        {/* Informations territoire */}
        <Card className="mb-6 p-4 bg-muted/30">
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold text-muted-foreground">Territoire</p>
              <p className="text-lg font-bold">Saint-Étienne Métropole</p>
            </div>
            <div>
              <p className="font-semibold text-muted-foreground">Population cible</p>
              <p className="text-lg font-bold">12 500 enfants 3-18 ans</p>
            </div>
            <div>
              <p className="font-semibold text-muted-foreground">Structures partenaires</p>
              <p className="text-lg font-bold">24 organismes actifs</p>
            </div>
          </div>
        </Card>

        {/* Objectifs affichés */}
        <Card className="mb-6 p-4 border-l-4 border-l-primary">
          <p className="font-semibold mb-2">🎯 Objectifs de la collectivité</p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">✓ Inclusion sociale : Toucher 30% d'enfants QPV</p>
              <p className="text-muted-foreground">✓ Accessibilité : 15% d'enfants en situation de handicap</p>
            </div>
            <div>
              <p className="text-muted-foreground">✓ Santé publique : 120 min/semaine d'activité physique</p>
              <p className="text-muted-foreground">✓ Mobilité durable : 40% de transports doux/collectifs</p>
            </div>
          </div>
        </Card>

        {/* Dashboard principal */}
        <CollectiviteDashboardContent territoryId={mockTerritoryId} />

        {/* Données disponibles */}
        <Card className="mt-8 p-6">
          <h3 className="font-bold text-lg mb-4">📊 Données disponibles pour la collectivité</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="font-semibold mb-2">Indicateurs d'impact social</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Nombre d'inscriptions totales</li>
                <li>• % enfants en situation de handicap</li>
                <li>• % enfants issus de Quartiers Prioritaires (QPV)</li>
                <li>• Taux de complétion des profils familiaux</li>
                <li>• Répartition par tranche d'âge</li>
                <li>• Répartition par catégorie socio-économique (QF)</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-2">Indicateurs d'activité</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Nombre d'activités disponibles par catégorie</li>
                <li>• Top 10 activités les plus demandées</li>
                <li>• Taux de remplissage par structure</li>
                <li>• Couverture géographique (carte de chaleur)</li>
                <li>• Nombre de créneaux disponibles</li>
                <li>• Taux de participation effective (vs réservations)</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-2">Indicateurs financiers</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Total simulations d'aides effectuées</li>
                <li>• Montant total des aides potentielles</li>
                <li>• Reste à charge moyen par famille</li>
                <li>• Budget engagé par la collectivité</li>
                <li>• Utilisation du Pass'Sport national</li>
                <li>• Taux de recours aux aides (vs non-recours)</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-2">Indicateurs santé & mobilité</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Minutes d'activité physique/semaine (moyenne)</li>
                <li>• Répartition par mode de transport utilisé</li>
                <li>• CO₂ économisé (vs trajets en voiture)</li>
                <li>• Utilisation du covoiturage</li>
                <li>• Distance moyenne domicile-activité</li>
                <li>• Impact santé publique estimé</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Exports disponibles */}
        <Card className="mt-6 p-6 bg-muted/30">
          <h3 className="font-bold text-lg mb-4">💾 Exports & Rapports</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-2">Formats disponibles</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Excel (.xlsx)</li>
                <li>• CSV</li>
                <li>• PDF (rapport)</li>
                <li>• JSON (API)</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">Périodicité</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Temps réel</li>
                <li>• Hebdomadaire</li>
                <li>• Mensuel</li>
                <li>• Annuel</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">Conformité RGPD</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Données agrégées uniquement</li>
                <li>• Anonymisation automatique</li>
                <li>• Pas de données nominatives</li>
                <li>• Hébergement France (UE)</li>
              </ul>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
