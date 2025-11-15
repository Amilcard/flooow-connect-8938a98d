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
        <div className="max-w-[1000px] mx-auto">
          <div className="overflow-hidden rounded-3xl shadow-lg">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {heroActivities.map((activity) => (
                <div key={activity.id} className="w-full flex-shrink-0">
                  <div 
                    className="relative bg-card cursor-pointer"
                    onClick={() => handleActivityClick(activity.id)}
                  >
                    {/* Image 16:9 */}
                    <div className="relative w-full aspect-video overflow-hidden">
                      <img
                        src={activity.image}
                        alt={activity.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Contenu en dessous */}
                    <div className="p-6 space-y-3">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {activity.category}
                        </Badge>
                        {activity.age_min && activity.age_max && (
                          <Badge variant="outline" className="text-xs">
                            {activity.age_min}-{activity.age_max} ans
                          </Badge>
                        )}
                        {activity.vacationType && (
                          <Badge variant="outline" className="text-xs">
                            {activity.vacationType === 'sejour_hebergement' ? 'Séjour' : 
                             activity.vacationType === 'centre_loisirs' ? 'Centre de loisirs' : 'Stage'}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Titre */}
                      <h3 className="text-xl font-bold text-text-main line-clamp-2">
                        {activity.title}
                      </h3>
                      
                      {/* Localisation / durée / prix */}
                      <div className="flex items-center justify-between text-sm text-text-muted">
                        <div className="flex items-center gap-4">
                          {activity.structureAddress && (
                            <div className="flex items-center gap-1">
                              <MapPin size={16} />
                              <span className="line-clamp-1">{activity.structureAddress}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 font-semibold text-primary">
                          <span className="text-lg">{activity.price}€</span>
                          {activity.priceUnit && (
                            <span className="text-xs text-text-muted">/{activity.priceUnit}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Indicateurs de pagination */}
          <div className="flex justify-center gap-2 mt-3">
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