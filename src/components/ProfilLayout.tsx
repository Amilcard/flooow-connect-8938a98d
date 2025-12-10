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
 * - Header blanc standard avec BackButton "Retour"
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
      {/* Header blanc standard */}
      <header
        className="bg-white border-b border-border shadow-sm sticky top-0 z-50"
        data-tour-id={tourId}
      >
        {/* Conteneur contraint h-16 fixe pour alignement vertical cohérent - comme PageHeader */}
        <div className={`container mx-auto ${maxWidthClasses[maxWidth]} h-16 flex items-center justify-between px-4`}>
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

      {/* Main content area */}
      <div className={`container mx-auto ${maxWidthClasses[maxWidth]} px-4 py-6 pb-24`}>
        {children}
      </div>
    </PageLayout>
  );
};
