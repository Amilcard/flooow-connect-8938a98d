import { Users } from "lucide-react";
import { getCategoryStyle } from "@/constants/categories";

interface QuickInfoBarProps {
  /**
   * Catégorie principale de l'activité
   */
  category?: string;

  /**
   * Type de période (scolaire ou vacances)
   */
  periodType?: "scolaire" | "vacances" | string;

  /**
   * Tranche d'âge { min, max }
   */
  ageRange?: {
    min?: number;
    max?: number;
  };

  /**
   * Indique si l'activité propose une séance d'essai
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
 * Barre de tags alignée avec les cards Recherche/Accueil
 *
 * Ordre d'affichage : [Catégorie] [Période] [Âge] [Séance d'essai] [Solidaire] [InKlusif] [Places]
 * Styles identiques aux badges de ActivityResultCard
 */
export function QuickInfoBar({
  category,
  periodType,
  ageRange,
  isFree,
  spotsRemaining,
  paymentEchelonned,
  hasAccessibility,
  className = ""
}: QuickInfoBarProps) {
  // Couleur catégorie via le système existant
  const categoryStyle = category ? getCategoryStyle(category) : null;

  // Formater la période
  const getPeriodLabel = (type?: string): string | null => {
    if (!type) return null;
    if (type === "scolaire") return "Année scolaire";
    if (type === "vacances") return "Vacances";
    return type;
  };

  // Formater l'âge (même logique que ActivityResultCard)
  const getAgeLabel = (range?: { min?: number; max?: number }): string | null => {
    if (!range) return null;
    const { min, max } = range;
    if (min && max) return `${min}-${max} ans`;
    if (min) return `Dès ${min} ans`;
    if (max) return `Jusqu'à ${max} ans`;
    return null;
  };

  // Couleur places restantes
  const getSpotsColor = (remaining: number): string => {
    if (remaining < 5) return "#EF4444";
    if (remaining < 10) return "#F59E0B";
    return "#10B981";
  };

  const periodLabel = getPeriodLabel(periodType);
  const ageLabel = getAgeLabel(ageRange);
  const spotsColor = spotsRemaining !== undefined ? getSpotsColor(spotsRemaining) : "#10B981";

  return (
    <div
      className={`quick-info-bar flex items-center gap-2 flex-wrap py-2 px-4 bg-background border-b border-border/40 ${className}`}
    >
      {/* 1. Catégorie - style identique ActivityResultCard */}
      {category && categoryStyle && (
        <div
          className="px-2.5 py-1 rounded-md"
          style={{ backgroundColor: `${categoryStyle.color}15` }}
        >
          <span
            className="text-xs font-bold uppercase"
            style={{ color: categoryStyle.color }}
          >
            {category}
          </span>
        </div>
      )}

      {/* 2. Période - style neutre */}
      {periodLabel && (
        <div className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
            {periodLabel}
          </span>
        </div>
      )}

      {/* 3. Âge - style bleu comme ActivityResultCard */}
      {ageLabel && (
        <div className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/50 rounded-md">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
            {ageLabel}
          </span>
        </div>
      )}

      {/* 4. Séance d'essai - style émeraude */}
      {isFree && (
        <div className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 rounded-md">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Séance d'essai
          </span>
        </div>
      )}

      {/* 5. Solidaire (paiement échelonné) - style ambre */}
      {paymentEchelonned && (
        <div className="px-2 py-1 bg-amber-50 dark:bg-amber-950/50 rounded-md">
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            Aides possibles
          </span>
        </div>
      )}

      {/* 6. InKlusif - style bleu clair */}
      {hasAccessibility && (
        <div className="px-2 py-1 bg-sky-50 dark:bg-sky-950/50 rounded-md">
          <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400">
            InKlusif
          </span>
        </div>
      )}

      {/* 7. Places restantes (si < 10) - aligné à droite */}
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
