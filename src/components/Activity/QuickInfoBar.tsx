import { Star, Users } from "lucide-react";
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
   * Indique si l'activité est gratuite
   */
  isFree?: boolean;

  /**
   * Nombre de places restantes (optionnel)
   */
  spotsRemaining?: number;

  /**
   * Indique si le paiement échelonné est disponible (badge SOLIDAIRE)
   */
  paymentEchelonned?: boolean;

  /**
   * Indique si l'activité est accessible PMR (badge INCLUSIVITÉ)
   */
  hasAccessibility?: boolean;

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
 * - Badge "GRATUIT" si applicable
 * - Badges SOLIDAIRE / InKlusif
 * - Indicateur de places restantes
 *
 * @example
 * ```tsx
 * <QuickInfoBar
 *   rating={{ average: 4.8, count: 23 }}
 *   isFree={false}
 *   spotsRemaining={3}
 * />
 * ```
 */
export function QuickInfoBar({
  rating,
  isFree,
  spotsRemaining,
  paymentEchelonned,
  hasAccessibility,
  className = ""
}: QuickInfoBarProps) {
  // Déterminer la couleur de l'indicateur de places selon le nombre restant
  const getSpotsColor = (remaining: number): string => {
    if (remaining < 5) return "#EF4444"; // Rouge (urgent)
    if (remaining < 10) return "#F59E0B"; // Orange (attention)
    return "#10B981"; // Vert (disponible)
  };

  const spotsColor = spotsRemaining ? getSpotsColor(spotsRemaining) : "#10B981";

  return (
    <div
      className={`quick-info-bar flex items-center gap-3 flex-wrap py-3 px-4 bg-background border-b border-border ${className}`}
    >
      {/* Rating */}
      {rating && (
        <div className="flex items-center gap-1.5">
          <Star size={16} fill="#F59E0B" color="#F59E0B" strokeWidth={0} />
          <span className="text-sm font-semibold text-foreground">
            {rating.average.toFixed(1)}
          </span>
          <span className="text-sm text-muted-foreground">
            ({rating.count} avis)
          </span>
        </div>
      )}

      {/* Séparateur si rating présent */}
      {rating && <div className="w-px h-5 bg-border" />}

      {/* Badge Gratuit */}
      {isFree && (
        <Badge
          className="text-xs font-bold uppercase tracking-wide px-2.5 py-1 bg-green-100 text-green-700 border-0"
        >
          GRATUIT
        </Badge>
      )}

      {/* Badge SOLIDAIRE */}
      {paymentEchelonned && (
        <Badge
          className="text-xs font-bold uppercase tracking-wide px-2.5 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0"
        >
          SOLIDAIRE
        </Badge>
      )}

      {/* Badge INCLUSIVITÉ */}
      {hasAccessibility && (
        <Badge
          className="text-xs font-bold uppercase tracking-wide px-2.5 py-1 bg-blue-100 text-blue-700 border-0"
        >
          InKlusif
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
