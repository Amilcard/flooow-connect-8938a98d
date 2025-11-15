import { Coins, Newspaper, Navigation, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StaticCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  onClick: () => void;
  className?: string;
}

const StaticCard = ({ icon, title, description, onClick, className }: StaticCardProps) => {
  return (
    <Card 
      className={cn(
        "p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-card border-border-subtle",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-text-main mb-1">{title}</h3>
          {description && (
            <p className="text-sm text-text-muted">{description}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export const StaticSections = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: <Coins className="w-6 h-6 text-primary" />,
      title: "Mes aides financières",
      description: "Estimez vos aides et réduisez vos coûts",
      onClick: () => navigate("/aides-mobilite"),
    },
    {
      icon: <Newspaper className="w-6 h-6 text-accent" />,
      title: "Mon actu",
      description: "Messages et bons plans vérifiés",
      onClick: () => {
        // Scroll to messages section on same page
        const messagesSection = document.getElementById("messages-section");
        if (messagesSection) {
          messagesSection.scrollIntoView({ behavior: "smooth" });
        }
      },
    },
    {
      icon: <Navigation className="w-6 h-6 text-success-green" />,
      title: "Mes trajets",
      description: "Planifiez vos déplacements éco-responsables",
      onClick: () => navigate("/eco-mobilite"),
    },
    {
      icon: <Award className="w-6 h-6 text-accent-pink" />,
      title: "Prix Bon esprit",
      description: "Partagez vos valeurs et soyez reconnu",
      onClick: () => {
        // TODO: Navigate to Prix Bon esprit form/page when implemented
        console.log("Prix Bon esprit - À implémenter");
      },
    },
  ];

  return (
    <section className="container px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section, index) => (
          <StaticCard
            key={index}
            icon={section.icon}
            title={section.title}
            description={section.description}
            onClick={section.onClick}
          />
        ))}
      </div>
    </section>
  );
};
