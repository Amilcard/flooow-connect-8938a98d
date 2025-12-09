/**
 * LOT 6 - ResultsGrid Component
 * Responsive grid of activity cards with loading and empty states
 */

import { ActivityResultCard } from './ActivityResultCard';

interface Activity {
  id: string;
  title: string;
  category: string;
  images?: string[];
  age_min?: number;
  age_max?: number;
  price_amount?: number;
  price_is_free: boolean;
  location_name?: string;
  financial_aids_accepted?: string[];
}

interface ResultsGridProps {
  activities: Activity[];
  isLoading: boolean;
  onResetFilters: () => void;
}

export const ResultsGrid = ({ activities, isLoading, onResetFilters }: ResultsGridProps) => {

  // Loading State
  if (isLoading) {
    return (
      <div className="px-4 py-10 bg-background min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin" />
        <p className="mt-4 text-[15px] text-muted-foreground font-poppins">
          Recherche en cours...
        </p>
      </div>
    );
  }

  // Empty State
  if (activities.length === 0) {
    return (
      <div className="px-4 py-16 bg-background min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h3 className="text-lg font-semibold text-foreground mb-3 font-poppins">
          Aucune activité ne correspond à vos critères
        </h3>
        <p className="text-[15px] text-muted-foreground mb-5 font-poppins">
          Essayez d'élargir vos filtres ou recherchez un autre terme
        </p>
        <button
          onClick={onResetFilters}
          className="px-6 py-3 bg-primary text-white rounded-[10px] text-[15px] font-semibold hover:bg-orange-500 transition-colors font-poppins"
        >
          Réinitialiser les filtres
        </button>
      </div>
    );
  }

  // Results Grid
  return (
    <div className="bg-background min-h-[60vh]">
      {/* Conteneur contraint pour alignement avec Header */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => (
            <ActivityResultCard
              key={activity.id}
              id={activity.id}
              title={activity.title}
              category={activity.category}
              imageUrl={activity.images?.[0]}
              ageMin={activity.age_min}
              ageMax={activity.age_max}
              price={activity.price_amount}
              priceIsFree={activity.price_is_free}
              location={activity.location_name}
              financialAids={activity.financial_aids_accepted}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
