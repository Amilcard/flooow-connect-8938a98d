import { Card } from "@/components/ui/card";
import { AppIcon } from "@/components/ui/app-icon";
import { BadgeEuro, Bike, Heart } from "lucide-react";
import { LucideIcon } from "lucide-react";
import aidesFinancieresImg from "@/assets/pass-sport.webp";
import ecoMobiliteImg from "@/assets/eco-mobilite.jpg";
import handicapSanteImg from "@/assets/handicap-sante.jpg";

interface InfoBlock {
  id: string;
  title: string;
  description: string;
  image: string;
  icon: LucideIcon;
  gradient: string;
  testId: string;
}

const infoBlocks: InfoBlock[] = [
  {
    id: "aides",
    title: "Aides Financières",
    description: "Découvrez les aides et subventions disponibles pour vos activités",
    image: aidesFinancieresImg,
    icon: BadgeEuro,
    gradient: "from-emerald-500/90 to-emerald-700/90",
    testId: "icon-aide-financial"
  },
  {
    id: "mobilite",
    title: "Éco-Mobilité",
    description: "Solutions de transport écologique et covoiturage pour vos déplacements",
    image: ecoMobiliteImg,
    icon: Bike,
    gradient: "from-blue-500/90 to-blue-700/90",
    testId: "icon-eco-bike"
  },
  {
    id: "handicap",
    title: "Handicap & Accessibilité",
    description: "Activités adaptées et accessibles pour tous les enfants",
    image: handicapSanteImg,
    icon: Heart,
    gradient: "from-rose-500/90 to-rose-700/90",
    testId: "icon-aide-accessibility"
  }
];

export const InfoBlocks = () => {
  const handleBlockClick = (id: string) => {
    if (id === "aides") {
      window.location.href = "/aides";
    } else if (id === "mobilite") {
      window.location.href = "/eco-mobilite";
    } else if (id === "handicap") {
      window.location.href = "/inclusivite";
    }
  };

  return (
    <section className="mb-8" aria-label="Informations pratiques">
      <h2 className="text-2xl font-bold mb-6">Informations pratiques</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {infoBlocks.map((block) => (
          <Card
            key={block.id}
            className="group relative overflow-hidden cursor-pointer border-0 shadow-card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            onClick={() => handleBlockClick(block.id)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleBlockClick(block.id);
              }
            }}
            aria-label={block.title}
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={block.image}
                alt={block.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${block.gradient} opacity-80 group-hover:opacity-90 transition-opacity`} />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                <div className="mb-3 p-3 bg-white/20 rounded-full backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <AppIcon 
                    Icon={block.icon} 
                    size="lg" 
                    color="default"
                    title={block.title}
                    data-testid={block.testId}
                    className="w-8 h-8"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2">{block.title}</h3>
                <p className="text-sm text-white/90">{block.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};
