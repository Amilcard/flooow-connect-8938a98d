import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export interface SearchFilters {
  ageMin?: number;
  ageMax?: number;
  categories: string[];
  hasAccessibility: boolean;
  hasFinancialAid: boolean;
  hasCovoiturage: boolean;
  maxPrice?: number;
}

interface SearchFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: SearchFilters;
  onApplyFilters: (filters: SearchFilters) => void;
  onResetFilters: () => void;
}

const categories = ["Sport", "Loisirs", "Vacances", "Scolarité", "Culture", "Santé & Bien-être", "Activités Innovantes"];

export const SearchFilterModal = ({
  open,
  onOpenChange,
  filters,
  onApplyFilters,
  onResetFilters
}: SearchFilterModalProps) => {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onOpenChange(false);
  };

  const handleReset = () => {
    const resetFilters: SearchFilters = {
      categories: [],
      hasAccessibility: false,
      hasFinancialAid: false,
      hasCovoiturage: false
    };
    setLocalFilters(resetFilters);
    onResetFilters();
  };

  const toggleCategory = (category: string) => {
    setLocalFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const activeFiltersCount = 
    localFilters.categories.length +
    (localFilters.hasAccessibility ? 1 : 0) +
    (localFilters.hasFinancialAid ? 1 : 0) +
    (localFilters.hasCovoiturage ? 1 : 0) +
    (localFilters.ageMin !== undefined ? 1 : 0) +
    (localFilters.maxPrice !== undefined ? 1 : 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Filtres de recherche
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount} actif(s)</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Affinez votre recherche d'activités
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Age Range */}
          <div className="space-y-3">
            <Label>Âge de l'enfant</Label>
            <div className="px-2">
              <Slider
                min={3}
                max={18}
                step={1}
                value={[localFilters.ageMin || 3, localFilters.ageMax || 18]}
                onValueChange={([min, max]) => {
                  setLocalFilters(prev => ({ ...prev, ageMin: min, ageMax: max }));
                }}
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>{localFilters.ageMin || 3} ans</span>
                <span>{localFilters.ageMax || 18} ans</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <Label>Catégories</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={localFilters.categories.includes(category) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                  {localFilters.categories.includes(category) && (
                    <X size={14} className="ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="space-y-3">
            <Label>Budget maximum</Label>
            <div className="space-y-3">
              <Label>Prix maximum : {localFilters.maxPrice || 200}€</Label>
              <Slider
                min={0}
                max={200}
                step={5}
                value={[localFilters.maxPrice || 200]}
                onValueChange={([value]) =>
                  setLocalFilters(prev => ({ ...prev, maxPrice: value }))
                }
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>0€</span>
                <span>{localFilters.maxPrice || 200}€</span>
              </div>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="aid"
                checked={localFilters.hasFinancialAid}
                onCheckedChange={(checked) => {
                  setLocalFilters(prev => ({ ...prev, hasFinancialAid: checked as boolean }));
                }}
              />
              <Label
                htmlFor="aid"
                className="text-sm font-normal cursor-pointer"
              >
                Aides financières disponibles
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="accessibility"
                checked={localFilters.hasAccessibility}
                onCheckedChange={(checked) => {
                  setLocalFilters(prev => ({ ...prev, hasAccessibility: checked as boolean }));
                }}
              />
              <Label
                htmlFor="accessibility"
                className="text-sm font-normal cursor-pointer"
              >
                Accessible PMR
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="covoiturage"
                checked={localFilters.hasCovoiturage}
                onCheckedChange={(checked) => {
                  setLocalFilters(prev => ({ ...prev, hasCovoiturage: checked as boolean }));
                }}
              />
              <Label
                htmlFor="covoiturage"
                className="text-sm font-normal cursor-pointer"
              >
                Covoiturage disponible
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full sm:w-auto"
          >
            Réinitialiser
          </Button>
          <Button
            onClick={handleApply}
            className="w-full sm:w-auto"
          >
            Appliquer les filtres
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
