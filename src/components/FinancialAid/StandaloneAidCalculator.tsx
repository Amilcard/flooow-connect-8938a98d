/**
 * Simulateur d'aides standalone - Copie conforme du simulateur du détail activité
 * Utilisé sur la page /aides (Aides financières)
 *
 * Utilise EXACTEMENT la même logique et la même UI que EnhancedFinancialAidCalculator
 * Garantit la cohérence des montants affichés
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, Calculator, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QF_BRACKETS } from "@/lib/qfBrackets";
import { calculateAidFromQF } from "@/utils/aidesCalculator";
import { safeErrorMessage } from '@/utils/sanitize';

interface FinancialAid {
  aid_name: string;
  amount: number;
  territory_level: string;
  official_link: string | null;
  is_informational: boolean;
}

const TERRITORY_ICONS = {
  national: "🇫🇷",
  region: "🌍",
  metropole: "🏙️",
  commune: "🏘️"
} as const;

// Prix par défaut pour la simulation
const DEFAULT_ACTIVITY_PRICE = 60;

export const StandaloneAidCalculator = () => {
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [ageEnfant, setAgeEnfant] = useState("");
  const [quotientFamilial, setQuotientFamilial] = useState("");
  const [cityCode, setCityCode] = useState("");
  const [activityPrice, setActivityPrice] = useState<string>(String(DEFAULT_ACTIVITY_PRICE));
  const [aids, setAids] = useState<FinancialAid[]>([]);
  const [calculated, setCalculated] = useState(false);

  const handleCalculate = async () => {
    // Validation
    if (!ageEnfant) {
      toast({
        title: "Âge requis",
        description: "Veuillez indiquer l'âge de votre enfant",
        variant: "destructive"
      });
      return;
    }

    const age = Number.parseInt(ageEnfant, 10);
    if (Number.isNaN(age) || age < 0 || age > 18) {
      toast({
        title: "Âge invalide",
        description: "Veuillez indiquer un âge entre 0 et 18 ans",
        variant: "destructive"
      });
      return;
    }

    if (!quotientFamilial || !cityCode) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez renseigner le quotient familial et le code postal",
        variant: "destructive"
      });
      return;
    }

    // Validation du code postal
    if (!/^[0-9]{5}$/.test(cityCode)) {
      toast({
        title: "Code postal invalide",
        description: "Veuillez saisir un code postal français valide (5 chiffres)",
        variant: "destructive"
      });
      return;
    }

    const prix = Number.parseFloat(activityPrice) || DEFAULT_ACTIVITY_PRICE;

    setLoading(true);
    try {
      // Utiliser la fonction pure calculateAidFromQF
      const result = calculateAidFromQF({
        qf: Number.parseInt(quotientFamilial, 10),
        prixActivite: prix
      });

      // Créer l'aide au format attendu
      const calculatedAids: FinancialAid[] = result.aide > 0 ? [{
        aid_name: `Aide QF ${result.trancheQF}`,
        amount: result.aide,
        territory_level: "commune",
        official_link: null,
        is_informational: false
      }] : [];

      setAids(calculatedAids);
      setCalculated(true);

      // Message adapté selon le résultat
      if (result.aide > 0) {
        toast({
          title: "Aide calculée",
          description: `Aide disponible : ${result.aide.toFixed(2)}€ - Économie de ${result.economiePourcent}%`,
        });
      } else {
        toast({
          title: "Simulation effectuée",
          description: "Aucune aide disponible pour ce quotient familial",
          variant: "default"
        });
      }
    } catch (err) {
      console.error(safeErrorMessage(err, 'StandaloneAidCalculator.handleCalculate'));
      toast({
        title: "Erreur",
        description: "Impossible de calculer les aides",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAgeEnfant("");
    setQuotientFamilial("");
    setCityCode("");
    setActivityPrice(String(DEFAULT_ACTIVITY_PRICE));
    setAids([]);
    setCalculated(false);
  };

  const prix = Number.parseFloat(activityPrice) || DEFAULT_ACTIVITY_PRICE;
  const totalAids = aids.reduce((sum, aid) => sum + Number(aid.amount), 0);
  const remainingPrice = Math.max(0, prix - totalAids);
  const savingsPercent = prix > 0 ? Math.round((totalAids / prix) * 100) : 0;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">💰 Simuler mon aide</h3>
        {calculated && (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 size={14} />
            Calculé
          </Badge>
        )}
      </div>

      <Separator />

      {/* Âge de l'enfant */}
      <div className="space-y-2">
        <Label htmlFor="child-age-standalone">
          Âge de votre enfant <span className="text-destructive">*</span>
        </Label>
        <Input
          id="child-age-standalone"
          type="number"
          placeholder="Ex: 8"
          min="0"
          max="18"
          value={ageEnfant}
          onChange={(e) => setAgeEnfant(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Entre 0 et 18 ans
        </p>
      </div>

      {/* QF et Code postal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="qf-standalone">
            Quotient Familial <span className="text-destructive">*</span>
          </Label>
          <Select value={quotientFamilial} onValueChange={setQuotientFamilial}>
            <SelectTrigger id="qf-standalone">
              <SelectValue placeholder="Choisir votre tranche" />
            </SelectTrigger>
            <SelectContent>
              {QF_BRACKETS.map(bracket => (
                <SelectItem key={bracket.id} value={String(bracket.value)}>
                  {bracket.label}
                </SelectItem>
              ))}
              <SelectItem value="0">Je ne sais pas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city-standalone">
            Code postal <span className="text-destructive">*</span>
          </Label>
          <Input
            id="city-standalone"
            type="text"
            placeholder="Ex: 42000"
            maxLength={5}
            value={cityCode}
            onChange={(e) => setCityCode(e.target.value)}
          />
        </div>
      </div>

      {/* Prix de l'activité */}
      <div className="space-y-2">
        <Label htmlFor="price-standalone">
          Prix de l'activité (€)
        </Label>
        <Input
          id="price-standalone"
          type="number"
          placeholder="Ex: 60"
          min="0"
          value={activityPrice}
          onChange={(e) => setActivityPrice(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Prix indicatif pour la simulation
        </p>
      </div>

      {/* Message CAF si "Je ne sais pas" */}
      {quotientFamilial === "0" && (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-900">
            Pour connaître votre quotient familial, rapprochez-vous de votre CAF (Caisse d'Allocations Familiales).
            Cette information figure sur votre attestation CAF.
          </AlertDescription>
        </Alert>
      )}

      {/* Boutons */}
      <div className="flex gap-2">
        <Button
          onClick={handleCalculate}
          disabled={loading || !ageEnfant || !quotientFamilial || !cityCode}
          className="flex-1"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calcul en cours...
            </>
          ) : (
            <>
              <Calculator className="mr-2 h-4 w-4" />
              Calculer mes aides
            </>
          )}
        </Button>

        {calculated && (
          <Button
            onClick={handleReset}
            variant="outline"
            size="lg"
          >
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Résultats */}
      {calculated && aids.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Aides disponibles</h4>
            {aids.map((aid, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{aid.aid_name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {TERRITORY_ICONS[aid.territory_level as keyof typeof TERRITORY_ICONS]}{" "}
                      {aid.territory_level}
                    </Badge>
                  </div>
                  {aid.official_link && (
                    <a
                      href={aid.official_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      En savoir plus →
                    </a>
                  )}
                </div>
                <div className="text-lg font-bold text-primary">
                  {Number(aid.amount).toFixed(2)}€
                </div>
              </div>
            ))}

            {/* Récap */}
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Prix initial</span>
                <span className="font-medium">{prix.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-sm text-primary">
                <span>Total aides</span>
                <span className="font-medium">- {totalAids.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Reste à charge</span>
                <span>{remainingPrice.toFixed(2)}€</span>
              </div>

              {savingsPercent >= 30 && (
                <div className="flex justify-center pt-2">
                  <Badge variant="default" className="text-sm">
                    🎉 Économie de {savingsPercent}% !
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Message rappel pièces justificatives */}
          <Alert className="bg-amber-50 border-amber-200">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-900">
              <strong>N'oubliez pas :</strong> Munissez-vous des pièces justificatives nécessaires lors de votre inscription
              (attestation CAF, justificatif de domicile, etc.)
            </AlertDescription>
          </Alert>
        </>
      )}

      {calculated && aids.length === 0 && (
        <>
          <div className="text-center py-4 text-muted-foreground text-sm">
            Aucune aide disponible pour ce quotient familial
          </div>

          {/* Message rappel pièces justificatives même sans aides */}
          <Alert className="bg-amber-50 border-amber-200">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-900">
              <strong>N'oubliez pas :</strong> Munissez-vous des pièces justificatives nécessaires lors de votre inscription.
            </AlertDescription>
          </Alert>
        </>
      )}
    </Card>
  );
};
