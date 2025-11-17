import { Star, Baby, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface QuickInfoBarProps {
  /**
   * Note moyenne de l'activité
   */
  rating?: {
    average: number;
    count: number;
  };

  /**
   * Tranche d'âge de l'activité
   */
  ageRange: {
    min: number;
    max: number;
    label?: string;
  };

  /**
   * Indique si l'activité est gratuite
   */
  isFree?: boolean;

  /**
   * Nombre de places restantes (optionnel)
   */
  spotsRemaining?: number;

  /**
   * Classes CSS additionnelles
   */
  className?: string;
}

/**
 * Barre condensée d'informations rapides sous le hero
 *
 * Affiche les informations essentielles en un coup d'œil :
 * - Rating avec étoiles
 * - Tranche d'âge avec icône
 * - Badge "GRATUIT" si applicable
 * - Indicateur de places restantes
 *
 * @example
 * ```tsx
 * <QuickInfoBar
 *   rating={{ average: 4.8, count: 23 }}
 *   ageRange={{ min: 6, max: 12, label: "6-12 ans" }}
 *   isFree={false}
 *   spotsRemaining={3}
 * />
 * ```
 */
export function QuickInfoBar({
  rating,
  ageRange,
  isFree,
  spotsRemaining,
  className = ""
}: QuickInfoBarProps) {
  // Déterminer la couleur de l'indicateur de places selon le nombre restant
  const getSpotsColor = (remaining: number): string => {
    if (remaining < 5) return "#EF4444"; // Rouge (urgent)
    if (remaining < 10) return "#F59E0B"; // Orange (attention)
    return "#10B981"; // Vert (disponible)
  };

  const spotsColor = spotsRemaining ? getSpotsColor(spotsRemaining) : "#10B981";
  const ageLabel = ageRange.label || `${ageRange.min}-${ageRange.max} ans`;

  return (
    <div
      className={`quick-info-bar flex items-center gap-3 flex-wrap py-3 px-4 bg-white border-b border-gray-200 ${className}`}
    >
      {/* Rating */}
      {rating && (
        <div className="flex items-center gap-1.5">
          <Star size={16} fill="#F59E0B" color="#F59E0B" strokeWidth={0} />
          <span className="text-sm font-semibold text-gray-900">
            {rating.average.toFixed(1)}
          </span>
          <span className="text-sm text-gray-500">
            ({rating.count} avis)
          </span>
        </div>
      )}

      {/* Séparateur si rating présent */}
      {rating && <div className="w-px h-5 bg-gray-300" />}

      {/* Age Range */}
      <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1 rounded-md">
        <Baby size={16} color="#4A90E2" strokeWidth={2} />
        <span className="text-sm font-semibold text-blue-700">
          {ageLabel}
        </span>
      </div>

      {/* Badge Gratuit */}
      {isFree && (
        <Badge
          className="text-xs font-bold uppercase tracking-wide px-2.5 py-1 bg-green-100 text-green-700 border-0"
        >
          GRATUIT
        </Badge>
      )}

      {/* Places restantes (seulement si < 10) */}
      {spotsRemaining !== undefined && spotsRemaining < 10 && (
        <div className="flex items-center gap-1.5 ml-auto">
          <Users size={14} color={spotsColor} strokeWidth={2.5} />
          <span
            className="text-sm font-semibold"
            style={{ color: spotsColor }}
          >
            {spotsRemaining} place{spotsRemaining > 1 ? "s" : ""} restante{spotsRemaining > 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}
