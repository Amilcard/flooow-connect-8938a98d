/**
 * Skip to Content Link - WCAG 2.4.1
 * Permet aux utilisateurs clavier de sauter la navigation
 * Visible uniquement au focus (Tab)
 */
export const SkipToContent = () => (
  <a
    href="#main-content"
    className="
      sr-only focus:not-sr-only
      focus:absolute focus:top-4 focus:left-4 focus:z-[9999]
      focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground
      focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring
      transition-all
    "
  >
    Aller au contenu principal
  </a>
);
