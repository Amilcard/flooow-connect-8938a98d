/**
 * LOT 6 - ResultsHeader Component
 * Shows results count, sort dropdown, and view toggle
 */

interface ResultsHeaderProps {
  resultsCount: number;
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const SORT_OPTIONS = [
  { value: 'pertinence', label: 'Pertinence' },
  { value: 'date_desc', label: 'Plus récentes' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'distance', label: 'Distance' }
];

export const ResultsHeader = ({
  resultsCount,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange
}: ResultsHeaderProps) => {
  return (
    <div className="px-4 py-4 bg-white border-b border-gray-200 flex justify-between items-center">
      {/* Results Count */}
      <h2 className="text-base font-semibold text-gray-900 font-poppins">
        {resultsCount} activité{resultsCount > 1 ? 's' : ''} trouvée{resultsCount > 1 ? 's' : ''}
      </h2>

      {/* Sort & View Controls */}
      <div className="flex gap-3 items-center">
        {/* Sort Dropdown - Hidden on mobile */}
        <div className="hidden md:block">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer text-sm font-medium text-gray-700 font-poppins"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* View Toggle - Desktop only */}
        <div className="hidden lg:flex gap-1">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`px-2 py-2 rounded-md text-[13px] font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`px-2 py-2 rounded-md text-[13px] font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Liste
          </button>
        </div>
      </div>
    </div>
  );
};
