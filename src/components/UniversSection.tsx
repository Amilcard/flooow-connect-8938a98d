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
  }
];

const getGradientForUniverse = (id: string) => {
  const gradients: Record<string, string> = {
    'sport': 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
    'culture': 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
    'apprentissage': 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
    'loisirs': 'linear-gradient(135deg, #A855F7 0%, #C084FC 100%)',
    'vacances': 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
  };
  return gradients[id] || gradients['sport'];
};

export const UniversSection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeUniverse = searchParams.get('universe');

  const handleUniversClick = (universId: string) => {
    navigate(`/activities?universe=${universId}`);
  };

  return (
    <section 
      className="w-full py-4 px-4" 
      aria-labelledby="univers-title"
    >
      <div className="max-w-[1200px] mx-auto">
        <h2 
          id="univers-title" 
          className="text-[18px] font-bold text-[#1F2937] mb-3"
        >
          Découvrir nos univers
        </h2>

        {/* Scrollable horizontal */}
        <div 
          className="w-full overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4"
          role="list"
          aria-label="Univers d'activités"
        >
          <div className="flex gap-[6px] min-w-max">
            {univers.map((item) => {
              const isActive = activeUniverse === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleUniversClick(item.id)}
                  className={cn(
                    "relative w-[84px] h-[84px] rounded-[16px] overflow-hidden flex-shrink-0",
                    "transition-all duration-300 ease-out",
                    "hover:scale-105 hover:shadow-lg",
                    isActive 
                      ? "shadow-[0_4px_12px_rgba(255,107,53,0.3)]" 
                      : "shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
                  )}
                  style={{ background: getGradientForUniverse(item.id) }}
                  role="listitem"
                  aria-label={`Voir les activités ${item.name}`}
                  aria-current={isActive ? 'page' : undefined}
                  data-testid={item.testId}
                >
                  {/* Image en overlay avec opacity */}
                  <img 
                    src={item.image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-25"
                  />
                  
                  {/* Texte centré */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[3] w-full px-2">
                    <span 
                      className={cn(
                        "text-[15px] font-bold text-white text-center block leading-tight whitespace-nowrap",
                        "drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
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
