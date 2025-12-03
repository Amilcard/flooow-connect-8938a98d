import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import aidesFinancieresImg from "@/assets/aides-financieres.jpg";
import { useEffect, useState } from "react";
import { calculateQuickEstimate, QuickEstimateParams } from "@/utils/FinancialAidEngine";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import NonRecoursQuiz from "@/components/home/NonRecoursQuiz";
import smileyIcon from "@/assets/smiley.png";

interface AidesFinancieresCardProps {
  userProfile?: any;
  children?: any[];
}

export const AidesFinancieresCard = ({ userProfile, children }: AidesFinancieresCardProps) => {
  const navigate = useNavigate();
  const [hasAids, setHasAids] = useState(false);
  const [estimationText, setEstimationText] = useState("Estimez vos droits en 2 minutes");
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  useEffect(() => {
    if (userProfile && children && children.length > 0) {
      // Simulation pour le premier enfant avec une activité "Sport" (cas le plus courant)
      const child = children[0];
      const age = calculateAge(child.dob);
      
      const params: QuickEstimateParams = {
        age,
        type_activite: 'sport',
        prix_activite: 200, // Prix fictif pour déclencher les aides au %
        code_postal: userProfile.postal_code || "00000"
      };

      const result = calculateQuickEstimate(params);

      // Si des aides sont détectées (min > 0) ou potentielles (max > 0)
      if (result.montant_max > 0) {
        setHasAids(true);
        // On affiche le montant max pour être incitatif (c'est une estimation "Jusqu'à")
        setEstimationText(`Jusqu'à ${result.montant_max}€ d'aides pour ${child.first_name || "votre enfant"} !`);
      }
    }
  }, [userProfile, children]);

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <>
      <Card
        className="group relative overflow-hidden rounded-3xl cursor-pointer h-[340px] md:h-[400px] border-0 shadow-md hover:shadow-2xl transition-all duration-500"
        onClick={() => navigate('/aides')}
      >
        {/* Image de fond plein cadre */}
        <div className="absolute inset-0">
          <img
            src={aidesFinancieresImg}
            alt="Mes aides"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          {/* Gradient overlay pour lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Badge Stop au non-recours avec smiley intégré */}
        <Badge 
          onClick={(e) => { e.stopPropagation(); setIsQuizOpen(true); }}
          className="absolute top-4 right-4 bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 min-w-[44px] min-h-[44px] border-0 shadow-lg z-10 cursor-pointer transition-all hover:scale-105 flex items-center gap-2"
        >
          <img src={smileyIcon} alt="" className="h-5 w-5 animate-bounce mix-blend-multiply" />
          Stop au non-recours !
        </Badge>

        {/* Contenu centré */}
        <div className="absolute inset-0 flex flex-col items-center justify-end p-6 md:p-8 text-center">
          {/* Icône */}
          <div className="mb-4 p-3 rounded-full bg-primary/90 backdrop-blur-sm shadow-lg">
            <Calculator className="h-6 w-6 text-white" />
          </div>

          {/* Titre */}
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
            Mes aides
          </h2>

          {/* Sous-titre */}
          <p className={`text-sm md:text-base text-white/90 mb-6 max-w-sm leading-relaxed ${hasAids ? 'font-semibold text-yellow-300' : ''}`}>
            {estimationText}
          </p>

          {/* CTA discret */}
          <Button
            className="bg-white/95 hover:bg-white text-primary font-semibold px-6 py-5 h-auto rounded-full shadow-lg hover:shadow-xl transition-all group-hover:scale-105"
          >
            Découvrir mes aides
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Dialog Quiz */}
      <Dialog open={isQuizOpen} onOpenChange={setIsQuizOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Quiz Zéro non-recours</DialogTitle>
          </DialogHeader>
          <NonRecoursQuiz />
        </DialogContent>
      </Dialog>
    </>
  );
};
