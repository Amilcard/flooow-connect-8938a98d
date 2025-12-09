import { ReactNode } from "react";
import { BackButton } from "@/components/BackButton";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backFallback?: string;
  rightContent?: ReactNode;
  /** ID pour Usetiful tour */
  tourId?: string;
}

/**
 * Composant de bandeau blanc standard pour l'espace parent
 * Remplace les anciens bandeaux orange pour uniformiser l'UI
 * Harmonized with all other page headers (LOT F)
 *
 * Fond: blanc (#FFFFFF) avec ombre légère
 * Hauteur: FIXE h-16 (64px) pour cohérence avec Header principal
 * Structure: flèche retour (gauche) | titre + sous-titre (centre/gauche) | icônes/actions (droite)
 */
export const PageHeader = ({
  title,
  subtitle,
  showBackButton = true,
  backFallback,
  rightContent,
  tourId,
}: PageHeaderProps) => {
  return (
    <header
      className="bg-white border-b border-border shadow-sm sticky top-0 z-50"
      data-tour-id={tourId}
    >
      {/* Conteneur contraint h-16 fixe pour alignement vertical cohérent */}
      <div className="max-w-5xl mx-auto h-16 flex items-center justify-between px-4">
        {/* Left: Back button + Title/subtitle - tous centrés verticalement */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {showBackButton && (
            <BackButton
              fallback={backFallback}
              positioning="relative"
              size="sm"
              showText={true}
              label="Retour"
              className="shrink-0"
            />
          )}

          {/* Title and subtitle */}
          <div className="flex flex-col justify-center flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-foreground leading-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Optional content (icons, avatar, etc.) */}
        {rightContent && (
          <div className="flex items-center gap-2 ml-4 shrink-0">
            {rightContent}
          </div>
        )}
      </div>
    </header>
  );
};
