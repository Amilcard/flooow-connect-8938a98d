import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchFilterModal, SearchFilters } from "./SearchFilterModal";

interface SearchBarProps {
  onFilterClick?: () => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ 
  onFilterClick, 
  onSearch,
  placeholder = "Rechercher une activité..." 
}: SearchBarProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    hasAccessibility: false,
    hasFinancialAid: false,
    hasCovoiturage: false
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleApplyFilters = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    
    // Build search params
    const params = new URLSearchParams();
    if (newFilters.categories.length > 0) {
      params.append("category", newFilters.categories[0]);
    }
    if (newFilters.ageMin) params.append("minAge", newFilters.ageMin.toString());
    if (newFilters.ageMax) params.append("maxAge", newFilters.ageMax.toString());
    if (newFilters.maxPrice) params.append("maxPrice", newFilters.maxPrice.toString());
    if (newFilters.hasFinancialAid) params.append("hasAid", "true");
    if (newFilters.hasAccessibility) params.append("isPMR", "true");
    if (newFilters.hasCovoiturage) params.append("hasCovoiturage", "true");
    
    // Navigate to search page with filters
    navigate(`/search?${params.toString()}`);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setFilters({
      categories: [],
      hasAccessibility: false,
      hasFinancialAid: false,
      hasCovoiturage: false
    });
  };

  const activeFiltersCount = 
    filters.categories.length +
    (filters.hasAccessibility ? 1 : 0) +
    (filters.hasFinancialAid ? 1 : 0) +
    (filters.hasCovoiturage ? 1 : 0);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container px-4 py-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" 
                size={20}
                aria-hidden="true"
              />
              <Input
                type="search"
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-14 rounded-full text-base bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Rechercher des activités"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-full border-0 bg-secondary/50 relative"
              onClick={() => {
                setShowFilters(true);
                onFilterClick?.();
              }}
              aria-label="Filtrer les résultats"
            >
              <SlidersHorizontal size={20} />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </form>
        </div>
      </header>

      <SearchFilterModal
        open={showFilters}
        onOpenChange={setShowFilters}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />
    </>
  );
};
