import { CircleDollarSign, Newspaper, Bus, Award, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StaticCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  iconColor: string;
}

const StaticCard = ({ icon, title, description, onClick, iconColor }: StaticCardProps) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-300 bg-white border border-border/50 rounded-2xl overflow-hidden min-h-[72px] group"
      onClick={onClick}
    >
      <div className="flex items-center gap-4 p-5">
        <div className={cn(
          "flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full",
          iconColor
        )}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[15px] text-text-main mb-0.5 line-clamp-1">
            {title}
          </h3>
          <p className="text-[13px] text-text-muted line-clamp-2 leading-snug">
            {description}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
      </div>
    </Card>
  );
};

export const StaticSections = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: <CircleDollarSign className="w-5 h-5" strokeWidth={2.5} />,
      title: "Mes aides financières",
      description: "Simuler et retrouver tes aides pour les activités",
      onClick: () => navigate("/aides"),
      iconColor: "text-primary bg-primary/10",
    },
    {
      icon: <Newspaper className="w-5 h-5" strokeWidth={2.5} />,
      title: "Ma ville, mon actu",
      description: "Infos locales, actus et événements près de chez toi",
      onClick: () => navigate("/community"),
      iconColor: "text-accent-blue bg-accent-blue/10",
    },
    {
      icon: <Bus className="w-5 h-5" strokeWidth={2.5} />,
      title: "Mes trajets",
      description: "Préparer le trajet pour aller à une activité",
      onClick: () => navigate("/eco-mobilite"),
      iconColor: "text-accent-green bg-accent-green/10",
    },
    {
      icon: <Award className="w-5 h-5" strokeWidth={2.5} />,
      title: "Prix Bon Esprit",
      description: "Découvrir les clubs et jeunes mis à l'honneur",
      onClick: () => navigate("/community"),
      iconColor: "text-accent-orange bg-accent-orange/10",
    },
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-[20px] font-semibold text-[#222222]">
        Actualités et outils pour ta famille
      </h2>
      
      <div className="grid grid-cols-1 gap-4">
        {sections.map((section, index) => (
          <StaticCard
            key={index}
            icon={section.icon}
            title={section.title}
            description={section.description}
            onClick={section.onClick}
            iconColor={section.iconColor}
          />
        ))}
      </div>
    </section>
  );
};
