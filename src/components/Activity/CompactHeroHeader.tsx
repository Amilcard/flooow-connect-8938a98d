import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/BackButton";
import {
  Palette,
  Trophy,
  Lightbulb,
  BookOpen,
  Plane,
  Music
} from "lucide-react";

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
 * Configuration des couleurs et icônes par catégorie
 */
const getCategoryConfig = (category: string) => {
  const configs: Record<string, {
    gradient: string;
    accent: string;
    badgeBg: string;
    badgeColor: string;
    Icon: any;
    label: string;
  }> = {
    Sport: {
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      accent: "#667eea",
      badgeBg: "#EEF2FF",
      badgeColor: "#667eea",
      Icon: Trophy,
      label: "Sport"
    },
    Culture: {
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      accent: "#f093fb",
      badgeBg: "#FEF3E2",
      badgeColor: "#F59E0B",
      Icon: Palette,
      label: "Culture"
    },
    Loisirs: {
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      accent: "#4facfe",
      badgeBg: "#EFF6FF",
      badgeColor: "#4A90E2",
      Icon: Music,
      label: "Loisirs"
    },
    Scolarité: {
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      accent: "#43e97b",
      badgeBg: "#ECFDF5",
      badgeColor: "#10B981",
      Icon: BookOpen,
      label: "Scolarité"
    },
    Vacances: {
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      accent: "#fa709a",
      badgeBg: "#FFF7ED",
      badgeColor: "#FF8C42",
      Icon: Plane,
      label: "Vacances"
    },
    "Activités Innovantes": {
      gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
      accent: "#30cfd0",
      badgeBg: "#F0F9FF",
      badgeColor: "#06B6D4",
      Icon: Lightbulb,
      label: "Innovant"
    }
  };

  return configs[category] || configs["Loisirs"];
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

  const categoryConfig = getCategoryConfig(displayCategory);
  const hasImage = imageUrl && !imgError;

  return (
    <div
      className="compact-hero-header relative w-full overflow-hidden"
      style={{ height: "160px" }}
    >
      {/* Image de fond ou Fallback gradient */}
      {hasImage ? (
        <>
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover object-center"
            style={{ filter: "brightness(0.85)" }}
            onError={() => setImgError(true)}
          />
          {/* Gradient overlay pour lisibilité */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)"
            }}
          />
        </>
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ background: categoryConfig.gradient }}
        >
          <categoryConfig.Icon
            size={80}
            color={categoryConfig.accent}
            style={{ opacity: 0.15 }}
            strokeWidth={1.5}
          />
        </div>
      )}

      {/* Back Button - Top Left avec backdrop blur */}
      <div className="absolute top-4 left-4 z-10">
        <BackButton
          fallback={backFallback}
          className="bg-white/90 backdrop-blur-md hover:bg-white shadow-md w-10 h-10 rounded-full flex items-center justify-center transition-all"
        />
      </div>

      {/* Category Badge - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        {rightContent ? (
          <div className="flex items-center gap-2">
            <Badge
              style={{
                background: categoryConfig.badgeBg,
                color: categoryConfig.badgeColor,
                backdropFilter: "blur(8px)"
              }}
              className="text-xs font-semibold uppercase tracking-wide px-3 py-1 shadow-md border-0"
            >
              {categoryConfig.label}
            </Badge>
            {rightContent}
          </div>
        ) : (
          <Badge
            style={{
              background: categoryConfig.badgeBg,
              color: categoryConfig.badgeColor,
              backdropFilter: "blur(8px)"
            }}
            className="text-xs font-semibold uppercase tracking-wide px-3 py-1 shadow-md border-0"
          >
            {categoryConfig.label}
          </Badge>
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
