import { Card } from "@/components/ui/card";
import { Bus } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Tuile "Nos trajets" - Format compact CityCrunch
 * Grid 2x2 mobile, 4 colonnes desktop
 */
export const MobiliteCard = () => {
  const navigate = useNavigate();

  return (
    <Card
      className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 cursor-pointer transition-all duration-200 hover:scale-102 hover:shadow-lg active:scale-98 h-full min-h-[140px] flex flex-col justify-between"
      onClick={() => navigate('/eco-mobilite')}
      role="link"
      aria-label="Nos trajets - On pense planète et santé"
    >
      {/* Icône */}
      <Bus className="w-6 h-6 text-blue-700 mb-3" />

      {/* Textes */}
      <div className="space-y-1">
        <h3 className="text-base font-bold text-gray-900 leading-tight">
          Nos trajets
        </h3>
        <p className="text-xs text-gray-600 leading-snug">
          On pense planète et santé.
        </p>
      </div>
    </Card>
  );
};
