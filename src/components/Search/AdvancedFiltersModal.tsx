/**
 * LOT 6 - AdvancedFiltersModal Component
 * Complex modal with multiple filter sections
 * Bottom sheet on mobile, centered modal on desktop
 */

import { X } from 'lucide-react';
import { AdvancedFilters } from '@/types/searchFilters';
import { AdvancedFiltersContent } from './AdvancedFiltersContent';
import { AdvancedFiltersFooter } from './AdvancedFiltersFooter';

interface AdvancedFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  resultsCount: number;
  isCountLoading: boolean;
  onApply: () => void;
  onClear: () => void;
}

export const AdvancedFiltersModal = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  resultsCount,
  isCountLoading,
  onApply,
  onClear
}: AdvancedFiltersModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:w-[600px] h-[90vh] sm:h-[85vh] bg-white sm:rounded-2xl shadow-xl flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold font-display text-gray-900">Filtres (V2)</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <AdvancedFiltersContent
            filters={filters}
            onFiltersChange={onFiltersChange}
          />
        </div>

        {/* Footer */}
        <AdvancedFiltersFooter
          onClear={onClear}
          onApply={onApply}
          resultsCount={resultsCount}
          isCountLoading={isCountLoading}
        />
      </div>
    </div>
  );
};


