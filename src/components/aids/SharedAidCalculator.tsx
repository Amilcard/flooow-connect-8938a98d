import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, Calculator, Info, UserPlus, Sparkles, ArrowRight, Lightbulb, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useActivityBookingState } from "@/hooks/useActivityBookingState";
import { QF_BRACKETS, mapQFToBracket } from "@/lib/qfBrackets";
import { useNavigate } from "react-router-dom";
import { useEligibleAids } from "@/hooks/useEligibleAids";
import { useResteACharge } from "@/hooks/useResteACharge";
import { computePricingSummaryFromSupabase } from "@/utils/pricingSummary";
import {
  getTypeActivite,
  shouldShowQF,
  shouldShowConditionSociale,
  shouldShowAllocataireCAF,
  getQFSectionTitle,
  getQFJustification
} from "@/utils/AidCalculatorHelpers";
import { safeErrorMessage } from '@/utils/sanitize';

// ============================================================================
// HELPER: Extract child age calculation to reduce cognitive complexity
// ============================================================================

function getChildAgeForDisplay(
  showChildSelector: boolean,
  selectedChildId: string,
  children: Child[],
  manualChildAge: string,
  calculateAge: (dob: string) => number
): number {
  if (showChildSelector && selectedChildId) {
    const child = children.find(c => c.id === selectedChildId);
    return child ? calculateAge(child.dob) : 0;
  }
  return Number.parseInt(manualChildAge, 10) || 0;
}

// ============================================================================
// HELPER: Determine school status from age
// ============================================================================

function getStatutScolaire(childAge: number): 'primaire' | 'college' | 'lycee' {
  if (childAge >= 15) return 'lycee';
  if (childAge >= 11) return 'college';
  return 'primaire';
}

// ============================================================================
// HELPER: Determine activity type from categories
// ============================================================================

function determineActivityType(categories: string[]): 'sport' | 'culture' | 'vacances' | 'loisirs' {
  if (categories.some(c => c.toLowerCase().includes('sport'))) return 'sport';
  if (categories.some(c => c.toLowerCase().includes('culture') || c.toLowerCase().includes('scolarité'))) return 'culture';
  if (categories.some(c => c.toLowerCase().includes('colo') || c.toLowerCase().includes('vacances'))) return 'vacances';
  return 'loisirs';
}

// ============================================================================
// HELPER: Map RPC results to FinancialAid format (for legacy compatibility)
// ============================================================================

function mapRpcAidToFinancialAid(aid: { aid_name: string; aid_amount: number }): FinancialAid {
  return {
    aid_name: aid.aid_name,
    amount: aid.aid_amount,
    territory_level: 'national', // Territory level determined by RPC
    official_link: null,
    is_informational: false,
    is_potential: false
  };
}

// ============================================================================
// VALIDATION HELPERS - Extracted to reduce cognitive complexity in handleCalculate
// ============================================================================

type ValidationError = { title: string; description: string } | null;

function validateChildOrAgeSelected(showSelector: boolean, childId: string, manualAge: string): ValidationError {
  if (showSelector && !childId) {
    return { title: "Enfant requis", description: "Veuillez sélectionner un enfant" };
  }
  if (!showSelector && !manualAge) {
    return { title: "Âge requis", description: "Veuillez indiquer l'âge de votre enfant" };
  }
  return null;
}

function validateAgeRange(age: number | undefined, ageMin: number, ageMax: number): ValidationError {
  if (age && (age < ageMin || age > ageMax)) {
    return { title: "Âge non compatible", description: `Cette activité est prévue pour les enfants de ${ageMin} à ${ageMax} ans.` };
  }
  return null;
}

function validatePostalCodeFormat(code: string): ValidationError {
  if (code && !/^\d{5}$/.test(code)) {
    return { title: "Code postal invalide", description: "Le code postal doit contenir 5 chiffres" };
  }
  return null;
}

function validateManualAge(ageStr: string): ValidationError {
  const age = Number.parseInt(ageStr, 10);
  if (Number.isNaN(age) || age < 0 || age > 18) {
    return { title: "Âge invalide", description: "Veuillez indiquer un âge entre 0 et 18 ans" };
  }
  return null;
}


