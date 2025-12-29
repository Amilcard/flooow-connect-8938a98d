/**
 * LOT 1 - T1_3: Composant Badge centralisé pour les cartes d'activités
 * Design system unifié pour toutes les pilules d'information
 *
 * Types de badges :
 * - category: Catégorie d'activité (Sport, Culture, etc.)
 * - age: Tranche d'âge
 * - period: Période (Annuelle, Vacances, etc.)
 * - price: Prix ou Gratuit
 * - aid: Aide financière disponible
 * - accessibility: Accessibilité
 * - vacation: Type de vacances (Séjour, Centre, Stage)
 */

import { getCategoryStyle } from '@/constants/categories';
import { formatAidLabel } from '@/utils/activityFormatters';
import { Accessibility } from 'lucide-react';

export type BadgeVariant =
  | 'category'
  | 'age'
  | 'period'
  | 'price'
  | 'aid'
  | 'accessibility'
  | 'vacation'
  | 'payment';

interface ActivityBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  /** Catégorie pour le style dynamique (variant='category') */
  category?: string;
  /** Afficher une icône (variant='accessibility') */
  showIcon?: boolean;
  /** Classe CSS supplémentaire */
  className?: string;
}

/**
 * Configuration des styles par variante
 * Chaque variante a un style cohérent et distinct
 */
const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  category: { bg: 'bg-white/95', text: '' }, // Couleur dynamique selon catégorie
  age: { bg: 'bg-slate-100/95', text: 'text-slate-600' },
  period: { bg: 'bg-amber-100/95', text: 'text-amber-700' },
  price: { bg: 'bg-emerald-500/95', text: 'text-white' },
  aid: { bg: 'bg-green-100/95', text: 'text-green-700' },
  accessibility: { bg: 'bg-white/95', text: 'text-foreground' },
  vacation: { bg: 'bg-purple-100/95', text: 'text-purple-600' },
  payment: { bg: 'bg-gradient-to-r from-orange-500/95 to-amber-500/95', text: 'text-white' },
};

/**
 * Styles spécifiques pour les types de vacances
 * Reserved for future vacation-specific badge styling
 */
const _vacationTypeStyles: Record<string, { bg: string; text: string }> = {
  sejour_hebergement: { bg: 'bg-purple-100/95', text: 'text-purple-600' },
  centre_loisirs: { bg: 'bg-blue-100/95', text: 'text-blue-600' },
  stage_journee: { bg: 'bg-amber-100/95', text: 'text-amber-600' },
};

export const ActivityBadge = ({
  variant,
  children,
  category,
  showIcon = false,
  className = '',
}: ActivityBadgeProps) => {
  // Récupérer le style de base pour la variante
  const style = variantStyles[variant];

  // Gestion spéciale pour la catégorie (couleur dynamique)
  let categoryColor: string | undefined;
  if (variant === 'category' && category) {
    const categoryStyle = getCategoryStyle(category);
    categoryColor = categoryStyle.color;
  }

  // Classes de base communes à tous les badges
  const baseClasses = 'px-3 py-1.5 rounded-lg backdrop-blur-sm inline-flex items-center gap-1';

  return (
    <div
      className={`${baseClasses} ${style.bg} ${className}`}
      role="status"
      aria-label={`Badge ${variant}`}
    >
      {/* Icône optionnelle pour accessibilité */}
      {variant === 'accessibility' && showIcon && (
        <Accessibility size={12} className={style.text} aria-hidden="true" />
      )}

      <span
        className={`text-xs font-bold uppercase font-poppins ${style.text}`}
        style={categoryColor ? { color: categoryColor } : undefined}
      >
        {children}
      </span>
    </div>
  );
};

/**
 * Badge spécialisé pour les catégories d'activités
 * Utilise la couleur définie dans le design system
 */
export const CategoryBadge = ({ category }: { category: string }) => (
  <ActivityBadge variant="category" category={category}>
    {category}
  </ActivityBadge>
);

/**
 * Badge spécialisé pour les tranches d'âge
 */
export const AgeBadge = ({ ageMin, ageMax }: { ageMin?: number; ageMax?: number }) => {
  if (ageMin === undefined || ageMax === undefined) return null;

  const label = ageMin === ageMax ? `${ageMin}` : `${ageMin}-${ageMax}`;

  return <ActivityBadge variant="age">{label}</ActivityBadge>;
};

/**
 * Badge spécialisé pour les aides financières
 */
export const AidBadge = ({ aidSlug }: { aidSlug: string }) => (
  <ActivityBadge variant="aid">{formatAidLabel(aidSlug)}</ActivityBadge>
);

/**
 * Badge pour activité gratuite
 */
export const FreeBadge = () => (
  <ActivityBadge variant="price">GRATUIT</ActivityBadge>
);

/**
 * Badge pour accessibilité/inclusivité
 */
export const AccessibilityBadge = () => (
  <ActivityBadge variant="accessibility" showIcon>
    InKlusif
  </ActivityBadge>
);

/**
 * Badge pour paiement échelonné
 */
export const PaymentBadge = () => (
  <ActivityBadge variant="payment">Échelonné</ActivityBadge>
);

export default ActivityBadge;
