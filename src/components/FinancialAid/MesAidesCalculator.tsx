/**
 * LOT A - Calculateur d'aides personnalisé (refactorisé selon spec)
 * Affiche les aides calculées basées sur le QF et les activités inscrites
 * Utilise la fonction pure calculateEstimatedAid
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Euro, TrendingUp, Users, AlertCircle, Settings, Baby, Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { calculateEstimatedAid, QF_BRACKETS } from '@/utils/aidesCalculator';

interface ChildWithActivities {
  id: string;
  prenom: string;
  age: number;
  activites: Array<{
    id: string;
    titre: string;
    prix: number;
  }>;
}

interface AidesCalculees {
  montantTotal: number;
  nombreActivites: number;
  aidesParEnfant: Array<{
    enfantId: string;
    nom: string;
    age: number;
    montantTotal: number;
    nbActivites: number;
  }>;
  trancheQF: string;
}

export const MesAidesCalculator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [qf, setQf] = useState<number | null>(null);
  const [enfantsAvecActivites, setEnfantsAvecActivites] = useState<ChildWithActivities[]>([]);
  const [aidesCalculees, setAidesCalculees] = useState<AidesCalculees | null>(null);

  useEffect(() => {
    if (user) {
      calculerMesAides();
    }
  }, [user]);

  const calculerMesAides = async () => {
    setLoading(true);
    try {
      // 1. Récupérer le QF du profil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('quotient_familial')
        .eq('id', user!.id)
        .maybeSingle();

      if (profileError) throw profileError;

      const quotientFamilial = profile?.quotient_familial || null;
      setQf(quotientFamilial);

      // Si pas de QF configuré, on arrête ici
      if (!quotientFamilial) {
        setLoading(false);
        return;
      }

      // 2. Récupérer les enfants
      const { data: children, error: childrenError } = await supabase
        .from('children')
        .select('id, first_name, dob')
        .eq('user_id', user!.id);

      if (childrenError) throw childrenError;

      if (!children || children.length === 0) {
        setLoading(false);
        return;
      }

      // 3. Pour chaque enfant, récupérer ses réservations confirmées avec les activités
      const enfantsData: ChildWithActivities[] = await Promise.all(
        children.map(async (child) => {
          // Calculer l'âge
          const birthDate = new Date(child.dob);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }

          // Récupérer les réservations confirmées
          const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select(`
              id,
              base_price_cents,
              activity_id,
              activities (
                id,
                title
              )
            `)
            .eq('child_id', child.id)
            .eq('status', 'validee');

          if (bookingsError) {
            console.error('Erreur bookings:', bookingsError);
            return {
              id: child.id,
              prenom: child.first_name,
              age,
              activites: []
            };
          }

          const activites = (bookings || []).map((booking: any) => ({
            id: booking.activity_id,
            titre: booking.activities?.title || 'Activité',
            prix: booking.base_price_cents / 100 // Convertir centimes en euros
          }));

          return {
            id: child.id,
            prenom: child.first_name,
            age,
            activites
          };
        })
      );

      setEnfantsAvecActivites(enfantsData);

      // 4. Calculer les aides avec la fonction pure calculateEstimatedAid
      let totalAides = 0;
      let totalActivites = 0;
      let trancheQF = '';
      const aidesParEnfant: Array<{
        enfantId: string;
        nom: string;
        age: number;
        montantTotal: number;
        nbActivites: number;
      }> = [];

      enfantsData.forEach(enfant => {
        let aidesEnfant = 0;
        const nbActivitesEnfant = enfant.activites.length;

        enfant.activites.forEach(activite => {
          const calcul = calculateEstimatedAid({
            quotientFamilial,
            age: enfant.age,
            prixActivite: activite.prix
          });
          aidesEnfant += calcul.montantAide;
          if (!trancheQF) trancheQF = calcul.trancheQF; // Garder la tranche
        });

        aidesParEnfant.push({
          enfantId: enfant.id,
          nom: enfant.prenom,
          age: enfant.age,
          montantTotal: aidesEnfant,
          nbActivites: nbActivitesEnfant
        });

        totalAides += aidesEnfant;
        totalActivites += nbActivitesEnfant;
      });

      setAidesCalculees({
        montantTotal: totalAides,
        nombreActivites: totalActivites,
        aidesParEnfant,
        trancheQF
      });

    } catch (error) {
      console.error('Erreur lors du calcul des aides:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cas de chargement
  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="py-8 text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-2 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Calcul de vos aides personnalisées...</p>
        </CardContent>
      </Card>
    );
  }

  // Cas 1 : Pas de QF configuré
  if (qf === null) {
    return (
      <Card className="mb-6 border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Configurez votre Quotient Familial
          </CardTitle>
          <CardDescription>
            Pour bénéficier du calcul automatique de vos aides, renseignez votre QF dans votre profil.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="default"
            className="w-full bg-amber-600 hover:bg-amber-700"
            onClick={() => navigate('/mon-compte/profil-eligibilite')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Renseigner mon QF
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Cas 2 : QF configuré mais aucune activité inscrite
  if (enfantsAvecActivites.every(e => e.activites.length === 0)) {
    // Calculer la tranche pour affichage
    const dummyCalc = calculateEstimatedAid({ quotientFamilial: qf, age: 10, prixActivite: 100 });

    return (
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Baby className="w-5 h-5 text-blue-600" />
            Aucune activité inscrite
          </CardTitle>
          <CardDescription>
            Votre QF est configuré ({qf}€), mais aucune activité n'est inscrite pour vos enfants.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-white rounded-lg border">
            <p className="text-sm font-medium mb-1">Votre tranche d'aide</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                QF {dummyCalc.trancheQF}
              </span>
              <Badge variant="secondary">
                {dummyCalc.montantAide > 0 ? `${dummyCalc.montantAide}€/activité` : 'Aucune aide'}
              </Badge>
            </div>
          </div>
          <Button
            variant="default"
            className="w-full"
            onClick={() => navigate('/activities')}
          >
            Découvrir les activités
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Cas 3 : QF + activités = affichage du calcul
  if (!aidesCalculees) return null;

  return (
    <div className="mb-6 space-y-4">
      {/* Carte récapitulative */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Euro className="w-5 h-5 text-green-600" />
              Vos aides calculées
            </span>
            <Badge variant="secondary" className="text-base px-3 py-1">
              {aidesCalculees.montantTotal}€
            </Badge>
          </CardTitle>
          <CardDescription>
            Basé sur votre QF de {qf}€ et {aidesCalculees.nombreActivites} activité{aidesCalculees.nombreActivites > 1 ? 's' : ''} inscrite{aidesCalculees.nombreActivites > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-xs text-muted-foreground mb-1">Total économisé</p>
              <p className="text-2xl font-bold text-green-600">{aidesCalculees.montantTotal}€</p>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-xs text-muted-foreground mb-1">Activités</p>
              <p className="text-2xl font-bold text-primary">{aidesCalculees.nombreActivites}</p>
            </div>
          </div>

          {/* Détail par enfant */}
          <div className="bg-white p-4 rounded-lg border space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Users className="w-4 h-4" />
              Détail par enfant
            </h4>
            {aidesCalculees.aidesParEnfant.map((enfantAide) => (
              <div key={enfantAide.enfantId} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-sm">{enfantAide.nom}</p>
                  <p className="text-xs text-muted-foreground">
                    {enfantAide.age} ans • {enfantAide.nbActivites} activité{enfantAide.nbActivites > 1 ? 's' : ''}
                  </p>
                </div>
                <Badge variant="outline" className="font-semibold">
                  {enfantAide.montantTotal}€
                </Badge>
              </div>
            ))}
          </div>

          {/* Tranche applicable */}
          <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-primary">
                  Tranche QF {aidesCalculees.trancheQF}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Les montants ci-dessus sont automatiquement déduits lors de vos inscriptions
                </p>
              </div>
            </div>
          </div>

          {/* Message d'avertissement légal (spec) */}
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-xs text-blue-900">
              <strong>Montant estimé selon votre quotient familial.</strong> Le montant réel pourra varier selon les dispositifs locaux.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
