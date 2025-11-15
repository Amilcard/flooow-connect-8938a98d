import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { useActivityBookingState } from "@/hooks/useActivityBookingState";

interface Child {
  id: string;
  first_name: string;
  dob: string;
}

interface FinancialAid {
  aid_name: string;
  amount: number;
  territory_level: string;
  official_link: string | null;
  is_informational: boolean;
}

interface Props {
  activityId: string;
  activityPrice: number;
  activityCategories: string[];
  periodType?: string;
  userProfile?: {
    quotient_familial?: number;
    postal_code?: string;
  };
  children: Child[];
  onAidsCalculated: (data: {
    childId: string;
    quotientFamilial: string;
    cityCode: string;
    aids: FinancialAid[];
    totalAids: number;
    remainingPrice: number;
  }) => void;
}

const TERRITORY_ICONS = {
  national: "🇫🇷",
  region: "🌍",
  metropole: "🏙️",
  commune: "🏘️"
} as const;

export const EnhancedFinancialAidCalculator = ({
  activityId,
  activityPrice,
  activityCategories,
  periodType = "vacances",
  userProfile,
  children,
  onAidsCalculated
}: Props) => {
  const { toast } = useToast();
  const { state: savedState, saveAidCalculation } = useActivityBookingState(activityId);
  
  const [loading, setLoading] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [quotientFamilial, setQuotientFamilial] = useState<string>("");
  const [cityCode, setCityCode] = useState<string>("");
  const [aids, setAids] = useState<FinancialAid[]>([]);
  const [calculated, setCalculated] = useState(false);

  // Restaurer depuis le state persisté
  useEffect(() => {
    if (savedState?.calculated) {
      setSelectedChildId(savedState.childId);
      setQuotientFamilial(savedState.quotientFamilial);
      setCityCode(savedState.cityCode);
      // Ensure all aids have is_informational
      const aidsWithInfo = savedState.aids.map(aid => ({
        ...aid,
        is_informational: aid.is_informational ?? false
      }));
      setAids(aidsWithInfo);
      setCalculated(true);
    }
  }, [savedState?.calculated]);

  // Pré-remplir depuis le profil si pas de state sauvegardé
  useEffect(() => {
    if (!savedState?.calculated && userProfile) {
      if (userProfile.quotient_familial && !quotientFamilial) {
        // Mapper le QF vers les tranches
        const qf = userProfile.quotient_familial;
        if (qf < 450) {
          setQuotientFamilial("450");
        } else if (qf >= 450 && qf <= 700) {
          setQuotientFamilial("575");
        } else if (qf > 700) {
          setQuotientFamilial("800");
        }
      }
      if (userProfile.postal_code && !cityCode) {
        setCityCode(userProfile.postal_code);
      }
    }
  }, [userProfile, savedState?.calculated, quotientFamilial, cityCode]);

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleCalculate = async () => {
    if (!selectedChildId) {
      toast({
        title: "Enfant requis",
        description: "Veuillez sélectionner un enfant",
        variant: "destructive"
      });
      return;
    }

    // Pour les activités de saison scolaire, on calcule directement le Pass'Sport
    if (periodType === "saison_scolaire") {
      const passSportAmount = Math.min(70, activityPrice);
      const calculatedAids: FinancialAid[] = [{
        aid_name: "Pass'Sport",
        amount: passSportAmount,
        territory_level: "national",
        official_link: "https://www.sports.gouv.fr/pass-sport",
        is_informational: false
      }];
      
      setAids(calculatedAids);
      setCalculated(true);

      const totalAids = passSportAmount;
      const remainingPrice = Math.max(0, activityPrice - totalAids);

      const aidData = {
        childId: selectedChildId,
        quotientFamilial: "N/A",
        cityCode: cityCode || "N/A",
        aids: calculatedAids,
        totalAids,
        remainingPrice
      };

      saveAidCalculation(aidData);
      onAidsCalculated(aidData);

      toast({
        title: "Aide calculée",
        description: `Pass'Sport : ${passSportAmount}€`,
      });
      return;
    }

    // Pour les activités de vacances, on demande le QF
    if (!quotientFamilial || !cityCode) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez renseigner le quotient familial et le code postal",
        variant: "destructive"
      });
      return;
    }

    const selectedChild = children.find(c => c.id === selectedChildId);
    if (!selectedChild) return;

    const childAge = calculateAge(selectedChild.dob);

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('calculate_eligible_aids', {
        p_age: childAge,
        p_qf: parseInt(quotientFamilial),
        p_city_code: cityCode,
        p_activity_price: activityPrice,
        p_duration_days: 7, // Défaut pour séjours
        p_categories: activityCategories,
        p_period_type: periodType
      });

      if (error) throw error;

      const calculatedAids = (data || []).map((aid: any) => ({
        ...aid,
        is_informational: aid.is_informational ?? false
      }));
      setAids(calculatedAids);
      setCalculated(true);

      // S'assurer que les aides ne dépassent pas le prix (exclude informational aids)
      const calculableAids = calculatedAids.filter((aid: FinancialAid) => !aid.is_informational);
      const totalAidsRaw = calculableAids.reduce((sum, aid) => sum + Number(aid.amount), 0);
      const totalAids = Math.min(totalAidsRaw, activityPrice);
      const remainingPrice = Math.max(0, activityPrice - totalAids);

      // Avertir si les aides dépassent le prix
      if (totalAidsRaw > activityPrice) {
        toast({
          title: "Aides ajustées",
          description: "Les aides ont été limitées au montant de l'activité",
          variant: "default"
        });
      }

      const aidData = {
        childId: selectedChildId,
        quotientFamilial,
        cityCode,
        aids: calculatedAids,
        totalAids,
        remainingPrice
      };

      // Save to persistent state
      saveAidCalculation(aidData);

      onAidsCalculated(aidData);

      toast({
        title: "Aides calculées",
        description: `${calculatedAids.length} aide(s) disponible(s)`,
      });
    } catch (err) {
      console.error("Error calculating aids:", err);
      toast({
        title: "Erreur",
        description: "Impossible de calculer les aides",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const totalAids = aids.reduce((sum, aid) => sum + Number(aid.amount), 0);
  const remainingPrice = Math.max(0, activityPrice - totalAids);
  const savingsPercent = activityPrice > 0 ? Math.round((totalAids / activityPrice) * 100) : 0;

  if (activityPrice <= 0) return null;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">💰 Évaluer ton aide</h3>
        {calculated && (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 size={14} />
            Calculé
          </Badge>
        )}
      </div>

      <Separator />

      {/* Sélecteur d'enfant */}
      <div className="space-y-2">
        <Label htmlFor="child-select">
          Enfant concerné <span className="text-destructive">*</span>
        </Label>
        <Select value={selectedChildId} onValueChange={setSelectedChildId}>
          <SelectTrigger id="child-select">
            <SelectValue placeholder="Sélectionner un enfant" />
          </SelectTrigger>
          <SelectContent>
            {children.map(child => {
              const age = calculateAge(child.dob);
              return (
                <SelectItem key={child.id} value={child.id}>
                  {child.first_name} ({age} ans)
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* QF et Code postal - affichage conditionnel selon le type d'activité */}
      {periodType === "saison_scolaire" ? (
        // Pour les activités de saison : afficher info Pass'Sport uniquement
        <Alert className="bg-primary/10 border-primary/20">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Pass'Sport (70€)</strong> : Cette aide nationale est automatiquement appliquée pour les licences sportives. 
            Si le tarif est inférieur à 70€, la réduction est limitée au prix de l'activité.
          </AlertDescription>
        </Alert>
      ) : (
        // Pour les activités de vacances : afficher le formulaire QF
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="qf">
              Quotient Familial <span className="text-destructive">*</span>
            </Label>
            <Select value={quotientFamilial} onValueChange={setQuotientFamilial}>
              <SelectTrigger id="qf">
                <SelectValue placeholder="Choisir votre tranche" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="450">Moins de 450€</SelectItem>
                <SelectItem value="575">Entre 450€ et 700€</SelectItem>
                <SelectItem value="800">Plus de 700€</SelectItem>
                <SelectItem value="0">Je ne sais pas</SelectItem>
              </SelectContent>
            </Select>
            {userProfile?.quotient_familial && (
              <p className="text-xs text-muted-foreground">
                Pré-rempli depuis votre profil ({userProfile.quotient_familial}€)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">
              Code postal <span className="text-destructive">*</span>
            </Label>
            <Input
              id="city"
              type="text"
              placeholder="Ex: 42000"
              maxLength={5}
              value={cityCode}
              onChange={(e) => setCityCode(e.target.value)}
            />
            {userProfile?.postal_code && (
              <p className="text-xs text-muted-foreground">
                Pré-rempli depuis votre profil
              </p>
            )}
          </div>
        </div>
      )}

      {/* Message CAF si "Je ne sais pas" - uniquement pour les activités de vacances */}
      {periodType === "vacances" && quotientFamilial === "0" && (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-900">
            Pour connaître votre quotient familial, rapprochez-vous de votre CAF (Caisse d'Allocations Familiales). 
            Cette information figure sur votre attestation CAF.
          </AlertDescription>
        </Alert>
      )}

      {/* Bouton Calculer - conditions différentes selon le type d'activité */}
      <Button 
        onClick={handleCalculate}
        disabled={
          loading || 
          !selectedChildId || 
          (periodType === "vacances" && (!quotientFamilial || !cityCode))
        }
        className="w-full"
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
            {periodType === "saison_scolaire" ? "Calculer mon aide" : "Calculer mes aides"}
          </>
        )}
      </Button>

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
                <span className="font-medium">{activityPrice.toFixed(2)}€</span>
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
            Aucune aide disponible pour cette activité
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

      {/* Informations complémentaires pour les activités de saison */}
      {periodType === "saison_scolaire" && (
        <Alert className="bg-muted/50 border-muted">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Autres aides possibles :</strong> Pass Culture, PASS'Région, bons plans locaux... 
            Ces aides ne sont pas calculées automatiquement mais peuvent réduire votre reste à charge. 
            Renseignez-vous auprès de votre collectivité !
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
};
