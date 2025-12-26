import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import actualitePrixImg from "@/assets/actualite-prix.webp";

export const BonEspritCard = () => {
  const navigate = useNavigate();

  return (
    <Card
      className="group relative overflow-hidden rounded-3xl cursor-pointer h-[400px] md:h-[480px] border-0 shadow-md hover:shadow-2xl transition-all duration-500"
      onClick={() => navigate('/bon-esprit')}
    >
      <div className="absolute inset-0">
        <img
          src={actualitePrixImg}
          alt="Clubs solidaires bon esprit"
          width={320}
          height={400}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      <Badge className="absolute top-4 right-4 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-3 py-1.5 shadow-lg">
        Solidarité
      </Badge>

      <div className="absolute inset-0 flex flex-col items-center justify-end p-6 md:p-8 text-center">
        <div className="mb-4 p-3 rounded-full bg-rose-500/90 backdrop-blur-sm shadow-lg">
          <Heart className="h-6 w-6 text-white" />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
          Clubs solidaires
        </h2>

        <p className="text-sm md:text-base text-white/90 mb-6 max-w-sm leading-relaxed line-clamp-2 min-h-[2.5rem]">
          Mettez en lumière un coach, un bénévole, un parent ou un copain qui fait du bien autour de lui.
        </p>

        <Button
          className="bg-white/95 hover:bg-white text-rose-600 font-semibold px-6 py-5 h-auto rounded-full shadow-lg hover:shadow-xl transition-all group-hover:scale-105"
        >
          Découvrir
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
