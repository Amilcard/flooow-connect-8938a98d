import { useNavigate, useSearchParams } from "react-router-dom";
import { Dumbbell, Palette, GraduationCap, Gamepad2, Briefcase } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Univers {
  id: string;
  name: string;
  image: string;
  gradient: string;
  icon: LucideIcon;
  testId: string;
}

const univers: Univers[] = [
  {
    id: 'sport',
    name: 'Sport',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=280&fit=crop',
    gradient: 'from-blue-600',
    icon: Dumbbell,
    testId: 'icon-category-sport'
  },
  {
    id: 'culture',
    name: 'Culture',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=280&fit=crop',
    gradient: 'from-purple-600',
    icon: Palette,
    testId: 'icon-category-culture'
  },
  {
    id: 'apprentissage',
    name: 'Apprentissage',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=280&fit=crop',
    gradient: 'from-green-600',
    icon: GraduationCap,
    testId: 'icon-category-apprentissage'
  },
  {
    id: 'loisirs',
    name: 'Loisirs',
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=280&fit=crop',
    gradient: 'from-orange-600',
    icon: Gamepad2,
    testId: 'icon-category-loisirs'
  },
  {
    id: 'vacances',
    name: 'Vacances',
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=280&fit=crop',
    gradient: 'from-pink-600',
    icon: Briefcase,
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
      className="w-full py-10 bg-[#F8F8F8]" 
      aria-labelledby="univers-title"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 
          id="univers-title" 
          className="text-[20px] font-semibold text-[#222222] mb-6"
        >
          Découvrir nos univers
        </h2>

        {/* Desktop: Ligne centrée - Mobile: Scrollable horizontal */}
        <div 
          className="w-full overflow-x-auto scrollbar-hide pb-2"
          role="list"
          aria-label="Univers d'activités"
        >
          <div className="flex gap-8 justify-center md:justify-between items-center min-w-max md:min-w-0">
            {univers.map((item) => {
              const isActive = activeUniverse === item.id;
              const IconComponent = item.icon;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleUniversClick(item.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 min-w-[90px] group transition-all duration-200"
                  )}
                  role="listitem"
                  aria-label={`Voir les activités ${item.name}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Pastille blanche ronde */}
                  <div 
                    className={cn(
                      "w-[66px] h-[66px] rounded-full bg-white",
                      "flex items-center justify-center",
                      "transition-all duration-300 ease-out",
                      "group-hover:scale-110 group-hover:shadow-lg",
                      isActive 
                        ? "shadow-[0_4px_12px_rgba(127,86,217,0.2)]" 
                        : "shadow-[0_2px_6px_rgba(0,0,0,0.06)]"
                    )}
                  >
                    <IconComponent 
                      size={26}
                      strokeWidth={2}
                      className={cn(
                        "transition-colors",
                        isActive ? "text-primary" : "text-[#7F56D9]"
                      )}
                      data-testid={item.testId}
                      aria-hidden="true"
                    />
                  </div>
                  
                  {/* Label */}
                  <span 
                    className={cn(
                      "text-[14px] font-medium text-center leading-tight",
                      isActive ? "text-primary" : "text-[#2D2D2D]"
                    )}
                  >
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
