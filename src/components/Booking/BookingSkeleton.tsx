/**
 * BookingSkeleton - Skeleton de chargement pour la page Booking
 * Affiche immédiatement une structure visible pendant les fetches
 */
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const BookingSkeleton = () => {
  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container flex items-center gap-3 py-3 px-4">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft />
          </Button>
          <h1 className="font-semibold text-lg">Inscription</h1>
        </div>
      </div>

      <div className="container px-4 py-6">
        {/* Desktop: 2 colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Colonne gauche - Enfants */}
          <div className="lg:col-span-7 space-y-6">
            {/* Bloc enfants */}
            <Card className="p-4">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Colonne droite - Récap */}
          <div className="lg:col-span-5 space-y-6">
            {/* Récap activité */}
            <Card className="p-4">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
                <div className="pt-2 border-t mt-3">
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </Card>

            {/* Bouton */}
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSkeleton;
