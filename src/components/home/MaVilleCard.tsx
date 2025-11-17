import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Banner compact "Ma ville, mon actu"
 *
 * Design System LOT 1 Optimization:
 * - Height: 140px (compact banner)
 * - Gradient background with icon pattern
 * - No image, clean gradient design
 * - Removed excessive whitespace
 */
export const MaVilleCard = () => {
  const navigate = useNavigate();

  return (
    <Card
      className="group relative overflow-hidden rounded-2xl cursor-pointer h-[140px] border-0 shadow-md hover:shadow-xl transition-all duration-300"
      onClick={() => navigate('/ma-ville-mon-actu')}
      data-tour-id="home-city-events"
    >
      {/* Gradient background bleu clair */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E0F2FE] to-[#DBEAFE]" />

      {/* Icon pattern background */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <Newspaper className="h-20 w-20 text-[#0EA5E9] opacity-10" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center p-5 pr-28">
        {/* Titre */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
          Ma ville, mon actu
        </h3>

        {/* Sous-titre */}
        <p className="text-sm text-gray-700 mb-3 leading-snug">
          Tous les événements près de chez vous
        </p>

        {/* CTA */}
        <Button
          variant="ghost"
          size="sm"
          className="w-fit text-[#0EA5E9] hover:text-[#0EA5E9] hover:bg-white/50 p-0 h-auto font-semibold"
        >
          Découvrir
          <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
};
