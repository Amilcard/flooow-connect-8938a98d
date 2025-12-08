import { ActivityCard } from "./ActivityCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

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

interface ActivityCarouselProps {
  activities: Activity[];
  onActivityClick?: (id: string) => void;
}

export const ActivityCarousel = ({ activities, onActivityClick }: ActivityCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // For desktop, show 3 cards per view
  const cardsPerView = 3;
  const totalPages = Math.ceil(activities.length / cardsPerView);

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(totalPages - 1, prev + 1));
  };

  // Calculate which activities to show on current page
  const startIndex = currentIndex * cardsPerView;
  const endIndex = startIndex + cardsPerView;
  const currentActivities = activities.slice(startIndex, endIndex);

  return (
    <div className="relative">
      {/* Helper text for carousel indication */}
      <div className="text-sm text-muted-foreground mb-3 text-center md:hidden">
        Faites défiler pour voir d'autres activités
      </div>

      {/* Desktop: Grid with pagination */}
      <div className="hidden md:block">
        {/* Navigation arrows for desktop */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="p-2 rounded-full bg-white shadow-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Page précédente"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="text-sm text-muted-foreground">
              {currentIndex + 1} / {totalPages}
            </div>
            <button
              onClick={handleNext}
              disabled={currentIndex === totalPages - 1}
              className="p-2 rounded-full bg-white shadow-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Page suivante"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Grid layout - Desktop (3 cols ≥1200px, 2 cols 768-1199px) */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {currentActivities.map((activity) => (
            <div key={activity.id} className="w-full">
              <ActivityCard
                {...activity}
                periodType={activity.periodType}
                structureName={activity.structureName}
                structureAddress={activity.structureAddress}
                vacationType={activity.vacationType}
                priceUnit={activity.priceUnit}
                hasAccommodation={activity.hasAccommodation}
                aidesEligibles={activity.aidesEligibles}
                mobility={activity.mobility}
                onRequestClick={() => onActivityClick?.(activity.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: Horizontal scroll with dots indicator */}
      <div className="md:hidden">
        <div className="w-full overflow-x-auto carousel-container scroll-smooth pb-4 -mx-4 px-4">
          <div
            className="flex gap-4"
            style={{ width: "max-content" }}
            role="list"
            aria-label="Activités en vedette"
          >
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="w-[280px] flex-shrink-0 snap-start"
                role="listitem"
              >
                <ActivityCard
                  {...activity}
                  periodType={activity.periodType}
                  structureName={activity.structureName}
                  structureAddress={activity.structureAddress}
                  vacationType={activity.vacationType}
                  priceUnit={activity.priceUnit}
                  hasAccommodation={activity.hasAccommodation}
                  aidesEligibles={activity.aidesEligibles}
                  mobility={activity.mobility}
                  onRequestClick={() => onActivityClick?.(activity.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Dots indicator for mobile */}
        <div className="flex justify-center gap-2 mt-3">
          {activities.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'w-6 bg-primary' 
                  : 'w-2 bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
