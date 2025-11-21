/**
 * LOT 6 - SearchPageHeader Component
 * Sticky header with BackButton, SearchBar, and Filters button
 * NO decorative icons (only Search, X, and back arrow allowed)
 */

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { BackButton } from '@/components/BackButton';

interface SearchPageHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFiltersCount: number;
  onOpenFilters: () => void;
}

export const SearchPageHeader = ({
  searchQuery,
  onSearchChange,
  activeFiltersCount,
  onOpenFilters
}: SearchPageHeaderProps) => {
  const handleClear = () => {
    onSearchChange('');
  };

  return (
    <div className="sticky top-0 z-[100] bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        {/* BackButton - cohérent avec LOT 1 - positioning relative pour alignement avec le contenu */}
        <BackButton positioning="relative" size="sm" />

        {/* SearchBar */}
        <div className="flex-1 flex items-center gap-2 bg-gray-50 border-2 border-gray-200 rounded-[10px] px-3 py-2.5 transition-all focus-within:border-primary">
          <Search size={20} className="text-gray-400 flex-shrink-0" />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Sport, culture, quartier..."
            className="flex-1 bg-transparent border-none outline-none text-[15px] text-gray-900 placeholder:text-gray-400 font-poppins"
          />

          {searchQuery && (
            <button
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="Effacer la recherche"
            >
              <X size={18} className="text-gray-600" />
            </button>
          )}
        </div>

        {/* Filters Button */}
        <button
          onClick={onOpenFilters}
          className="relative px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-[10px] transition-all hover:border-primary hover:bg-white"
          aria-label="Ouvrir les filtres"
        >
          <span className="text-sm font-semibold text-gray-900 font-poppins">
            Filtres
          </span>

          {/* Badge Count */}
          {activeFiltersCount > 0 && (
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <span className="text-[11px] font-bold text-white font-poppins">
                {activeFiltersCount}
              </span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
