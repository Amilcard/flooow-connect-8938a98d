import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

/**
 * ScrollToTopButton - Bouton flottant "Remonter en haut"
 * Visible après scroll > threshold (600px par défaut)
 * Respecte safe-area iOS
 */
interface ScrollToTopButtonProps {
  /** Seuil de scroll pour afficher le bouton (px) */
  threshold?: number;
  /** Position horizontale */
  position?: "left" | "right";
}

export const ScrollToTopButton = ({
  threshold = 600,
  position = "right"
}: ScrollToTopButtonProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className={`fixed ${position === "left" ? "left-5" : "right-5"} w-12 h-12 rounded-full bg-background border-2 border-border text-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-40 flex items-center justify-center`}
      style={{
        bottom: 'calc(100px + var(--safe-area-bottom))', // Au-dessus de la bottom nav
      }}
      aria-label="Remonter en haut de la page"
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  );
};

export default ScrollToTopButton;
