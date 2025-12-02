import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, Calculator, Info, UserPlus, Sparkles, ArrowRight, Lightbulb, ChevronDown, Trash2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { useActivityBookingState } from "@/hooks/useActivityBookingState";
import { QF_BRACKETS, mapQFToBracket } from "@/lib/qfBrackets";
import { calculateAidFromQF } from "@/utils/aidesCalculator";
import { useNavigate } from "react-router-dom";
import { calculateAllEligibleAids, calculateQuickEstimate, EligibilityParams, QuickEstimateParams, CalculatedAid } from "@/utils/FinancialAidEngine";
import { 
  getTypeActivite, 
  shouldShowQF, 
  shouldShowConditionSociale,
  shouldShowAllocataireCAF,
  getQFSectionTitle,
  getQFJustification,
  getContextualMessage
} from "@/utils/AidCalculatorHelpers";

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
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [manualChildAge, setManualChildAge] = useState<string>("");
  const [quotientFamilial, setQuotientFamilial] = useState<string>("");
  const [cityCode, setCityCode] = useState<string>("");
  const [aids, setAids] = useState<FinancialAid[]>([]);
  const [calculated, setCalculated] = useState(false);
  const [isQuickEstimate, setIsQuickEstimate] = useState(false); // Track if it's a quick estimate
  const [showAdvancedCriteria, setShowAdvancedCriteria] = useState(false); // Toggle advanced criteria section
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
    console.log("Calculating aids...", { isLoggedIn, showChildSelector, manualChildAge, selectedChildId });
    
    // Validation: soit un enfant sélectionné (mode selecteur), soit un âge manuel (mode manuel)
    if (showChildSelector && !selectedChildId) {
      toast({
        title: "Enfant requis",
        description: "Veuillez sélectionner un enfant",
        variant: "destructive"
      });
      return;
    }

    if (!showChildSelector && !manualChildAge) {
      toast({
        title: "Âge requis",
        description: "Veuillez indiquer l'âge de votre enfant",
        variant: "destructive"
      });
      return;
    }

    // Validate postal code format (5 digits for French postal codes)
    if (cityCode && !/^\d{5}$/.test(cityCode)) {
      toast({
        title: "Code postal invalide",
        description: "Le code postal doit contenir 5 chiffres",
        variant: "destructive"
      });
      return;
    }

    // QF is now OPTIONAL for Quick Estimate
    const hasQF = !!quotientFamilial && quotientFamilial !== "0";

    // Déterminer l'âge de l'enfant
    let childAge: number;
    let nbFratrie = 0;
    
    if (showChildSelector) {
      const selectedChild = children.find(c => c.id === selectedChildId);
      if (!selectedChild) return;
      childAge = calculateAge(selectedChild.dob);
      nbFratrie = children.length;
    } else {
      childAge = parseInt(manualChildAge);
      if (isNaN(childAge) || childAge < 0 || childAge > 18) {
        toast({
          title: "Âge invalide",
          description: "Veuillez indiquer un âge entre 0 et 18 ans",
          variant: "destructive"
        });
        return;
      }
    }

    setLoading(true);
    try {
      // Déduction du statut scolaire
      let statut_scolaire: 'primaire' | 'college' | 'lycee' = 'primaire';
      if (childAge >= 11 && childAge <= 14) statut_scolaire = 'college';
      if (childAge >= 15) statut_scolaire = 'lycee';

      // Déduction du type d'activité (NOUVEAU - Étape 2.2)
      const typeActivite = getTypeActivite(activityCategories);
      console.log('🎯 Type activité détecté:', typeActivite, 'Catégories:', activityCategories);
      console.log('📅 Période:', activityPeriod, 'Âge:', childAge, 'CP:', cityCode);

      // Déduction du type d'activité (ANCIEN CODE - à supprimer plus tard)
      let type_activite: 'sport' | 'culture' | 'vacances' | 'loisirs' = 'loisirs';
      if (activityCategories.some(c => c.toLowerCase().includes('sport'))) type_activite = 'sport';
      else if (activityCategories.some(c => c.toLowerCase().includes('culture') || c.toLowerCase().includes('scolarité'))) type_activite = 'culture';
      else if (activityCategories.some(c => c.toLowerCase().includes('colo') || c.toLowerCase().includes('vacances'))) type_activite = 'vacances';

      let calculatedAids: FinancialAid[] = [];

      if (hasQF) {
        // FULL ESTIMATION (Mode 3)
        setIsQuickEstimate(false);
        const context: EligibilityParams = {
          age: childAge,
          quotient_familial: parseInt(quotientFamilial) || 0,
          code_postal: cityCode || "00000",
          ville: "", 
          departement: cityCode ? parseInt(cityCode.substring(0, 2)) : 0,
          prix_activite: activityPrice,
          type_activite: type_activite,
          periode: activityPeriod === 'vacances' ? 'vacances' : 'saison_scolaire',
          nb_fratrie: nbFratrie,
          allocataire_caf: !!quotientFamilial,
          statut_scolaire: statut_scolaire, // Ajout pour corriger l'erreur TypeScript
          est_qpv: false, 
          conditions_sociales: {
            beneficie_ARS: false,
            beneficie_AEEH: false,
            beneficie_AESH: false,
            beneficie_bourse: false,
            beneficie_ASE: false
          }
        };
        const engineResults = calculateAllEligibleAids(context);
        calculatedAids = engineResults.map(res => ({
          aid_name: res.name,
          amount: res.montant, // Correction: utiliser montant au lieu de amount
          territory_level: res.niveau === 'departemental' ? 'departement' : res.niveau === 'communal' ? 'commune' : res.niveau,
          official_link: null,
          is_informational: false,
          is_potential: false
        }));

      } else {
        // QUICK ESTIMATION (Mode 1)
        setIsQuickEstimate(true);
        const params: QuickEstimateParams = {
          age: childAge,
          type_activite: type_activite,
          prix_activite: activityPrice,
          code_postal: cityCode || undefined,
          periode: activityPeriod // CRITICAL: Filter aids by period
        };
        const result = calculateQuickEstimate(params);
        
        // Add detected aids
        const detected = result.aides_detectees.map(res => ({
          aid_name: res.name,
          amount: res.montant, // Correction: utiliser montant
          territory_level: res.niveau === 'departemental' ? 'departement' : res.niveau === 'communal' ? 'commune' : res.niveau,
          official_link: null,
          is_informational: false,
          is_potential: false
        }));

        // Add potential aids
        const potential = result.aides_potentielles.map(res => {
           // Extract max amount from string "20-80€" -> 80
           const matches = res.montant_possible.match(/(\d+)/g);
           const amount = matches ? parseInt(matches[matches.length - 1]) : 0;
           
           return {
            aid_name: res.name,
            amount: amount,
            territory_level: 'national', // Default for potential
            official_link: null,
            is_informational: true,
            is_potential: true
           };
        });

        calculatedAids = [...detected, ...potential];
      }

      setAids(calculatedAids);
      setCalculated(true);

      // Only count CONFIRMED aids for total
      const rawTotalAids = calculatedAids.filter(a => !a.is_potential).reduce((sum, aid) => sum + aid.amount, 0);
      const totalAids = Math.min(activityPrice, rawTotalAids);
      const remainingPrice = Math.max(0, activityPrice - totalAids);
      const economiePourcent = activityPrice > 0 ? Math.round((totalAids / activityPrice) * 100) : 0;

      const aidData = {
        childId: selectedChildId,
        quotientFamilial: quotientFamilial || "N/A",
        cityCode: cityCode || "N/A",
        aids: calculatedAids,
        totalAids,
        remainingPrice
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
      } else if (calculatedAids.some(a => a.is_potential)) {
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
    
    toast({
      title: "Données effacées",
      description: "Vos informations ont été supprimées pour protéger votre confidentialité",
    });
  };

  const rawTotalAids = aids.filter(a => !a.is_potential).reduce((sum, aid) => sum + Number(aid.amount), 0);
  const totalAids = Math.min(activityPrice, rawTotalAids);
  const potentialTotal = aids.filter(a => a.is_potential).reduce((sum, aid) => sum + Number(aid.amount), 0);
  const remainingPrice = Math.max(0, activityPrice - totalAids);
  const savingsPercent = activityPrice > 0 ? Math.round((totalAids / activityPrice) * 100) : 0;

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
      {(() => {
        const typeAct = getTypeActivite(activityCategories);
        const childAgeForDisplay = showChildSelector && selectedChildId 
          ? calculateAge(children.find(c => c.id === selectedChildId)?.dob || '')
          : parseInt(manualChildAge) || 0;
        
        return shouldShowConditionSociale(typeAct, childAgeForDisplay) && (
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
                    className="h-4 w-4 rounded border-gray-300"
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
                    className="h-4 w-4 rounded border-gray-300"
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
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="bourse" className="font-normal cursor-pointer">
                    Bourse scolaire
                  </Label>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* QF Section - Affichage conditionnel (NOUVEAU - Étape 2.3) */}
      {(() => {
        // Calculer le type d'activité pour l'affichage conditionnel
        const typeAct = getTypeActivite(activityCategories);
        const childAgeForDisplay = showChildSelector && selectedChildId 
          ? calculateAge(children.find(c => c.id === selectedChildId)?.dob || '')
          : parseInt(manualChildAge) || 0;
        
        return shouldShowQF(typeAct, activityPeriod, childAgeForDisplay, cityCode) && (
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
      })()}

      {/* Bloc Allocataire CAF - Affichage conditionnel (NOUVEAU - Étape 2.5) */}
      {/* Masquer si QF déjà renseigné (déduction automatique : QF implique CAF) */}
      {(() => {
        const typeAct = getTypeActivite(activityCategories);
        const hasQF = !!quotientFamilial && quotientFamilial !== '';
        
        return shouldShowAllocataireCAF(typeAct, activityPeriod) && !hasQF && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">
                Statut allocataire CAF (requis pour aides vacances)
              </p>
            </div>
            <div className="space-y-2">
              <Label>Êtes-vous allocataire CAF ?</Label>
              <RadioGroup value={isAllocataireCaf} onValueChange={(value) => setIsAllocataireCaf(value as 'oui'|'non')}>
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
      })()}


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
            {periodType === "saison_scolaire" ? "Calculer mon aide" : "Calculer mes aides"}
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
      {calculated && aids.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Aides estimées</h4>
            {aids.map((aid, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${aid.is_potential ? 'bg-yellow-50 border border-yellow-200' : 'bg-accent/50'}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{aid.aid_name}</span>
                    {aid.is_potential && (
                      <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-700 bg-yellow-100">
                        Potentiel
                      </Badge>
                    )}
                    {!aid.is_potential && (
                      <Badge variant="secondary" className="text-xs">
                        {TERRITORY_ICONS[aid.territory_level as keyof typeof TERRITORY_ICONS]}{" "}
                        {aid.territory_level}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className={`text-lg font-bold ${aid.is_potential ? 'text-yellow-600' : 'text-primary'}`}>
                  {aid.is_potential ? `~${Number(aid.amount).toFixed(0)}€` : `${Number(aid.amount).toFixed(2)}€`}
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
                        toast({ title: "Renseignez votre QF ci-dessus" });
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
          {!isLoggedIn && (
            <div className="pt-4">
              <Alert className="bg-primary/10 border-primary/30">
                <UserPlus className="h-4 w-4 text-primary" />
                <AlertDescription className="space-y-3">
                  <p className="text-sm font-medium">
                    Pour profiter de vos aides et inscrire votre enfant à cette activité
                  </p>
                  <Button
                    onClick={() => navigate("/signup")}
                    className="w-full"
                    size="lg"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Créer mon compte gratuit
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </>
      )}

      {calculated && aids.length === 0 && (
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
          {!isLoggedIn && (
            <div className="pt-4">
              <Alert className="bg-primary/10 border-primary/30">
                <UserPlus className="h-4 w-4 text-primary" />
                <AlertDescription className="space-y-3">
                  <p className="text-sm font-medium">
                    Pour inscrire votre enfant à cette activité
                  </p>
                  <Button
                    onClick={() => navigate("/signup")}
                    className="w-full"
                    size="lg"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Créer mon compte gratuit
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
// Test sync Claude Code Tue Dec  2 19:17:09 UTC 2025
