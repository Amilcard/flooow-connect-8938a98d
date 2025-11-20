import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface WhenFilterData {
  period?: string;
  vacationType?: string;
  schoolType?: string;
}

interface WhenFilterProps extends WhenFilterData {
  onChange: (updates: Partial<WhenFilterData>) => void;
}

export const WhenFilter = ({
  period = 'all',
  vacationType,
  schoolType,
  onChange
}: WhenFilterProps) => {
  const showVacationTypes = period === 'spring_2026' || period === 'summer_2026';
  const showSchoolTypes = period === 'school_year_2026' || period === 'wednesdays';

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold mb-3 block">Quand ?</Label>
        
        <RadioGroup value={period} onValueChange={(value) => onChange({ period: value })}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="period-all" />
            <Label htmlFor="period-all" className="font-normal cursor-pointer">
              Toutes périodes
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="spring_2026" id="period-spring" />
            <Label htmlFor="period-spring" className="font-normal cursor-pointer">
              Vacances printemps 2026
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="summer_2026" id="period-summer" />
            <Label htmlFor="period-summer" className="font-normal cursor-pointer">
              Vacances été 2026
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="school_year_2026" id="period-school" />
            <Label htmlFor="period-school" className="font-normal cursor-pointer">
              Année scolaire 2026–2027
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="wednesdays" id="period-wednesdays" />
            <Label htmlFor="period-wednesdays" className="font-normal cursor-pointer">
              Mercredis / périscolaire
            </Label>
          </div>
        </RadioGroup>
      </div>

      {showVacationTypes && (
        <div className="pl-6 space-y-2 border-l-2 border-border">
          <Label className="text-sm font-medium">Type d'accueil</Label>
          <RadioGroup value={vacationType} onValueChange={(value) => onChange({ vacationType: value })}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sejour_semaine" id="vac-sejour" />
              <Label htmlFor="vac-sejour" className="text-sm font-normal cursor-pointer">
                Séjour à la semaine (avec nuitée)
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="centre_journee" id="vac-jour" />
              <Label htmlFor="vac-jour" className="text-sm font-normal cursor-pointer">
                Centre de loisirs – à la journée
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="centre_demi_journee" id="vac-demi" />
              <Label htmlFor="vac-demi" className="text-sm font-normal cursor-pointer">
                Centre de loisirs – demi-journée
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}

      {showSchoolTypes && (
        <div className="pl-6 space-y-2 border-l-2 border-border">
          <Label className="text-sm font-medium">Durée</Label>
          <RadioGroup value={schoolType} onValueChange={(value) => onChange({ schoolType: value })}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="annee" id="school-year" />
              <Label htmlFor="school-year" className="text-sm font-normal cursor-pointer">
                À l'année
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="trimestre" id="school-trimester" />
              <Label htmlFor="school-trimester" className="text-sm font-normal cursor-pointer">
                Au trimestre
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cycle_court" id="school-cycle" />
              <Label htmlFor="school-cycle" className="text-sm font-normal cursor-pointer">
                Cycle court (6–8 séances)
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}
    </div>
  );
};
