import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface NewsCardProps {
  background: string;
  icon: string;
  title: string;
  description: string;
  linkText: string;
  onClick: () => void;
}

const NewsCard = ({ background, icon, title, description, linkText, onClick }: NewsCardProps) => {
  return (
    <div 
      className="relative w-[240px] h-[140px] rounded-[16px] overflow-hidden flex-shrink-0 cursor-pointer hover:scale-[1.02] transition-transform p-5 flex flex-col justify-between"
      style={{ background }}
      onClick={onClick}
    >
      {/* Icône en haut à droite */}
      <div className="absolute top-5 right-5 text-[32px] opacity-90">
        {icon}
      </div>
      
      {/* Contenu */}
      <div className="relative z-[2]">
        <h3 className="text-[16px] font-bold text-white leading-snug mb-2">
          {title}
        </h3>
        <p className="text-[13px] font-normal text-white/90 leading-relaxed mb-3">
          {description}
        </p>
        <span className="text-[12px] font-semibold text-white underline inline-flex items-center gap-1">
          {linkText}
        </span>
      </div>
    </div>
  );
};

export const StaticSections = () => {
  const navigate = useNavigate();

  const newsCards = [
    {
      background: "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
      icon: "🔔",
      title: "Nouveautés Flooow",
      description: "Découvrez les dernières fonctionnalités de la plateforme",
      linkText: "En savoir plus →",
      path: "/community"
    },
    {
      background: "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)",
      icon: "📅",
      title: "Événements à venir",
      description: "Retrouvez tous les événements dans votre région",
      linkText: "Voir l'agenda →",
      path: "/community"
    },
    {
      background: "linear-gradient(135deg, #EC4899 0%, #F472B6 100%)",
      icon: "💬",
      title: "Retours familles",
      description: "Lisez les témoignages des familles accompagnées",
      linkText: "Lire les avis →",
      path: "/community"
    },
    {
      background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
      icon: "💰",
      title: "Aides disponibles",
      description: "Découvrez les aides financières pour vos activités",
      linkText: "Simuler mes aides →",
      path: "/aides"
    }
  ];

  return (
    <section className="px-4 mt-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[18px] font-bold text-[#1F2937]">Actualités</h2>
        <button 
          onClick={() => navigate('/community')}
          className="text-[13px] font-medium text-[#FF6B35] flex items-center gap-1"
        >
          Toutes nos actualités (65)
        </button>
      </div>
      
      {/* Cartes en scroll horizontal */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
        <div className="flex gap-4">
          {newsCards.map((card, index) => (
            <NewsCard
              key={index}
              background={card.background}
              icon={card.icon}
              title={card.title}
              description={card.description}
              linkText={card.linkText}
              onClick={() => navigate(card.path)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
