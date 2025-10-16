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
    <Card className="overflow-hidden border-0 shadow-card hover:shadow-card-hover transition-all">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={displayImage}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = fallbackImage;
          }}
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <Badge 
            className="bg-badge-sport text-white"
            aria-label={`Catégorie: ${category}`}
          >
            {category}
          </Badge>
          {periodType && (
            <Badge 
              variant="secondary" 
              className="bg-white/90 text-foreground"
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
              className="bg-white/90 text-foreground"
              aria-label="Accessible PMR"
            >
              <Accessibility size={14} className="mr-1" />
              Accessible
            </Badge>
          )}
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-2 mb-2">{title}</h3>
          
          {structureName && (
            <p className="text-sm text-muted-foreground mb-2">
              📍 {structureName}
              {structureAddress && ` • ${structureAddress.split(',')[1]?.trim() || structureAddress.split(',')[0]}`}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {distance && (
              <span className="flex items-center gap-1">
                <MapPin size={14} className="text-badge-distance" aria-hidden="true" />
                {distance}
              </span>
            )}
            {ageRange && (
              <span className="flex items-center gap-1">
                <Users size={14} className="text-badge-age" aria-hidden="true" />
                {ageRange}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <div>
            {estimatedAidAmount && estimatedAidAmount > 0 ? (
              <div className="space-y-1">
                <p className="text-lg line-through text-muted-foreground">
                  {price}€
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-green-600">
                    {Math.max(0, price - estimatedAidAmount)}€
                  </p>
                  <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 text-xs">
                    -{estimatedAidAmount}€ aides
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-2xl font-bold text-primary">
                {price === 0 ? "Gratuit" : `${price}€`}
              </p>
            )}
            {hasFinancialAid && !estimatedAidAmount && (
              <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20 mt-1">
                Aides disponibles
              </Badge>
            )}
          </div>
          
          <Button 
            className="rounded-full min-h-[48px] px-6"
            onClick={onRequestClick}
            aria-label={`Faire une demande pour ${title}`}
          >
            Demander
          </Button>
        </div>
      </div>
    </Card>
  );
};
