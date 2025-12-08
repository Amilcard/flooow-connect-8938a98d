import { Link } from "react-router-dom";
import logoFlooow from "@/assets/logo-flooow.svg";

interface HeaderLogoProps {
  className?: string;
  to?: string;
}

/**
 * HeaderLogo - Composant standardisé pour le logo Flooow
 *
 * Spécifications Design System:
 * - Logo SVG horizontal ratio 5:1 (400×80 viewBox)
 * - Affichage: 120px × 24px mobile → 160px × 32px desktop
 * - Retina ready (source SVG scalable)
 * - Couleur: Orange #F97316
 * - Aligné verticalement avec les boutons du header
 *
 * Usage:
 * <HeaderLogo /> ou <HeaderLogo to="/custom-route" />
 */
export const HeaderLogo = ({ className = "", to = "/" }: HeaderLogoProps) => {
  return (
    <Link
      to={to}
      className={`flex items-center shrink-0 ${className}`}
    >
      <img
        src={logoFlooow}
        alt="Flooow - Mes activités, mes aides, mes trajets"
        className="h-6 md:h-8 w-auto object-contain block"
        style={{ minWidth: '120px' }}
      />
    </Link>
  );
};

export default HeaderLogo;
