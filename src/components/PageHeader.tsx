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
  backFallback = -1,
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
        {/* Left: Back button and title */}
        <div className="flex items-center gap-4 flex-1">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="h-9 px-2 gap-2"
              aria-label="Retour"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Retour</span>
            </Button>
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
