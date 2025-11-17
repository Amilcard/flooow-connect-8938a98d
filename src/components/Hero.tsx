import { Button } from "@/components/ui/button";
import { Search, Heart, Users } from "lucide-react";

/**
 * Hero Banner - Page d'accueil
 *
 * Design System LOT 1 Optimization:
 * - Height: 180px (compact banner)
 * - Removed excessive whitespace
 * - Condensed spacing while preserving all content
 */
const Hero = () => {
  return (
    <section className="relative h-[180px] flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Subtle overlay pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12)_0%,transparent_55%)]" />

      <div className="container px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          {/* Badge WeTransfer style - compact */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 shadow-lg">
            <Heart className="w-3 h-3 text-white" />
            <span className="text-xs font-semibold text-white tracking-wide">Plateforme gratuite d'accès aux activités</span>
          </div>

          {/* Main heading - Compact responsive sizing */}
          <h1 className="font-display text-white leading-[1.1] tracking-tight text-2xl md:text-3xl">
            Ouvrez les portes de toutes les activités pour vos enfants
          </h1>

          {/* Subheading - More compact */}
          <p className="text-sm md:text-base text-white/95 max-w-2xl mx-auto leading-snug font-light">
            Sport, culture, loisirs, vacances : trouvez l'activité idéale et découvrez les aides auxquelles vous avez droit.
          </p>

          {/* CTA buttons - Compact sizing */}
          <div className="flex flex-col sm:flex-row gap-2 justify-center items-center pt-2">
            <Button
              variant="default"
              size="sm"
              className="min-w-[180px] h-10 text-sm font-semibold shadow-lg hover:shadow-xl"
            >
              <Search className="w-4 h-4 mr-1.5" />
              Trouver une activité
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="min-w-[180px] h-10 text-sm font-semibold shadow-md hover:shadow-lg"
            >
              <Users className="w-4 h-4 mr-1.5" />
              Je suis un organisme
            </Button>
          </div>

          {/* Trust indicators - Compact */}
          <div className="hidden sm:flex flex-wrap justify-center gap-4 pt-2 text-white/85 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-sm" />
              <span>100% gratuit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-sm" />
              <span>Accessible à tous</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-sm" />
              <span>Enfants 3-17 ans</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
