import { Card } from "@/components/ui/card";
import { Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Tuile "Prix Bon Esprit" - Format compact CityCrunch
 * Grid 2x2 mobile, 4 colonnes desktop
 */
export const BonEspritCard = () => {
  const navigate = useNavigate();

  return (
    <Card
      className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 cursor-pointer transition-all duration-200 hover:scale-102 hover:shadow-lg active:scale-98 h-full min-h-[140px] flex flex-col justify-between"
      onClick={() => navigate('/bon-esprit')}
      role="link"
      aria-label="Prix Bon Esprit - On nomme nos héros"
      data-tour-id="home-bon-esprit"
    >
      {/* Icône */}
      <Award className="w-6 h-6 text-purple-700 mb-3" />

      {/* Textes */}
      <div className="space-y-1">
        <h3 className="text-base font-bold text-gray-900 leading-tight">
          Prix Bon Esprit
        </h3>
        <p className="text-xs text-gray-600 leading-snug">
          On nomme nos héros.
        </p>
      </div>
    </Card>
  );
};
