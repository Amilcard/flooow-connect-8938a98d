import { CircleDollarSign, Newspaper, Car, Award, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StaticCardProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  iconColor: string;
}

const StaticCard = ({ icon, title, onClick, iconColor }: StaticCardProps) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-card border border-border rounded-xl p-5 flex items-center justify-between group"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className={cn("flex items-center justify-center flex-shrink-0", iconColor)}>
          {icon}
        </div>
        <h3 className="font-bold text-lg text-text-main">{title}</h3>
      </div>
      <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-text-main transition-colors" />
    </Card>
  );
};

export const StaticSections = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: <CircleDollarSign className="w-10 h-10" strokeWidth={2} />,
      title: "Mes aides financières",
      description: "Accès au simulateur et à l'historique des calculs",
      onClick: () => navigate("/aides"),
      iconColor: "text-primary",
    },
    {
      icon: <Newspaper className="w-10 h-10" strokeWidth={2} />,
      title: "Ma ville, mon actu",
      description: "Infos locales, événements et annonces importantes",
      onClick: () => navigate("/community"),
      iconColor: "text-accent-blue",
    },
    {
      icon: <Car className="w-10 h-10" strokeWidth={2} />,
      title: "Mes trajets",
      description: "Accès rapide aux options de transport pour les activités",
      onClick: () => navigate("/eco-mobilite"),
      iconColor: "text-accent-green",
    },
    {
      icon: <Award className="w-10 h-10" strokeWidth={2} />,
      title: "Prix Bon Esprit",
      description: "Met en avant les clubs et jeunes engagés",
      onClick: () => navigate("/community"),
      iconColor: "text-accent-orange",
    },
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-text-main">
        Actualités et outils pour ta famille
      </h2>
      
      <div className="grid grid-cols-1 gap-4">
        {sections.map((section, index) => (
          <StaticCard
            key={index}
            icon={section.icon}
            title={section.title}
            onClick={section.onClick}
            iconColor={section.iconColor}
          />
        ))}
      </div>
    </section>
  );
};
