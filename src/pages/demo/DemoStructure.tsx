import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StructureDashboardContent from "../dashboard-content/StructureDashboardContent";

export default function DemoStructure() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Bannière démo */}
        <Card className="mb-6 p-4 bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg">🏢 Démo - Dashboard Structure Partenaire</p>
              <p className="text-sm text-muted-foreground">
                Gestion des activités : Créneaux, réservations, participants
              </p>
            </div>
            <Badge variant="outline" className="bg-background">
              PARTENAIRE (Structure)
            </Badge>
          </div>
        </Card>

        {/* Informations structure */}
        <Card className="mb-6 p-4 bg-muted/30">
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold text-muted-foreground">Structure</p>
              <p className="text-lg font-bold">Association Jungle Attitude</p>
            </div>
            <div>
              <p className="font-semibold text-muted-foreground">Type</p>
              <p className="text-lg font-bold">Association sportive</p>
            </div>
            <div>
              <p className="font-semibold text-muted-foreground">Activités proposées</p>
              <p className="text-lg font-bold">12 activités actives</p>
            </div>
          </div>
        </Card>

        {/* Rôle de la structure */}
        <Card className="mb-6 p-4 border-l-4 border-l-green-500">
          <p className="font-semibold mb-2">🎯 Rôle de la structure partenaire</p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">✓ Créer et gérer ses activités (sports, loisirs, culture)</p>
              <p className="text-muted-foreground">✓ Définir les créneaux horaires et places disponibles</p>
            </div>
            <div>
              <p className="text-muted-foreground">✓ Voir les réservations en temps réel</p>
              <p className="text-muted-foreground">✓ Valider la présence des participants</p>
            </div>
          </div>
        </Card>

        {/* Dashboard principal */}
        <StructureDashboardContent />

        {/* Fonctionnalités disponibles */}
        <Card className="mt-8 p-6">
          <h3 className="font-bold text-lg mb-4">🛠️ Fonctionnalités pour les structures</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="font-semibold mb-2">Gestion des activités</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Créer une nouvelle activité (sport, culture, loisirs)</li>
                <li>• Définir le prix, la tranche d'âge, les documents requis</li>
                <li>• Indiquer les critères d'accessibilité (INCLUSIVITÉ, handicaps)</li>
                <li>• Ajouter photos et description détaillée</li>
                <li>• Publier/dépublier les activités</li>
                <li>• Modifier les informations à tout moment</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-2">Gestion des créneaux</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Créer des créneaux horaires (date, heure début/fin)</li>
                <li>• Définir le nombre de places disponibles</li>
                <li>• Gérer les places restantes en temps réel</li>
                <li>• Dupliquer des créneaux (séries)</li>
                <li>• Annuler un créneau si nécessaire</li>
                <li>• Voir l'historique des créneaux passés</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-2">Suivi des réservations</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Liste complète des réservations (en attente, validées, annulées)</li>
                <li>• Voir les informations enfant (prénom, âge, allergies, handicaps)</li>
                <li>• Accéder aux coordonnées des parents</li>
                <li>• Télécharger les documents justificatifs</li>
                <li>• Statistiques : taux de remplissage, no-show, etc.</li>
                <li>• Export Excel pour gestion interne</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-2">Validation présence</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Confirmer la présence effective d'un enfant</li>
                <li>• Signaler les absences non justifiées</li>
                <li>• Historique de participation par enfant</li>
                <li>• Calcul automatique du taux de no-show</li>
                <li>• Notification automatique aux parents</li>
                <li>• Données utilisées pour les KPIs collectivité</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Modèle économique */}
        <Card className="mt-6 p-6 bg-gradient-to-br from-green-500/5 to-green-600/10">
          <h3 className="font-bold text-lg mb-4">💡 Modèle économique pour les structures</h3>
          <div className="space-y-4">
            <div className="p-4 bg-background rounded-lg">
              <p className="font-semibold mb-2">🆓 Utilisation GRATUITE de la plateforme</p>
              <p className="text-sm text-muted-foreground">
                Les structures partenaires (clubs, associations, centres de loisirs) utilisent la plateforme <strong>sans frais</strong>.
                <br />
                Ils bénéficient d'un outil de gestion moderne et d'une visibilité accrue auprès des familles.
              </p>
            </div>

            <div className="p-4 bg-background rounded-lg">
              <p className="font-semibold mb-2">📈 Bénéfices pour les structures</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Visibilité augmentée : Référencement sur la plateforme publique</li>
                <li>✓ Simplification administrative : Gestion centralisée des inscriptions</li>
                <li>✓ Accès à de nouveaux publics : Familles bénéficiant d'aides financières</li>
                <li>✓ Réduction du no-show : Validation présence + notifications automatiques</li>
                <li>✓ Paiements facilités : Cumul automatique des aides (CAF, Pass'Sport, etc.)</li>
                <li>✓ Reporting : Statistiques d'activité pour leurs financeurs/tutelles</li>
              </ul>
            </div>

            <div className="p-4 bg-background rounded-lg">
              <p className="font-semibold mb-2">🔐 Sécurité & Conformité</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Accès sécurisé par identifiant + mot de passe</li>
                <li>✓ Visibilité uniquement sur leurs propres activités (isolation des données)</li>
                <li>✓ Pas d'accès aux données financières des familles (RGPD)</li>
                <li>✓ Documents justificatifs stockés de manière chiffrée</li>
                <li>✓ Historique des actions (audit trail)</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Distinction PARTENAIRE vs CLIENT */}
        <Card className="mt-6 p-6 bg-muted/30 border-2 border-green-500/20">
          <h3 className="font-bold text-lg mb-4">🔍 Structure = PARTENAIRE (pas CLIENT)</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-2 text-green-600">PARTENAIRES (Structures)</p>
              <ul className="text-muted-foreground space-y-1">
                <li>✓ Utilisent la plateforme <strong>gratuitement</strong></li>
                <li>✓ Proposent des activités (clubs, associations)</li>
                <li>✓ Gèrent les inscriptions et créneaux</li>
                <li>✓ Bénéficient de la visibilité</li>
                <li>✓ Exemples : Jungle Attitude, Club Omnisports, MJC, etc.</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2 text-blue-600">CLIENTS (payants)</p>
              <ul className="text-muted-foreground space-y-1">
                <li>✓ <strong>Collectivités locales</strong> : Commandent la plateforme</li>
                <li>✓ <strong>Financeurs</strong> : CAF, Pass'Sport, fondations, conseils départementaux</li>
                <li>✓ Accès aux dashboards KPIs et reporting</li>
                <li>✓ Pilotage territorial et suivi des aides</li>
                <li>✓ Paient un abonnement ou licence</li>
              </ul>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
