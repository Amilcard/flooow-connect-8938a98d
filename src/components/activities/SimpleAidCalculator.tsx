/**
 * LOT A - Calculateur d'aides simplifié basé sur QF
 * Pour l'onglet Tarifs de la page détail activité
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, TrendingUp, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { calculerAidesParActivite, BAREME_AIDES } from '@/utils/aidesCalculator';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  activityPrice: number;
  userProfile?: {
    quotient_familial?: number;
  };
}

export const SimpleAidCalculator = ({ activityPrice, userProfile }: Props) => {
  const { toast } = useToast();
  const [qf, setQf] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [resultat, setResultat] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();
  }, []);

  // Pré-remplir le QF depuis le profil
  useEffect(() => {
    if (userProfile?.quotient_familial && !qf) {
      setQf(userProfile.quotient_familial.toString());
    }
  }, [userProfile, qf]);

  const handleCalculer = () => {
    const qfNum = parseFloat(qf);
    const ageNum = parseInt(age);

    // Validation
    if (!qfNum || !ageNum || qfNum < 0 || ageNum < 0) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez renseigner le QF et l'âge de l'enfant",
        variant: "destructive"
      });
      return;
    }

    const calcul = calculerAidesParActivite(activityPrice, qfNum, ageNum);
    setResultat(calcul);
    setShowResult(true);

    toast({
      title: "Aide calculée",
      description: `Vous économisez ${calcul.montantAide}€ sur cette activité`,
    });
  };

  const handleReset = () => {
    setQf(userProfile?.quotient_familial?.toString() || '');
    setAge('');
    setResultat(null);
    setShowResult(false);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          Calculateur d'aides
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {!showResult ? (
          <>
            {/* Formulaire */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qf">Quotient Familial (QF)</Label>
                <Input
                  id="qf"
                  type="number"
                  placeholder="Ex: 650"
                  value={qf}
                  onChange={(e) => setQf(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {userProfile?.quotient_familial
                    ? "Pré-rempli depuis votre profil"
                    : "En euros"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Âge de l'enfant</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Ex: 10"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="3"
                  max="25"
                />
                <p className="text-xs text-muted-foreground">
                  Entre 3 et 25 ans
                </p>
              </div>
            </div>

            {/* Bouton calculer */}
            <Button
              onClick={handleCalculer}
              disabled={!qf || !age}
              className="w-full"
              size="lg"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calculer mon aide
            </Button>

            {/* Info barème */}
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold text-sm">Barème des aides :</p>
                  <ul className="text-xs space-y-1">
                    {Object.entries(BAREME_AIDES).map(([key, tranche]) => (
                      <li key={key}>
                        • {tranche.label} : <strong>{tranche.montant > 0 ? `${tranche.montant}€` : 'Aucune aide'}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            {/* CTA pour non-connectés */}
            {!isLoggedIn && (
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-sm">
                  💡 Créez un compte pour sauvegarder votre QF et calculer automatiquement vos aides
                </AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <>
            {/* Résultat */}
            <div className="space-y-4">
              {/* Aide principale */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200 text-center">
                <p className="text-sm text-muted-foreground mb-2">Aide Flooow</p>
                <p className="text-5xl font-bold text-green-600 mb-2">
                  {resultat.montantAide}€
                </p>
                <Badge variant="secondary">
                  {resultat.trancheQF.replace('TRANCHE_', 'Tranche ')}
                </Badge>
              </div>

              {/* Détails du calcul */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted p-3 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Prix initial</p>
                  <p className="text-lg font-semibold">{resultat.prixInitial}€</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center border border-green-200">
                  <p className="text-xs text-muted-foreground mb-1">Aide</p>
                  <p className="text-lg font-semibold text-green-600">-{resultat.montantAide}€</p>
                </div>
                <div className="bg-primary/5 p-3 rounded-lg text-center border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1">Reste à charge</p>
                  <p className="text-lg font-semibold text-primary">{resultat.resteACharge}€</p>
                </div>
              </div>

              {/* Pourcentage d'économie */}
              {resultat.pourcentageEconomie > 0 && (
                <Alert className="bg-green-50 border-green-200">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-sm">
                    Vous économisez{' '}
                    <strong className="text-green-600 text-lg">{resultat.pourcentageEconomie}%</strong>
                    {' '}sur cette activité
                  </AlertDescription>
                </Alert>
              )}

              {/* Message */}
              <p className="text-center text-sm text-muted-foreground italic">
                {resultat.message}
              </p>

              {/* Bouton reset */}
              <Button
                variant="outline"
                onClick={handleReset}
                className="w-full"
              >
                Nouvelle simulation
              </Button>

              {/* Info */}
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription className="text-xs">
                  {isLoggedIn
                    ? "Cette aide sera automatiquement appliquée lors de votre inscription"
                    : "Créez un compte pour bénéficier de cette aide lors de votre inscription"}
                </AlertDescription>
              </Alert>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
