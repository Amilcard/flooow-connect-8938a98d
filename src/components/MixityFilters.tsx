import { Badge } from "@/components/ui/badge";
import { Users2 } from "lucide-react";

/**
 * Filtre de mixité filles/garçons
 * Axe 4: Égalité filles/garçons
 */

export type MixityFilter = 'equilibre' | 'desequilibre' | 'filles_only' | 'garcons_only' | null;

interface MixityFiltersProps {
  selectedFilters: MixityFilter[];
  onFilterChange: (filters: MixityFilter[]) => void;
}

export const MixityFilters = ({ selectedFilters, onFilterChange }: MixityFiltersProps) => {
  const toggleFilter = (filter: MixityFilter) => {
    if (!filter) return;

    if (selectedFilters.includes(filter)) {
      onFilterChange(selectedFilters.filter(f => f !== filter));
    } else {
      onFilterChange([...selectedFilters, filter]);
    }
  };

  const filters = [
    {
      id: 'equilibre' as MixityFilter,
      label: 'Mixte équilibré',
      color: 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300',
      ariaLabel: 'Activités avec équilibre filles/garçons'
    },
    {
      id: 'desequilibre' as MixityFilter,
      label: 'Mixte déséquilibré',
      color: 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-300',
      ariaLabel: 'Activités avec déséquilibre filles/garçons'
    },
    {
      id: 'filles_only' as MixityFilter,
      label: 'Filles uniquement',
      color: 'bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-900 dark:text-pink-300',
      ariaLabel: 'Activités réservées aux filles'
    },
    {
      id: 'garcons_only' as MixityFilter,
      label: 'Garçons uniquement',
      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300',
      ariaLabel: 'Activités réservées aux garçons'
    }
  ];

  return (
    <div className="flex gap-2 flex-wrap" role="group" aria-label="Filtres de mixité">
      {filters.map(({ id, label, color, ariaLabel }) => {
        const isSelected = selectedFilters.includes(id);
        return (
          <Badge
            key={id}
            variant={isSelected ? "default" : "outline"}
            className={`cursor-pointer transition-colors px-3 py-1.5 text-xs ${isSelected ? color : ''}`}
            onClick={() => toggleFilter(id)}
            role="checkbox"
            aria-checked={isSelected}
            aria-label={ariaLabel}
          >
            <Users2 className="w-3 h-3 mr-1.5" aria-hidden="true" />
            {label}
          </Badge>
        );
      })}
    </div>
  );
};

/**
 * Badge de statut mixité à afficher sur les cartes d'activités
 */
interface MixityBadgeProps {
  statutMixite?: string;
  tauxFillesPct?: number;
}

export const MixityBadge = ({ statutMixite, tauxFillesPct }: MixityBadgeProps) => {
  if (!statutMixite || statutMixite === 'equilibre') {
    return null; // Pas besoin d'afficher si équilibré
  }

  const config = {
    filles_only: { label: '♀️ Filles uniquement', color: 'bg-pink-500/90' },
    garcons_only: { label: '♂️ Garçons uniquement', color: 'bg-blue-500/90' },
    desequilibre: {
      label: tauxFillesPct && tauxFillesPct > 65 ? `${tauxFillesPct}% filles` : tauxFillesPct && tauxFillesPct < 35 ? `${100 - tauxFillesPct}% garçons` : 'Déséquilibré',
      color: 'bg-orange-500/90'
    }
  };

  const { label, color } = config[statutMixite as keyof typeof config] || { label: '', color: '' };

  if (!label) return null;

  return (
    <Badge
      variant="secondary"
      className={`${color} backdrop-blur-sm text-white shadow-sm text-xs`}
      aria-label={`Mixité: ${label}`}
    >
      {label}
    </Badge>
  );
};
