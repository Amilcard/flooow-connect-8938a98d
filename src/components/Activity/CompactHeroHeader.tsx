import { useState } from "react";
import { BackButton } from "@/components/BackButton";
import activitySportImg from "@/assets/activity-sport.jpg";
import activityLoisirsImg from "@/assets/activity-loisirs.jpg";
import activityVacancesImg from "@/assets/activity-vacances.jpg";
import activityCultureImg from "@/assets/activity-culture.jpg";
import { getCategoryStyle } from "@/constants/categories";

interface CompactHeroHeaderProps {
  /**
   * URL de l'image hero de l'activité
   */
  imageUrl?: string;

  /**
   * Titre de l'activité (pour alt text)
   */
  title: string;

  /**
   * Catégorie de l'activité
   */
  category: string;

  /**
   * Catégories multiples (optionnel, priorité sur category)
   */
  categories?: string[];

  /**
   * Fallback route pour le bouton retour
   */
  backFallback?: string;

  /**
   * Contenu à afficher en haut à droite (ex: bouton partage)
   */
  rightContent?: React.ReactNode;

  /**
   * Callback pour le clic sur le bouton retour
   */
  onBack?: () => void;
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
 * Header compact avec image réduite - style card cohérent avec la home
 *
 * - Mobile: image réduite (140px) en bandeau discret
 * - Desktop: masqué (image affichée dans une card dans le contenu)
 * - Back button avec backdrop blur
 * - Category badge discret
 * - Pas de titre en overlay (titre affiché dans le contenu page)
 */
export function CompactHeroHeader({
  imageUrl,
  title,
  category,
  categories,
  backFallback = "/activities",
  rightContent,
  onBack
}: CompactHeroHeaderProps) {
  const [imgError, setImgError] = useState(false);

  // Utiliser la première catégorie si plusieurs, sinon la catégorie principale
  const displayCategory = categories && categories.length > 0
    ? categories[0]
    : category;

  // Utiliser l'image fournie ou l'image de catégorie comme fallback
  const fallbackImage = getCategoryImage(displayCategory);
  const finalImageUrl = (imageUrl && !imgError) ? imageUrl : fallbackImage;

  return (
    <div className="compact-hero-header relative w-full overflow-hidden lg:hidden">
      {/* Conteneur compact - 140px mobile, 160px tablet, masqué desktop */}
      <div className="relative w-full h-[140px] md:h-[160px]">
        {/* Image de fond - réduite et sobre */}
        <img
          src={finalImageUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            filter: "brightness(0.9)",
            objectPosition: "center 30%"
          }}
          onError={(e) => {
            if (!imgError) {
              setImgError(true);
              (e.target as HTMLImageElement).src = fallbackImage;
            }
          }}
        />
        {/* Gradient léger */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.3) 100%)"
          }}
        />
      </div>

      {/* Back Button - Top Left - Position fixe cohérente avec PageHeader */}
      <div className="absolute top-3 left-4 z-10">
        <BackButton
          positioning="relative"
          size="sm"
          className="bg-white/90 backdrop-blur-md hover:bg-white shadow-md !h-10 !w-10 !min-w-[40px] !p-0 rounded-full flex items-center justify-center transition-all"
        />
      </div>

      {/* Category Badge + Actions - Top Right */}
      <div className="absolute top-3 right-3 z-10">
        <div className="flex items-center gap-2">
          <div
            className="px-2.5 py-1 rounded-md backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
          >
            <span
              className="text-xs font-bold uppercase font-poppins"
              style={{ color: getCategoryStyle(displayCategory).color }}
            >
              {displayCategory}
            </span>
          </div>
          {rightContent}
        </div>
      </div>
    </div>
  );
}
