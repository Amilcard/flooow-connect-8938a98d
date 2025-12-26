import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Train, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ecoMobiliteImg from "@/assets/eco-mobilite.webp";

/**
 * Carte portrait "Mes trajets" - CityCrunch
 * Design moderne avec image plein cadre, texte centré sur overlay
 */
export const MobiliteCard = () => {
  const navigate = useNavigate();

  return (
    <Card
      className="group relative overflow-hidden rounded-3xl cursor-pointer h-[400px] md:h-[480px] border-0 shadow-md hover:shadow-2xl transition-all duration-500"
      onClick={() => navigate('/eco-mobilite')}
    >
      {/* Image de fond plein cadre */}
      <div className="absolute inset-0">
        <img
          src={ecoMobiliteImg}
          alt="Mes trajets éco-mobilité"
          width={320}
          height={400}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        {/* Gradient overlay pour lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Badge */}
      <Badge className="absolute top-4 right-4 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 shadow-lg">
        Éco-mobilité
      </Badge>

      {/* Contenu centré */}
      <div className="absolute inset-0 flex flex-col items-center justify-end p-6 md:p-8 text-center">
        {/* Icône */}
        <div className="mb-4 p-3 rounded-full bg-accent-blue/90 backdrop-blur-sm shadow-lg">
          <Train className="h-6 w-6 text-white" />
        </div>

        {/* Titre */}
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
          Mes trajets
        </h2>

        {/* Sous-titre */}
        <p className="text-sm md:text-base text-white/90 mb-6 max-w-sm leading-relaxed line-clamp-2 min-h-[2.5rem]">
          Vélo, bus ou covoiturage : à vous de choisir
        </p>

        {/* CTA */}
        <Button
          className="bg-white/95 hover:bg-white text-accent-blue font-semibold px-6 py-5 h-auto rounded-full shadow-lg hover:shadow-xl transition-all group-hover:scale-105"
        >
          Trouver mon trajet
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
