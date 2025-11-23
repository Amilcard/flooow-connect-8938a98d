import { Link } from "react-router-dom";
import logoFlooow from "@/assets/logo-flooow.svg";

interface HeaderLogoProps {
  className?: string;
  to?: string;
}

/**
 * HeaderLogo - Composant standardisé pour le logo Flooow
 *
 * Spécifications Design System LOT 1:
 * - Height max: 40px (max-h-10)
 * - Width responsive: 120px mobile → 160px desktop
 * - Aspect ratio preserved
 * - Object-fit: contain
 *
 * Usage:
 * <HeaderLogo /> ou <HeaderLogo to="/custom-route" />
 */
export const HeaderLogo = ({ className = "", to = "/" }: HeaderLogoProps) => {
  return (
    <Link to={to} className={`flex items-center ${className}`}>
      <img
        src={logoFlooow}
        alt="Flooow - Mes activités, mes aides, mes trajets"
        className="w-[140px] min-[375px]:w-[160px] md:w-[200px] h-auto max-h-12 object-contain"
      />
    </Link>
  );
};

export default HeaderLogo;
