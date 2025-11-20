import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface WhatFilterData {
  categories: string[];
  activityType?: string;
}

interface WhatFilterProps extends WhatFilterData {
  onChange: (updates: Partial<WhatFilterData>) => void;
}

const CATEGORIES = [
  "Sport",
  "Culture",
  "Loisirs",
  "Vacances",
  "Scolarité",
  "Insertion"
];

export const WhatFilter = ({
  categories,
  activityType,
  onChange
}: WhatFilterProps) => {
  const toggleCategory = (category: string) => {
    const newCategories = categories.includes(category)
      ? categories.filter(c => c !== category)
      : [...categories, category];
    onChange({ categories: newCategories });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold mb-3 block">Type d'activité</Label>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIES.map((category) => (
            <Badge
              key={category}
              variant={categories.includes(category) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleCategory(category)}
            >
              {category}
              {categories.includes(category) && (
                <X size={14} className="ml-1" />
              )}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Type d'accueil</Label>
        
        <RadioGroup value={activityType || "all"} onValueChange={(value) => onChange({ activityType: value === "all" ? undefined : value })}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="type-all" />
            <Label htmlFor="type-all" className="text-sm font-normal cursor-pointer">
              Tous types
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sejour" id="type-sejour" />
            <Label htmlFor="type-sejour" className="text-sm font-normal cursor-pointer">
              Séjour / colonie (avec nuitée)
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="centre_loisirs" id="type-centre" />
            <Label htmlFor="type-centre" className="text-sm font-normal cursor-pointer">
              Centre de loisirs / accueil de jour
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="stage" id="type-stage" />
            <Label htmlFor="type-stage" className="text-sm font-normal cursor-pointer">
              Stage (quelques jours sans nuitée)
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cours_regulier" id="type-cours" />
            <Label htmlFor="type-cours" className="text-sm font-normal cursor-pointer">
              Cours / entraînement régulier
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};
