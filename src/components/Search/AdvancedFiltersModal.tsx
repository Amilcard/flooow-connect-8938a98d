/**
 * LOT 6 - AdvancedFiltersModal Component
 * Complex modal with multiple filter sections
 * Bottom sheet on mobile, centered modal on desktop
 */

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AdvancedFilters } from '@/types/searchFilters';

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
  const [localFilters, setLocalFilters] = useState<AdvancedFilters>(filters);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    accessibility: true
  });

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Notify parent of filter changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange(localFilters);
    }, 500);
    return () => clearTimeout(timer);
  }, [localFilters, onFiltersChange]);

  if (!isOpen) return null;

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const getCounterColor = () => {
    if (resultsCount > 20) return '#10B981'; // green
    if (resultsCount >= 1) return '#F59E0B'; // amber
    return '#EF4444'; // red
  };

  const handleApply = () => {
    onApply();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[1000] flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-full md:w-[600px] max-h-[85vh] md:max-h-[90vh] rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slideUp md:animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 px-4 py-5 border-b border-gray-200 bg-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900 font-poppins">
                Filtres de recherche
              </h2>
              <p
                className="mt-2 text-sm font-medium font-poppins"
                style={{ color: getCounterColor() }}
              >
                {isCountLoading ? 'Calcul...' : `${resultsCount} activité(s) trouvée(s)`}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Fermer"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
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
                  value={localFilters.city}
                  onChange={(e) => setLocalFilters({ ...localFilters, city: e.target.value })}
                  placeholder="Ex: Saint-Étienne, Beaulieu..."
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-[15px] font-poppins focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 font-poppins">
                  Distance maximum: {localFilters.max_distance} km
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={localFilters.max_distance}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, max_distance: Number(e.target.value) })
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
                        checked={localFilters.period === option.value}
                        onChange={(e) => setLocalFilters({ ...localFilters, period: e.target.value })}
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
                  Âge de l'enfant: {localFilters.age_range[0]} - {localFilters.age_range[1]} ans
                </label>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min="4"
                    max="17"
                    value={localFilters.age_range[0]}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        age_range: [Number(e.target.value), localFilters.age_range[1]]
                      })
                    }
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <input
                    type="range"
                    min="4"
                    max="17"
                    value={localFilters.age_range[1]}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        age_range: [localFilters.age_range[0], Number(e.target.value)]
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
                    const isActive = localFilters.categories.includes(cat.value);
                    return (
                      <button
                        key={cat.value}
                        onClick={() => {
                          const newCategories = isActive
                            ? localFilters.categories.filter((c) => c !== cat.value)
                            : [...localFilters.categories, cat.value];
                          setLocalFilters({ ...localFilters, categories: newCategories });
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
          <FilterSection
            title="Budget & aides"
            isCollapsed={collapsedSections.financial}
            onToggle={() => toggleSection('financial')}
            isCritical
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 font-poppins">
                  Budget maximum: {localFilters.max_budget === 200 ? '200€+' : `${localFilters.max_budget}€`}
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="5"
                  value={localFilters.max_budget}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, max_budget: Number(e.target.value) })
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
                        checked={localFilters.financial_aids_accepted.includes(aid.value)}
                        onChange={(e) => {
                          const newAids = e.target.checked
                            ? [...localFilters.financial_aids_accepted, aid.value]
                            : localFilters.financial_aids_accepted.filter((a) => a !== aid.value);
                          setLocalFilters({ ...localFilters, financial_aids_accepted: newAids });
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
                  checked={localFilters.qf_based_pricing}
                  onChange={(e) => setLocalFilters({ ...localFilters, qf_based_pricing: e.target.checked })}
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

          {/* Accessibility Section */}
          <FilterSection
            title="Accessibilité"
            isCollapsed={collapsedSections.accessibility}
            onToggle={() => toggleSection('accessibility')}
          >
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.inclusivity}
                  onChange={(e) => setLocalFilters({ ...localFilters, inclusivity: e.target.checked })}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-900 font-poppins">
                  Activité InKlusif
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.public_transport}
                  onChange={(e) => setLocalFilters({ ...localFilters, public_transport: e.target.checked })}
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

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4 shadow-lg flex gap-3">
          <button
            onClick={onClear}
            className="flex-1 px-4 py-3.5 bg-gray-100 text-gray-700 rounded-[10px] text-[15px] font-semibold hover:bg-gray-200 transition-colors font-poppins"
          >
            Réinitialiser
          </button>

          <button
            onClick={handleApply}
            disabled={resultsCount === 0 && !isCountLoading}
            className="flex-[2] px-4 py-3.5 bg-primary text-white rounded-[10px] text-[15px] font-semibold hover:bg-orange-500 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed font-poppins"
          >
            Voir les résultats ({resultsCount})
          </button>
        </div>
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
