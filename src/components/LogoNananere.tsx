/**
 * Logo NANANERE - Version placeholder
 *
 * TODO: Remplacer par le vrai fichier SVG logo_nananere_blanc_texte_orange.svg
 * quand il sera disponible dans /src/assets/
 *
 * Design: Fond blanc avec texte orange, bien lisible sur fond blanc ou clair
 */

interface LogoNananereProps {
  className?: string;
  width?: number;
  height?: number;
}

export const LogoNananere = ({
  className = "",
  width = 120,
  height = 40
}: LogoNananereProps) => {
  // Placeholder temporaire - À remplacer par le vrai SVG
  // <img src="/assets/logo_nananere_blanc_texte_orange.svg" alt="NANANERE" />

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 120 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Fond blanc */}
        <rect width="120" height="40" fill="white" rx="4" />

        {/* Texte NANANERE en orange */}
        <text
          x="60"
          y="26"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="18"
          fontWeight="700"
          fill="#FF7A00"
          textAnchor="middle"
        >
          NANANERE
        </text>
      </svg>
    </div>
  );
};

/**
 * Instructions pour remplacer ce placeholder:
 *
 * 1. Ajouter le fichier logo_nananere_blanc_texte_orange.svg dans /src/assets/
 * 2. Importer: import logoNananere from "@/assets/logo_nananere_blanc_texte_orange.svg"
 * 3. Remplacer le contenu du composant par:
 *    return <img src={logoNananere} alt="NANANERE" className={className} width={width} height={height} />
 */
