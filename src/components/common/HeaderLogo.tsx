import { Link } from "react-router-dom";
import logoFlooow from "@/assets/logo-flooow.png";

interface HeaderLogoProps {
  className?: string;
  to?: string;
}

/**
 * HeaderLogo - Composant standardisé pour le logo Flooow
 *
 * Spécifications Design System LOT 1:
 * - Height: 32px mobile (h-8) → 36px desktop (h-9)
 * - Width auto, min-width pour éviter compression
 * - Aspect ratio preserved
 * - Object-fit: contain
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
        className="h-10 md:h-12 w-auto object-contain"
      />
    </Link>
  );
};

export default HeaderLogo;
