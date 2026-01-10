import { useState, useCallback, ChangeEvent, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  onFilterClick?: () => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export const SearchBar = ({
  onFilterClick,
  onSearch,
  placeholder = "Rechercher une activite..."
}: SearchBarProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.append("q", searchQuery);
      navigate(`/search?${params.toString()}`);
    }
  }, [onSearch, searchQuery, navigate]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(e as unknown as React.FormEvent);
    }
  }, [handleSearch]);

  const handleFilterClick = useCallback(() => {
    if (onFilterClick) {
      onFilterClick();
    } else {
      navigate('/search/filters');
    }
  }, [onFilterClick, navigate]);

  return (
    <header className="w-full bg-white flex justify-center" data-tour="search-bar">
      <div className="w-full max-w-5xl mx-auto px-4 py-3 md:py-4">
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <div className="relative flex-1 h-12 md:h-[52px]">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={20}
              aria-hidden="true"
            />
            <Input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="pl-12 pr-4 h-full rounded-xl text-[15px] font-normal bg-white border border-border-subtle focus-visible:ring-0 focus-visible:border-border-subtle placeholder:text-text-muted"
              aria-label="Rechercher des activites"
              data-tour-id="global-search-bar"
            />
          </div>
          <button
            type="button"
            onClick={handleFilterClick}
            aria-label="Filtrer les resultats"
            className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg hover:bg-muted transition-colors"
            data-tour="filters-button"
          >
            <SlidersHorizontal size={20} className="text-muted-foreground" />
          </button>
        </form>
      </div>
    </header>
  );
};
