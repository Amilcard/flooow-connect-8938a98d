import { ReactNode } from "react";
import { BackButton } from "@/components/BackButton";
import PageLayout from "@/components/PageLayout";

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
   * Max width du conteneur central
   * @default "2xl"
   */
  maxWidth?: "xl" | "2xl" | "3xl" | "4xl" | "full";

  /**
   * ID pour Usetiful tour
   */
  tourId?: string;
}

/**
 * Layout réutilisable pour toutes les pages de la section "Mon compte"
 *
 * Fournit :
 * - Header avec gradient orange (from-primary to-accent)
 * - BackButton en haut à gauche
 * - Titre + sous-titre optionnel
 * - Conteneur central avec max-width responsive
 *
 * @example
 * ```tsx
 * <ProfilLayout
 *   title="Mes enfants"
 *   subtitle="Gérez les profils de vos enfants"
 * >
 *   <div>Contenu...</div>
 * </ProfilLayout>
 * ```
 */
export const ProfilLayout = ({
  title,
  subtitle,
  backFallback = "/mon-compte",
  rightContent,
  children,
  maxWidth = "2xl",
  tourId
}: ProfilLayoutProps) => {
  const maxWidthClasses = {
    xl: "max-w-screen-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    full: "max-w-full"
  };

  return (
    <PageLayout showHeader={false}>
      {/* Header avec gradient orange */}
      <header
        className="bg-gradient-to-r from-primary to-accent text-white p-4 sticky top-0 z-50 shadow-md"
        data-tour-id={tourId}
      >
        <div className={`container mx-auto ${maxWidthClasses[maxWidth]} flex items-center justify-between`}>
          {/* Left: BackButton + Title */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <BackButton
              fallback={backFallback}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold truncate">{title}</h1>
              {subtitle && (
                <p className="text-white/90 text-sm truncate">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          {rightContent && (
            <div className="ml-4 shrink-0">
              {rightContent}
            </div>
          )}
        </div>
      </header>

      {/* Main content area */}
      <div className={`container mx-auto ${maxWidthClasses[maxWidth]} px-4 py-6 pb-24`}>
        {children}
      </div>
    </PageLayout>
  );
};
