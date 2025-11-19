import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import PageLayout from "@/components/PageLayout";
import { EnhancedSearchFilters } from "@/components/search/types";
import { WhoFilter } from "@/components/search/WhoFilter";
import { WhenFilter } from "@/components/search/WhenFilter";
import { WhereFilter } from "@/components/search/WhereFilter";
import { WhatFilter } from "@/components/search/WhatFilter";
import { BudgetAidsFilter } from "@/components/search/BudgetAidsFilter";
import { ArrowLeft } from "lucide-react";

export default function SearchFilters() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Parse initial filters from URL
  const [localFilters, setLocalFilters] = useState<EnhancedSearchFilters>(() => {
    const categories = searchParams.get("category") ? [searchParams.get("category")!] : [];
    const ageMin = searchParams.get("minAge") ? parseInt(searchParams.get("minAge")!) : undefined;
    const ageMax = searchParams.get("maxAge") ? parseInt(searchParams.get("maxAge")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : undefined;
    const hasFinancialAid = searchParams.get("hasAid") === "true";
    const hasAccessibility = searchParams.get("isPMR") === "true";
    const hasCovoiturage = searchParams.get("hasCovoiturage") === "true";

    return {
      categories,
      ageMin,
      ageMax,
      maxPrice,
      hasFinancialAid,
      hasAccessibility,
      hasCovoiturage,
      period: 'all'
    };
  });

  const handleApply = () => {
    // Build search params
    const params = new URLSearchParams();
    if (localFilters.categories.length > 0) {
      params.append("category", localFilters.categories[0]);
    }
    if (localFilters.ageMin) params.append("minAge", localFilters.ageMin.toString());
    if (localFilters.ageMax) params.append("maxAge", localFilters.ageMax.toString());
    if (localFilters.maxPrice) params.append("maxPrice", localFilters.maxPrice.toString());
    if (localFilters.hasFinancialAid) params.append("hasAid", "true");
    if (localFilters.hasAccessibility) params.append("isPMR", "true");
    if (localFilters.hasCovoiturage) params.append("hasCovoiturage", "true");
    
    // Navigate to search page with filters
    navigate(`/search?${params.toString()}`);
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
    <PageLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="container max-w-2xl px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                <ArrowLeft size={18} />
                Retour
              </Button>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary">{activeFiltersCount} actif(s)</Badge>
              )}
            </div>
            <h1 className="text-2xl font-display font-bold">Filtres de recherche</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Affinez votre recherche selon vos besoins
            </p>
          </div>
        </div>

        {/* Filters Content */}
        <div className="container max-w-2xl px-4 py-6">
          <div className="space-y-6">
            {/* Où ? - EN PREMIER sur mobile (critère prioritaire pour parents) */}
            <WhereFilter
              location={localFilters.location}
              maxTravelTime={localFilters.maxTravelTime}
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
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-background border-t">
          <div className="container max-w-2xl px-4 py-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleReset}
                className="w-full sm:w-auto sm:flex-1"
              >
                Réinitialiser
              </Button>
              <Button
                onClick={handleApply}
                className="w-full sm:w-auto sm:flex-1"
              >
                Appliquer les filtres
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
