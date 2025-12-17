import { useNavigate } from "react-router-dom";
import { Bell, Calendar, MessageCircle, DollarSign, LucideIcon } from "lucide-react";

/**
 * Section Actualités - Version LOT 4 Optimisée
 *
 * Spécifications :
 * - 4 cartes EN VERTICAL (les unes en dessous des autres)
 * - Hauteur 70px par carte
 * - Contenu simple : icône (24px) + texte (14px, 600)
 * - 4 variantes de couleur (gradients)
 * - Pas de compteur "(65)" dans le titre
 * - 80px de margin-bottom pour la bottom nav
 */

interface ActualiteCardProps {
  gradient: string;
  icon: LucideIcon;
  text: string;
  onClick: () => void;
}

/**
 * Carte d'actualité simple et épurée
 * - 70px de hauteur fixe
 * - Icône + Texte en flex row
 * - Gradient de fond
 * - Hover avec scale légère
 */
const ActualiteCard = ({ gradient, icon: Icon, text, onClick }: ActualiteCardProps) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
      style={{
        width: "100%",
        height: "70px",
        borderRadius: "12px",
        background: gradient,
        padding: "16px",
        display: "flex",
        alignItems: "center",
        gap: "12px"
      }}
    >
      {/* Icône - 24px blanc */}
      <Icon size={24} className="text-white flex-shrink-0" />

      {/* Texte - 14px, 600, blanc */}
      <p
        style={{
          fontSize: "14px",
          fontWeight: 600,
          color: "#FFFFFF",
          lineHeight: "1.3",
          margin: 0,
          flex: 1
        }}
      >
        {text}
      </p>
    </div>
  );
};

/**
 * Section Actualités complète
 *
 * Features :
 * - Header avec titre + lien (sans compteur)
 * - 4 cartes en disposition VERTICALE
 * - Gap de 12px entre les cartes
 * - 80px de margin-bottom pour bottom nav
 */
export const StaticSections = () => {
  const navigate = useNavigate();

  const actualites = [
    {
      gradient: "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
      icon: Bell,
      text: "Nouveautés Flooow",
      path: "/ma-ville-mon-actu"
    },
    {
      gradient: "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)",
      icon: Calendar,
      text: "Événements à venir",
      path: "/agenda"
    },
    {
      gradient: "linear-gradient(135deg, #EC4899 0%, #F472B6 100%)",
      icon: MessageCircle,
      text: "Retours familles",
      path: "/community"
    },
    {
      gradient: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
      icon: DollarSign,
      text: "Aides disponibles",
      path: "/aides"
    }
  ];

  return (
    <section
      style={{
        paddingLeft: "16px",
        paddingRight: "16px",
        marginTop: "24px",
        marginBottom: "80px" // CRITIQUE : 80px pour la bottom nav
      }}
    >
      {/* Header avec titre + lien */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px"
        }}
      >
        {/* Titre */}
        <h3
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "#1F2937",
            margin: 0
          }}
        >
          Actualités
        </h3>

        {/* Lien - SANS compteur (65) */}
        <a
          href="/ma-ville-mon-actu"
          onClick={(e) => {
            e.preventDefault();
            navigate("/ma-ville-mon-actu");
          }}
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: "#FF6B35",
            textDecoration: "none",
            cursor: "pointer"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = "underline";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = "none";
          }}
        >
          Toutes nos actualités
        </a>
      </div>

      {/* Container de cartes - VERTICAL (flex-direction: column) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column", // CRITIQUE : VERTICAL !
          gap: "12px"
        }}
      >
        {actualites.map((actualite, index) => (
          <ActualiteCard
            key={index}
            gradient={actualite.gradient}
            icon={actualite.icon}
            text={actualite.text}
            onClick={() => navigate(actualite.path)}
          />
        ))}
      </div>
    </section>
  );
};
