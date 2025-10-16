import { MapPin, Users, Accessibility } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import activitySportImg from "@/assets/activity-sport.jpg";
import activityLoisirsImg from "@/assets/activity-loisirs.jpg";
import activityVacancesImg from "@/assets/activity-vacances.jpg";
import activityCultureImg from "@/assets/activity-culture.jpg";

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
  
  return (
    <Card className="group overflow-hidden border border-border bg-card hover:shadow-lg transition-all duration-300 cursor-pointer">
      {/* Image Section - 40% */}
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        <img
          src={displayImage}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = fallbackImage;
          }}
        />
        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
          <Badge 
            className="bg-badge-sport text-white shadow-sm text-xs"
            aria-label={`Catégorie: ${category}`}
          >
            {category}
          </Badge>
          {periodType && (
            <Badge 
              variant="secondary" 
              className="bg-background/95 backdrop-blur-sm text-foreground shadow-sm text-xs"
              aria-label={`Période: ${periodType}`}
            >
              {periodType === 'annual' && '📅 Annuel'}
              {periodType === 'school_holidays' && '🏖️ Vacances'}
              {periodType === 'trimester' && '📆 Trimestre'}
            </Badge>
          )}
          {hasAccessibility && (
            <Badge 
              variant="secondary" 
              className="bg-background/95 backdrop-blur-sm text-foreground shadow-sm text-xs"
              aria-label="Accessible PMR"
            >
              <Accessibility size={12} className="mr-1" />
              PMR
            </Badge>
          )}
        </div>
      </div>
      
      {/* Content Section - 60% */}
      <div className="p-4 space-y-3">
        {/* Structure & Location */}
        {structureName && (
          <div className="flex items-start gap-1.5">
            <MapPin size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" aria-hidden="true" />
            <p className="text-xs text-muted-foreground line-clamp-1">
              {structureName}
              {structureAddress && ` • ${structureAddress.split(',')[1]?.trim() || structureAddress.split(',')[0]}`}
            </p>
          </div>
        )}

        {/* Title */}
        <h3 className="font-semibold text-base leading-tight line-clamp-2 text-foreground">
          {title}
        </h3>
        
        {/* Meta Info */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {ageRange && (
            <span className="flex items-center gap-1">
              <Users size={13} className="text-badge-age" aria-hidden="true" />
              {ageRange}
            </span>
          )}
          {distance && (
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-muted-foreground/40" aria-hidden="true" />
              {distance}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Price & CTA */}
        <div className="flex items-end justify-between gap-3">
          <div className="flex-1">
            {estimatedAidAmount && estimatedAidAmount > 0 ? (
              <div className="space-y-1">
                <p className="text-sm line-through text-muted-foreground">
                  {price}€
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-xl font-bold text-foreground">
                    {Math.max(0, price - estimatedAidAmount)}€
                  </p>
                  <Badge variant="success" className="text-[10px] px-1.5 py-0">
                    -{estimatedAidAmount}€
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="flex items-baseline gap-1">
                <p className="text-xl font-bold text-foreground">
                  {price === 0 ? "Gratuit" : `${price}€`}
                </p>
                {price > 0 && <span className="text-xs text-muted-foreground">/an</span>}
              </div>
            )}
            {hasFinancialAid && !estimatedAidAmount && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mt-1">
                Aides dispo
              </Badge>
            )}
          </div>
          
          <Button 
            size="sm"
            className="rounded-full px-4 h-9 font-medium"
            onClick={onRequestClick}
            aria-label={`Faire une demande pour ${title}`}
          >
            Réserver
          </Button>
        </div>
      </div>
    </Card>
  );
};
