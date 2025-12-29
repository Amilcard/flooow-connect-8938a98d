import { useState } from "react";
import { BackButton } from "@/components/BackButton";
import { optimizeSupabaseImage } from "@/lib/imageMapping";
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
 * Header avec image d'activité style "super-card"
 *
 * Design aligné avec les cards de l'écran Recherche et Accueil :
 * - Hauteur intermédiaire (pas trop landing page, pas trop petit)
 * - Overlay léger pour lisibilité sans assombrir
 * - Boutons discrets (retour, partage)
 * - Badge catégorie style pill identique aux cards
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
  // PERF: Optimize Supabase images with transformations
  const optimizedUrl = optimizeSupabaseImage(imageUrl, { width: 800, height: 220 });
  const finalImageUrl = (optimizedUrl && !imgError) ? optimizedUrl : fallbackImage;

  return (
    <div className="compact-hero-header relative w-full overflow-hidden">
      {/* Conteneur style super-card - hauteur intermédiaire entre card et landing */}
      <div className="relative w-full h-[180px] md:h-[200px] lg:h-[220px]">
        {/* Image de fond - nette et centrée comme les cards */}
        <img
          src={finalImageUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            objectPosition: "center center"
          }}
          onError={(e) => {
            if (!imgError) {
              setImgError(true);
              (e.target as HTMLImageElement).src = fallbackImage;
            }
          }}
        />
        {/* Gradient léger - juste pour lisibilité des boutons, pas d'effet dramatique */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.20) 100%)"
          }}
        />
      </div>

      {/* Back Button - Top Left - Style sobre cohérent avec Recherche */}
      <div className="absolute top-4 left-4 z-10">
        <BackButton
          positioning="relative"
          size="sm"
          className="bg-white/95 backdrop-blur-sm hover:bg-white shadow-md !h-10 !w-10 !min-w-[40px] !p-0 rounded-full flex items-center justify-center transition-colors"
        />
      </div>

      {/* Category Badge + Actions - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex items-center gap-2">
          {/* Badge catégorie - même style que ActivityResultCard */}
          <div
            className="px-2.5 py-1 rounded-lg backdrop-blur-sm shadow-sm"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.92)' }}
          >
            <span
              className="text-xs font-bold uppercase"
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
