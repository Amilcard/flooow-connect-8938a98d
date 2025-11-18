import { MapPin, Users, Accessibility, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Activity } from "@/types/domain";
import activitySportImg from "@/assets/activity-sport.jpg";
import activityLoisirsImg from "@/assets/activity-loisirs.jpg";
import activityVacancesImg from "@/assets/activity-vacances.jpg";
import activityCultureImg from "@/assets/activity-culture.jpg";

/**
 * ActivityCard - Optimized for grid layout with reduced whitespace
 */
interface ActivityCardProps {
  id: string;
  title: string;
  image: string;
  distance?: string;
  ageRange?: string;
  category: string;
  price: number;
  hasAccessibility?: boolean;
  hasFinancialAid?: boolean;
  periodType?: string;
  structureName?: string;
  structureAddress?: string;
  estimatedAidAmount?: number;
  aidesEligibles?: string[];
  mobility?: {
    TC?: string;
    velo?: boolean;
    covoit?: boolean;
  };
  onRequestClick?: () => void;
  isHealthFocused?: boolean;
  isApa?: boolean;
  isInsertionPro?: boolean;
  insertionType?: string;
  complexityScore?: number;
  vacationType?: 'sejour_hebergement' | 'centre_loisirs' | 'stage_journee';
  priceUnit?: string;
  hasAccommodation?: boolean;
}

const getCategoryImage = (category: string): string => {
  const categoryMap: Record<string, string> = {
    Sport: activitySportImg,
    Loisirs: activityLoisirsImg,
    Vacances: activityVacancesImg,
    Apprentissage: activityCultureImg,
    Culture: activityCultureImg,
    "Activités Innovantes": activityCultureImg,
  };
  return categoryMap[category] || activityLoisirsImg;
};

