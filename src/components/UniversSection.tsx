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
    // Navigate to activities page with category filter
    navigate(`/activities?category=${universId}`);
  };

  return (
    <section className="w-full" aria-labelledby="univers-title">
      <div className="mb-4">
        <h2 id="univers-title" className="text-xl font-bold">
          Découvrir nos univers
        </h2>
      </div>

      <div className="carousel-container scroll-smooth pb-4 -mx-4 px-4">
        <div
          className="flex gap-4"
          style={{ width: "max-content" }}
          role="list"
          aria-label="Univers d'activités"
        >
          {univers.map((item) => (
            <Card
              key={item.id}
              onClick={() => handleUniversClick(item.id)}
              className="relative w-[200px] h-[140px] flex-shrink-0 snap-start overflow-hidden
                         cursor-pointer group hover:scale-105 transition-all duration-300
                         border-0 shadow-md hover:shadow-xl"
              role="listitem"
            >
              {/* Background Image */}
              <img
                src={item.image}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />

              {/* Gradient Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t ${item.gradient} to-transparent opacity-70
                           group-hover:opacity-80 transition-opacity`}
              />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                <span className="text-4xl mb-2 drop-shadow-lg group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                <h3 className="text-xl font-bold drop-shadow-lg text-center">
                  {item.name}
                </h3>
              </div>

              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
