import { useState, useEffect } from "react";
import { ActivityCard } from "@/components/Activity/ActivityCard";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, MapPin } from "lucide-react";

interface Activity {
  id: string;
  title: string;
  image: string;
  distance?: string;
  ageRange?: string;
  category: string;
  price: number;
  hasAccessibility?: boolean;
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
    <section className="space-y-8">
      {/* Titre principal */}
      <h2 className="text-2xl font-bold text-text-main">Activités à la une</h2>

      {/* Carrousel principal hero */}
      {heroActivities.length > 0 && (
        <div className="relative">
          <div className="overflow-hidden rounded-xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {heroActivities.map((activity) => (
                <div key={activity.id} className="w-full flex-shrink-0">
                  <div className="relative h-[280px] sm:h-[320px]">
                    <ActivityCard
                      {...activity}
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
          
          {/* Indicateurs de pagination */}
          <div className="flex justify-center gap-2 mt-4">
            {heroActivities.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'w-8 bg-primary' 
                    : 'w-2 bg-border'
                }`}
                aria-label={`Aller à l'activité ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sous-carrousel: Petits budgets */}
      {budgetActivities.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-text-main">Petits budgets</h3>
          <div className="w-full overflow-x-auto pb-4 -mx-4 px-4">
            <div className="flex gap-4" style={{ width: "max-content" }}>
              {budgetActivities.map((activity) => (
                <div key={activity.id} className="w-[280px] flex-shrink-0">
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

      {/* Sous-carrousel: Innovantes */}
      {innovativeActivities.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-text-main">Innovantes</h3>
          <div className="w-full overflow-x-auto pb-4 -mx-4 px-4">
            <div className="flex gap-4" style={{ width: "max-content" }}>
              {innovativeActivities.map((activity) => (
                <div key={activity.id} className="w-[280px] flex-shrink-0">
                  <div className="relative">
                    <Badge 
                      className="absolute top-2 left-2 z-10 bg-accent-orange text-white"
                    >
                      Nouveau
                    </Badge>
                    <ActivityCard
                      {...activity}
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

      {/* Sous-carrousel: À proximité */}
      {nearbyActivities.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-text-main">À proximité</h3>
          <div className="w-full overflow-x-auto pb-4 -mx-4 px-4">
            <div className="flex gap-4" style={{ width: "max-content" }}>
              {nearbyActivities.map((activity) => (
                <div key={activity.id} className="w-[280px] flex-shrink-0">
                  <div className="relative">
                    {activity.distance && (
                      <Badge 
                        className="absolute top-2 left-2 z-10 bg-accent-blue text-white flex items-center gap-1"
                      >
                        <MapPin size={12} />
                        {activity.distance}
                      </Badge>
                    )}
                    <ActivityCard
                      {...activity}
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
    </section>
  );
};