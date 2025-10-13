import { Card, CardContent } from "@/components/ui/card";
import { Search, Calculator, CheckCircle, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Recherche simplifiée",
    description: "Trouvez rapidement l'activité idéale grâce à nos filtres : âge, distance, accessibilité, coût...",
    forWho: "familles",
  },
  {
    icon: Calculator,
    title: "Simulateur d'aides",
    description: "Calculez instantanément les aides auxquelles vous avez droit : CAF, Pass'Sport, aides locales...",
    forWho: "familles",
  },
  {
    icon: CheckCircle,
    title: "Inscription facilitée",
    description: "Inscrivez vos enfants en quelques clics et suivez l'état de vos demandes en temps réel.",
    forWho: "familles",
  },
  {
    icon: TrendingUp,
    title: "Visibilité accrue",
    description: "Touchez plus de familles, gérez vos inscriptions et vos créneaux depuis un tableau de bord unique.",
    forWho: "structures",
  },
];

const Features = () => {
  return (
    <section className="py-20 md:py-32 bg-gradient-subtle">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-foreground">Comment ça marche ?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Une plateforme pensée pour faciliter l'accès aux activités
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.title}
                className="border-border hover:border-primary/20 transition-all duration-300 hover:shadow-elegant-md"
              >
                <CardContent className="p-8 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-foreground">
                          {feature.title}
                        </h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent font-medium">
                          {feature.forWho}
                        </span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
