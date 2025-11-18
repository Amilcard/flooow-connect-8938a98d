import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Hero Tile "Prix Bon Esprit"
 * Updated UI/UX: Visual + aligned title/subtitle (secondary role)
 */
export const BonEspritCard = () => {
  const navigate = useNavigate();

  return (
    <Card
      className="group relative overflow-hidden rounded-2xl cursor-pointer h-[280px] border-0 shadow-md hover:shadow-xl transition-all duration-300"
      onClick={() => navigate('/bon-esprit')}
      data-tour-id="home-bon-esprit"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop&q=80"
          alt="Entraide et solidarité"
          className="w-full h-full object-cover opacity-85"
        />
        {/* Overlay gradient for text readability - slightly softer */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/10" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-6">
        {/* Titre */}
        <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
          Prix Bon Esprit
        </h3>

        {/* Sous-titre */}
        <p className="text-sm text-white/90 mb-4 leading-snug">
          Votez pour les héros de votre quartier.
        </p>

        {/* CTA */}
        <Button
          variant="secondary"
          size="sm"
          className="w-fit bg-white text-gray-900 hover:bg-white/90 font-semibold"
        >
          Je vote
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
