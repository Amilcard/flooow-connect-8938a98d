import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Train, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ecoMobiliteImg from "@/assets/eco-mobilite.jpg";

/**
 * Carte portrait "Mes trajets et mobilités"
 * Design moderne avec image plein cadre, texte centré sur overlay
 */
export const MobiliteCard = () => {
  const navigate = useNavigate();

  return (
    <Card
      className="group relative overflow-hidden rounded-3xl cursor-pointer h-[400px] md:h-[480px] border-0 shadow-md hover:shadow-2xl transition-all duration-500 flex flex-col"
      onClick={() => navigate('/eco-mobilite')}
    >
      {/* Image avec ratio 16:10 */}
      <div className="relative w-full h-[140px] overflow-hidden">
        <img
          src={ecoMobiliteImg}
          alt="Éco-mobilité"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        {/* Gradient overlay pour lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Contenu centré */}
      <div className="flex flex-col items-center justify-center p-6 md:p-8 text-center flex-1">
        {/* Icône */}
        <div className="mb-4 p-3 rounded-full bg-accent-blue/90 backdrop-blur-sm shadow-lg">
          <Train className="h-6 w-6 text-white" />
        </div>

        {/* Titre */}
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
          Mes trajets et mobilités
        </h2>

        {/* Sous-titre */}
        <p className="text-sm md:text-base text-white/90 mb-6 max-w-sm leading-relaxed">
          Préparez vos déplacements avec des solutions éco-responsables
        </p>

        {/* CTA discret */}
        <Button
          className="bg-white/95 hover:bg-white text-accent-blue font-semibold px-6 py-5 h-auto rounded-full shadow-lg hover:shadow-xl transition-all group-hover:scale-105"
        >
          Voir les solutions
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
