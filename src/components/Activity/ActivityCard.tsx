import { MapPin, Users, Accessibility, Heart, Bus, Bike, Car } from "lucide-react";
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
  aidesEligibles?: string[];
  mobility?: {
    TC?: string;
    velo?: boolean;
    covoit?: boolean;
  };
  onRequestClick?: () => void;
  // Nouveaux champs pour 10 axes
  isHealthFocused?: boolean;
  isApa?: boolean;
  isInsertionPro?: boolean;
  insertionType?: string;
  complexityScore?: number;
  // Nouveaux champs pour tarification vacances
  vacationType?: 'sejour_hebergement' | 'centre_loisirs' | 'stage_journee';
  priceUnit?: string;
  hasAccommodation?: boolean;
}

const getCategoryImage = (category: string): string => {
  const categoryMap: Record<string, string> = {
    Sport: activitySportImg,
    Loisirs: activityLoisirsImg,
    Vacances: activityVacancesImg,
    Apprentissage: activityCultureImg, // Renamed from Scolarité
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
  isHealthFocused = false,
  isApa = false,
  isInsertionPro = false,
  insertionType,
  complexityScore,
  vacationType,
  priceUnit,
  hasAccommodation,
}: ActivityCardProps) => {
  const fallbackImage = getCategoryImage(category);
  const displayImage = image || fallbackImage;

  // Calculate price after aids (simulation)
  const priceAfterAids = price > 100 ? Math.round(price * 0.7) : price;
  const hasAids = priceAfterAids < price || aidesEligibles.length > 0;
  
  return (
    <Card className="card-wetransfer group overflow-hidden cursor-pointer">
      {/* Image Container - WeTransfer style avec rounded corners */}
      <div className="relative w-[280px] h-[210px] overflow-hidden bg-gradient-to-br from-primary-soft to-accent-soft">
        <img
          src={displayImage}
          alt={title}
          loading="eager"
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = fallbackImage;
          }}
        />
        
        {/* Badge GRATUIT - Style WeTransfer arrondi */}
        {price === 0 && (
          <div 
            className="absolute top-4 right-4 text-white font-bold text-xs uppercase px-4 py-2 rounded-full shadow-xl z-10 backdrop-blur-sm"
            style={{ background: 'var(--gradient-pink)' }}
          >
            Gratuit
          </div>
        )}
        
        {/* BADGES OVERLAY - Style WeTransfer */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2 max-w-[calc(100%-5rem)]">
          {/* Badge Univers */}
          <Badge
            className="bg-white/95 backdrop-blur-md text-foreground shadow-md text-xs font-semibold px-3 py-1.5 rounded-full border-0"
            aria-label={`Catégorie: ${category}`}
          >
            {category}
          </Badge>
          
          {/* Badge Type d'accueil (uniquement pour vacances) */}
          {vacationType === 'sejour_hebergement' && (
            <Badge
              variant="secondary"
              className="bg-purple-500/90 backdrop-blur-sm text-white shadow-sm text-xs"
              aria-label="Séjour / Colonie"
            >
              Séjour / Colonie
            </Badge>
          )}
          {vacationType === 'centre_loisirs' && (
            <Badge
              variant="secondary"
              className="bg-blue-500/90 backdrop-blur-sm text-white shadow-sm text-xs"
              aria-label="Centre de loisirs"
            >
              Centre de loisirs
            </Badge>
          )}
          {vacationType === 'stage_journee' && (
            <Badge
              variant="secondary"
              className="bg-amber-500/90 backdrop-blur-sm text-white shadow-sm text-xs"
              aria-label="Stage"
            >
              Stage
            </Badge>
          )}
          
          {/* Badge Accessibilité PMR */}
          {hasAccessibility && (
            <Badge
              variant="secondary"
              className="bg-white/95 backdrop-blur-sm text-foreground shadow-sm text-xs"
              aria-label="Accessible PMR"
            >
              <Accessibility size={12} className="mr-1" />
              PMR
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
      <div className="p-4 space-y-3 mb-2">
        
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

          {/* Ages + Période + Distance */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            {ageRange && (
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{ageRange}</span>
              </div>
            )}

            {periodType && (
              <>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" aria-hidden="true" />
                <span className="text-muted-foreground">
                  {periodType === 'annual' || periodType === 'trimester' 
                    ? 'Année scolaire' 
                    : 'Vacances'}
                </span>
              </>
            )}

            {distance && (
              <>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" aria-hidden="true" />
                <span>{distance}</span>
              </>
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
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-foreground">
                  {price === 0 ? 'Gratuit' : `${price}€`}
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
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mt-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                💰 Aides dispo
              </Badge>
            )}
          </div>

          <Button
            size="sm"
            className="h-8 text-xs px-4"
            onClick={onRequestClick}
            aria-label={`Intéressé par ${title}`}
          >
            Je suis intéressé
          </Button>
        </div>
      </div>
    </Card>
  );
};
