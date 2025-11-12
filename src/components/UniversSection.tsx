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
    <section className="w-full mt-16" aria-labelledby="univers-title">
      {/* Titre de section WeTransfer style - Police display serif */}
      <div className="mb-8">
        <h2 id="univers-title" className="font-display text-4xl md:text-5xl text-foreground mb-3">
          Découvrir nos univers
        </h2>
        <p className="text-base text-text-muted font-light">
          Explorez nos catégories d'activités
        </p>
      </div>

      {/* Grille responsive WeTransfer style - Plus d'espace, cartes plus grandes, effet décalé */}
      <div 
        className="grid-staggered-5"
        role="list"
        aria-label="Univers d'activités"
      >
        {univers.map((item) => (
          <Card
            key={item.id}
            onClick={() => handleUniversClick(item.id)}
            className="group relative overflow-hidden cursor-pointer
                       h-44 flex flex-col items-center justify-center
                       bg-white border-0
                       transition-all duration-300 ease-out hover:-translate-y-2
                       shadow-md hover:shadow-2xl rounded-3xl"
            role="listitem"
          >
            {/* Fond coloré au survol - Style WeTransfer */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-soft to-accent-soft opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Contenu de la carte - Icône agrandie style WeTransfer */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-4 p-5">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/15 to-accent/15
                            flex items-center justify-center 
                            shadow-sm group-hover:shadow-lg
                            transition-all duration-300 ease-out group-hover:scale-110">
                <span className="text-7xl filter drop-shadow-sm">
                  {item.icon}
                </span>
              </div>
              <h3 className="text-base font-semibold text-text-main text-center group-hover:text-primary transition-colors">
                {item.name}
              </h3>
            </div>

            {/* Indicateur visuel au survol - Plus épais */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-3xl" />
          </Card>
        ))}
      </div>
    </section>
  );
};
