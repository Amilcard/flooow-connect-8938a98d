import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import actualiteVilleImg from "@/assets/actualite-ville.webp";

export const MaVilleCard = () => {
  const navigate = useNavigate();

  return (
    <Card
      className="group relative overflow-hidden rounded-3xl cursor-pointer h-[400px] md:h-[480px] border-0 shadow-md hover:shadow-2xl transition-all duration-500"
      onClick={() => navigate('/ma-ville-mon-actu')}
    >
      <div className="absolute inset-0">
        <img
          src={actualiteVilleImg}
          alt="Ma ville mon actu"
          width={320}
          height={400}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      <Badge className="absolute top-4 right-4 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 shadow-lg">
        Local
      </Badge>

      <div className="absolute inset-0 flex flex-col items-center justify-end p-6 md:p-8 text-center">
        <div className="mb-4 p-3 rounded-full bg-amber-500/90 backdrop-blur-sm shadow-lg">
          <Building2 className="h-6 w-6 text-white" />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
          Ma ville
        </h2>

        <p className="text-sm md:text-base text-white/90 mb-6 max-w-sm leading-relaxed line-clamp-2 min-h-[2.5rem]">
          Actus, agenda et bons plans près de chez vous
        </p>

        <Button
          className="bg-white/95 hover:bg-white text-amber-600 font-semibold px-6 py-5 h-auto rounded-full shadow-lg hover:shadow-xl transition-all group-hover:scale-105"
        >
          Explorer
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