export const ActivityCard = ({
  title,
  image,
  distance,
  ageRange,
  category,
  price,
  hasAccessibility = false,
  hasFinancialAid = false,
  periodType,
  structureName,
  structureAddress,
  estimatedAidAmount,
  aidesEligibles = [],
  mobility,
  onRequestClick,
  vacationType,
  priceUnit,
}: ActivityCardProps) => {
  const fallbackImage = getCategoryImage(category);
  const displayImage = image || fallbackImage;

  const priceAfterAids = price > 100 ? Math.round(price * 0.7) : price;
  const hasAids = priceAfterAids < price || aidesEligibles.length > 0;

  // Extract city from address
  const getCity = (address: string) => {
    const parts = address.split(',');
    return parts[1]?.trim() || parts[0];
  };
  
  return (
    <Card className="card-wetransfer group overflow-hidden cursor-pointer h-full flex flex-col">
      {/* Image Container - Reduced height */}
      <div className="relative w-full h-[180px] overflow-hidden bg-gradient-to-br from-primary-soft to-accent-soft flex-shrink-0">
        <img
          src={displayImage}
          alt={title}
          loading="eager"
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = fallbackImage;
          }}
        />
        
        {/* Badge GRATUIT */}
        {price === 0 && (
          <div 
            className="absolute top-3 right-3 text-white font-bold text-xs uppercase px-3 py-1.5 rounded-full shadow-xl z-10 backdrop-blur-sm"
            style={{ background: 'var(--gradient-pink)' }}
          >
            Gratuit
          </div>
        )}
        
        {/* BADGES OVERLAY */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5 max-w-[calc(100%-4rem)]">
          <Badge
            className="bg-white/95 backdrop-blur-md text-foreground shadow-md text-xs font-semibold px-2.5 py-1 rounded-full border-0"
            aria-label={"Catégorie: " + category}
          >
            {category}
          </Badge>
          
          {vacationType === 'sejour_hebergement' && (
            <Badge variant="secondary" className="bg-purple-500/90 backdrop-blur-sm text-white shadow-sm text-xs px-2 py-0.5">
              Séjour
            </Badge>
          )}
          {vacationType === 'centre_loisirs' && (
            <Badge variant="secondary" className="bg-blue-500/90 backdrop-blur-sm text-white shadow-sm text-xs px-2 py-0.5">
              Centre
            </Badge>
          )}
          {vacationType === 'stage_journee' && (
            <Badge variant="secondary" className="bg-amber-500/90 backdrop-blur-sm text-white shadow-sm text-xs px-2 py-0.5">
              Stage
            </Badge>
          )}
          
          {hasAccessibility && (
            <Badge variant="secondary" className="bg-white/95 backdrop-blur-sm text-foreground shadow-sm text-xs px-2 py-0.5">
              <Accessibility size={12} className="mr-0.5" />
              PMR
            </Badge>
          )}
        </div>

        {/* FAVORITE BUTTON */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/90 hover:bg-white h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            console.log("Favori:", title);
          }}
          aria-label="Ajouter aux favoris"
        >
          <Heart className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* CONTENT CONTAINER - Reduced padding and spacing */}
      <div className="p-3 space-y-2 flex-1 flex flex-col">
        
        {/* TITLE */}
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors min-h-[2.25rem]">
          {title}
        </h3>

        {/* METADATA - Reduced spacing */}
        <div className="space-y-1 text-sm text-muted-foreground flex-1">
          {structureName && (
            <div className="flex items-start gap-1">
              <MapPin className="w-3 h-3 shrink-0 mt-0.5" aria-hidden="true" />
              <span className="line-clamp-1 text-xs">
                {structureName}
                {structureAddress && " • " + getCity(structureAddress)}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs flex-wrap">
            {ageRange && (
              <div className="flex items-center gap-0.5">
                <Users className="w-3 h-3" aria-hidden="true" />
                <span>{ageRange}</span>
              </div>
            )}

            {periodType && (
              <>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" aria-hidden="true" />
                <span className="text-muted-foreground text-xs">
                  {periodType === 'annual' || periodType === 'trimester' 
                    ? 'Année scolaire' 
                    : 'Vacances'}
                </span>
              </>
            )}

            {distance && (
              <>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" aria-hidden="true" />
                <span className="text-xs">{distance}</span>
              </>
            )}
          </div>
        </div>

        {/* PRICING + CTA - Reduced spacing */}
        <div className="flex items-end justify-between pt-2 border-t border-border mt-auto">
          <div className="space-y-0">
            {estimatedAidAmount && estimatedAidAmount > 0 ? (
              <>
                <div className="text-xs line-through text-muted-foreground">
                  {price}€
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-foreground">
                    {Math.max(0, price - estimatedAidAmount)}€
                  </span>
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-green-100 text-green-700">
                    -{estimatedAidAmount}€
                  </Badge>
                </div>
              </>
            ) : hasAids ? (
              <>
                <div className="text-xs line-through text-muted-foreground">
                  {price}€
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-primary">
                    {priceAfterAids}€
                  </span>
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-green-100 text-green-700">
                    -30%
                  </Badge>
                </div>
              </>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-foreground">
                  {price === 0 ? 'Gratuit' : price + '€'}
                </span>
                {price > 0 && priceUnit && (
                  <span className="text-xs text-muted-foreground font-normal">
                    / {priceUnit}
                  </span>
                )}
              </div>
            )}
            {!priceUnit && price > 0 && (
              <p className="text-[10px] text-muted-foreground">
                {periodType === 'annual' ? 'par an' : 
                 periodType === 'trimester' ? 'par trimestre' : 
                 vacationType === 'sejour_hebergement' ? 'par semaine' :
                 vacationType === 'centre_loisirs' ? 'par jour' :
                 vacationType === 'stage_journee' ? 'la session' :
                 'par période'}
              </p>
            )}
            {(hasFinancialAid || aidesEligibles.length > 0) && !estimatedAidAmount && !hasAids && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mt-0.5 bg-green-100 text-green-700">
                💰 Aides dispo
              </Badge>
            )}
          </div>

          <Button
            size="sm"
            className="h-8 text-xs px-3 flex-shrink-0"
            onClick={onRequestClick}
            aria-label={"Intéressé par " + title}
          >
            Je suis intéressé
          </Button>
        </div>
      </div>
    </Card>
  );
};
