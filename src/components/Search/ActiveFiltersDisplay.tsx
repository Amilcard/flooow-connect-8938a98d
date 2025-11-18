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
    <div className="px-4 py-3 bg-white border-b border-gray-200 flex gap-2 flex-wrap items-center">
      <span className="text-[13px] font-semibold text-gray-600 font-poppins">
        Filtres actifs:
      </span>

      {activeFilters.map((filter) => (
        <div
          key={filter.id}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg"
        >
          <span className="text-[13px] font-medium text-gray-700 font-poppins">
            {filter.label}
          </span>

          <button
            onClick={() => onRemoveFilter(filter.id)}
            className="p-0.5 rounded-full hover:bg-gray-200 transition-colors"
            aria-label={`Retirer le filtre ${filter.label}`}
          >
            <X size={14} className="text-gray-400" />
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
