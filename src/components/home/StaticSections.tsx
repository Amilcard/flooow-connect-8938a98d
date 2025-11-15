import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import actualiteAides from "@/assets/actualite-aides.jpg";
import actualiteVille from "@/assets/actualite-ville.jpg";
import actualiteTrajets from "@/assets/actualite-trajets.jpg";
import actualitePrix from "@/assets/actualite-prix.jpg";

interface StaticCardProps {
  image: string;
  title: string;
  description: string;
  onClick: () => void;
}

const StaticCard = ({ image, title, description, onClick }: StaticCardProps) => {
  return (
    <Card 
      className="group p-3 cursor-pointer hover:shadow-lg transition-all duration-200 bg-white rounded-xl min-h-[90px] flex items-center gap-3"
      onClick={onClick}
    >
      {/* Image à gauche */}
      <div className="w-[70px] h-[70px] rounded-[10px] overflow-hidden flex-shrink-0">
        <img 
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Texte à droite */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-[16px] text-text-main mb-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-[13px] text-[#555] line-clamp-2">
          {description}
        </p>
      </div>
      
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
    </Card>
  );
};

export const StaticSections = () => {
  const navigate = useNavigate();

  const sections = [
    {
      image: actualiteAides,
      title: "Mes aides financières",
      description: "Simuler et retrouver tes aides pour les activités.",
      path: "/aides"
    },
    {
      image: actualiteVille,
      title: "Ma ville, mon actu",
      description: "Infos locales, actus et événements près de chez toi.",
      path: "/community"
    },
    {
      image: actualiteTrajets,
      title: "Mes trajets",
      description: "Préparer le trajet pour aller à une activité.",
      path: "/eco-mobilite"
    },
    {
      image: actualitePrix,
      title: "Prix Bon Esprit",
      description: "Découvrir les clubs et jeunes mis à l'honneur.",
      path: "/community"
    }
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-[20px] font-semibold text-[#222222]">
        Actualités et outils pour ta famille
      </h2>
      
      <div className="grid gap-3">
        {sections.map((section, index) => (
          <StaticCard
            key={index}
            image={section.image}
            title={section.title}
            description={section.description}
            onClick={() => navigate(section.path)}
          />
        ))}
      </div>
    </section>
  );
};
