import { ActivityCard } from "./ActivityCard";
import { ChevronRight } from "lucide-react";

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
  periodType?: string;
  structureName?: string;
  structureAddress?: string;
}

interface ActivityCarouselProps {
  activities: Activity[];
  onActivityClick?: (id: string) => void;
}

export const ActivityCarousel = ({ activities, onActivityClick }: ActivityCarouselProps) => {
  return (
    <div className="w-full carousel-container scroll-smooth pb-4 -mx-4 px-4">
      <div
        className="flex gap-4"
        style={{ width: "max-content" }}
        role="list"
        aria-label="Activités en vedette"
      >
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="w-[85vw] max-w-[400px] flex-shrink-0 snap-start"
            role="listitem"
          >
            <ActivityCard
              {...activity}
              periodType={activity.periodType}
              structureName={activity.structureName}
              structureAddress={activity.structureAddress}
              onRequestClick={() => onActivityClick?.(activity.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
