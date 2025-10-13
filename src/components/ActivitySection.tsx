import { ActivityCard } from "./ActivityCard";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
}

interface ActivitySectionProps {
  title: string;
  activities: Activity[];
  onSeeAll?: () => void;
  onActivityClick?: (id: string) => void;
}

export const ActivitySection = ({ 
  title, 
  activities, 
  onSeeAll,
  onActivityClick 
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            {...activity}
            ageRange={activity.age_min && activity.age_max ? `${activity.age_min}-${activity.age_max} ans` : activity.ageRange}
            onRequestClick={() => navigate(`/activity/${activity.id}`)}
          />
        ))}
      </div>
    </section>
  );
};
