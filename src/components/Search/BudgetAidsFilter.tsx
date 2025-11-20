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
  onChange
}: BudgetAidsFilterProps) => {
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
            Accessible PMR
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
    </div>
  );
};
