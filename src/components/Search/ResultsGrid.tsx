/**
 * LOT 6 - ResultsGrid Component
 * Responsive grid of activity cards with loading and empty states
 * UPDATED: Now uses unified ActivityCard component instead of ActivityResultCard
 */

import { ActivityCard } from '../Activity/ActivityCard';
import { useNavigate } from 'react-router-dom';

interface Activity {
  id: string;
  title: string;
  category: string;
  categories?: string[];
  images?: string[];
  age_min?: number;
  age_max?: number;
  price_base?: number;
  price_amount?: number;
  price_is_free?: boolean;
  structures?: {
    name?: string;
    address?: string;
  };
  financial_aids_accepted?: string[];
  pmr_accessible?: boolean;
  payment_echelonned?: boolean;
  period_type?: string;
  vacation_type?: 'sejour_hebergement' | 'centre_loisirs' | 'stage_journee';
  price_unit?: string;
  has_accommodation?: boolean;
  covoiturage_enabled?: boolean;
  has_free_trial?: boolean;
}

interface ResultsGridProps {
  activities: Activity[];
  isLoading: boolean;
  onResetFilters: () => void;
}

export const ResultsGrid = ({ activities, isLoading, onResetFilters }: ResultsGridProps) => {
  const navigate = useNavigate();

  // Loading State
  if (isLoading) {
    return (
      <div className="px-4 py-10 bg-white min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-primary rounded-full animate-spin" />
        <p className="mt-4 text-[15px] text-gray-600 font-poppins">
          Recherche en cours...
        </p>
      </div>
    );
  }

  // Empty State
  if (activities.length === 0) {
    return (
      <div className="px-4 py-16 bg-white min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 font-poppins">
          Aucune activité ne correspond à vos critères
        </h3>
        <p className="text-[15px] text-gray-600 mb-5 font-poppins">
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

  // Results Grid - Now using unified ActivityCard
  return (
    <div className="px-4 py-4 bg-white min-h-[60vh]">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {activities.map((activity) => {
          // Map SearchResults data structure to ActivityCard props
          const price = activity.price_base ?? activity.price_amount ?? 0;
          const ageRange = activity.age_min && activity.age_max 
            ? `${activity.age_min}-${activity.age_max} ans` 
            : undefined;
          
          return (
            <ActivityCard
              key={activity.id}
              id={activity.id}
              title={activity.title}
              image={activity.images?.[0] || ''}
              category={activity.category}
              price={price}
              ageRange={ageRange}
              structureName={activity.structures?.name}
              structureAddress={activity.structures?.address}
              hasAccessibility={activity.pmr_accessible || false}
              paymentEchelonned={activity.payment_echelonned || false}
              hasFinancialAid={activity.financial_aids_accepted ? activity.financial_aids_accepted.length > 0 : false}
              aidesEligibles={activity.financial_aids_accepted}
              periodType={activity.period_type}
              vacationType={activity.vacation_type}
              priceUnit={activity.price_unit}
              hasAccommodation={activity.has_accommodation}
              mobility={{
                covoit: activity.covoiturage_enabled
              }}
              onRequestClick={() => navigate(`/activity/${activity.id}`)}
            />
          );
        })}
      </div>
    </div>
  );
};
