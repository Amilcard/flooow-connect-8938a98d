import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface WhoFilterData {
  childId?: string;
  ageMin?: number;
  ageMax?: number;
  needsHandicapSupport?: boolean;
  needsAseSupport?: boolean;
  needsSchoolSupport?: boolean;
}

interface WhoFilterProps extends WhoFilterData {
  onChange: (updates: Partial<WhoFilterData>) => void;
}

export const WhoFilter = ({
  childId,
  ageMin = 3,
  ageMax = 18,
  needsHandicapSupport,
  needsAseSupport,
  needsSchoolSupport,
  onChange
}: WhoFilterProps) => {
  const { user } = useAuth();

  const { data: children } = useQuery({
    queryKey: ['user-children', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold mb-3 block">Pour quel enfant ?</Label>
        
        {user && children && children.length > 0 ? (
          <Select value={childId || "age-range"} onValueChange={(value) => {
            if (value === "age-range") {
              onChange({ childId: undefined });
            } else {
              onChange({ childId: value });
            }
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un enfant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="age-range">Tous mes enfants / Recherche par âge</SelectItem>
              {children.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  {child.first_name} ({child.dob ? new Date().getFullYear() - new Date(child.dob).getFullYear() : '?'} ans)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        {(!user || !childId) && (
          <div className="mt-4 space-y-2">
            <Label className="text-sm text-muted-foreground">Âge de l'enfant</Label>
            <Slider
              min={3}
              max={18}
              step={1}
              value={[ageMin, ageMax]}
              onValueChange={([min, max]) => onChange({ ageMin: min, ageMax: max })}
              className="mt-2"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{ageMin} ans</span>
              <span>{ageMax} ans</span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 pt-2">
        <Label className="text-sm font-medium">Besoins spécifiques (optionnel)</Label>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="handicap"
            checked={needsHandicapSupport}
            onCheckedChange={(checked) => onChange({ needsHandicapSupport: checked as boolean })}
          />
          <Label htmlFor="handicap" className="text-sm font-normal cursor-pointer">
            Handicap / accompagnement
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="ase"
            checked={needsAseSupport}
            onCheckedChange={(checked) => onChange({ needsAseSupport: checked as boolean })}
          />
          <Label htmlFor="ase" className="text-sm font-normal cursor-pointer">
            Suivi ASE / protection de l'enfance
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="school"
            checked={needsSchoolSupport}
            onCheckedChange={(checked) => onChange({ needsSchoolSupport: checked as boolean })}
          />
          <Label htmlFor="school" className="text-sm font-normal cursor-pointer">
            Soutien scolaire / risque de décrochage
          </Label>
        </div>
      </div>
    </div>
  );
};
