/**
 * LOT A - Simulateur d'aides sur la page d'accueil
 * 
 * MIGRATION P0-2: Utilise useAidCalculation (RPC Supabase) au lieu de calcul TS local
 * 
 * @version 2.0.0 - Migration RPC
 * @date 2026-01-08
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, TrendingUp, Sparkles, ArrowRight, Info, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAidCalculation, AID_DISPLAY_BRACKETS, getQFBracketLabel } from '@/hooks/useAidCalculation';

interface SimulationResult {
  montantAide: number;
  prixInitial: number;
  resteACharge: number;
  pourcentageEconomie: number;
  trancheQF: string;
  message: string;
}

export const AidSimulator = () => {
  const navigate = useNavigate();
  const { calculate, loading } = useAidCalculation();
  
  const [qf, setQf] = useState('');
  const [age, setAge] = useState('');
  const [prix, setPrix] = useState('');
  const [resultat, setResultat] = useState<SimulationResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSimuler = async () => {
    const qfNum = Number.parseFloat(qf);
    const ageNum = Number.parseInt(age, 10);
    const prixNum = Number.parseFloat(prix);

    // Validation simple
    if (!qfNum || !ageNum || !prixNum || qfNum < 0 || ageNum < 0 || prixNum < 0) {
      return;
    }

    // Appel RPC via hook
    const result = await calculate({
      price: prixNum,
      priceType: 'scolaire', // Par défaut pour simulateur générique
      quotientFamilial: qfNum,
      externalAidEuros: 0,
    });

    if (result) {
      const trancheLabel = getQFBracketLabel(qfNum);
      const message = result.totalAidEuros > 0
        ? `Profil QF ${trancheLabel} : aide estimée ${result.totalAidEuros} €`
        : "Aucune aide disponible pour ces critères";

      setResultat({
        montantAide: result.totalAidEuros,
        prixInitial: prixNum,
        resteACharge: result.remainingEuros,
        pourcentageEconomie: result.aidPercentage,
        trancheQF: trancheLabel,
        message
      });
      setShowResult(true);
    }
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
                  disabled={!qf || !age || !prix || loading}
                  size="lg"
                  className="px-8 bg-primary hover:bg-primary/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Calcul en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Simuler mon aide
                    </>
                  )}
                </Button>
              </div>

              {/* Barème d'aides info - NOUVELLES TRANCHES */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Tranches de Quotient Familial
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {AID_DISPLAY_BRACKETS.map((bracket, index) => (
                    <div key={index} className="text-center p-2 bg-white rounded border">
                      <p className="text-xs text-muted-foreground mb-1">
                        {bracket.label}
                      </p>
                      <p className="text-sm font-bold text-primary">
                        {bracket.description}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3 italic">
                  Le montant de l'aide varie selon le prix de l'activité et votre QF.
                </p>
              </div>

              {/* Message d'avertissement légal */}
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-xs text-blue-900">
                  <strong>Montant estimé selon votre quotient familial.</strong> Le montant réel pourra varier selon les dispositifs locaux.
                </AlertDescription>
              </Alert>
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
                      {resultat?.montantAide}€
                    </p>
                    <Badge variant="secondary" className="text-sm">
                      Tranche QF {resultat?.trancheQF}
                    </Badge>
                  </div>

                  {/* Détails */}
                  <div className="grid grid-cols-3 gap-3 mt-6">
                    <div className="bg-white p-3 rounded-lg border text-center">
                      <p className="text-xs text-muted-foreground mb-1">Prix initial</p>
                      <p className="text-lg font-semibold">{resultat?.prixInitial}€</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border text-center">
                      <p className="text-xs text-muted-foreground mb-1">Aide</p>
                      <p className="text-lg font-semibold text-green-600">-{resultat?.montantAide}€</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border text-center">
                      <p className="text-xs text-muted-foreground mb-1">Reste à charge</p>
                      <p className="text-lg font-semibold text-primary">{resultat?.resteACharge}€</p>
                    </div>
                  </div>

                  {/* Pourcentage d'économie */}
                  {resultat && resultat.pourcentageEconomie > 0 && (
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
                    {resultat?.message}
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

                {/* Message d'avertissement légal */}
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-xs text-blue-900">
                    <strong>Montant estimé selon votre quotient familial.</strong> Le montant réel pourra varier selon les dispositifs locaux. Créez votre compte pour bénéficier automatiquement de ces aides lors de vos inscriptions.
                  </AlertDescription>
                </Alert>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
};
