import { useNavigate, useSearchParams } from "react-router-dom";
import { AppIcon } from "@/components/ui/app-icon";
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
    <section className="w-full space-y-4 px-4" aria-labelledby="univers-title">
      <h2 id="univers-title" className="text-2xl font-bold text-text-main">
        Découvrir nos univers
      </h2>

      {/* Desktop/Tablet: Ligne centrée - Mobile: Scrollable horizontal */}
      <div 
        className="w-full overflow-x-auto pb-2"
        role="list"
        aria-label="Univers d'activités"
      >
        <div className="flex gap-6 md:gap-8 justify-start md:justify-center items-start">
          {univers.map((item) => {
            const isActive = activeUniverse === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleUniversClick(item.id)}
                className={cn(
                  "flex flex-col items-center gap-3 min-w-[80px] max-w-[100px] group flex-shrink-0",
                  "transition-all duration-200"
                )}
                role="listitem"
                aria-label={`Voir les activités ${item.name}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className={cn(
                  "w-20 h-20 rounded-2xl bg-card border-2",
                  "flex items-center justify-center",
                  "shadow-sm transition-all duration-300 ease-out",
                  "group-hover:scale-105 group-hover:shadow-md",
                  isActive 
                    ? "border-primary bg-primary/5 shadow-md" 
                    : "border-border group-hover:border-primary/50"
                )}>
                  <AppIcon 
                    Icon={item.icon} 
                    size="md" 
                    color={isActive ? "primary" : "default"}
                    title={item.name}
                    data-testid={item.testId}
                    className={cn(
                      "transition-colors",
                      isActive && "text-primary"
                    )}
                  />
                </div>
                
                <span className={cn(
                  "text-sm font-medium text-center leading-tight",
                  isActive ? "text-primary" : "text-text-main"
                )}>
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
