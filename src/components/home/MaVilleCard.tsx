import { Card } from "@/components/ui/card";
import { Newspaper } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Tuile "Notre ville" - Format compact CityCrunch
 * Grid 2x2 mobile, 4 colonnes desktop
 */
export const MaVilleCard = () => {
  const navigate = useNavigate();

  return (
    <Card
      className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 cursor-pointer transition-all duration-200 hover:scale-102 hover:shadow-lg active:scale-98 h-full min-h-[140px] flex flex-col justify-between"
      onClick={() => navigate('/ma-ville')}
      role="link"
      aria-label="Notre ville - Actus, agenda, contacts"
      data-tour-id="home-city-events"
    >
      {/* Icône */}
      <Newspaper className="w-6 h-6 text-orange-700 mb-3" />

      {/* Textes */}
      <div className="space-y-1">
        <h3 className="text-base font-bold text-gray-900 leading-tight">
          Notre ville
        </h3>
        <p className="text-xs text-gray-600 leading-snug">
          Actus, agenda, contacts.
        </p>
      </div>
    </Card>
  );
};
