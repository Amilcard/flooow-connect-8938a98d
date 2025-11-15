import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Train } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const MobiliteCard = () => {
  const navigate = useNavigate();

  return (
    <Card 
      className="group cursor-pointer hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-6 md:p-8"
      onClick={() => navigate('/eco-mobilite')}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-green-600 text-white shadow-md">
          <Train className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-bold text-text-main mb-2 group-hover:text-green-600 transition-colors">
            Mobilités
          </h2>
          <p className="text-sm md:text-base text-text-muted mb-4 leading-relaxed">
            Préparez vos trajets vers les activités sans voiture, en privilégiant les solutions éco-responsables.
          </p>
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 h-11 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            Voir les solutions de mobilité
          </Button>
        </div>
      </div>
    </Card>
  );
};
