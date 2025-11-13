import { useEffect, useRef, useState } from "react";
import { ActivityCardMobile } from "./ActivityCardMobile";
import { Activity } from "@/types/domain";
import { Loader2 } from "lucide-react";

interface ActivityListMobileProps {
  activities: Activity[];
  isLoading?: boolean;
}

export const ActivityListMobile = ({
  activities,
  isLoading = false,
}: ActivityListMobileProps) => {
  const [visibleCount, setVisibleCount] = useState(12);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < activities.length) {
          setVisibleCount((prev) => Math.min(prev + 12, activities.length));
        }
      },
      { threshold: 0.1, rootMargin: "600px" }
    );

    const target = observerTarget.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [visibleCount, activities.length]);

  const visibleActivities = activities.slice(0, visibleCount);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Aucune activité trouvée
      </div>
    );
  }

  return (
    <div className="px-3 md:px-0">
      {/* Grid 1 colonne, gutter 12px, edge-to-edge */}
      <div className="grid grid-cols-1 gap-3 pt-2 pb-20">
        {visibleActivities.map((activity) => (
          <ActivityCardMobile key={activity.id} activity={activity} />
        ))}
      </div>

      {/* Observer target for infinite scroll */}
      {visibleCount < activities.length && (
        <div
          ref={observerTarget}
          className="flex justify-center items-center py-6"
        >
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};
