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
    <section className="px-4 mt-6 mb-6">
      {/* Header section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[18px] font-bold text-[#1F2937]">Activités à la une</h2>
        <button 
          onClick={() => navigate('/activities')}
          className="text-[13px] font-medium text-[#FF6B35] flex items-center gap-1"
        >
          Voir tout
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Carrousel portrait - 2 cartes visibles avec gap 12px */}
      {heroActivities.length > 0 && (
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
          <div 
            className="flex gap-3 snap-x snap-mandatory"
            style={{ width: 'max-content' }}
          >
            {heroActivities.map((activity) => (
              <div 
                key={activity.id} 
                className="w-[165px] h-[220px] flex-shrink-0 snap-start relative rounded-[16px] overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={() => handleActivityClick(activity.id)}
              >
                {/* Image de fond */}
                <img
                  src={activity.image}
                  alt={activity.title}
                  className="absolute top-0 left-0 w-full h-full object-cover z-[1]"
                />
                
                {/* Badge catégorie */}
                <div className="absolute top-3 left-3 z-[3] bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[#1F2937]">
                    {activity.category}
                  </span>
                </div>
                
                {/* Zone inférieure avec gradient */}
                <div 
                  className="absolute bottom-0 left-0 right-0 z-[2] p-4 flex flex-col gap-2"
                  style={{
                    background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.75) 100%)'
                  }}
                >
                  {/* Titre */}
                  <h3 className="text-[15px] font-bold text-white leading-snug line-clamp-2">
                    {activity.title}
                  </h3>
                  
                  {/* Sous-titre (structure) */}
                  {activity.structureName && (
                    <p className="text-[12px] font-normal text-white/90 line-clamp-1">
                      {activity.structureName}
                    </p>
                  )}
                  
                  {/* Tags */}
                  <div className="flex gap-1.5 flex-wrap mb-2">
                    {activity.age_min && activity.age_max && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-medium text-white bg-[#EC4899]">
                        {activity.age_min}-{activity.age_max} ans
                      </span>
                    )}
                    {activity.price < 50 && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-medium text-white bg-[#10B981]">
                        {activity.price}€
                      </span>
                    )}
                    {activity.hasFinancialAid && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-medium text-white bg-[#F7931E]">
                        Aides dispo
                      </span>
                    )}
                  </div>
                  
                  {/* Icônes accessibilité/mobilité */}
                  <div className="flex gap-3 items-center">
                    {activity.hasAccessibility && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2">
                        <circle cx="12" cy="4" r="2"/>
                        <path d="M19 13v-2a7 7 0 0 0-14 0v2"/>
                        <path d="M12 14l-3 3 3 3"/>
                        <path d="M12 14l3 3-3 3"/>
                      </svg>
                    )}
                    {activity.mobility?.TC && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    )}
                    {activity.mobility?.velo && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2">
                        <circle cx="18.5" cy="17.5" r="3.5"/>
                        <circle cx="5.5" cy="17.5" r="3.5"/>
                        <circle cx="15" cy="5" r="1"/>
                        <path d="M12 17V8l-3 3"/>
                      </svg>
                    )}
                    {activity.mobility?.covoit && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2">
                        <path d="M5 17h14v-2H5m3-4h8a7 7 0 0 0-4-6.24A7 7 0 0 0 8 11m7-7l-4 1v2l4-1V4m-6 0l4 1v2l-4-1V4z"/>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section "Innovantes" désactivée pour simplifier la Home */}
      
      {/* Section "À proximité" désactivée pour simplifier la Home */}
    </section>
  );
};
