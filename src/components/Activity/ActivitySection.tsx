import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ActivityCard } from "./ActivityCard";
import { ActivityCarousel } from "./ActivityCarousel";
import { ChevronRight, Search } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

interface Activity {
  id: string;
  title: string;
  image: string;
  distance?: string;
  ageRange?: string;
  category: string;
  price: number;
  hasAccessibility?: boolean;
  paymentEchelonned?: boolean;
  hasFinancialAid?: boolean;
  age_min?: number;
  age_max?: number;
  periodType?: string;
  structureName?: string;
  structureAddress?: string;
  vacationType?: 'sejour_hebergement' | 'centre_loisirs' | 'stage_journee';
  priceUnit?: string;
  hasAccommodation?: boolean;
  aidesEligibles?: string[];
  mobility?: {
    TC?: string;
    velo?: boolean;
    covoit?: boolean;
  };
}

interface ActivitySectionProps {
  title: string;
  activities: Activity[];
  onSeeAll?: () => void;
  onActivityClick?: (id: string) => void;
  layout?: 'grid' | 'carousel'; // New prop to choose layout type
}

export const ActivitySection = ({
  title,
  activities,
  onSeeAll,
  onActivityClick,
  layout = 'grid' // Default to grid for backward compatibility
}: ActivitySectionProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const periodParam = searchParams.get("period");

  const handleActivityClick = (activityId: string) => {
    const url = periodParam
      ? `/activity/${activityId}?period=${periodParam}`
      : `/activity/${activityId}`;
    navigate(url);
  };

  // Reset all filters to default
  const handleResetFilters = () => {
    // Clear all search params except essential ones
    const newParams = new URLSearchParams();
    // Keep only the base path without any filters
    setSearchParams(newParams);
  };

  return (
    <section className="space-y-4" aria-labelledby={`section-${title.replace(/\s/g, '-')}`}>
      <div className="flex items-center justify-between">
        <h2
          id={`section-${title.replace(/\s/g, '-')}`}
          className="text-2xl font-bold"
        >
          {title}
        </h2>
        {onSeeAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSeeAll}
            className="text-primary hover:text-primary/80"
            aria-label={`Voir toutes les activités de ${title}`}
          >
            Voir tout
            <ChevronRight size={16} className="ml-1" />
          </Button>
        )}
      </div>

      {/* Show empty state if no activities */}
      {activities.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Aucune activité trouvée"
          description="Aucune activité ne correspond aux critères sélectionnés. Essayez d'élargir vos critères de recherche."
          actionLabel="Réinitialiser les filtres"
          onAction={handleResetFilters}
        />
      ) : (
        <>
          {/* Conditional rendering based on layout prop */}
          {layout === 'carousel' ? (
            <ActivityCarousel
              activities={activities}
              onActivityClick={handleActivityClick}
            />
          ) : (
            <div className="grid-staggered">
              {activities.map((activity, index) => (
                <ActivityCard
                  key={activity.id}
                  {...activity}
                  ageRange={activity.age_min && activity.age_max ? `${activity.age_min}-${activity.age_max} ans` : activity.ageRange}
                  periodType={activity.periodType}
                  structureName={activity.structureName}
                  structureAddress={activity.structureAddress}
                  vacationType={activity.vacationType}
                  priceUnit={activity.priceUnit}
                  hasAccommodation={activity.hasAccommodation}
                  aidesEligibles={activity.aidesEligibles}
                  mobility={activity.mobility}
                  onRequestClick={() => handleActivityClick(activity.id)}
                  data-tour-id={index === 0 ? "activity-card-first" : undefined}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
};