// ============================================================================
// HELPER: Messages conditionnels pour les aides
// ============================================================================

interface ConditionalAidMessage {
  message: string;
  type: 'info' | 'success' | 'warning';
}

/**
 * Retourne un message conditionnel basé sur l'aide et l'âge de l'enfant
 * Exemple: Pass Culture disponible à partir de 15 ans
 */
function getConditionalAidMessage(
  aidName: string,
  childAge: number,
  activityCategories: string[]
): ConditionalAidMessage | null {
  const aidLower = aidName.toLowerCase();
  const isCultureActivity = activityCategories.some(c =>
    c.toLowerCase().includes('culture') || c.toLowerCase().includes('scolarité')
  );

  // Pass Culture: disponible à partir de 15 ans
  if (aidLower.includes('pass culture')) {
    if (childAge < 15) {
      const yearsUntil = 15 - childAge;
      return {
        message: `Disponible dans ${yearsUntil} an${yearsUntil > 1 ? 's' : ''} (à partir de 15 ans)`,
        type: 'info'
      };
    }
    if (childAge >= 15 && childAge <= 17) {
      const amount = childAge === 15 ? 20 : 30;
      return {
        message: `${amount}€ disponibles pour les ${childAge} ans`,
        type: 'success'
      };
    }
  }

  // Pass'Sport: conditions sociales requises
  if (aidLower.includes('pass\'sport') || aidLower.includes('passsport')) {
    if (childAge >= 6 && childAge <= 17) {
      return {
        message: 'Nécessite une condition sociale (ARS, AEEH, bourse...)',
        type: 'info'
      };
    }
  }

  // Pass Colo: uniquement 11 ans
  if (aidLower.includes('pass colo')) {
    if (childAge === 11) {
      return {
        message: 'Aide spéciale pour les 11 ans !',
        type: 'success'
      };
    }
    if (childAge < 11) {
      return {
        message: `Disponible dans ${11 - childAge} an${(11 - childAge) > 1 ? 's' : ''} (à 11 ans uniquement)`,
        type: 'info'
      };
    }
  }

  // Carte BÔGE: 13-29 ans
  if (aidLower.includes('bôge') || aidLower.includes('boge')) {
    if (childAge < 13) {
      return {
        message: `Disponible dans ${13 - childAge} an${(13 - childAge) > 1 ? 's' : ''} (à partir de 13 ans)`,
        type: 'info'
      };
    }
  }

  return null;
}

// ============================================================================
// SUB-COMPONENT: Condition Sociale Section (reduces main component complexity)
// ============================================================================

interface ConditionSocialeSectionProps {
  activityCategories: string[];
  childAge: number;
  hasARS: boolean;
  hasAEEH: boolean;
  hasBourse: boolean;
  setHasARS: (value: boolean) => void;
  setHasAEEH: (value: boolean) => void;
  setHasBourse: (value: boolean) => void;
}

