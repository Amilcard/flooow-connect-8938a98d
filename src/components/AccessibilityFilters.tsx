import { Badge } from "@/components/ui/badge";
import { Accessibility, Brain, Heart } from "lucide-react";

export type AccessibilityFilter = 'motor' | 'cognitive' | 'developmental' | null;

interface AccessibilityFiltersProps {
  selectedFilters: AccessibilityFilter[];
  onFilterChange: (filters: AccessibilityFilter[]) => void;
}

export const AccessibilityFilters = ({ selectedFilters, onFilterChange }: AccessibilityFiltersProps) => {
  const toggleFilter = (filter: AccessibilityFilter) => {
    if (!filter) return;
    
    if (selectedFilters.includes(filter)) {
      onFilterChange(selectedFilters.filter(f => f !== filter));
    } else {
      onFilterChange([...selectedFilters, filter]);
    }
  };

  const filters = [
    {
      id: 'motor' as AccessibilityFilter,
      label: 'Moteur',
      icon: Accessibility,
      ariaLabel: 'Filtrer par accessibilité moteur et fauteuil roulant'
    },
    {
      id: 'cognitive' as AccessibilityFilter,
      label: 'TDA/TSA',
      icon: Brain,
      ariaLabel: 'Filtrer par adaptations pour troubles de l\'attention et autisme'
    },
    {
      id: 'developmental' as AccessibilityFilter,
      label: 'Trisomie',
      icon: Heart,
      ariaLabel: 'Filtrer par adaptations pour handicap cognitif et trisomie'
    }
  ];

  return (
    <div className="flex gap-2 flex-wrap" role="group" aria-label="Filtres d'accessibilité">
      {filters.map(({ id, label, icon: Icon, ariaLabel }) => {
        const isSelected = selectedFilters.includes(id);
        return (
          <Badge
            key={id}
            variant={isSelected ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/10 transition-colors px-3 py-1.5 text-xs"
            onClick={() => toggleFilter(id)}
            role="checkbox"
            aria-checked={isSelected}
            aria-label={ariaLabel}
          >
            <Icon className="w-3 h-3 mr-1.5" aria-hidden="true" />
            {label}
          </Badge>
        );
      })}
    </div>
  );
};
