import { useNavigate } from "react-router-dom";
import { Bell, Calendar, MessageCircle, DollarSign } from "lucide-react";

interface NewsCardProps {
  background: string;
  Icon: typeof Bell;
  text: string;
  onClick: () => void;
}

const NewsCard = ({ background, Icon, text, onClick }: NewsCardProps) => {
  return (
    <div 
      className="w-full h-[70px] rounded-[12px] flex items-center gap-3 px-4 cursor-pointer hover:scale-[1.02] transition-transform"
      style={{ background }}
      onClick={onClick}
    >
      <Icon className="w-6 h-6 text-white flex-shrink-0" />
      <p className="text-[14px] font-semibold text-white flex-1">
        {text}
      </p>
    </div>
  );
};

export const StaticSections = () => {
  const navigate = useNavigate();

  const newsCards = [
    {
      background: "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
      Icon: Bell,
      text: "Nouveautés Flooow",
      path: "/community"
    },
    {
      background: "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)",
      Icon: Calendar,
      text: "Événements à venir",
      path: "/community"
    },
    {
      background: "linear-gradient(135deg, #EC4899 0%, #F472B6 100%)",
      Icon: MessageCircle,
      text: "Retours familles",
      path: "/community"
    },
    {
      background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
      Icon: DollarSign,
      text: "Aides disponibles",
      path: "/aides"
    }
  ];

  return (
    <section className="px-4 mt-6 mb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[18px] font-bold text-[#1F2937]">Actualités</h2>
        <button 
          onClick={() => navigate('/community')}
          className="text-[13px] font-medium text-[#FF6B35]"
        >
          Toutes nos actualités
        </button>
      </div>
      
      {/* Cartes en vertical */}
      <div className="flex flex-col gap-3">
        {newsCards.map((card, index) => (
          <NewsCard
            key={index}
            background={card.background}
            Icon={card.Icon}
            text={card.text}
            onClick={() => navigate(card.path)}
          />
        ))}
      </div>
    </section>
  );
};
