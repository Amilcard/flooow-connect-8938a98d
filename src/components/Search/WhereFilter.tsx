import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CITY_PLACEHOLDER } from "@/config/territories";

interface WhereFilterData {
  location?: string;
  maxTravelTime?: string;
}

interface WhereFilterProps extends WhereFilterData {
  onChange: (updates: Partial<WhereFilterData>) => void;
}

// TODO: Remplacer par données dynamiques depuis Supabase/API
// Ces villes sont des données de démo pour le pilote
const DEMO_LOCATIONS = [
  "Toutes les villes",
  // Villes pilotes (démo)
  "La Ricamarie",
  "Firminy",
  "Saint-Chamond",
  "Rive-de-Gier",
];

export const WhereFilter = ({
  location,
  maxTravelTime,
  onChange
}: WhereFilterProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold mb-3 block">Où ?</Label>

        <Select value={location || "all"} onValueChange={(value) => onChange({ location: value === "all" ? undefined : value })}>
          <SelectTrigger>
            <SelectValue placeholder={CITY_PLACEHOLDER} />
          </SelectTrigger>
          <SelectContent>
            {DEMO_LOCATIONS.map((loc) => (
              <SelectItem key={loc} value={loc === "Toutes les villes" ? "all" : loc}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">Ville ou code postal.</p>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Temps de trajet maximum</Label>

        <Select value={maxTravelTime || "any"} onValueChange={(value) => onChange({ maxTravelTime: value === "any" ? undefined : value })}>
          <SelectTrigger>
            <SelectValue placeholder="Peu importe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Peu importe</SelectItem>
            <SelectItem value="15">Moins de 15 min</SelectItem>
            <SelectItem value="30">15–30 min</SelectItem>
            <SelectItem value="30plus">Plus de 30 min</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
