import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AidesFinancieresCard = () => {
  const navigate = useNavigate();

  return (
    <Card 
      className="group cursor-pointer hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-2xl p-6 md:p-8"
      onClick={() => navigate('/aides')}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-primary text-white shadow-md">
          <Calculator className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-bold text-text-main mb-2 group-hover:text-primary transition-colors">
            Mes aides financières
          </h2>
          <p className="text-sm md:text-base text-text-muted mb-4 leading-relaxed">
            Estimez rapidement les aides auxquelles votre famille peut avoir droit.
          </p>
          <Button 
            className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 h-11 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            Découvrir mes aides
          </Button>
        </div>
      </div>
    </Card>
  );
};
