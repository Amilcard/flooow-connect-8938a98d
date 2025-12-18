import { useState } from "react";
import { getCategoryStyle } from "@/constants/categories";
import activitySportImg from "@/assets/activity-sport.jpg";
import activityLoisirsImg from "@/assets/activity-loisirs.jpg";
import activityVacancesImg from "@/assets/activity-vacances.jpg";
import activityCultureImg from "@/assets/activity-culture.jpg";

interface ActivityImageCardProps {
  /**
   * URL de l'image de l'activité
   */
  imageUrl?: string;

  /**
   * Titre de l'activité (pour alt text)
   */
  title: string;

  /**
   * Catégorie principale de l'activité
   */
  category: string;

  /**
   * Catégories multiples (optionnel, priorité sur category)
   */
  categories?: string[];

  /**
   * Contenu à afficher en overlay (ex: bouton partage)
   */
  rightContent?: React.ReactNode;
}

/**
 * Récupère l'image de fallback selon la catégorie
 */
const getCategoryImage = (category: string): string => {
  const categoryMap: Record<string, string> = {
    Sport: activitySportImg,
    Loisirs: activityLoisirsImg,
    Vacances: activityVacancesImg,
    Scolarité: activityCultureImg,
    Culture: activityCultureImg,
  };
  return categoryMap[category] || activityLoisirsImg;
};

/**
 * Card arrondie pour afficher l'image de l'activité
 *
 * - Style: rounded-xl avec px-4 margin
 * - Badges en overlay (catégorie + actions)
 * - Gestion du fallback image par catégorie
 * - Hauteur responsive: 200px mobile, 240px tablet, 280px desktop
 */
export function ActivityImageCard({
  imageUrl,
  title,
  category,
  categories,
  rightContent
}: ActivityImageCardProps) {
  const [imgError, setImgError] = useState(false);

  // Utiliser la première catégorie si plusieurs, sinon la catégorie principale
  const displayCategory = categories && categories.length > 0
    ? categories[0]
    : category;

  // Utiliser l'image fournie ou l'image de catégorie comme fallback
  const fallbackImage = getCategoryImage(displayCategory);
  const finalImageUrl = (imageUrl && !imgError) ? imageUrl : fallbackImage;

  return (
    <div className="px-4 pt-4">
      <div className="relative w-full overflow-hidden rounded-2xl shadow-md">
        {/* Conteneur image - hauteur réduite pour cohérence avec cards Accueil/Résultats */}
        <div className="relative w-full h-[140px] md:h-[180px] lg:h-[200px]">
          {/* Image - Optimized for PageSpeed (LCP priority, async decoding) */}
          <img
            src={finalImageUrl}
            alt={title}
            fetchPriority="high"
            decoding="async"
            width={400}
            height={140}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              objectPosition: "center 40%"
            }}
            onError={(e) => {
              if (!imgError) {
                setImgError(true);
                (e.target as HTMLImageElement).src = fallbackImage;
              }
            }}
          />

          {/* Gradient léger pour lisibilité des badges */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.25) 100%)"
            }}
          />
        </div>

        {/* Badges overlay - Top Right */}
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center gap-2">
            {/* Category badge */}
            <div
              className="px-3 py-1.5 rounded-full backdrop-blur-md shadow-md"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
            >
              <span
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: getCategoryStyle(displayCategory).color }}
              >
                {displayCategory}
              </span>
            </div>
            {/* Actions (partage, etc.) */}
            {rightContent}
          </div>
        </div>
      </div>
    </div>
  );
}
