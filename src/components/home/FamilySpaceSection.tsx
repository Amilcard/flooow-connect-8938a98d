import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const FamilySpaceSection = () => {
  const navigate = useNavigate();

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-text-main mb-2">
          Pour votre famille
        </h2>
        <p className="text-sm text-text-muted">
          Des services utiles pour vous accompagner au quotidien.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ma ville, mon actu */}
        <Card
          className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-border rounded-2xl p-6"
          onClick={() => navigate('/ma-ville-mon-actu')}
          data-tour-id="home-city-events"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600 shadow-sm">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-text-main mb-2 group-hover:text-primary transition-colors">
                Ma ville, mon actu
              </h3>
              <p className="text-sm text-text-muted mb-4 leading-relaxed">
                Tous les événements, sorties et animations près de chez vous : matchs, spectacles, festivals et plus encore !
              </p>
              <Button
                variant="outline"
                className="font-semibold hover:bg-background/80 transition-all"
              >
                Découvrir les événements
              </Button>
            </div>
          </div>
        </Card>

        {/* Prix Bon Esprit */}
        <Card
          className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-border rounded-2xl p-6"
          onClick={() => navigate('/bon-esprit')}
          data-tour-id="home-bon-esprit"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600 shadow-sm">
              <Trophy className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-text-main mb-2 group-hover:text-primary transition-colors">
                Prix Bon Esprit
              </h3>
              <p className="text-sm text-text-muted mb-4 leading-relaxed">
                Valorisez les belles actions ! Votez pour ceux qui font briller votre quartier par leur solidarité et leur engagement.
              </p>
              <Button
                variant="outline"
                className="font-semibold hover:bg-background/80 transition-all"
              >
                Voter pour un héros du quotidien
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
