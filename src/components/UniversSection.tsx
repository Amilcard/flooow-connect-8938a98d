import { useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import universSport from "@/assets/univers-sport.jpg";
import universCulture from "@/assets/univers-culture.jpg";
import universApprentissage from "@/assets/univers-apprentissage.jpg";
import universLoisirs from "@/assets/univers-loisirs.jpg";
import universVacances from "@/assets/univers-vacances.jpg";

interface Univers {
  id: string;
  name: string;
  image: string;
  testId: string;
}

const univers: Univers[] = [
  {
    id: 'sport',
    name: 'Sport',
    image: universSport,
    testId: 'icon-category-sport'
  },
  {
    id: 'culture',
    name: 'Culture',
    image: universCulture,
    testId: 'icon-category-culture'
  },
  {
    id: 'apprentissage',
    name: 'Apprentissage',
    image: universApprentissage,
    testId: 'icon-category-apprentissage'
  },
  {
    id: 'loisirs',
    name: 'Loisirs',
    image: universLoisirs,
    testId: 'icon-category-loisirs'
  },
  {
    id: 'vacances',
    name: 'Vacances',
    image: universVacances,
    testId: 'icon-category-vacances'
  },
];

export const UniversSection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeUniverse = searchParams.get('universe');

  const handleUniversClick = (universId: string) => {
    navigate(`/activities?universe=${universId}`);
  };

  return (
    <section 
      className="w-full py-4 bg-[#F8F8F8]" 
      aria-labelledby="univers-title"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 
          id="univers-title" 
          className="text-[18px] font-semibold text-[#222222] mb-4"
        >
          Découvrir nos univers
        </h2>

        {/* Desktop: Ligne centrée - Mobile: Scrollable horizontal */}
        <div 
          className="w-full overflow-x-auto scrollbar-hide pb-2"
          role="list"
          aria-label="Univers d'activités"
        >
          <div className="flex gap-3 justify-center md:justify-between items-center min-w-max md:min-w-0">
            {univers.map((item) => {
              const isActive = activeUniverse === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleUniversClick(item.id)}
                  className={cn(
                    "relative w-[85px] h-[105px] rounded-[14px] overflow-hidden",
                    "group transition-all duration-300 ease-out",
                    "hover:scale-105 hover:shadow-lg",
                    isActive 
                      ? "shadow-[0_4px_12px_rgba(127,86,217,0.3)]" 
                      : "shadow-[0_2px_6px_rgba(0,0,0,0.04)]"
                  )}
                  role="listitem"
                  aria-label={`Voir les activités ${item.name}`}
                  aria-current={isActive ? 'page' : undefined}
                  data-testid={item.testId}
                >
                  {/* Image de fond */}
                  <img 
                    src={item.image}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  {/* Label en overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-2 flex items-end justify-center">
                    <span 
                      className={cn(
                        "text-[16px] font-semibold text-white text-center leading-tight",
                        "drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]",
                        isActive && "scale-105"
                      )}
                    >
                      {item.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
