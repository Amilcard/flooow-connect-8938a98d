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
    <>
      <header className="w-full bg-background border-b border-border">
        <div className="container px-4 py-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" 
                size={20}
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
                className="pl-12 pr-4 h-12 rounded-lg text-base bg-background border border-border focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Rechercher des activités"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-lg border-border"
              onClick={() => {
                navigate('/search/filters');
                onFilterClick?.();
              }}
              aria-label="Filtrer les résultats"
            >
              <SlidersHorizontal size={20} className="text-text-main" />
            </Button>
          </form>
        </div>
      </header>
    </>
  );
};
