import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

interface BudgetAidsFilterData {
  maxPrice?: number;
  hasFinancialAid?: boolean;
  hasModulatedPricing?: boolean;
  hasAccessibility?: boolean;
  hasCovoiturage?: boolean;
  vacationType?: string;
  schoolType?: string;
  activityType?: string;
  financialAidsAccepted?: string[]; // Nouveau: aides spécifiques
}

interface BudgetAidsFilterProps extends BudgetAidsFilterData {
  onChange: (updates: Partial<BudgetAidsFilterData>) => void;
}

export const BudgetAidsFilter = ({
  maxPrice = 200,
  hasFinancialAid,
  hasModulatedPricing,
  hasAccessibility,
  hasCovoiturage,
  vacationType,
  schoolType,
  activityType,
  financialAidsAccepted = [],
  onChange
}: BudgetAidsFilterProps) => {
  
  // Helper pour toggle une aide spécifique
  const toggleAid = (aidId: string) => {
    const current = financialAidsAccepted || [];
    const updated = current.includes(aidId)
      ? current.filter(a => a !== aidId)
      : [...current, aidId];
    onChange({ financialAidsAccepted: updated });
  };
  // Déterminer le libellé du budget selon le type d'activité
  let priceLabel = "par activité";
  let maxBudget = 200;

  if (vacationType === 'sejour_semaine' || activityType === 'sejour') {
    priceLabel = "par semaine de séjour";
    maxBudget = 1000;
  } else if (vacationType === 'centre_journee') {
    priceLabel = "par jour";
    maxBudget = 50;
  } else if (vacationType === 'centre_demi_journee') {
    priceLabel = "par demi-journée";
    maxBudget = 30;
  } else if (schoolType === 'annee' || activityType === 'cours_regulier') {
    priceLabel = "par an";
    maxBudget = 500;
  } else if (schoolType === 'trimestre') {
    priceLabel = "par trimestre";
    maxBudget = 200;
  } else if (schoolType === 'cycle_court' || activityType === 'stage') {
    priceLabel = "pour le cycle/stage";
    maxBudget = 150;
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold mb-3 block">Budget & aides</Label>
        
        <div className="space-y-3">
          <Label className="text-sm">
            Budget maximum : {maxPrice}€ <span className="text-muted-foreground">{priceLabel}</span>
          </Label>
          <Slider
            min={0}
            max={maxBudget}
            step={maxBudget > 200 ? 50 : 5}
            value={[Math.min(maxPrice, maxBudget)]}
            onValueChange={([value]) => onChange({ maxPrice: value })}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0€</span>
            <span>{maxBudget}€</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Options</Label>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="aid"
            checked={hasFinancialAid}
            onCheckedChange={(checked) => onChange({ hasFinancialAid: checked as boolean })}
          />
          <Label htmlFor="aid" className="text-sm font-normal cursor-pointer">
            Aides financières disponibles
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="modulated"
            checked={hasModulatedPricing}
            onCheckedChange={(checked) => onChange({ hasModulatedPricing: checked as boolean })}
          />
          <Label htmlFor="modulated" className="text-sm font-normal cursor-pointer">
            Tarifs modulés selon QF
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="accessibility"
            checked={hasAccessibility}
            onCheckedChange={(checked) => onChange({ hasAccessibility: checked as boolean })}
          />
          <Label htmlFor="accessibility" className="text-sm font-normal cursor-pointer">
            Activité InKlusif
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="covoiturage"
            checked={hasCovoiturage}
            onCheckedChange={(checked) => onChange({ hasCovoiturage: checked as boolean })}
          />
          <Label htmlFor="covoiturage" className="text-sm font-normal cursor-pointer">
            Covoiturage / transport éco-responsable disponible
          </Label>
        </div>
      </div>

      {/* Section Aides Financières */}
      <div className="space-y-3 pt-4 border-t">
        <Label className="text-sm font-medium">Aides financières acceptées</Label>
        
        {/* Aides nationales */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground font-normal">Aides nationales</Label>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="aid-pass-sport"
              checked={financialAidsAccepted.includes("pass_sport")}
              onCheckedChange={() => toggleAid("pass_sport")}
            />
            <Label htmlFor="aid-pass-sport" className="text-sm font-normal cursor-pointer">
              ⚽ Pass'Sport (50€)
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="aid-pass-culture"
              checked={financialAidsAccepted.includes("pass_culture")}
              onCheckedChange={() => toggleAid("pass_culture")}
            />
            <Label htmlFor="aid-pass-culture" className="text-sm font-normal cursor-pointer">
              🎭 Pass Culture (15-17 ans)
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="aid-pass-colo"
              checked={financialAidsAccepted.includes("pass_colo")}
              onCheckedChange={() => toggleAid("pass_colo")}
            />
            <Label htmlFor="aid-pass-colo" className="text-sm font-normal cursor-pointer">
              🏕️ Pass Colo (11 ans)
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="aid-ancv"
              checked={financialAidsAccepted.includes("ancv")}
              onCheckedChange={() => toggleAid("ancv")}
            />
            <Label htmlFor="aid-ancv" className="text-sm font-normal cursor-pointer">
              🎫 ANCV (Chèques Vacances)
            </Label>
          </div>
        </div>
        
        {/* Aides locales (Loire) */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground font-normal">Aides Loire (42)</Label>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="aid-caf-loire"
              checked={financialAidsAccepted.includes("caf_loire_temps_libre")}
              onCheckedChange={() => toggleAid("caf_loire_temps_libre")}
            />
            <Label htmlFor="aid-caf-loire" className="text-sm font-normal cursor-pointer">
              🏦 CAF Loire Temps Libre
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="aid-vacaf-ave"
              checked={financialAidsAccepted.includes("vacaf_ave")}
              onCheckedChange={() => toggleAid("vacaf_ave")}
            />
            <Label htmlFor="aid-vacaf-ave" className="text-sm font-normal cursor-pointer">
              🏖️ VACAF - AVE (Enfants)
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="aid-vacaf-avf"
              checked={financialAidsAccepted.includes("vacaf_avf")}
              onCheckedChange={() => toggleAid("vacaf_avf")}
            />
            <Label htmlFor="aid-vacaf-avf" className="text-sm font-normal cursor-pointer">
              👨‍👩‍👧 VACAF - AVF (Familles)
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
};
