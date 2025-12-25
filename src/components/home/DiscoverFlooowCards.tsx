import { Search, Euro, Bike, ClipboardCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

const features: FeatureCard[] = [
  {
    icon: <Search className="w-6 h-6 text-white" />,
    title: "Trouver une activité",
    description: "Par âge, budget et envies",
    gradient: "from-primary to-primary/80"
  },
  {
    icon: <Euro className="w-6 h-6 text-white" />,
    title: "Estimer ses aides",
    description: "Pass'Sport, CAF, aides locales",
    gradient: "from-accent to-accent/80"
  },
  {
    icon: <Bike className="w-6 h-6 text-white" />,
    title: "Éco-mobilité",
    description: "Trajets et options de transport",
    gradient: "from-green-500 to-green-600"
  },
  {
    icon: <ClipboardCheck className="w-6 h-6 text-white" />,
    title: "Inscription simple",
    description: "Un parcours sans galère",
    gradient: "from-blue-500 to-blue-600"
  }
];

/**
 * Cartes présentant les fonctionnalités de Flooow
 * Affichées sans données locales, juste la promesse de valeur
 */
export const DiscoverFlooowCards = () => {
  return (
    <section className="py-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-foreground">Découvrir Flooow</h2>
        <p className="text-sm text-muted-foreground">
          Ce que l'app peut faire pour vous
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {features.map((feature, index) => (
          <Card 
            key={index}
            className="overflow-hidden hover:shadow-md transition-shadow cursor-default"
          >
            <CardContent className="p-4">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3`}>
                {feature.icon}
              </div>
              <h3 className="font-semibold text-sm text-foreground mb-1">
                {feature.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default DiscoverFlooowCards;
