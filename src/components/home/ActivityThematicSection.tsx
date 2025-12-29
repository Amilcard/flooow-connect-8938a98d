import { ActivityCarousel } from "@/components/Activity/ActivityCarousel";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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
}

interface ActivityThematicSectionProps {
  title: string;
  subtitle?: string;
  activities: Activity[];
  showSeeAll?: boolean;
  badge?: string;
  onActivityClick?: (id: string) => void;
  onSeeAllClick?: () => void;
  /** LCP optimization: mark first section for priority loading */
  isFirstSection?: boolean;
  /** Show skeleton loader while loading to prevent CLS */
  isLoading?: boolean;
}

/** Skeleton loader for activity carousel - prevents CLS */
const ActivityCarouselSkeleton = () => (
  <div className="flex gap-4 overflow-hidden">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="flex-shrink-0 w-[200px] md:w-[240px]">
        <Skeleton className="aspect-[4/5] rounded-xl" />
        <Skeleton className="h-4 w-3/4 mt-3" />
        <Skeleton className="h-3 w-1/2 mt-2" />
      </div>
    ))}
  </div>
);

export const ActivityThematicSection = ({
  title,
  subtitle,
  activities,
  showSeeAll = false,
  badge,
  onActivityClick,
  onSeeAllClick,
  isFirstSection = false,
  isLoading = false
}: ActivityThematicSectionProps) => {
  const navigate = useNavigate();

  // Don't hide section during loading - show skeleton instead to prevent CLS
  // Only hide if explicitly not loading AND no activities
  if (!isLoading && (!activities || activities.length === 0)) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-text-main">
              {title}
            </h2>
            {badge && (
              <Badge variant="secondary" className="text-xs">
                {badge}
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-text-muted mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {showSeeAll && (
          <Button
            variant="ghost"
            className="text-primary hover:text-primary/80 font-medium group"
            onClick={onSeeAllClick || (() => navigate('/activities'))}
          >
            Voir tout
            <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        )}
      </div>

      {isLoading ? (
        <ActivityCarouselSkeleton />
      ) : (
        <ActivityCarousel
          activities={activities}
          onActivityClick={onActivityClick || ((id) => navigate(`/activity/${id}`))}
          isFirstSection={isFirstSection}
        />
      )}
    </section>
  );
};
