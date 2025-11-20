import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
   * Titre de l'activité (affiché en overlay)
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
 * Header hero compact optimisé pour mobile
 *
 * - Hauteur réduite à 160px (vs ~250px)
 * - Gradient amélioré pour lisibilité texte
 * - Fallback élégant si pas d'image
 * - Back button avec backdrop blur
 * - Category badge avec design system
 *
 * @example
 * ```tsx
 * <CompactHeroHeader
 *   imageUrl={activity.images?.[0]}
 *   title="Stage de danse hip-hop"
 *   category="Culture"
 *   backFallback="/activities"
 * />
 * ```
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
    <div
      className="compact-hero-header relative w-full overflow-hidden"
      style={{ height: "160px" }}
    >
      {/* Image de fond - toujours affichée (avec fallback catégorie) */}
      <img
        src={finalImageUrl}
        alt={title}
        className="w-full h-full object-cover object-center"
        style={{ filter: "brightness(0.85)" }}
        onError={(e) => {
          // Si erreur de chargement, utiliser l'image de catégorie
          if (!imgError) {
            setImgError(true);
            (e.target as HTMLImageElement).src = fallbackImage;
          }
        }}
      />
      {/* Gradient overlay pour lisibilité - intensité réduite */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 100%)"
        }}
      />

      {/* Back Button - Top Left avec backdrop blur */}
      <div className="absolute top-4 left-4 z-10">
        <BackButton
          className="bg-white/90 backdrop-blur-md hover:bg-white shadow-md w-10 h-10 rounded-full flex items-center justify-center transition-all"
        />
      </div>

      {/* Category Badge - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        {rightContent ? (
          <div className="flex items-center gap-2">
            <div
              className="px-3 py-1.5 rounded-lg backdrop-blur-sm"
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
        ) : (
          <div
            className="px-3 py-1.5 rounded-lg backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
          >
            <span
              className="text-xs font-bold uppercase font-poppins"
              style={{ color: getCategoryStyle(displayCategory).color }}
            >
              {displayCategory}
            </span>
          </div>
        )}
      </div>

      {/* Title Overlay - Bottom avec text-shadow fort */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <h1
          className="text-white font-bold leading-tight line-clamp-2"
          style={{
            fontSize: "clamp(18px, 4vw, 20px)",
            textShadow: "0px 2px 8px rgba(0,0,0,0.7), 0px 1px 2px rgba(0,0,0,0.5)"
          }}
        >
          {title}
        </h1>
      </div>
    </div>
  );
}
