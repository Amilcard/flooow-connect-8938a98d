import { useNavigate } from "react-router-dom";
import { AppIcon } from "@/components/ui/app-icon";
import { Dumbbell, Palette, GraduationCap, Gamepad2, Briefcase } from "lucide-react";
import { LucideIcon } from "lucide-react";

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

  const handleUniversClick = (universId: string) => {
    navigate(`/activities?universe=${universId}`);
  };

  return (
    <section className="w-full space-y-4" aria-labelledby="univers-title">
      <h2 id="univers-title" className="text-2xl font-bold text-text-main">
        Découvrir nos univers
      </h2>

      {/* Ligne horizontale scrollable d'icônes */}
      <div 
        className="w-full overflow-x-auto pb-2 -mx-4 px-4"
        role="list"
        aria-label="Univers d'activités"
      >
        <div className="flex gap-4" style={{ width: "max-content" }}>
          {univers.map((item) => (
            <button
              key={item.id}
              onClick={() => handleUniversClick(item.id)}
              className="flex flex-col items-center gap-2 min-w-[100px] group"
              role="listitem"
              aria-label={`Voir les activités ${item.name}`}
            >
              <div className="w-20 h-20 rounded-2xl bg-card border border-border
                            flex items-center justify-center 
                            shadow-sm hover:shadow-md
                            transition-all duration-300 ease-out group-hover:scale-105
                            group-hover:border-primary">
                <AppIcon 
                  Icon={item.icon} 
                  size="md" 
                  color="primary"
                  title={item.name}
                  data-testid={item.testId}
                />
              </div>
              
              <span className="text-sm font-medium text-text-main text-center">
                {item.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
