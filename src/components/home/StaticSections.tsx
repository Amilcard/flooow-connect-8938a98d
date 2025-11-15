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
      className="group cursor-pointer hover:shadow-xl transition-all duration-200 bg-white rounded-xl overflow-hidden shadow-card h-[160px] md:h-[220px] flex flex-row"
      onClick={onClick}
    >
      {/* Texte à gauche - 60% */}
      <div className="flex-1 w-[60%] p-4 md:p-6 flex flex-col justify-center">
        <h3 className="font-semibold text-[16px] md:text-[18px] text-text-main mb-2 group-hover:text-primary transition-colors leading-[1.35]">
          {title}
        </h3>
        <p className="text-[13px] md:text-[14px] text-text-muted line-clamp-3 leading-[1.35]">
          {description}
        </p>
      </div>
      
      {/* Image à droite - 40% */}
      <div className="w-[40%] md:w-[360px] h-full flex-shrink-0">
        <img 
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
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
    <section className="space-y-5">
      <h2 className="text-[20px] font-semibold text-text-main">
        Actualités et outils pour ta famille
      </h2>
      
      <div className="grid gap-4">
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
