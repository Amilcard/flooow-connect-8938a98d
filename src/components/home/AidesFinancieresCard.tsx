import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Tuile "Nos aides" - Format compact CityCrunch
 * Grid 2x2 mobile, 4 colonnes desktop
 */
export const AidesFinancieresCard = () => {
  const navigate = useNavigate();

  return (
    <Card
      className="relative p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border-green-200 cursor-pointer transition-all duration-200 hover:scale-102 hover:shadow-lg active:scale-98 h-full min-h-[140px] flex flex-col justify-between"
      onClick={() => navigate('/aides')}
      role="link"
      aria-label="Nos aides - On simule, on économise"
    >
      {/* Badge Stop au non-recours */}
      <Badge className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] px-2 py-0.5 border-0">
        Stop au non-recours !
      </Badge>

      {/* Icône */}
      <DollarSign className="w-6 h-6 text-green-700 mb-3" />

      {/* Textes */}
      <div className="space-y-1">
        <h3 className="text-base font-bold text-gray-900 leading-tight">
          Nos aides
        </h3>
        <p className="text-xs text-gray-600 leading-snug">
          On simule. On économise.
        </p>
      </div>
    </Card>
  );
};
