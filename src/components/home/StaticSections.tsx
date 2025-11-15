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
      className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-card border border-border rounded-xl p-5 flex items-center justify-between group"
      onClick={onClick}
    >
      <div className="flex items-start gap-4 flex-1">
        <div className={cn(
          "flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-full bg-background",
          iconColor
        )}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-text-main mb-1 line-clamp-1">
            {title}
          </h3>
          <p className="text-sm text-text-muted line-clamp-2">
            {description}
          </p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-text-main group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
    </Card>
  );
};

export const StaticSections = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: <CircleDollarSign className="w-6 h-6" strokeWidth={2.5} />,
      title: "Mes aides financières",
      description: "Accéder au simulateur et à l'historique de tes aides",
      onClick: () => navigate("/aides"),
      iconColor: "text-primary",
    },
    {
      icon: <Newspaper className="w-6 h-6" strokeWidth={2.5} />,
      title: "Ma ville, mon actu",
      description: "Retrouver les infos locales et événements importants",
      onClick: () => navigate("/community"),
      iconColor: "text-accent-blue",
    },
    {
      icon: <Bus className="w-6 h-6" strokeWidth={2.5} />,
      title: "Mes trajets",
      description: "Voir les options de transport pour se rendre aux activités",
      onClick: () => navigate("/eco-mobilite"),
      iconColor: "text-accent-green",
    },
    {
      icon: <Award className="w-6 h-6" strokeWidth={2.5} />,
      title: "Prix Bon Esprit",
      description: "Découvrir les clubs et jeunes mis à l'honneur",
      onClick: () => navigate("/community"),
      iconColor: "text-accent-orange",
    },
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-text-main">
        Actualités et outils pour ta famille
      </h2>
      
      <div className="grid grid-cols-1 gap-3">
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
