/**
 * Logo NANANERE - Version image
 * Utilise l'image PNG officielle depuis les assets
 */

import logoNananere from '@/assets/logo-nananere.png';

interface LogoNananereProps {
  className?: string;
  width?: number;
  height?: number;
}

export const LogoNananere = ({
  className = "",
  width = 160,
  height = 48
}: LogoNananereProps) => {
  return (
    <img
      src={logoNananere}
      alt="NANANERE"
      className={`object-contain ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
};
