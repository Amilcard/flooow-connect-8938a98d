/**
 * LOT 6 - ActiveFiltersDisplay Component
 * Shows active filters as removable tags
 */

import { X } from 'lucide-react';
import { ActiveFilterTag } from '@/types/searchFilters';

interface ActiveFiltersDisplayProps {
  activeFilters: ActiveFilterTag[];
  onRemoveFilter: (filterId: string) => void;
  onClearAll: () => void;
}

export const ActiveFiltersDisplay = ({
  activeFilters,
  onRemoveFilter,
  onClearAll
}: ActiveFiltersDisplayProps) => {
  if (activeFilters.length === 0) return null;

  return (
    <div className="px-4 py-3 bg-background border-b border-border flex gap-2 flex-wrap items-center">
      <span className="text-[13px] font-semibold text-muted-foreground font-poppins">
        Filtres actifs:
      </span>

      {activeFilters.map((filter) => (
        <div
          key={filter.id}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted border border-border rounded-lg"
        >
          <span className="text-[13px] font-medium text-muted-foreground font-poppins">
            {filter.label}
          </span>

          <button
            onClick={() => onRemoveFilter(filter.id)}
            className="p-0.5 rounded-full hover:bg-muted/80 transition-colors"
            aria-label={`Retirer le filtre ${filter.label}`}
          >
            <X size={14} className="text-muted-foreground" />
          </button>
        </div>
      ))}

      {activeFilters.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-[13px] font-semibold text-red-500 underline hover:text-red-600 font-poppins ml-2"
        >
          Tout effacer
        </button>
      )}
    </div>
  );
};
