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
    <header className="w-full bg-white box-border">
      <div className="px-4 py-3 box-border">
        <form onSubmit={handleSearch} className="flex items-center gap-3 w-full box-border">
          <div className="relative flex-1 h-11 min-w-0">
            <Search 
              className="absolute left-4 top-1/2 -translate-y-1/2 flex-shrink-0" 
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
              className="w-full pl-12 pr-4 h-11 rounded-xl text-[15px] font-normal bg-white border border-[#E5E7EB] focus-visible:ring-0 focus-visible:border-[#E5E7EB] placeholder:text-[#9CA3AF] box-border"
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
            className="flex items-center justify-center flex-shrink-0"
          >
            <SlidersHorizontal size={20} color="#6B7280" />
          </button>
        </form>
      </div>
    </header>
  );
};
