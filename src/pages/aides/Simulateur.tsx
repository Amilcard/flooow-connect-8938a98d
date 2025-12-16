import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Info,
  CreditCard,
  TrendingDown,
  Gift,
  Heart,
  ChevronDown
} from "lucide-react";
import { calculateAidFromQF, QF_AID_BRACKETS } from "@/utils/aidesCalculator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Générer les options d'âge 4-17 ans
const AGE_OPTIONS = Array.from({ length: 14 }, (_, i) => i + 4);

// Prix d'activité par défaut pour la simulation (période test)
const DEFAULT_ACTIVITY_PRICE = 60;

const Simulateur = () => {
  const navigate = useNavigate();

  // State du formulaire
  const [quotientFamilial, setQuotientFamilial] = useState("");
  const [ageEnfant, setAgeEnfant] = useState("");
  const [codePostal, setCodePostal] = useState("");
  const [prixActivite, setPrixActivite] = useState<string>(String(DEFAULT_ACTIVITY_PRICE));

  // State des résultats
  const [isLoading, setIsLoading] = useState(false);
  const [hasSimulated, setHasSimulated] = useState(false);
  const [calculationResult, setCalculationResult] = useState<{
    montantAide: number;
    montantAPayer: number;
    pourcentageEconomie: number;
    message: string;
  } | null>(null);

  // Validation et calcul
  const handleCalculate = () => {
    const qf = parseFloat(quotientFamilial);
    const age = parseInt(ageEnfant, 10);
    const cp = codePostal;
    const prix = parseFloat(prixActivite);

    // Validation
    if (!qf || qf < 0 || qf > 3000) {
      alert("Quotient Familial : entre 0 et 3000€");
      return;
    }

    if (!age || age < 4 || age > 17) {
      alert("Âge enfant : entre 4 et 17 ans");
      return;
    }

    if (!cp || !/^[0-9]{5}$/.test(cp)) {
      alert("Code postal : 5 chiffres requis");
      return;
    }

    if (!prix || prix < 0 || prix > 10000) {
      alert("Prix activité : entre 0 et 10000€");
      return;
    }

    setIsLoading(true);

    // Simulation de temps de calcul (500ms)
    setTimeout(() => {
      // Utiliser la fonction unifiée calculateAidFromQF avec prix saisi
      const aidResult = calculateAidFromQF({
        qf: qf,
        prixActivite: prix
      });

      // Générer un message informatif
      const message = aidResult.aide > 0
        ? `Profil QF ${aidResult.trancheQF} : aide estimée ${aidResult.aide} €`
        : "Aucune aide disponible pour ces critères";

      setCalculationResult({
        montantAide: aidResult.aide,
        montantAPayer: aidResult.resteACharge,
        pourcentageEconomie: aidResult.economiePourcent,
        message: message
      });

      setHasSimulated(true);
      setIsLoading(false);
    }, 500);
  };

  const resetSimulation = () => {
    setHasSimulated(false);
    setCalculationResult(null);
    // Réinitialiser aussi le prix par défaut
    setPrixActivite(String(DEFAULT_ACTIVITY_PRICE));
  };

  const isEligible = calculationResult && calculationResult.montantAide > 0;

  return (
    <PageLayout>
      <div className="container max-w-2xl px-4 py-6 space-y-6 pb-24">
        <BackButton positioning="relative" size="sm" showText={true} label="Retour" fallback="/aides" />

        {/* Header CityCrunch */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                On simule nos aides
              </h1>
              <p className="text-base text-muted-foreground">
                1 minute. Gratuit. On y a droit.
              </p>
            </div>
            <Badge className="bg-orange-500 text-white text-xs px-3 py-1.5 border-0 whitespace-nowrap">
              Stop au non-recours !
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground pb-2">
            On calcule. On économise. On respire.
          </p>
        </div>

        {/* Formulaire de simulation */}
        {!hasSimulated ? (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Nos infos</h2>
            <div className="space-y-4">
              {/* Champ 1: Quotient Familial */}
              <div className="space-y-2">
                <Label htmlFor="qf" className="text-sm font-medium">
                  Quotient Familial (€)
                </Label>
                <Input
                  id="qf"
                  type="number"
                  placeholder="Ex: 650"
                  value={quotientFamilial}
                  onChange={(e) => setQuotientFamilial(e.target.value)}
                  min="0"
                  max="3000"
                  className="w-full"
                />
                <div className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Sur avis CAF ou impôts
                  </p>
                </div>
              </div>

              {/* Champ 2: Âge enfant */}
              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm font-medium">
                  Âge enfant
                </Label>
                <Select value={ageEnfant} onValueChange={setAgeEnfant}>
                  <SelectTrigger id="age">
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    {AGE_OPTIONS.map(age => (
                      <SelectItem key={age} value={String(age)}>
                        {age} ans
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Champ 3: Code postal */}
              <div className="space-y-2">
                <Label htmlFor="cp" className="text-sm font-medium">
                  Code postal
                </Label>
                <Input
                  id="cp"
                  type="text"
                  placeholder="42000"
                  value={codePostal}
                  onChange={(e) => setCodePostal(e.target.value)}
                  maxLength={5}
                  pattern="[0-9]{5}"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Pour aides locales
                </p>
              </div>

              {/* Champ 4: Prix activité (nouveau) */}
              <div className="space-y-2">
                <Label htmlFor="prix" className="text-sm font-medium">
                  Prix activité (€)
                </Label>
                <Input
                  id="prix"
                  type="number"
                  placeholder="60"
                  value={prixActivite}
                  onChange={(e) => setPrixActivite(e.target.value)}
                  min="0"
                  max="10000"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Prix de l'activité souhaitée
                </p>
              </div>

              {/* Bouton calcul */}
              <Button
                onClick={handleCalculate}
                disabled={isLoading}
                className="w-full h-12 font-bold bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    On calcule...
                  </>
                ) : (
                  "On calcule"
                )}
              </Button>
            </div>
          </Card>
        ) : (
          /* Résultats de la simulation */
          <div className="space-y-6">
            {isEligible ? (
              /* État ÉLIGIBLE */
              <>
                <div className="text-center space-y-2 py-4">
                  <h2 className="text-2xl font-bold text-green-600">
                    Éligible ! 🎉
                  </h2>
                  <p className="text-base text-muted-foreground">
                    On économise. On respire.
                  </p>
                </div>

                {/* Tableau calcul */}
                <Card className="border-green-200 bg-green-50/50">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Activité</span>
                      <div className="text-right">
                        <span className="font-medium text-foreground">{calculationResult.prixInitial}€</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Aide</span>
                      <span className="text-lg font-bold text-green-600">
                        -{calculationResult.montantAide}€
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-3 px-4 bg-orange-50 rounded-lg border border-orange-200">
                      <span className="text-lg font-bold text-foreground">On paye</span>
                      <span className="text-2xl font-bold text-orange-600">
                        {calculationResult.montantAPayer}€
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Économie</span>
                      <span className="text-lg font-bold text-green-600">
                        {calculationResult.pourcentageEconomie}% 🎉
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Message paiement échelonné */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="w-4 h-4" />
                  <span>Paiement échelonné possible.</span>
                </div>

                {/* CTA principal */}
                <Button
                  onClick={() => navigate('/activities')}
                  className="w-full h-12 font-semibold"
                >
                  Voir les activités
                </Button>

                {/* CTA secondaire */}
                <Button
                  onClick={resetSimulation}
                  variant="outline"
                  className="w-full"
                >
                  Nouvelle simulation
                </Button>
              </>
            ) : (
              /* État NON ÉLIGIBLE */
              <>
                <div className="text-center space-y-2 py-4">
                  <h2 className="text-2xl font-bold text-foreground">
                    Pas d'aide pour ce QF
                  </h2>
                  <p className="text-base text-muted-foreground">
                    On a d'autres solutions.
                  </p>
                </div>

                {/* Liste alternatives */}
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold text-lg text-foreground mb-3">
                      Nos alternatives
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CreditCard className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Paiement en 3x sans frais</span>
                      </div>

                      <div className="flex items-start gap-3">
                        <TrendingDown className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Activités à tarifs réduits</span>
                      </div>

                      <div className="flex items-start gap-3">
                        <Gift className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Initiations gratuites possibles</span>
                      </div>

                      <div className="flex items-start gap-3">
                        <Heart className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Clubs Solidaires (bourses exceptionnelles)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* CTA principal */}
                <Button
                  onClick={() => navigate('/activities')}
                  className="w-full h-12 font-semibold"
                >
                  Voir les activités
                </Button>

                {/* CTA secondaire */}
                <Button
                  onClick={resetSimulation}
                  variant="outline"
                  className="w-full"
                >
                  Nouvelle simulation
                </Button>
              </>
            )}
          </div>
        )}

        {/* Section barème (accordion) */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="bareme" className="border rounded-lg px-4">
            <AccordionTrigger className="text-base font-semibold hover:no-underline">
              Nos tranches d'aides
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">
                Stop au non-recours. On vérifie nos droits.
              </p>

              {/* Tableau barème */}
              <div className="space-y-2">
                {QF_AID_BRACKETS.map((bracket, index) => {
                  const colorClasses = [
                    "bg-green-700 text-white",
                    "bg-green-600 text-white",
                    "bg-green-400 text-white",
                    "bg-muted text-muted-foreground"
                  ];
                  return (
                    <div key={index} className={`flex justify-between items-center p-3 rounded-lg ${colorClasses[index]}`}>
                      <span className="font-medium">
                        {bracket.qf_max === null
                          ? `${bracket.qf_min}€ et +`
                          : `${bracket.qf_min} - ${bracket.qf_max}€`
                        }
                      </span>
                      <span className="font-bold">{bracket.aide_euros}€</span>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground italic mt-3">
                Barème indicatif période test. Montants réels selon partenaire.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Mentions footer améliorées */}
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-xs text-blue-900 space-y-2">
            <p>
              <strong>⚠️ Estimation basée sur le Quotient Familial uniquement.</strong> Cette simulation ne prend pas en compte certains critères spécifiques (QPV, statut scolaire, labellisation séjour).
            </p>
            <p>
              Les aides réelles peuvent varier selon votre situation et les dispositifs locaux. Montants définitifs confirmés lors de l'inscription auprès de l'organisateur.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    </PageLayout>
  );
};

export default Simulateur;
