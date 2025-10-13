import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ActivityCardSkeleton = () => {
  return (
    <Card className="overflow-hidden border-0 shadow-card">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
      
      <div className="p-4 space-y-3">
        <div>
          <Skeleton className="h-6 w-3/4 mb-2" />
          <div className="flex gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-5 w-32" />
          </div>
          
          <Skeleton className="h-12 w-28 rounded-full" />
        </div>
      </div>
    </Card>
  );
};
