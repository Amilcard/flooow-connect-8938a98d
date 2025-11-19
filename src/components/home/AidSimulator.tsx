/**
 * LOT A - Simulateur d'aides sur la page d'accueil
 * Permet de simuler le montant d'aide selon QF et prix activité
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { calculerAidesParActivite, BAREME_AIDES } from '@/utils/aidesCalculator';

export const AidSimulator = () => {
  const navigate = useNavigate();
  const [qf, setQf] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [prix, setPrix] = useState<string>('');
  const [resultat, setResultat] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSimuler = () => {
    const qfNum = parseFloat(qf);
    const ageNum = parseInt(age);
    const prixNum = parseFloat(prix);

    // Validation simple
    if (!qfNum || !ageNum || !prixNum || qfNum < 0 || ageNum < 0 || prixNum < 0) {
      return;
    }

    const calcul = calculerAidesParActivite(prixNum, qfNum, ageNum);
    setResultat(calcul);
    setShowResult(true);
  };

  const handleReset = () => {
    setQf('');
    setAge('');
    setPrix('');
    setResultat(null);
    setShowResult(false);
  };

  return (
    <section className="py-8">
      <Card className="border-2 border-primary/20 shadow-lg bg-gradient-to-br from-white to-primary/5">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3 p-3 rounded-full bg-primary/10 w-fit">
            <Calculator className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Simulateur d'aides
          </CardTitle>
          <CardDescription className="text-base">
            Estimez instantanément le montant d'aide pour une activité
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!showResult ? (
            <>
              {/* Formulaire */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qf" className="text-sm font-medium">
                    Quotient Familial (QF)
                  </Label>
                  <Input
                    id="qf"
                    type="number"
                    placeholder="Ex: 650"
                    value={qf}
                    onChange={(e) => setQf(e.target.value)}
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    En euros
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age" className="text-sm font-medium">
                    Âge de l'enfant
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Ex: 10"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min="3"
                    max="25"
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    Entre 3 et 25 ans
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prix" className="text-sm font-medium">
                    Prix de l'activité
                  </Label>
                  <Input
                    id="prix"
                    type="number"
                    placeholder="Ex: 150"
                    value={prix}
                    onChange={(e) => setPrix(e.target.value)}
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    En euros
                  </p>
                </div>
              </div>

              {/* Bouton simuler */}
              <div className="flex justify-center pt-2">
                <Button
                  onClick={handleSimuler}
                  disabled={!qf || !age || !prix}
                  size="lg"
                  className="px-8 bg-primary hover:bg-primary/90"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Simuler mon aide
                </Button>
              </div>

              {/* Barème d'aides info */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Barème des aides
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(BAREME_AIDES).map(([key, tranche]) => (
                    <div key={key} className="text-center p-2 bg-white rounded border">
                      <p className="text-xs text-muted-foreground mb-1">{tranche.label}</p>
                      <p className="text-sm font-bold text-primary">
                        {tranche.montant > 0 ? `${tranche.montant}€` : 'Aucune'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Résultat */}
              <div className="space-y-4">
                {/* Carte résultat principal */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
                  <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Aide estimée</p>
                    <p className="text-5xl font-bold text-green-600 mb-1">
                      {resultat.montantAide}€
                    </p>
                    <Badge variant="secondary" className="text-sm">
                      {resultat.trancheQF.replace('TRANCHE_', 'Tranche ')}
                    </Badge>
                  </div>

                  {/* Détails */}
                  <div className="grid grid-cols-3 gap-3 mt-6">
                    <div className="bg-white p-3 rounded-lg border text-center">
                      <p className="text-xs text-muted-foreground mb-1">Prix initial</p>
                      <p className="text-lg font-semibold">{resultat.prixInitial}€</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border text-center">
                      <p className="text-xs text-muted-foreground mb-1">Aide</p>
                      <p className="text-lg font-semibold text-green-600">-{resultat.montantAide}€</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border text-center">
                      <p className="text-xs text-muted-foreground mb-1">Reste à charge</p>
                      <p className="text-lg font-semibold text-primary">{resultat.resteACharge}€</p>
                    </div>
                  </div>

                  {/* Pourcentage d'économie */}
                  {resultat.pourcentageEconomie > 0 && (
                    <div className="mt-4 p-3 bg-white rounded-lg border text-center">
                      <p className="text-sm text-muted-foreground">
                        Vous économisez{' '}
                        <span className="font-bold text-green-600 text-lg">
                          {resultat.pourcentageEconomie}%
                        </span>
                        {' '}sur cette activité
                      </p>
                    </div>
                  )}

                  {/* Message */}
                  <p className="mt-4 text-center text-sm text-muted-foreground italic">
                    {resultat.message}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="flex-1"
                  >
                    Nouvelle simulation
                  </Button>
                  <Button
                    onClick={() => navigate('/signup')}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    Créer mon compte
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {/* Info complémentaire */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-center text-muted-foreground">
                    💡 Créez votre compte pour bénéficier automatiquement de ces aides lors de vos inscriptions
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
};