function ConditionSocialeSection({
  activityCategories,
  childAge,
  hasARS,
  hasAEEH,
  hasBourse,
  setHasARS,
  setHasAEEH,
  setHasBourse
}: ConditionSocialeSectionProps) {
  const typeAct = getTypeActivite(activityCategories);

  if (!shouldShowConditionSociale(typeAct, childAge)) {
    return null;
  }

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="flex items-center gap-2">
        <Info className="h-4 w-4 text-primary" />
        <p className="text-sm font-medium">
          Critères nécessaires pour Pass'Sport (50€)
        </p>
      </div>
      <div className="space-y-2">
        <Label>Avez-vous une aide sociale ?</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="ars"
              checked={hasARS}
              onChange={(e) => setHasARS(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <Label htmlFor="ars" className="font-normal cursor-pointer">
              Allocation de rentrée scolaire (ARS)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="aeeh"
              checked={hasAEEH}
              onChange={(e) => setHasAEEH(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <Label htmlFor="aeeh" className="font-normal cursor-pointer">
              Allocation enfant handicapé (AEEH)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="bourse"
              checked={hasBourse}
              onChange={(e) => setHasBourse(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <Label htmlFor="bourse" className="font-normal cursor-pointer">
              Bourse scolaire
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENT: QF Section (reduces main component complexity)
// ============================================================================

interface QFSectionProps {
  activityCategories: string[];
  activityPeriod: 'scolaire' | 'vacances';
  childAge: number;
  cityCode: string;
  quotientFamilial: string;
  setQuotientFamilial: (value: string) => void;
}

function QFSection({
  activityCategories,
  activityPeriod,
  childAge,
  cityCode,
  quotientFamilial,
  setQuotientFamilial
}: QFSectionProps) {
  const typeAct = getTypeActivite(activityCategories);

  if (!shouldShowQF(typeAct, activityPeriod, childAge, cityCode)) {
    return null;
  }

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="flex items-center gap-2">
        <Info className="h-4 w-4 text-primary" />
        <p className="text-sm font-medium">
          {getQFSectionTitle(typeAct, activityPeriod)}
        </p>
      </div>
      <div className="space-y-2" data-tour-id="qf-selector-container">
        <Label htmlFor="qf" className="flex items-center gap-2">
          Quotient Familial
        </Label>
        <Select value={quotientFamilial} onValueChange={setQuotientFamilial}>
          <SelectTrigger id="qf">
            <SelectValue placeholder="Je ne sais pas" />
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
        <p className="text-xs text-muted-foreground">
          {getQFJustification(typeAct, activityPeriod)}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENT: CAF Section (reduces main component complexity)
// ============================================================================

interface CAFSectionProps {
  activityCategories: string[];
  activityPeriod: 'scolaire' | 'vacances';
  quotientFamilial: string;
  isAllocataireCaf: 'oui' | 'non' | '';
  setIsAllocataireCaf: (value: 'oui' | 'non' | '') => void;
}

function CAFSection({
  activityCategories,
  activityPeriod,
  quotientFamilial,
  isAllocataireCaf,
  setIsAllocataireCaf
}: CAFSectionProps) {
  const typeAct = getTypeActivite(activityCategories);
  const hasQF = !!quotientFamilial && quotientFamilial !== '';

  if (!shouldShowAllocataireCAF(typeAct, activityPeriod) || hasQF) {
    return null;
  }

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="flex items-center gap-2">
        <Info className="h-4 w-4 text-primary" />
        <p className="text-sm font-medium">
          Statut allocataire CAF (requis pour aides vacances)
        </p>
      </div>
      <div className="space-y-2">
        <Label>Êtes-vous allocataire CAF ?</Label>
        <RadioGroup value={isAllocataireCaf} onValueChange={(value) => setIsAllocataireCaf(value as 'oui' | 'non')}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="oui" id="caf-oui" />
            <Label htmlFor="caf-oui" className="font-normal cursor-pointer">
              Oui
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="non" id="caf-non" />
            <Label htmlFor="caf-non" className="font-normal cursor-pointer">
              Non
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}

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
  is_potential?: boolean; // New field for potential aids
}

interface Props {
  activityId?: string;
  activityPrice?: number;
  activityCategories?: string[];
  periodType?: string;
  ageMin?: number;
  ageMax?: number;
  userProfile?: {
    quotient_familial?: number;
    postal_code?: string;
  };
  children?: Child[];
  onAidsCalculated?: (data: {
    childId: string;
    quotientFamilial: string;
    cityCode: string;
    aids: FinancialAid[];
    totalAids: number;
    remainingPrice: number;
  }) => void;
  resetOnMount?: boolean;
}

const TERRITORY_ICONS = {
  national: "🇫🇷",
  regional: "🌍",
  region: "🌍",
  departement: "🏢",
  metropole: "🏙️",
  commune: "🏘️",
  ville: "🏘️",
  caf: "🏦",
  caf_local: "🏦",
  organisateur: "🤝"
} as const;

export const SharedAidCalculator = ({
  activityId = "",
  activityPrice = 100,
  activityCategories = [],
  periodType,
  ageMin = 3,
  ageMax = 17, // No default: undefined allows user to choose period
  userProfile,
  children = [],
  onAidsCalculated,
  resetOnMount = false
}: Props) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { state: savedState, saveAidCalculation, clearState } = useActivityBookingState(activityId);

  const [loading, setLoading] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [manualChildAge, setManualChildAge] = useState("");
  const [quotientFamilial, setQuotientFamilial] = useState("");
  const [cityCode, setCityCode] = useState("");
  const [aids, setAids] = useState<FinancialAid[]>([]);
  const [calculated, setCalculated] = useState(false);
  const [isQuickEstimate, setIsQuickEstimate] = useState(false); // Track if it's a quick estimate

  // Committed states to trigger RPC hooks only on Calculate button click
  const [committedChildAge, setCommittedChildAge] = useState<number | null>(null);
  const [committedQf, setCommittedQf] = useState<number | null>(null);
  const [committedTerritoryCode, setCommittedTerritoryCode] = useState<string>('42');
  const [committedNbChildren, setCommittedNbChildren] = useState<number>(1);
  // Reserved for future advanced criteria toggle feature
  const [_showAdvancedCriteria, _setShowAdvancedCriteria] = useState(false);
  // Initialiser depuis periodType prop (si l'activité a déjà une période définie)
  const [activityPeriod, setActivityPeriod] = useState<'scolaire'|'vacances'>(() => {
    // Safety check: ensure periodType is a valid string
    if (periodType && typeof periodType === 'string' && periodType.trim() !== '') {
      const p = periodType.toLowerCase().trim();
      if (p === 'vacances' || p === 'school_holidays' || p.includes('vacances')) {
        return 'vacances';
      }
    }
    return 'scolaire'; // Safe fallback
  });
  
  // Nouveaux states pour conditions sociales (Étape 2.4)
  const [hasARS, setHasARS] = useState(false);
  const [hasAEEH, setHasAEEH] = useState(false);
  const [hasBourse, setHasBourse] = useState(false);
  
  // Nouveau state pour allocataire CAF (Étape 2.5)
  const [isAllocataireCaf, setIsAllocataireCaf] = useState<'oui'|'non'|''>('');

  // Check if user is logged in based on profile existence
  const isLoggedIn = !!userProfile;
  // If logged in but no children, fall back to manual mode
  const showChildSelector = isLoggedIn && children.length > 0;

  // ==========================================================================
  // NEW: RPC HOOKS - Use Supabase functions instead of legacy FinancialAidEngine
  // ==========================================================================

  // Fetch eligible aids from Supabase RPC (respects accepts_aid_types)
  const { data: eligibleAidsFromRpc = [], isLoading: isLoadingAids } = useEligibleAids({
    activityId: activityId || '',
    childAge: committedChildAge,
    quotientFamilial: committedQf,
    isQpv: false, // TODO: Get from user profile if available
    territoryCode: committedTerritoryCode,
    nbChildren: committedNbChildren,
  });

  // Fetch reste à charge with QF tranches (vacances only)
  const { data: resteAChargeData, isLoading: isLoadingResteACharge } = useResteACharge({
    activityId: activityId || '',
    quotientFamilial: committedQf,
    periodType: activityPeriod,
    priceBase: activityPrice,
  });

  // Compute pricing summary from Supabase RPC results
  const hasQf = committedQf !== null && committedQf > 0;
  const pricingSummary = resteAChargeData && calculated
    ? computePricingSummaryFromSupabase(eligibleAidsFromRpc, resteAChargeData, hasQf)
    : null;

  // Reset automatique au montage si resetOnMount est true
  useEffect(() => {
    if (resetOnMount) {
      setSelectedChildId("");
      setManualChildAge("");
      setQuotientFamilial("");
      setCityCode("");
      setAids([]);
      setCalculated(false);
      setIsQuickEstimate(false);
    }
  }, [resetOnMount]);

  // Restaurer depuis le state persisté (seulement si resetOnMount est false)
  useEffect(() => {
    if (!resetOnMount && savedState?.calculated) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentional: restore once when savedState.calculated becomes true
  }, [savedState?.calculated, resetOnMount]);

  // Pré-remplir depuis le profil si pas de state sauvegardé
  useEffect(() => {
    if (!savedState?.calculated && userProfile && !resetOnMount) {
      if (userProfile.quotient_familial && !quotientFamilial) {
        // Mapper le QF vers les tranches en utilisant la config centralisée
        const qf = userProfile.quotient_familial;
        const mappedValue = mapQFToBracket(qf);
        setQuotientFamilial(String(mappedValue));
      }
      if (userProfile.postal_code && !cityCode) {
        setCityCode(userProfile.postal_code);
      }
    }
  }, [userProfile, savedState?.calculated, quotientFamilial, cityCode, resetOnMount]);

  // PROTECTION CONFIDENTIALITÉ: Effacement automatique à la fermeture
  useEffect(() => {
    return () => {
      // Cleanup: effacer les données quand le composant est démonté
      if (activityId && clearState) {
        clearState();
      }
    };
  }, [activityId, clearState]);

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
    // Run validation helpers (reduces cognitive complexity)
    const selectionError = validateChildOrAgeSelected(showChildSelector, selectedChildId, manualChildAge);
    if (selectionError) {
      toast({ title: selectionError.title, description: selectionError.description, variant: "destructive" });
      return;
    }

    const checkAge = showChildSelector ? children?.find(c => c.id === selectedChildId)?.age : Number.parseInt(manualChildAge, 10);
    const ageRangeError = validateAgeRange(checkAge, ageMin, ageMax);
    if (ageRangeError) {
      toast({ title: ageRangeError.title, description: ageRangeError.description, variant: "destructive" });
      return;
    }

    const postalError = validatePostalCodeFormat(cityCode);
    if (postalError) {
      toast({ title: postalError.title, description: postalError.description, variant: "destructive" });
      return;
    }

    // Déterminer l'âge de l'enfant
    let childAge: number;
    let nbFratrie = 0;

    if (showChildSelector) {
      const selectedChild = children.find(c => c.id === selectedChildId);
      if (!selectedChild) return;
      childAge = calculateAge(selectedChild.dob);
      nbFratrie = children.length;
    } else {
      const manualAgeError = validateManualAge(manualChildAge);
      if (manualAgeError) {
        toast({ title: manualAgeError.title, description: manualAgeError.description, variant: "destructive" });
        return;
      }
      childAge = Number.parseInt(manualChildAge, 10);
    }

    // Extract territory code from postal code
    const territoryCode = cityCode ? cityCode.substring(0, 2) : '42';
    const qf = quotientFamilial ? Number.parseInt(quotientFamilial, 10) : null;

    // Determine if this is a quick estimate (no QF) or full calculation
    const hasQF = qf !== null && qf > 0;
    setIsQuickEstimate(!hasQF);

    setLoading(true);

    // Commit the values to trigger RPC hooks
    // The hooks will automatically refetch when these states change
    setCommittedChildAge(childAge);
    setCommittedQf(qf);
    setCommittedTerritoryCode(territoryCode);
    setCommittedNbChildren(nbFratrie || 1);
    setCalculated(true);

    // Wait for hooks to complete (they're triggered by the state updates above)
    // The results will be available in pricingSummary computed from hooks
    setTimeout(() => {
      setLoading(false);

      // Show appropriate message
      const summary = pricingSummary;
      if (!summary) {
        toast({
          title: "Calcul en cours",
          description: "Les aides sont en cours de calcul...",
          variant: "default"
        });
        return;
      }

      const totalAids = summary.confirmedAidTotal;
      const potentialTotal = summary.potentialAidTotal;
      const economiePourcent = summary.savingsPercent;

      // Map to legacy FinancialAid format for persistence
      const calculatedAids: FinancialAid[] = summary.eligibleAids.map(aid => ({
        aid_name: aid.name,
        amount: aid.amount,
        territory_level: 'national',
        official_link: null,
        is_informational: false,
        is_potential: !hasQF // Mark as potential if no QF provided
      }));

      setAids(calculatedAids);

      const aidData = {
        childId: selectedChildId,
        quotientFamilial: quotientFamilial || "N/A",
        cityCode: cityCode || "N/A",
        aids: calculatedAids,
        totalAids,
        remainingPrice: summary.resteActuel
      };

      // Save to persistent state only if activityId is provided
      if (activityId) {
        saveAidCalculation(aidData);
      }

      if (onAidsCalculated) {
        onAidsCalculated(aidData);
      }

      // Message adapté selon le résultat
      if (totalAids > 0) {
        toast({
          title: "Aides calculées",
          description: `Aide totale : ${totalAids.toFixed(2)}€ - Économie de ${economiePourcent}%`,
        });
      } else if (potentialTotal > 0) {
        toast({
          title: "Aides potentielles détectées",
          description: "Affinez votre simulation pour confirmer ces aides !",
          variant: "default"
        });
      } else {
        toast({
          title: "Simulation effectuée",
          description: "Aucune aide disponible pour ce profil",
          variant: "default"
        });
      }
    }, 500); // Small delay to allow hooks to refetch
  };

  // PROTECTION CONFIDENTIALITÉ: Fonction de réinitialisation manuelle
  const handleReset = () => {
    // Effacer l'état persisté
    if (clearState) {
      clearState();
    }

    // Réinitialiser tous les champs
    setSelectedChildId("");
    setManualChildAge("");
    setQuotientFamilial("");
    setCityCode("");
    setAids([]);
    setCalculated(false);
    setIsQuickEstimate(false);
    setHasARS(false);
    setHasAEEH(false);
    setHasBourse(false);
    setIsAllocataireCaf("");

    // Reset committed states
    setCommittedChildAge(null);
    setCommittedQf(null);
    setCommittedTerritoryCode('42');
    setCommittedNbChildren(1);

    toast({
      title: "Données effacées",
      description: "Vos informations ont été supprimées pour protéger votre confidentialité",
    });
  };

  // Calculate totals from pricingSummary (new RPC-based) or fallback to legacy aids
  const totalAids = pricingSummary?.confirmedAidTotal ?? 0;
  const potentialTotal = pricingSummary?.potentialAidTotal ?? 0;
  const remainingPrice = pricingSummary?.resteActuel ?? activityPrice;
  // Reserved for future savings badge display
  const _savingsPercent = pricingSummary?.savingsPercent ?? 0;

  if (activityPrice <= 0) return null;

  return (
    <Card className="p-6 space-y-4 border-2 border-primary/20">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">💰 Évaluer vos aides</h3>
        {calculated && (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 size={14} />
            Calculé
          </Badge>
        )}
      </div>

      {/* Pedagogical Message */}
      <Alert className="bg-blue-50 border-blue-200">
        <Lightbulb className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-900">
          <strong>Comment ça marche ?</strong> Flooow analyse automatiquement plusieurs critères (âge, activité, résidence, statut CAF...) pour vous proposer les aides adaptées. <strong>Le Quotient Familial n'est utilisé que pour certaines aides CAF.</strong>
        </AlertDescription>
      </Alert>

      <Separator />

      {/* Sélecteur d'enfant (si enfants dispos) OU âge manuel */}
      {showChildSelector ? (
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
      ) : (
        <div className="space-y-2">
          <Label htmlFor="child-age">
            Âge de votre enfant <span className="text-destructive">*</span>
          </Label>
          <Input
            id="child-age"
            type="number"
            placeholder="Ex: 8"
            min="0"
            max="18"
            value={manualChildAge}
            onChange={(e) => setManualChildAge(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Entre 0 et 18 ans
          </p>
        </div>
      )}

      {/* Code postal (critère essentiel) */}
      <div className="space-y-2">
        <Label htmlFor="city">
          Code postal <span className="text-muted-foreground text-xs">(pour détecter les aides locales)</span>
        </Label>
        <Input
          id="city"
          type="text"
          placeholder="Ex: 42000"
          maxLength={5}
          value={cityCode}
          onChange={(e) => setCityCode(e.target.value)}
        />
      </div>

      {/* Période de l'activité - Masquer si déjà définie par l'activité */}
      {!periodType && (
        <div className="space-y-2">
          <Label htmlFor="activity-period">
            Quand a lieu l'activité ? <span className="text-destructive">*</span>
          </Label>
          <RadioGroup value={activityPeriod} onValueChange={(value) => setActivityPeriod(value as 'scolaire'|'vacances')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="scolaire" id="period-scolaire" />
              <Label htmlFor="period-scolaire" className="font-normal cursor-pointer">
                Pendant l'année scolaire (septembre-juin)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="vacances" id="period-vacances" />
              <Label htmlFor="period-vacances" className="font-normal cursor-pointer">
                Pendant les vacances scolaires
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}

      {/* Bloc Condition Sociale - Affichage conditionnel (NOUVEAU - Étape 2.4) */}
      <ConditionSocialeSection
        activityCategories={activityCategories}
        childAge={getChildAgeForDisplay(showChildSelector, selectedChildId, children, manualChildAge, calculateAge)}
        hasARS={hasARS}
        hasAEEH={hasAEEH}
        hasBourse={hasBourse}
        setHasARS={setHasARS}
        setHasAEEH={setHasAEEH}
        setHasBourse={setHasBourse}
      />

      {/* QF Section - Affichage conditionnel (NOUVEAU - Étape 2.3) */}
      <QFSection
        activityCategories={activityCategories}
        activityPeriod={activityPeriod}
        childAge={getChildAgeForDisplay(showChildSelector, selectedChildId, children, manualChildAge, calculateAge)}
        cityCode={cityCode}
        quotientFamilial={quotientFamilial}
        setQuotientFamilial={setQuotientFamilial}
      />

      {/* Bloc Allocataire CAF - Affichage conditionnel (NOUVEAU - Étape 2.5) */}
      <CAFSection
        activityCategories={activityCategories}
        activityPeriod={activityPeriod}
        quotientFamilial={quotientFamilial}
        isAllocataireCaf={isAllocataireCaf}
        setIsAllocataireCaf={setIsAllocataireCaf}
      />


      {/* Bouton Calculer */}
      <Button
        onClick={handleCalculate}
        disabled={
          loading ||
          (showChildSelector ? !selectedChildId : !manualChildAge)
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
            {periodType === "scolaire" ? "Calculer mon aide" : "Calculer mes aides"}
          </>
        )}
      </Button>

      {/* Bouton Effacer (Protection confidentialité) */}
      {calculated && (
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full"
            size="sm"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Effacer mes données
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Vos données restent sur votre appareil et ne sont pas partagées.
          </p>
        </div>
      )}

      {/* Résultats */}
      {calculated && pricingSummary && pricingSummary.eligibleAids.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Aides estimées</h4>
            {pricingSummary.eligibleAids.map((aid, index) => {
              const currentChildAge = getChildAgeForDisplay(showChildSelector, selectedChildId, children, manualChildAge, calculateAge);
              const conditionalMsg = getConditionalAidMessage(aid.name, currentChildAge, activityCategories);
              const isPotential = !pricingSummary.hasQf; // Aids are "potential" if no QF provided

              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${isPotential ? 'bg-yellow-50 border border-yellow-200' : 'bg-accent/50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{aid.name}</span>
                        {isPotential && (
                          <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-700 bg-yellow-100">
                            Potentiel
                          </Badge>
                        )}
                        {!isPotential && (
                          <Badge variant="secondary" className="text-xs">
                            🇫🇷 national
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${isPotential ? 'text-yellow-600' : 'text-primary'}`}>
                      {isPotential ? `~${Number(aid.amount).toFixed(0)}€` : `${Number(aid.amount).toFixed(2)}€`}
                    </div>
                  </div>
                  {/* Message conditionnel (Pass Culture ≥15 ans, etc.) */}
                  {conditionalMsg && (
                    <p className={`text-xs mt-1 ${
                      conditionalMsg.type === 'success' ? 'text-green-600' :
                      conditionalMsg.type === 'warning' ? 'text-orange-600' :
                      'text-muted-foreground'
                    }`}>
                      {conditionalMsg.type === 'success' ? '✓ ' : conditionalMsg.type === 'info' ? 'ℹ️ ' : '⚠️ '}
                      {conditionalMsg.message}
                    </p>
                  )}
                </div>
              );
            })}

            {/* Récap */}
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Prix initial</span>
                <span className="font-medium">{activityPrice.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-sm text-primary">
                <span>Total aides confirmées</span>
                <span className="font-medium">- {totalAids.toFixed(2)}€</span>
              </div>
              
              {potentialTotal > 0 && (
                <div className="flex justify-between text-sm text-yellow-600">
                  <span>Aides potentielles</span>
                  <span className="font-medium">~ {potentialTotal.toFixed(0)}€</span>
                </div>
              )}

              <div className="flex justify-between text-lg font-bold border-t pt-2" data-tour-id="reste-charge-calculator">
                <span>Reste à charge estimé</span>
                <span>{remainingPrice.toFixed(2)}€</span>
              </div>

              {isQuickEstimate && potentialTotal > 0 && activityPeriod === 'vacances' && (
                <Alert className="bg-blue-50 border-blue-200 mt-4">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-900 space-y-2">
                    <p><strong>Vous pourriez payer encore moins !</strong></p>
                    <p>En renseignant votre Quotient Familial, vous pourriez débloquer jusqu'à {potentialTotal}€ d'aides supplémentaires.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2 bg-white hover:bg-blue-50 text-blue-700 border-blue-200"
                      onClick={() => {
                        const qfSelect = document.getElementById('qf');
                        if (qfSelect) qfSelect.focus();
                        toast({
                          title: "Quotient familial requis",
                          description: "Indiquez votre QF pour affiner le calcul de vos aides"
                        });
                      }}
                    >
                      Affiner mon résultat <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Disclaimer légal */}
          <Alert className="bg-muted border-muted-foreground/20">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Montants indicatifs</strong> - Sous réserve d'éligibilité et de validation
              auprès des organismes payeurs. Confirmation nécessaire avant inscription définitive.
            </AlertDescription>
          </Alert>

          {/* CTA Signup pour utilisateurs non connectés */}
          {/* LOT 3 - T3_1: Message orienté parent */}
          {!isLoggedIn && (
            <div className="pt-4">
              <Alert className="bg-primary/10 border-primary/30">
                <UserPlus className="h-4 w-4 text-primary" />
                <AlertDescription className="space-y-3">
                  <p className="text-sm font-medium">
                    Parents : créez votre compte pour profiter des aides et inscrire vos enfants
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Le compte Flooow est au nom du parent. Vous pourrez ensuite ajouter vos enfants.
                  </p>
                  <Button
                    onClick={() => navigate("/signup")}
                    className="w-full"
                    size="lg"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Créer mon compte parent gratuit
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </>
      )}

      {calculated && pricingSummary && pricingSummary.eligibleAids.length === 0 && (
        <>
          <div className="text-center py-4 text-muted-foreground text-sm">
            Aucune aide détectée pour le moment.
          </div>
          
          {isQuickEstimate && (
             <Alert className="bg-blue-50 border-blue-200">
             <Info className="h-4 w-4 text-blue-600" />
             <AlertDescription className="text-sm text-blue-900">
               <strong>Conseil :</strong> Renseignez votre Quotient Familial pour vérifier si vous avez droit à des aides locales ou de la CAF.
             </AlertDescription>
           </Alert>
          )}

          {/* CTA Signup pour utilisateurs non connectés même sans aides */}
          {/* LOT 3 - T3_1: Message orienté parent */}
          {!isLoggedIn && (
            <div className="pt-4">
              <Alert className="bg-primary/10 border-primary/30">
                <UserPlus className="h-4 w-4 text-primary" />
                <AlertDescription className="space-y-3">
                  <p className="text-sm font-medium">
                    Parents : créez votre compte pour inscrire vos enfants
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Le compte Flooow est au nom du parent. Vous pourrez ensuite ajouter vos enfants.
                  </p>
                  <Button
                    onClick={() => navigate("/signup")}
                    className="w-full"
                    size="lg"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Créer mon compte parent gratuit
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </>
      )}
    </Card>
  );
};
