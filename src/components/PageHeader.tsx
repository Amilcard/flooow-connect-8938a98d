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
 * Hauteur: auto (flexible)
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
      <div className="container flex items-center justify-between px-4 py-3">
        {/* Left: Back button + Title/subtitle */}
        <div className="flex items-start gap-5 flex-1 min-w-0">
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
          <div className="flex flex-col flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-foreground leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">
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
