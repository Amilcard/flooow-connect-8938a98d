import { Button } from "@/components/ui/button";
import { Search, Heart, Users } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative h-[40vh] md:h-[45vh] lg:h-[480px] min-h-[320px] flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Subtle overlay pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
      
      <div className="container px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
            <Heart className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Plateforme gratuite d'accès aux activités</span>
          </div>

          {/* Main heading */}
          <h1 className="text-white leading-tight">
            Ouvrez les portes de toutes les activités pour vos enfants
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Sport, culture, loisirs, vacances : trouvez l'activité idéale et découvrez les aides auxquelles vous avez droit.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button variant="default" size="lg" className="min-w-[200px]">
              <Search className="w-5 h-5 mr-2" />
              Trouver une activité
            </Button>
            <Button variant="secondary" size="lg" className="min-w-[200px]">
              <Users className="w-5 h-5 mr-2" />
              Je suis un organisme
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-8 pt-8 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span>100% gratuit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span>Accessible à tous</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span>Enfants 3-17 ans</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-20 md:h-32 text-background" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,50 C300,100 900,0 1200,50 L1200,120 L0,120 Z" fill="currentColor" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
