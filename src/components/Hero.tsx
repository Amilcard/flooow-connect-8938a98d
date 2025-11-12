import { Button } from "@/components/ui/button";
import { Search, Heart, Users } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative h-[40vh] md:h-[45vh] lg:h-[520px] min-h-[360px] flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Subtle overlay pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12)_0%,transparent_55%)]" />
      
      <div className="container px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge WeTransfer style - plus arrondi, fond doux */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 shadow-lg">
            <Heart className="w-4 h-4 text-white" />
            <span className="text-sm font-semibold text-white tracking-wide">Plateforme gratuite d'accès aux activités</span>
          </div>

          {/* Main heading - Police display serif pour effet magazine */}
          <h1 className="font-display text-white leading-[1.1] tracking-tight">
            Ouvrez les portes de toutes les activités pour vos enfants
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-white/95 max-w-2xl mx-auto leading-relaxed font-light">
            Sport, culture, loisirs, vacances : trouvez l'activité idéale et découvrez les aides auxquelles vous avez droit.
          </p>

          {/* CTA buttons - Style WeTransfer (plus gros padding, ombres douces) */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button 
              variant="default" 
              size="lg" 
              className="min-w-[220px] h-14 text-base font-semibold shadow-xl hover:shadow-2xl"
            >
              <Search className="w-5 h-5 mr-2" />
              Trouver une activité
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              className="min-w-[220px] h-14 text-base font-semibold shadow-md hover:shadow-lg"
            >
              <Users className="w-5 h-5 mr-2" />
              Je suis un organisme
            </Button>
          </div>

          {/* Trust indicators - Style plus moderne */}
          <div className="flex flex-wrap justify-center gap-8 pt-8 text-white/85 text-sm font-medium">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-sm" />
              <span>100% gratuit</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-sm" />
              <span>Accessible à tous</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-sm" />
              <span>Enfants 3-17 ans</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave - Plus prononcée */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-24 md:h-36 text-bg-body" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,50 C300,100 900,0 1200,50 L1200,120 L0,120 Z" fill="currentColor" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
