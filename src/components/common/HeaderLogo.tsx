import { Link } from "react-router-dom";
import logoFlooow from "@/assets/logo-flooow.png";

interface HeaderLogoProps {
  className?: string;
  to?: string;
}

/**
 * HeaderLogo - Composant standardisé pour le logo Flooow
 *
 * Spécifications Design System:
 * - Logo PNG horizontal (smiley + FLOOOW)
 * - Affichage: 28px mobile (h-7) → 36px desktop (h-9)
 * - Min-width: 140px pour éviter compression
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
        className="h-7 md:h-9 w-auto object-contain block"
        style={{ minWidth: '140px' }}
      />
    </Link>
  );
};

export default HeaderLogo;
