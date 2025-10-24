import { MapPin, Users, Accessibility, Heart, Calendar, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Activity } from "@/types/domain";
import activitySportImg from "@/assets/activity-sport.jpg";
import activityLoisirsImg from "@/assets/activity-loisirs.jpg";
import activityVacancesImg from "@/assets/activity-vacances.jpg";
import activityCultureImg from "@/assets/activity-culture.jpg";

/**
 * [D1] ActivityCard utilise le type domain Activity unifié
 * Props compatibles avec Activity mais permet aussi passage direct des champs
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
  onRequestClick?: () => void;
}

const getCategoryImage = (category: string): string => {
  const categoryMap: Record<string, string> = {
    Sport: activitySportImg,
    Loisirs: activityLoisirsImg,
    Vacances: activityVacancesImg,
    Scolarité: activityCultureImg,
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
  onRequestClick,
}: ActivityCardProps) => {
  const fallbackImage = getCategoryImage(category);
  const displayImage = image || fallbackImage;
  
  // Calculate price after aids (simulation)
  const priceAfterAids = price > 100 ? Math.round(price * 0.7) : price;
  const hasAids = priceAfterAids < price;
  
  return (
    <Card className="group overflow-hidden border border-border bg-card hover:shadow-xl transition-all duration-300 cursor-pointer">
      {/* Image Container - 30% height */}
      <div className="relative h-44 overflow-hidden bg-muted">
        <img
          src={displayImage}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = fallbackImage;
          }}
        />
        
        {/* BADGES OVERLAY */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
          <Badge 
            className="bg-white/95 backdrop-blur-sm text-foreground shadow-sm text-xs"
            aria-label={`Catégorie: ${category}`}
          >
            {category}
          </Badge>
          {periodType && (
            <Badge 
              variant="secondary" 
              className="bg-white/95 backdrop-blur-sm text-foreground shadow-sm text-xs"
              aria-label={`Période: ${periodType}`}
            >
              {periodType === 'annual' && '📅'}
              {periodType === 'school_holidays' && '🏖️'}
              {periodType === 'trimester' && '📆'}
            </Badge>
          )}
          {hasAccessibility && (
            <Badge 
              variant="secondary" 
              className="bg-white/95 backdrop-blur-sm text-foreground shadow-sm text-xs"
              aria-label="Accessible PMR"
            >
              <Accessibility size={12} />
            </Badge>
          )}
        </div>

        {/* FAVORITE BUTTON */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/90 hover:bg-white h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            console.log("Favori:", title);
          }}
          aria-label="Ajouter aux favoris"
        >
          <Heart className="w-4 h-4" />
        </Button>
      </div>

      {/* CONTENT CONTAINER - 70% */}
      <div className="p-4 space-y-3">
        
        {/* TITLE */}
        <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
          {title}
        </h3>

        {/* METADATA */}
        <div className="space-y-1.5 text-sm text-muted-foreground">
          {/* Organization + Location */}
          {structureName && (
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
              <span className="line-clamp-1 text-xs">
                {structureName}
                {structureAddress && ` • ${structureAddress.split(',')[1]?.trim() || structureAddress.split(',')[0]}`}
              </span>
            </div>
          )}

          {/* Ages + Distance */}
          <div className="flex items-center gap-3 text-xs">
            {ageRange && (
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{ageRange}</span>
              </div>
            )}
            
            {distance && (
              <div className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" aria-hidden="true" />
                <span>{distance}</span>
              </div>
            )}
          </div>
        </div>

        {/* PRICING + CTA */}
        <div className="flex items-end justify-between pt-2 border-t border-border">
          <div className="space-y-0.5">
            {estimatedAidAmount && estimatedAidAmount > 0 ? (
              <>
                <div className="text-xs line-through text-muted-foreground">
                  {price}€
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-foreground">
                    {Math.max(0, price - estimatedAidAmount)}€
                  </span>
                  <Badge variant="secondary" className="text-[10px] h-5 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    -{estimatedAidAmount}€
                  </Badge>
                </div>
              </>
            ) : hasAids ? (
              <>
                <div className="text-xs line-through text-muted-foreground">
                  {price}€
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-primary">
                    {priceAfterAids}€
                  </span>
                  <Badge variant="secondary" className="text-[10px] h-5 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    -30%
                  </Badge>
                </div>
              </>
            ) : (
              <span className="text-xl font-bold text-foreground">
                {price === 0 ? 'Gratuit' : `${price}€`}
              </span>
            )}
            <p className="text-[10px] text-muted-foreground">
              {periodType === 'annual' ? 'par an' : periodType === 'trimester' ? 'par trimestre' : 'par période'}
            </p>
            {hasFinancialAid && !estimatedAidAmount && !hasAids && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mt-1">
                Aides dispo
              </Badge>
            )}
          </div>

          <Button 
            size="sm" 
            className="h-8 text-xs px-4"
            onClick={onRequestClick}
            aria-label={`Voir détails de ${title}`}
          >
            Voir détails
          </Button>
        </div>
      </div>
    </Card>
  );
};
