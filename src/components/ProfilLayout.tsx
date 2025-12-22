import { ReactNode } from "react";
import { BackButton } from "@/components/BackButton";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfilLayoutProps {
  /**
   * Titre principal de la page
   */
  title: string;

  /**
   * Sous-titre optionnel (affiché sous le titre)
   */
  subtitle?: string;

  /**
   * Route de fallback pour le bouton retour
   * @default "/mon-compte"
   */
  backFallback?: string;

  /**
   * Contenu additionnel à droite du header (ex: boutons d'action)
   */
  rightContent?: ReactNode;

  /**
   * Contenu principal de la page
   */
  children: ReactNode;

  /**
   * État de chargement - affiche un skeleton
   */
  isLoading?: boolean;

  /**
   * ID pour le guided tour
   */
  tourId?: string;
}

/**
 * Skeleton de chargement unifié pour l'espace client
 */
const AccountSkeleton = () => (
  <div className="space-y-4">
    {/* Skeleton cards */}
    {[1, 2, 3].map((i) => (
      <div key={i} className="p-4 border rounded-xl space-y-3">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-60" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/**
 * Layout réutilisable pour toutes les pages de la section "Mon compte"
 *
 * UNIFORMISÉ: Utilise max-w-5xl (1024px) pour cohérence avec MonCompte hub
 *
 * Fournit :
 * - Header blanc standard avec BackButton "Retour"
 * - Titre + sous-titre optionnel
 * - Conteneur central avec max-w-5xl
 * - Padding bottom pour la bottom nav (pb-24)
 */
export const ProfilLayout = ({
  title,
  subtitle,
  backFallback = "/mon-compte",
  rightContent,
  children,
  isLoading = false,
  tourId
}: ProfilLayoutProps) => {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header blanc standard */}
      <header
        className="bg-white border-b border-border shadow-sm sticky top-0 z-50"
        data-tour-id={tourId}
      >
        {/* Conteneur contraint h-16 fixe - max-w-5xl pour cohérence */}
        <div className="max-w-5xl mx-auto h-16 flex items-center justify-between px-4">
          {/* Left: BackButton + Title - tous centrés verticalement */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <BackButton
              fallback={backFallback}
              positioning="relative"
              size="sm"
              showText={true}
              label="Retour"
              className="shrink-0"
            />
            <div className="flex flex-col justify-center flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-foreground leading-tight truncate">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          {rightContent && (
            <div className="ml-4 shrink-0 flex items-center gap-2">
              {rightContent}
            </div>
          )}
        </div>
      </header>

      {/* Main content area - max-w-5xl pour cohérence */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {isLoading ? <AccountSkeleton /> : children}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
