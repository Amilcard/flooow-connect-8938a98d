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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EnhancedSearchFilters } from "./search/types";
import { WhoFilter } from "./search/WhoFilter";
import { WhenFilter } from "./search/WhenFilter";
import { WhereFilter } from "./search/WhereFilter";
import { WhatFilter } from "./search/WhatFilter";
import { BudgetAidsFilter } from "./search/BudgetAidsFilter";

// Maintien de l'ancienne interface pour la compatibilité
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

export const SearchFilterModal = ({
  open,
  onOpenChange,
  filters,
  onApplyFilters,
  onResetFilters
}: SearchFilterModalProps) => {
  const [localFilters, setLocalFilters] = useState<EnhancedSearchFilters>({
    categories: filters.categories || [],
    hasAccessibility: filters.hasAccessibility || false,
    hasFinancialAid: filters.hasFinancialAid || false,
    hasCovoiturage: filters.hasCovoiturage || false,
    ageMin: filters.ageMin,
    ageMax: filters.ageMax,
    maxPrice: filters.maxPrice,
    period: 'all'
  });

  const handleApply = () => {
    // Convertir vers l'ancien format pour la compatibilité
    const compatibleFilters: SearchFilters = {
      categories: localFilters.categories,
      hasAccessibility: localFilters.hasAccessibility || false,
      hasFinancialAid: localFilters.hasFinancialAid || false,
      hasCovoiturage: localFilters.hasCovoiturage || false,
      ageMin: localFilters.ageMin,
      ageMax: localFilters.ageMax,
      maxPrice: localFilters.maxPrice
    };
    onApplyFilters(compatibleFilters);
    onOpenChange(false);
  };

  const handleReset = () => {
    const resetFilters: EnhancedSearchFilters = {
      categories: [],
      hasAccessibility: false,
      hasFinancialAid: false,
      hasCovoiturage: false,
      period: 'all'
    };
    setLocalFilters(resetFilters);
    onResetFilters();
  };

  const activeFiltersCount = 
    localFilters.categories.length +
    (localFilters.childId ? 1 : 0) +
    (localFilters.period && localFilters.period !== 'all' ? 1 : 0) +
    (localFilters.location ? 1 : 0) +
    (localFilters.activityType ? 1 : 0) +
    (localFilters.hasAccessibility ? 1 : 0) +
    (localFilters.hasFinancialAid ? 1 : 0) +
    (localFilters.hasCovoiturage ? 1 : 0) +
    (localFilters.needsHandicapSupport ? 1 : 0) +
    (localFilters.needsAseSupport ? 1 : 0) +
    (localFilters.needsSchoolSupport ? 1 : 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Filtres de recherche
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount} actif(s)</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Affinez votre recherche selon vos besoins
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Pour qui ? */}
          <WhoFilter
            childId={localFilters.childId}
            ageMin={localFilters.ageMin}
            ageMax={localFilters.ageMax}
            needsHandicapSupport={localFilters.needsHandicapSupport}
            needsAseSupport={localFilters.needsAseSupport}
            needsSchoolSupport={localFilters.needsSchoolSupport}
            onChange={(updates) => setLocalFilters(prev => ({ ...prev, ...updates }))}
          />

          <Separator />

          {/* Quand ? */}
          <WhenFilter
            period={localFilters.period}
            vacationType={localFilters.vacationType}
            schoolType={localFilters.schoolType}
            onChange={(updates) => setLocalFilters(prev => ({ ...prev, ...updates }))}
          />

          <Separator />

          {/* Où ? */}
          <WhereFilter
            location={localFilters.location}
            maxTravelTime={localFilters.maxTravelTime}
            onChange={(updates) => setLocalFilters(prev => ({ ...prev, ...updates }))}
          />

          <Separator />

          {/* Quoi ? */}
          <WhatFilter
            categories={localFilters.categories}
            activityType={localFilters.activityType}
            onChange={(updates) => setLocalFilters(prev => ({ ...prev, ...updates }))}
          />

          <Separator />

          {/* Budget & aides */}
          <BudgetAidsFilter
            maxPrice={localFilters.maxPrice}
            hasFinancialAid={localFilters.hasFinancialAid}
            hasModulatedPricing={localFilters.hasModulatedPricing}
            hasAccessibility={localFilters.hasAccessibility}
            hasCovoiturage={localFilters.hasCovoiturage}
            vacationType={localFilters.vacationType}
            schoolType={localFilters.schoolType}
            activityType={localFilters.activityType}
            onChange={(updates) => setLocalFilters(prev => ({ ...prev, ...updates }))}
          />
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
