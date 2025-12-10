/**
 * LOT 6 - QuickFiltersBar Component
 * Horizontal scrollable chips for quick 1-click filters
 * Most used filters: séance d'essai, vacances été, âge, aides, proche, mercredi, sport, culture
 */

import { QuickFilters, QuickFilterChip } from '@/types/searchFilters';

interface QuickFiltersBarProps {
  quickFilters: QuickFilters;
  onToggleFilter: (filterId: keyof QuickFilters) => void;
}

const QUICK_FILTER_CHIPS: QuickFilterChip[] = [
  {
    id: 'gratuit',
    label: 'Séance d\'essai',
    color_active: '#10B981',
    bg_active: '#DCFCE7'
  },
  {
    id: 'vacances_ete',
    label: 'Vacances été',
    color_active: '#F59E0B',
    bg_active: '#FEF3E2'
  },
  {
    id: 'age_6_12',
    label: '6-12 ans',
    color_active: '#4A90E2',
    bg_active: '#EFF6FF'
  },
  {
    id: 'avec_aides',
    label: 'Aides acceptées',
    color_active: '#F59E0B',
    bg_active: '#FEF3E2'
  },
  {
    id: 'proche',
    label: '< 2 km',
    color_active: '#EF4444',
    bg_active: '#FEE2E2'
  },
  {
    id: 'mercredi',
    label: 'Mercredi',
    color_active: '#3B82F6',
    bg_active: '#DBEAFE'
  },
  {
    id: 'sport',
    label: 'Sport',
    color_active: '#10B981',
    bg_active: '#DCFCE7'
  },
  {
    id: 'culture',
    label: 'Culture',
    color_active: '#F59E0B',
    bg_active: '#FEF3E2'
  }
];

export const QuickFiltersBar = ({ quickFilters, onToggleFilter }: QuickFiltersBarProps) => {
  return (
    <div className="sticky top-[69px] z-[90] bg-muted py-3 border-b border-border overflow-x-auto overflow-y-hidden scrollbar-hide webkit-overflow-scrolling-touch">
      <div className="max-w-5xl mx-auto">
        <div className="flex gap-2 px-4 whitespace-nowrap">
        {QUICK_FILTER_CHIPS.map((chip) => {
          const isActive = quickFilters[chip.id];

          return (
            <button
              key={chip.id}
              onClick={() => onToggleFilter(chip.id)}
              className="px-4 py-2 rounded-[20px] border-2 font-semibold text-sm font-poppins whitespace-nowrap transition-all hover:-translate-y-0.5"
              style={{
                backgroundColor: isActive ? chip.bg_active : '#FFFFFF',
                borderColor: isActive ? 'transparent' : '#E5E7EB',
                color: isActive ? chip.color_active : '#6B7280',
                fontWeight: isActive ? 700 : 600
              }}
              aria-pressed={isActive}
            >
              {chip.label}
            </button>
          );
        })}
        </div>
      </div>
    </div>
  );
};
