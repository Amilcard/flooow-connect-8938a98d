/**
 * Logo Flooow Connect - Version image
 * Utilise l'image PNG officielle depuis les assets
 */

import logoFlooow from '@/assets/logo-flooow.png';

interface LogoFlooowProps {
  className?: string;
  width?: number;
  height?: number;
}

export const LogoFlooow = ({
  className = "",
  width = 200,
  height
}: LogoFlooowProps) => {
  return (
    <img
      src={logoFlooow}
      alt="Flooow Connect"
      className={`object-contain ${className}`}
      style={{ width: `${width}px`, height: height ? `${height}px` : 'auto' }}
    />
  );
};
