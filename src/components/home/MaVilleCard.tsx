import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import actualiteVilleImg from "@/assets/actualite-ville.jpg";

/**
 * Carte portrait "Notre ville" - CityCrunch
 * Design moderne avec image plein cadre, texte centré sur overlay
 */
export const MaVilleCard = () => {
  const navigate = useNavigate();

  return (
    <Card
      className="group relative overflow-hidden rounded-3xl cursor-pointer h-[340px] md:h-[400px] border-0 shadow-md hover:shadow-2xl transition-all duration-500"
      onClick={() => navigate('/ma-ville-mon-actu')}
      data-tour-id="home-city-events"
    >
      {/* Image de fond plein cadre */}
      <div className="absolute inset-0">
        <img
          src={actualiteVilleImg}
          alt="Notre ville"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        {/* Gradient overlay pour lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Contenu centré */}
      <div className="absolute inset-0 flex flex-col items-center justify-end p-6 md:p-8 text-center">
        {/* Icône */}
        <div className="mb-4 p-3 rounded-full bg-primary/90 backdrop-blur-sm shadow-lg">
          <Newspaper className="h-6 w-6 text-white" />
        </div>

        {/* Titre */}
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
          Notre ville
        </h2>

        {/* Sous-titre */}
        <p className="text-sm md:text-base text-white/90 mb-6 max-w-sm leading-relaxed">
          Actus, agenda, contacts.
        </p>

        {/* CTA discret */}
        <Button
          className="bg-white/95 hover:bg-white text-primary font-semibold px-6 py-5 h-auto rounded-full shadow-lg hover:shadow-xl transition-all group-hover:scale-105"
        >
          Découvrir les événements
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
