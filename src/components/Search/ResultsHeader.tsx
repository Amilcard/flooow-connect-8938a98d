/**
 * LOT 6 - ResultsHeader Component
 * Shows results count, sort dropdown, and view toggle
 */

interface ResultsHeaderProps {
  resultsCount: number;
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: 'map' | 'list';
  onViewModeChange: (mode: 'map' | 'list') => void;
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
    <div className="px-4 py-4 bg-background border-b border-border flex flex-col md:flex-row gap-4 md:justify-between md:items-center sticky top-[130px] z-20">
      {/* Results Count */}
      <h2 className="text-base font-semibold text-foreground font-poppins">
        {resultsCount} activité{resultsCount > 1 ? 's' : ''} trouvée{resultsCount > 1 ? 's' : ''}
      </h2>

      {/* Sort & View Controls */}
      <div className="flex gap-3 items-center justify-between w-full md:w-auto">
        {/* Sort Dropdown */}
        <div className="flex-1 md:flex-none">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full md:w-auto px-3 py-2 bg-muted border border-border rounded-lg cursor-pointer text-sm font-medium text-foreground font-poppins focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* View Toggle - List / Map */}
        <div className="flex bg-muted p-1 rounded-lg">
          <button
            onClick={() => onViewModeChange('list')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === 'list'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Liste
          </button>
          <button
            onClick={() => onViewModeChange('map')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === 'map'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Carte
          </button>
        </div>
      </div>
    </div>
  );
};
