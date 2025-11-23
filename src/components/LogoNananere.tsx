/**
 * Logo NANANERE - Version image
 * Utilise l'image SVG officielle depuis les assets
 */

import logoNananere from '@/assets/logo-nananere.svg';

interface LogoNananereProps {
  className?: string;
  width?: number;
  height?: number;
}

export const LogoNananere = ({
  className = "",
  width = 200,
  height
}: LogoNananereProps) => {
  return (
    <img
      src={logoNananere}
      alt="NANANERE"
      className={`object-contain ${className}`}
      style={{ width: `${width}px`, height: height ? `${height}px` : 'auto' }}
    />
  );
};
