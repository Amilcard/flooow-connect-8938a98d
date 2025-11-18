import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Hero Tile "Mes aides"
 * Updated UI/UX: Visual + aligned title/subtitle
 */
export const AidesFinancieresCard = () => {
  const navigate = useNavigate();

  return (
    <Card
      className="group relative overflow-hidden rounded-2xl cursor-pointer h-[280px] border-0 shadow-md hover:shadow-xl transition-all duration-300"
      onClick={() => navigate('/aides')}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&auto=format&fit=crop&q=80"
          alt="Famille budget"
          className="w-full h-full object-cover opacity-90"
        />
        {/* Overlay gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-6">
        {/* Titre */}
        <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
          Mes aides
        </h3>

        {/* Sous-titre */}
        <p className="text-sm text-white/90 mb-4 leading-snug">
          Voir à quelles aides ma famille peut avoir droit.
        </p>

        {/* CTA */}
        <Button
          variant="secondary"
          size="sm"
          className="w-fit bg-white text-gray-900 hover:bg-white/90 font-semibold"
        >
          Voir mes aides
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
