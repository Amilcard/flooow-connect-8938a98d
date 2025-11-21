import { useState } from 'react';
import { AdvancedFilters } from '@/types/searchFilters';

interface AdvancedFiltersContentProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
}

export const AdvancedFiltersContent = ({
  filters,
  onFiltersChange
}: AdvancedFiltersContentProps) => {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    accessibility: true
  });

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <div className="space-y-0">
      {/* Geographic Section */}
      <FilterSection
        title="Où ?"
        isCollapsed={collapsedSections.geographic}
        onToggle={() => toggleSection('geographic')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 font-poppins">
              Ville ou quartier
            </label>
            <input
              type="text"
              value={filters.city}
              onChange={(e) => onFiltersChange({ ...filters, city: e.target.value })}
              placeholder="Ex: Saint-Étienne, Beaulieu..."
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-[15px] font-poppins focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 font-poppins">
              Distance maximum: {filters.max_distance} km
            </label>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={filters.max_distance}
              onChange={(e) =>
                onFiltersChange({ ...filters, max_distance: Number(e.target.value) })
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1 font-poppins">
              <span>0 km</span>
              <span>20 km</span>
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Temporal Section */}
      <FilterSection
        title="Quand ?"
        isCollapsed={collapsedSections.temporal}
        onToggle={() => toggleSection('temporal')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 font-poppins">
              Période
            </label>
            <div className="space-y-2">
              {[
                { value: 'all', label: 'Toutes périodes' },
                { value: 'spring_2026', label: 'Vacances printemps 2026', subtitle: '11-26 avril' },
                { value: 'summer_2026', label: 'Vacances été 2026', subtitle: '4 juil - 1 sept' },
                { value: 'school_year_2026', label: 'Année scolaire 2026-2027' },
                { value: 'wednesdays', label: 'Mercredis / périscolaire' }
              ].map((option) => (
                <label key={option.value} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="period"
                    value={option.value}
                    checked={filters.period === option.value}
                    onChange={(e) => onFiltersChange({ ...filters, period: e.target.value })}
                    className="mt-1 w-4 h-4 accent-primary cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 font-poppins">
                      {option.label}
                    </div>
                    {option.subtitle && (
                      <div className="text-xs text-gray-500 font-poppins">{option.subtitle}</div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Child Profile Section */}
      <FilterSection
        title="Pour quel enfant ?"
        isCollapsed={collapsedSections.child_profile}
        onToggle={() => toggleSection('child_profile')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 font-poppins">
              Âge de l'enfant: {filters.age_range[0]} - {filters.age_range[1]} ans
            </label>
            <div className="flex gap-2">
              <input
                type="range"
                min="4"
                max="17"
                value={filters.age_range[0]}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    age_range: [Number(e.target.value), filters.age_range[1]]
                  })
                }
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <input
                type="range"
                min="4"
                max="17"
                value={filters.age_range[1]}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    age_range: [filters.age_range[0], Number(e.target.value)]
                  })
                }
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1 font-poppins">
              <span>4 ans</span>
              <span>17 ans</span>
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Activity Type Section */}
      <FilterSection
        title="Type d'activité"
        isCollapsed={collapsedSections.activity_type}
        onToggle={() => toggleSection('activity_type')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 font-poppins">
              Catégories
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'sport', label: 'Sport', color: '#10B981' },
                { value: 'culture', label: 'Culture', color: '#F59E0B' },
                { value: 'loisirs', label: 'Loisirs', color: '#A855F7' },
                { value: 'vacances', label: 'Vacances', color: '#EF4444' },
                { value: 'scolaire', label: 'Scolaire', color: '#4A90E2' }
              ].map((cat) => {
                const isActive = filters.categories.includes(cat.value);
                return (
                  <button
                    key={cat.value}
                    onClick={() => {
                      const newCategories = isActive
                        ? filters.categories.filter((c) => c !== cat.value)
                        : [...filters.categories, cat.value];
                      onFiltersChange({ ...filters, categories: newCategories });
                    }}
                    className="px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all font-poppins"
                    style={{
                      backgroundColor: isActive ? `${cat.color}15` : 'white',
                      borderColor: isActive ? cat.color : '#E5E7EB',
                      color: isActive ? cat.color : '#6B7280'
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Financial Section */}
      <div data-tour-id="filter-section-budget">
        <FilterSection
          title="Budget & aides"
          isCollapsed={collapsedSections.financial}
          onToggle={() => toggleSection('financial')}
          isCritical
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 font-poppins">
                Budget maximum: {filters.max_budget === 200 ? '200€+' : `${filters.max_budget}€`}
              </label>
              <input
                type="range"
                min="0"
                max="200"
                step="5"
                value={filters.max_budget}
                onChange={(e) =>
                  onFiltersChange({ ...filters, max_budget: Number(e.target.value) })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1 font-poppins">
                <span>Gratuit</span>
                <span>50€</span>
                <span>100€</span>
                <span>200€+</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 font-poppins">
                Aides financières acceptées
              </label>
              <div className="space-y-2">
                {[
                  { value: 'pass_sport', label: "Pass'Sport (50€)", subtitle: 'Sport, 6-17 ans' },
                  { value: 'pass_culture', label: 'Pass Culture (20-300€)', subtitle: 'Culture, 15-18 ans' },
                  { value: 'vacaf', label: 'VACAF / Aides vacances CAF', subtitle: 'Vacances familles allocataires' },
                  { value: 'pass_colo', label: 'Pass Colo (200-350€)', subtitle: 'Colonies, 11 ans minimum' }
                ].map((aid) => (
                  <label key={aid.value} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.financial_aids_accepted.includes(aid.value)}
                      onChange={(e) => {
                        const newAids = e.target.checked
                          ? [...filters.financial_aids_accepted, aid.value]
                          : filters.financial_aids_accepted.filter((a) => a !== aid.value);
                        onFiltersChange({ ...filters, financial_aids_accepted: newAids });
                      }}
                      className="mt-1 w-4 h-4 accent-primary cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 font-poppins">
                        {aid.label}
                      </div>
                      <div className="text-xs text-gray-500 font-poppins">{aid.subtitle}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.qf_based_pricing}
                onChange={(e) => onFiltersChange({ ...filters, qf_based_pricing: e.target.checked })}
                className="mt-1 w-4 h-4 accent-primary cursor-pointer"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 font-poppins">
                  Tarifs modulés selon Quotient Familial
                </div>
                <div className="text-xs text-gray-500 font-poppins">Prix adapté aux revenus</div>
              </div>
            </label>
          </div>
        </FilterSection>
      </div>

      {/* Accessibility Section */}
      <div data-tour-id="filter-section-inclusivity">
        <FilterSection
          title="Accessibilité"
          isCollapsed={collapsedSections.accessibility}
          onToggle={() => toggleSection('accessibility')}
        >
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.inclusivity}
                onChange={(e) => onFiltersChange({ ...filters, inclusivity: e.target.checked })}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-900 font-poppins">
                Activité InKlusif
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.public_transport}
                onChange={(e) => onFiltersChange({ ...filters, public_transport: e.target.checked })}
                className="mt-0.5 w-4 h-4 accent-primary cursor-pointer"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 font-poppins">
                  Accessible transports en commun
                </div>
                <div className="text-xs text-gray-500 font-poppins">Arrêt bus/tram &lt; 500m</div>
              </div>
            </label>
          </div>
        </FilterSection>
      </div>
    </div>
  );
};

// Helper Component: FilterSection
interface FilterSectionProps {
  title: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
  isCritical?: boolean;
  children: React.ReactNode;
}

const FilterSection = ({ title, isCollapsed = false, onToggle, isCritical, children }: FilterSectionProps) => {
  return (
    <div className="px-4 py-5 border-b border-gray-200">
      <div
        className="flex justify-between items-center mb-4 cursor-pointer"
        onClick={onToggle}
      >
        <h3 className="text-[17px] font-bold text-gray-900 font-poppins">
          {title}
          {isCritical && <span className="ml-2 text-primary">*</span>}
        </h3>
        {onToggle && (
          <span className="text-gray-400 transition-transform" style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
        )}
      </div>

      {!isCollapsed && <div>{children}</div>}
    </div>
  );
};
