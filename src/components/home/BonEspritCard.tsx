import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const BonEspritCard = () => {
  const navigate = useNavigate();

  return (
    <Card
      className="group cursor-pointer hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6 md:p-8"
      onClick={() => navigate('/bon-esprit')}
      data-tour-id="home-bon-esprit"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-accent-blue text-white shadow-md">
          <Trophy className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-bold text-text-main mb-2 group-hover:text-accent-blue transition-colors">
            Prix Bon Esprit
          </h2>
          <p className="text-sm md:text-base text-text-muted mb-4 leading-relaxed">
            Valorisez les belles actions ! Votez pour ceux qui font briller votre quartier.
          </p>
          <Button
            className="bg-accent-blue hover:bg-accent-blue/90 text-white font-semibold px-6 h-11 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            Voter pour un héros
          </Button>
        </div>
      </div>
    </Card>
  );
};
