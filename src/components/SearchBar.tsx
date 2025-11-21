import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Si callback fourni, l'appeler
    onSearch?.(searchQuery);

    // Naviguer vers page recherche avec query
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.append("q", searchQuery);
      navigate(`/search?${params.toString()}`);
    }
  };


  return (
    <header className="w-full bg-white flex justify-center">
      <div className="w-full max-w-[940px] px-4 py-3 md:py-4">
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <div className="relative flex-1 h-12 md:h-[52px]">
            <Search 
              className="absolute left-4 top-1/2 -translate-y-1/2" 
              size={20}
              color="#9CA3AF"
              aria-hidden="true"
            />
            <Input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch(e as any);
                }
              }}
              className="pl-12 pr-4 h-full rounded-xl text-[15px] font-normal bg-white border border-border-subtle focus-visible:ring-0 focus-visible:border-border-subtle placeholder:text-text-muted"
              aria-label="Rechercher des activités"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              navigate('/search/filters');
              onFilterClick?.();
            }}
            aria-label="Filtrer les résultats"
            className="flex items-center justify-center"
          >
            <SlidersHorizontal size={20} color="#6B7280" />
          </button>
        </form>
      </div>
    </header>
  );
};
