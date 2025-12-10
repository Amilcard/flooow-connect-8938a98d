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
 * Style aligné avec les cards de l'écran Recherche
 *
 * Affiche les informations essentielles en un coup d'œil :
 * - Rating avec étoiles
 * - Badge "Séance d'essai" si activité propose un essai gratuit
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
      className={`quick-info-bar flex items-center gap-2 flex-wrap py-2.5 px-4 bg-background/95 backdrop-blur-sm border-b border-border/50 ${className}`}
    >
      {/* Rating - style card Recherche */}
      {rating && (
        <div className="flex items-center gap-1">
          <Star size={14} fill="#F59E0B" color="#F59E0B" strokeWidth={0} />
          <span className="text-sm font-semibold text-foreground">
            {rating.average.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">
            ({rating.count})
          </span>
        </div>
      )}

      {/* Séparateur si rating présent */}
      {rating && <div className="w-px h-4 bg-border/60" />}

      {/* Badge Séance d'essai (remplace "Gratuit") */}
      {isFree && (
        <Badge
          className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
        >
          Séance d'essai
        </Badge>
      )}

      {/* Badge SOLIDAIRE - style pill cohérent */}
      {paymentEchelonned && (
        <Badge
          className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0"
        >
          Solidaire
        </Badge>
      )}

      {/* Badge InKlusif - style pill cohérent */}
      {hasAccessibility && (
        <Badge
          className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
        >
          InKlusif
        </Badge>
      )}

      {/* Places restantes (seulement si < 10) - aligné à droite */}
      {spotsRemaining !== undefined && spotsRemaining < 10 && (
        <div className="flex items-center gap-1 ml-auto">
          <Users size={12} color={spotsColor} strokeWidth={2.5} />
          <span
            className="text-xs font-semibold"
            style={{ color: spotsColor }}
          >
            {spotsRemaining} place{spotsRemaining > 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}
