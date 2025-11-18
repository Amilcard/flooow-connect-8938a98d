import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  backFallback?: string;
  rightContent?: ReactNode;
  /** ID pour Usetiful tour */
  tourId?: string;
}

/**
 * Composant de bandeau blanc standard pour l'espace parent
 * Remplace les anciens bandeaux orange pour uniformiser l'UI
 *
 * Fond: blanc (#FFFFFF) avec ombre légère
 * Hauteur: 64px (h-16)
 * Structure: flèche retour (gauche) | titre + sous-titre (centre/gauche) | icônes/actions (droite)
 */
export const PageHeader = ({
  title,
  subtitle,
  showBackButton = true,
  onBackClick,
  backFallback = "/",
  rightContent,
  tourId,
}: PageHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else if (typeof backFallback === 'string') {
      navigate(backFallback);
    } else {
      navigate(backFallback as number);
    }
  };

  return (
    <header
      className="bg-white border-b border-border shadow-sm sticky top-0 z-50"
      data-tour-id={tourId}
    >
      <div className="container h-16 flex items-center justify-between px-4">
        {/* Left: Back button - Minimalist design */}
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="flex items-center justify-center h-8 w-8 text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-md hover:bg-muted/50"
              aria-label="Retour"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}

          {/* Title and subtitle */}
          <div className="flex flex-col flex-1">
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
          <div className="flex items-center gap-2">
            {rightContent}
          </div>
        )}
      </div>
    </header>
  );
};
