import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FinanceurDashboardContent from "../dashboard-content/FinanceurDashboardContent";

export default function DemoFinanceur() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Bannière démo */}
        <Card className="mb-6 p-4 bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg">💰 Démo - Dashboard Partenaire Financier</p>
              <p className="text-sm text-muted-foreground">
                Suivi des aides distribuées : ROI, bénéficiaires, impact territorial
              </p>
            </div>
            <Badge variant="outline" className="bg-background">
              BACK (Financeur)
            </Badge>
          </div>
        </Card>

        {/* Informations partenaire */}
        <Card className="mb-6 p-4 bg-muted/30">
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold text-muted-foreground">Partenaire</p>
              <p className="text-lg font-bold">CAF Loire</p>
            </div>
            <div>
              <p className="font-semibold text-muted-foreground">Type d'aide</p>
              <p className="text-lg font-bold">Aide vacances + QF</p>
            </div>
            <div>
              <p className="font-semibold text-muted-foreground">Budget annuel alloué</p>
              <p className="text-lg font-bold">250 000 €</p>
            </div>
          </div>
        </Card>

        {/* Objectifs affichés */}
        <Card className="mb-6 p-4 border-l-4 border-l-accent">
          <p className="font-semibold mb-2">🎯 Objectifs du partenaire financier</p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">✓ Maximiser le taux de recours aux aides (réduire le non-recours)</p>
              <p className="text-muted-foreground">✓ Toucher 80% des familles éligibles dans les QPV</p>
            </div>
            <div>
              <p className="text-muted-foreground">✓ Mesurer l'impact social : nombre de départs en vacances</p>
              <p className="text-muted-foreground">✓ Optimiser le budget : cibler les familles prioritaires</p>
            </div>
          </div>
        </Card>

        {/* Dashboard principal */}
        <FinanceurDashboardContent />

        {/* Données disponibles */}
        <Card className="mt-8 p-6">
          <h3 className="font-bold text-lg mb-4">📊 Données disponibles pour le partenaire financier</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="font-semibold mb-2">Indicateurs d'utilisation des aides</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Nombre de simulations d'aides effectuées</li>
                <li>• Nombre de demandes d'aides validées</li>
                <li>• Montant total des aides distribuées</li>
                <li>• Montant moyen par bénéficiaire</li>
                <li>• Taux d'utilisation du budget alloué (%)</li>
                <li>• Évolution mensuelle des demandes</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-2">Profil des bénéficiaires</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Nombre de familles bénéficiaires</li>
                <li>• Répartition par Quotient Familial (QF)</li>
                <li>• % bénéficiaires issus de QPV</li>
                <li>• Répartition par territoire/commune</li>
                <li>• Nombre d'enfants concernés</li>
                <li>• Typologie des familles (monoparentales, etc.)</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-2">Impact territorial</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Couverture géographique (carte interactive)</li>
                <li>• Nombre de territoires couverts</li>
                <li>• Taux de recours par territoire</li>
                <li>• Zones de non-recours identifiées</li>
                <li>• Structures partenaires utilisant l'aide</li>
                <li>• Activités financées par catégorie</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-2">ROI & Impact social</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Nombre d'enfants ayant accédé à une activité grâce à l'aide</li>
                <li>• Coût par enfant bénéficiaire</li>
                <li>• Taux de satisfaction des familles (optionnel)</li>
                <li>• Nombre de départs en vacances facilités</li>
                <li>• Impact santé : minutes d'activité physique générées</li>
                <li>• Comparaison avec objectifs annuels</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Cas d'usage spécifiques */}
        <Card className="mt-6 p-6 bg-gradient-to-br from-accent/5 to-accent/10">
          <h3 className="font-bold text-lg mb-4">💡 Cas d'usage pour les partenaires financiers</h3>
          <div className="space-y-4">
            <div className="p-4 bg-background rounded-lg">
              <p className="font-semibold mb-2">1. CAF (Caisse d'Allocations Familiales)</p>
              <p className="text-sm text-muted-foreground">
                → Suit l'utilisation de ses aides vacances (montant, QF, territoires)
                <br />
                → Identifie les zones de non-recours pour ajuster sa communication
                <br />
                → Mesure l'impact social : nombre de départs en vacances effectifs
              </p>
            </div>

            <div className="p-4 bg-background rounded-lg">
              <p className="font-semibold mb-2">2. Ministère des Sports (Pass'Sport)</p>
              <p className="text-sm text-muted-foreground">
                → Suivi national/régional de l'utilisation du Pass'Sport
                <br />
                → Nombre d'enfants bénéficiaires par département
                <br />
                → Catégories d'activités sportives les plus plébiscitées
              </p>
            </div>

            <div className="p-4 bg-background rounded-lg">
              <p className="font-semibold mb-2">3. Fondations privées (Decathlon, Orange, etc.)</p>
              <p className="text-sm text-muted-foreground">
                → Reporting précis sur l'utilisation du budget alloué
                <br />
                → Profil détaillé des bénéficiaires (QPV, handicap, monoparentalité)
                <br />
                → ROI social : nombre d'enfants ayant accédé au sport grâce au financement
              </p>
            </div>

            <div className="p-4 bg-background rounded-lg">
              <p className="font-semibold mb-2">4. Conseils Départementaux/Régionaux</p>
              <p className="text-sm text-muted-foreground">
                → Vision globale de l'impact des aides locales
                <br />
                → Croisement avec données nationales (CAF, Pass'Sport)
                <br />
                → Pilotage budgétaire : ajuster les enveloppes par territoire
              </p>
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
                <li>• Excel (.xlsx) avec graphiques</li>
                <li>• CSV (données brutes)</li>
                <li>• PDF (rapport exécutif)</li>
                <li>• API REST (intégration SI)</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">Périodicité</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Temps réel (dashboard live)</li>
                <li>• Hebdomadaire (alertes budget)</li>
                <li>• Mensuel (rapport détaillé)</li>
                <li>• Annuel (bilan d'impact)</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">Conformité & Sécurité</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Données agrégées (anonymes)</li>
                <li>• Pas de données nominatives</li>
                <li>• Accès sécurisé (MFA + audit logs)</li>
                <li>• Hébergement certifié France</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Avantages plateforme */}
        <Card className="mt-6 p-6 border-2 border-accent/20">
          <h3 className="font-bold text-lg mb-4">✨ Avantages pour les financeurs</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-2 text-accent">🎯 Transparence & Pilotage</p>
              <ul className="text-muted-foreground space-y-1">
                <li>✓ Suivi en temps réel de l'utilisation du budget</li>
                <li>✓ Visibilité sur les bénéficiaires réels (pas d'estimation)</li>
                <li>✓ Identification rapide des zones de non-recours</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2 text-accent">📊 Reporting automatisé</p>
              <ul className="text-muted-foreground space-y-1">
                <li>✓ Rapports mensuels générés automatiquement</li>
                <li>✓ Graphiques et KPIs prêts à présenter</li>
                <li>✓ Export Excel/PDF en 1 clic</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2 text-accent">🤝 Collaboration multi-acteurs</p>
              <ul className="text-muted-foreground space-y-1">
                <li>✓ Cumul d'aides automatique (CAF + Pass'Sport + locale)</li>
                <li>✓ Évite les doublons et erreurs manuelles</li>
                <li>✓ Coordination entre financeurs simplifiée</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2 text-accent">💡 Impact mesuré</p>
              <ul className="text-muted-foreground space-y-1">
                <li>✓ Nombre d'enfants réellement inscrits (pas de simulation)</li>
                <li>✓ Taux de participation effective aux activités</li>
                <li>✓ ROI social calculé (coût par bénéficiaire)</li>
              </ul>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
