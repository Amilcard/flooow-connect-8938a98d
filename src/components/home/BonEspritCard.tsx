import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import actualitePrixImg from "@/assets/actualite-prix.jpg";

/**
 * Carte portrait "Prix Bon Esprit" - CityCrunch
 * Design moderne avec image plein cadre, texte centré sur overlay
 */
export const BonEspritCard = () => {
  const navigate = useNavigate();

  return (
    <Card
      className="group relative overflow-hidden rounded-3xl cursor-pointer h-[340px] md:h-[400px] border-0 shadow-md hover:shadow-2xl transition-all duration-500"
      onClick={() => navigate('/bon-esprit')}
      data-tour-id="home-bon-esprit"
    >
      {/* Image de fond plein cadre */}
      <div className="absolute inset-0">
        <img
          src={actualitePrixImg}
          alt="Prix Bon Esprit"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        {/* Gradient overlay pour lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Contenu centré */}
      <div className="absolute inset-0 flex flex-col items-center justify-end p-6 md:p-8 text-center">
        {/* Icône */}
        <div className="mb-4 p-3 rounded-full bg-accent-blue/90 backdrop-blur-sm shadow-lg">
          <Award className="h-6 w-6 text-white" />
        </div>

        {/* Titre */}
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
          Prix Bon Esprit
        </h2>

        {/* Sous-titre */}
        <p className="text-sm md:text-base text-white/90 mb-6 max-w-sm leading-relaxed">
          On nomme nos héros.
        </p>

        {/* CTA discret */}
        <Button
          className="bg-white/95 hover:bg-white text-accent-blue font-semibold px-6 py-5 h-auto rounded-full shadow-lg hover:shadow-xl transition-all group-hover:scale-105"
        >
          Proposer un héros
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
