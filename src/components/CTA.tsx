import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-accent p-12 md:p-16 shadow-elegant-xl">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 text-center space-y-6">
              <h2 className="text-white">
                Prêt à découvrir de nouvelles opportunités ?
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                Rejoignez des milliers de familles qui ont déjà trouvé l'activité parfaite pour leurs enfants.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button variant="default" size="lg">
                  Commencer maintenant
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button variant="secondary" size="lg">
                  En savoir plus
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
