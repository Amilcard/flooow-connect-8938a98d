import { ActivityCard } from "./ActivityCard";
import { ActivityCarousel } from "./ActivityCarousel";
import { ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
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
  hasFinancialAid?: boolean;
  age_min?: number;
  age_max?: number;
  periodType?: string;
  structureName?: string;
  structureAddress?: string;
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

  return (
    <section className="space-y-4" aria-labelledby={`section-${title.replace(/\s/g, '-')}`}>
      <div className="flex items-center justify-between">
        <h2
          id={`section-${title.replace(/\s/g, '-')}`}
          className="text-xl font-bold"
        >
          {title}
        </h2>
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
      </div>

      {/* Show empty state if no activities */}
      {activities.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Aucune activité trouvée"
          description="Aucune activité ne correspond aux critères sélectionnés pour le moment."
        />
      ) : (
        <>
          {/* Conditional rendering based on layout prop */}
          {layout === 'carousel' ? (
            <ActivityCarousel
              activities={activities}
              onActivityClick={(id) => navigate(`/activity/${id}`)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  {...activity}
                  ageRange={activity.age_min && activity.age_max ? `${activity.age_min}-${activity.age_max} ans` : activity.ageRange}
                  periodType={activity.periodType}
                  structureName={activity.structureName}
                  structureAddress={activity.structureAddress}
                  onRequestClick={() => navigate(`/activity/${activity.id}`)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
};
