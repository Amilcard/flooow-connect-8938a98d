import { useState, useEffect } from "react";
import { ActivityCard } from "@/components/Activity/ActivityCard";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, MapPin } from "lucide-react";
import { formatAgeRangeForCard } from "@/utils/categoryMapping";

interface Activity {
  id: string;
  title: string;
  image: string;
  distance?: string;
  ageRange?: string;
  category: string;
  price: number;
  hasAccessibility?: boolean;
  paymentEchelonned?: boolean;
  hasFinancialAid?: boolean;
  age_min?: number;
  age_max?: number;
  periodType?: string;
  structureName?: string;
  structureAddress?: string;
  vacationType?: 'sejour_hebergement' | 'centre_loisirs' | 'stage_journee';
  priceUnit?: string;
  hasAccommodation?: boolean;
  aidesEligibles?: string[];
  mobility?: {
    TC?: string;
    velo?: boolean;
    covoit?: boolean;
  };
}

interface ActivitiesShowcaseProps {
  activities: Activity[];
}

export const ActivitiesShowcase = ({ activities }: ActivitiesShowcaseProps) => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Autoplay pour le carrousel principal
  useEffect(() => {
    if (activities.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.min(activities.length, 5));
    }, 5000);

    return () => clearInterval(timer);
  }, [activities.length]);

  const handleActivityClick = (activityId: string) => {
    navigate(`/activity/${activityId}`);
  };

  // Filtrer les activités pour les sous-carrousels
  const budgetActivities = activities.filter(a => a.price < 50 || a.hasFinancialAid).slice(0, 6);
  const innovativeActivities = activities.filter(a => 
    a.category === 'innovation' || 
    a.title.toLowerCase().includes('nouveau') ||
    a.title.toLowerCase().includes('innovant')
  ).slice(0, 6);
  const nearbyActivities = activities.slice(0, 6); // Déjà triées par proximité

  // Carrousel principal (5 premières activités)
  const heroActivities = activities.slice(0, 5);

  return (
    <section className="space-y-6">
      {/* Titre principal */}
      <h2 className="text-xl font-bold text-text-main">Activités à la une</h2>

      {/* Carrousel principal - 1.3 cartes visibles */}
      {heroActivities.length > 0 && (
        <div className="w-full overflow-x-auto scrollbar-hide -mx-6 px-6">
          <div 
            className="flex gap-4 snap-x snap-mandatory"
            style={{ width: 'max-content' }}
          >
            {heroActivities.map((activity) => (
              <div 
                key={activity.id} 
                className="w-[70vw] max-w-[500px] flex-shrink-0 snap-start"
              >
                <div
                  role="button"
                  tabIndex={0}
                  className="bg-white rounded-[20px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] cursor-pointer hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  onClick={() => handleActivityClick(activity.id)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleActivityClick(activity.id)}
                >
                  {/* Image 70% de la hauteur - ratio 4:3 */}
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={activity.image || '/placeholder.svg'}
                      alt={activity.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  
                  {/* Pied 30% - contenu sous l'image */}
                  <div className="p-4 space-y-2">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {activity.category}
                      </Badge>
                      {activity.age_min && activity.age_max && (
                        <Badge variant="outline" className="text-xs">
                          {formatAgeRangeForCard(activity.age_min, activity.age_max).replace(/ ans$/, "")}
                        </Badge>
                      )}
                    </div>

                    {/* Titre */}
                    <h3 className="font-bold text-lg text-text-main line-clamp-2">
                      {activity.title}
                    </h3>

                    {/* Prix */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-primary font-bold text-xl">
                        {activity.price}€
                      </span>
                      {activity.hasFinancialAid && (
                        <Badge variant="outline" className="text-xs">
                          Aides dispo
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sous-carrousel: Petits budgets */}
      {budgetActivities.length > 0 && (
        <div className="space-y-3 mt-8">
          <h3 className="text-lg font-semibold text-text-main">Petits budgets</h3>
          <div className="w-full overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4">
            <div className="flex gap-4 px-1">
              {budgetActivities.map((activity) => (
                <div key={activity.id} className="w-[260px] flex-shrink-0 snap-start">
                  <div className="relative">
                    {activity.price < 30 && (
                      <Badge 
                        className="absolute top-2 left-2 z-10 bg-accent-green text-white"
                      >
                        Petit prix
                      </Badge>
                    )}
                    <ActivityCard
                      {...activity}
                      image={activity.image}
                      ageRange={activity.age_min && activity.age_max ? `${activity.age_min}-${activity.age_max} ans` : activity.ageRange}
                      periodType={activity.periodType}
                      structureName={activity.structureName}
                      structureAddress={activity.structureAddress}
                      vacationType={activity.vacationType}
                      priceUnit={activity.priceUnit}
                      hasAccommodation={activity.hasAccommodation}
                      aidesEligibles={activity.aidesEligibles}
                      mobility={activity.mobility}
                      onRequestClick={() => handleActivityClick(activity.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section "Innovantes" désactivée pour simplifier la Home */}
      
      {/* Section "À proximité" désactivée pour simplifier la Home */}
    </section>
  );
};