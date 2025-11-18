import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Hero Tile "Mes trajets"
 * Updated UI/UX: Visual + aligned title/subtitle
 */
export const MobiliteCard = () => {
  const navigate = useNavigate();

  return (
    <Card
      className="group relative overflow-hidden rounded-2xl cursor-pointer h-[280px] border-0 shadow-md hover:shadow-xl transition-all duration-300"
      onClick={() => navigate('/eco-mobilite')}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80"
          alt="Famille en mouvement"
          className="w-full h-full object-cover opacity-90"
        />
        {/* Overlay gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-6">
        {/* Titre */}
        <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
          Mes trajets
        </h3>

        {/* Sous-titre */}
        <p className="text-sm text-white/90 mb-4 leading-snug">
          Préparer le trajet jusqu'à l'activité sans voiture.
        </p>

        {/* CTA */}
        <Button
          variant="secondary"
          size="sm"
          className="w-fit bg-white text-gray-900 hover:bg-white/90 font-semibold"
        >
          Voir les trajets possibles
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
