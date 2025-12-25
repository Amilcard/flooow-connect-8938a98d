import { MapPin, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DemoCityKey, 
  DEMO_CITIES, 
  DEMO_CITY_KEYS 
} from '@/components/demo/DemoCityConfig';

interface DemoExamplesSectionProps {
  onSelectDemoCity: (cityKey: DemoCityKey) => void;
  /** Si true, le composant ne s'affiche pas (utilisateur sur territoire couvert) */
  isCovered?: boolean;
}

// Exemples statiques d'activités (pas de fetch, juste illustration)
const exampleActivities = [
  {
    id: 1,
    title: "Atelier théâtre ados",
    category: "Culture",
    ageRange: "12-17 ans",
    price: "230€/saison",
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400&h=300&fit=crop"
  },
  {
    id: 2,
    title: "Camp nature découverte",
    category: "Vacances",
    ageRange: "8-14 ans", 
    price: "150€/séjour",
    image: "https://images.unsplash.com/photo-1472745942893-4b9f730c7668?w=400&h=300&fit=crop"
  },
  {
    id: 3,
    title: "Basket mini-poussins",
    category: "Sport",
    ageRange: "6-9 ans",
    price: "180€/saison",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop"
  },
  {
    id: 4,
    title: "Arts plastiques",
    category: "Culture",
    ageRange: "4-10 ans",
    price: "210€/saison",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop"
  }
];

/**
 * Section d'exemples d'activités des villes pilotes
 * 
 * RÈGLE PRODUIT : Ce composant ne doit s'afficher que pour les utilisateurs
 * dont le territoire n'est PAS couvert. Les utilisateurs couverts (42/69/13)
 * ne doivent jamais voir les boutons "Tester à Lyon/Marseille/St-É".
 */
export const DemoExamplesSection = ({ onSelectDemoCity, isCovered = false }: DemoExamplesSectionProps) => {
  
  // RÈGLE : Ne pas afficher si l'utilisateur est sur un territoire couvert
  if (isCovered) {
    return null;
  }

  return (
    <section className="py-6">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-bold text-foreground">Exemples d'activités</h2>
          <Badge variant="secondary" className="text-xs">
            Démo
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Découvrez le parcours complet sur une ville pilote
        </p>
      </div>

      {/* Grille d'exemples */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {exampleActivities.map((activity) => (
          <Card 
            key={activity.id}
            className="overflow-hidden group cursor-default"
          >
            <div className="relative aspect-[4/3]">
              <img 
                src={activity.image}
                alt={activity.title}
                className="w-full h-full object-cover"
              />
              {/* Badge "Exemple" */}
              <div className="absolute top-2 left-2">
                <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5">
                  Exemple
                </Badge>
              </div>
              {/* Overlay catégorie */}
              <div className="absolute bottom-2 left-2">
                <Badge variant="secondary" className="text-[10px] bg-white/90">
                  {activity.category}
                </Badge>
              </div>
            </div>
            <CardContent className="p-3">
              <h3 className="font-medium text-sm text-foreground line-clamp-1 mb-1">
                {activity.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{activity.ageRange}</span>
                <span className="font-medium text-primary">{activity.price}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTAs villes pilotes - UNIQUEMENT pour non couverts */}
      <div className="bg-muted/30 rounded-xl p-4">
        <p className="text-sm text-center text-muted-foreground mb-4">
          Votre ville n'est pas encore couverte ? Testez la démo sur une ville pilote
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          {DEMO_CITY_KEYS.map((key) => (
            <Button
              key={key}
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() => onSelectDemoCity(key)}
            >
              <Play className="mr-2 h-4 w-4" />
              Démo {DEMO_CITIES[key].shortLabel}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DemoExamplesSection;
