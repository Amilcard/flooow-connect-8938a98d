import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateAge } from "@/lib/dateUtils";
import { Calculator, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import aidesFinancieresImg from "@/assets/aides-financieres.webp";
import { useEffect, useState, lazy, Suspense } from "react";
import { calculateQuickEstimate, QuickEstimateParams } from "@/utils/FinancialAidEngine";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Lazy load NonRecoursQuiz (contient Lottie 614KB) - chargé uniquement quand dialog ouvert
const NonRecoursQuiz = lazy(() => import("@/components/home/NonRecoursQuiz"));

interface AidesFinancieresCardProps {
  userProfile?: any;
  children?: any[];
}

export const AidesFinancieresCard = ({ userProfile, children }: AidesFinancieresCardProps) => {
  const navigate = useNavigate();
  const [hasAids, setHasAids] = useState(false);
  const [estimationText, setEstimationText] = useState("Estimez vos droits en 2 minutes");
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Arrêter l'animation halo après 3 cycles (~4.5s)
  useEffect(() => {
    const timer = setTimeout(() => setHasAnimated(true), 4500);
    return () => clearTimeout(timer);
  }, []);

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


  return (
    <>
      <Card
        className="group relative overflow-hidden rounded-3xl cursor-pointer min-h-[400px] md:min-h-[480px] border-0 shadow-md hover:shadow-2xl transition-all duration-500"
        onClick={() => navigate('/aides')}
      >
        {/* Image de fond plein cadre */}
        <div className="absolute inset-0">
          <img
            src={aidesFinancieresImg}
            alt="Mes aides"
            width={320}
            height={400}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            style={{ contentVisibility: 'auto', containIntrinsicSize: '320px 400px' }}
          />
          {/* Gradient overlay pour lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Badge Stop au non-recours - animation pulse subtile */}
        <Badge
          onClick={(e) => { e.stopPropagation(); setIsQuizOpen(true); }}
          className="absolute top-4 right-4 max-w-[calc(100%-2rem)] bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white text-sm px-4 py-2.5 min-w-[44px] min-h-[44px] border-2 border-white/30 shadow-xl z-10 cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 hover:shadow-2xl flex flex-col items-center gap-0.5 motion-safe:animate-[pulse_2s_ease-in-out_3] motion-reduce:animate-none"
          role="button"
          aria-label="Ouvrir le quiz des aides"
        >
          <span className="font-bold">Stop au non-recours</span>
          <span className="text-[10px] text-white/90 font-normal">Testez vos aides</span>
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

          {/* Sous-titre dynamique */}
          <p className={`text-sm md:text-base text-white/90 mb-6 max-w-sm leading-relaxed ${hasAids ? 'font-semibold text-yellow-300' : ''}`}>
            {estimationText}
          </p>

          {/* CTA avec halo breathing (3 cycles max) + hover desktop */}
          <div className="relative">
            {/* Halo breathing - s'arrête après 3 cycles, respecte prefers-reduced-motion */}
            {!hasAnimated && (
              <div 
                className="absolute inset-0 rounded-full bg-white/30 motion-safe:animate-[pulse_1.5s_ease-in-out_3]"
                style={{ transform: 'scale(1.15)' }}
              />
            )}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setIsLoading(true);
                setTimeout(() => {
                  setIsLoading(false);
                  setIsQuizOpen(true);
                }, 300);
              }}
              disabled={isLoading}
              className="relative bg-white/95 hover:bg-white text-primary font-semibold px-6 py-5 h-auto rounded-full shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-0.5 disabled:opacity-90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  Estimer mes aides
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Dialog Quiz */}
      <Dialog open={isQuizOpen} onOpenChange={setIsQuizOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Quiz Zéro non-recours</DialogTitle>
          </DialogHeader>
          <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <NonRecoursQuiz />
          </Suspense>
        </DialogContent>
      </Dialog>
    </>
  );
};
