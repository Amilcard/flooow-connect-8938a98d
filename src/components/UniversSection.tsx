import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface Univers {
  id: string;
  name: string;
  image: string;
  gradient: string;
  icon: string;
}

const univers: Univers[] = [
  {
    id: 'sport',
    name: 'Sport',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=280&fit=crop',
    gradient: 'from-blue-600',
    icon: '⚽'
  },
  {
    id: 'culture',
    name: 'Culture',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=280&fit=crop',
    gradient: 'from-purple-600',
    icon: '🎨'
  },
  {
    id: 'apprentissage',
    name: 'Apprentissage',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=280&fit=crop',
    gradient: 'from-green-600',
    icon: '📚'
  },
  {
    id: 'loisirs',
    name: 'Loisirs',
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=280&fit=crop',
    gradient: 'from-orange-600',
    icon: '🎮'
  },
  {
    id: 'vacances',
    name: 'Vacances',
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=280&fit=crop',
    gradient: 'from-pink-600',
    icon: '🏖️'
  },
];

export const UniversSection = () => {
  const navigate = useNavigate();

  const handleUniversClick = (universId: string) => {
    // Navigate to activities page with universe filter
    navigate(`/activities?universe=${universId}`);
  };

  return (
    <section className="w-full mt-12" aria-labelledby="univers-title">
      {/* Titre de section avec séparateur visuel */}
      <div className="mb-6 pb-3 border-b border-border">
        <h2 id="univers-title" className="text-2xl font-bold text-foreground">
          Découvrir nos univers
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Explorez nos catégories d'activités
        </p>
      </div>

      {/* Grille responsive : 5 colonnes desktop, 3 tablette, 2 mobile */}
      <div 
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
        role="list"
        aria-label="Univers d'activités"
      >
        {univers.map((item) => (
          <Card
            key={item.id}
            onClick={() => handleUniversClick(item.id)}
            className="group relative overflow-hidden cursor-pointer
                       h-32 flex flex-col items-center justify-center
                       bg-card border border-border/50
                       hover:border-primary/50 hover:shadow-lg
                       transition-all duration-300 hover:scale-[1.02]"
            role="listitem"
          >
            {/* Fond subtil avec l'icône emoji */}
            <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Contenu de la carte */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-2 p-4">
              <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </span>
              <h3 className="text-base font-semibold text-foreground text-center">
                {item.name}
              </h3>
            </div>

            {/* Indicateur visuel au survol */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Card>
        ))}
      </div>
    </section>
  );
};
