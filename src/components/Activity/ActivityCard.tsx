/**
 * LOT 1 - ActivityCard amélioré
 * - Fallback image intelligent via getActivityImage()
 * - Formatage âge cohérent via formatAgeRange()
 * - Labels aides via formatAidLabel()
 */
import { MapPin, Accessibility, Heart } from "lucide-react";
import { getMainCategory, getPeriodLabel } from "@/utils/categoryMapping";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCategoryStyle } from "@/constants/categories";
import { getActivityImage, optimizeSupabaseImage } from "@/lib/imageMapping";
import { formatAidLabel } from "@/utils/activityFormatters";

// HELPERS: Reduce cognitive complexity by extracting badge rendering logic

type VacationType = 'sejour_hebergement' | 'centre_loisirs' | 'stage_journee';

const VACATION_TYPE_STYLES: Record<VacationType, { bg: string; text: string; label: string }> = {
  sejour_hebergement: { bg: 'bg-purple-100/95', text: 'text-purple-600', label: 'Séjour' },
  centre_loisirs: { bg: 'bg-blue-100/95', text: 'text-blue-600', label: 'Centre' },
  stage_journee: { bg: 'bg-amber-100/95', text: 'text-amber-600', label: 'Stage' }
};

/**
 * Get price unit label based on period and vacation type
 */
const getPriceUnitLabel = (periodType: string | undefined, vacationType: VacationType | undefined): string => {
  if (periodType === 'annual') return 'par an';
  if (periodType === 'trimester') return 'par trimestre';
  if (vacationType === 'sejour_hebergement') return 'par semaine';
  if (vacationType === 'centre_loisirs') return 'par jour';
  if (vacationType === 'stage_journee') return 'la session';
  return 'par période';
};

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
  paymentEchelonned?: boolean;
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
  hasFreeTrial?: boolean; // Nouveau: pour afficher "Initiation gratuite"
  "data-tour-id"?: string;
  /** LCP optimization: prioritize loading for above-the-fold cards */
  isLCP?: boolean;
}

// LOT 1 - Supprimé: getCategoryImage() remplacé par getActivityImage() de lib/imageMapping.ts
// qui fournit un mapping intelligent basé sur titre + catégorie + âge

export const ActivityCard = ({
  title,
  image,
  _distance,
  ageRange,
  category,
  price,
  hasAccessibility = false,
  paymentEchelonned = false,
  _hasFinancialAid = false,
  periodType,
  structureName,
  structureAddress,
  _estimatedAidAmount,
  aidesEligibles = [],
  _mobility,
  onRequestClick,
  vacationType,
  priceUnit,
  isLCP = false,
}: ActivityCardProps) => {
  // LOT 1 - T1_1: Fallback image intelligent basé sur titre, catégorie et âge
  // Extraction de l'âge depuis ageRange si disponible (format: "X-Y ans")
  const ageMatch = ageRange?.match(/^(\d+)-(\d+)/);
  const ageMin = ageMatch ? Number.parseInt(ageMatch[1], 10) : 6;
  const ageMax = ageMatch ? Number.parseInt(ageMatch[2], 10) : 17;
  const fallbackImage = getActivityImage(title, category, ageMin, ageMax);
  // PERF: Optimize Supabase images with transformations (saves ~60% bandwidth)
  const displayImage = optimizeSupabaseImage(image, { width: 320, height: 400 }) || fallbackImage;

  const priceAfterAids = price > 100 ? Math.round(price * 0.7) : price;
  const _hasAids = priceAfterAids < price || aidesEligibles.length > 0;

  // Extract city from address
  const getCity = (address: string) => {
    const parts = address.split(',');
    return parts[1]?.trim() || parts[0];
  };
  
  return (
    <Card className="card-wetransfer group overflow-hidden cursor-pointer h-full flex flex-col">
      {/* Image Container - Standardized Ratio 4:5 */}
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-gradient-to-br from-primary-soft to-accent-soft flex-shrink-0">
        <img
          src={displayImage}
          alt={title}
          width={320}
          height={400}
          loading={isLCP ? "eager" : "lazy"}
          decoding={isLCP ? "sync" : "async"}
          fetchPriority={isLCP ? "high" : "auto"}
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = fallbackImage;
          }}
        />
        
        {/* Badge GRATUIT */}
        {price === 0 && (
          <div className="absolute top-3 right-3 px-3 py-1.5 bg-emerald-500/95 rounded-lg z-10 backdrop-blur-sm">
            <span className="text-xs font-bold text-white uppercase font-poppins">
              GRATUIT
            </span>
          </div>
        )}
        
        {/* BADGES OVERLAY */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[calc(100%-4rem)]">
          <div
            className="px-3 py-1.5 rounded-lg backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
          >
            <span
              className="text-xs font-bold uppercase font-poppins"
              style={{ color: getCategoryStyle(category).color }}
            >
              {getMainCategory(undefined, category)}
            </span>
          </div>
          

          {/* Pilule Période */}
          {periodType && (
            <div className="px-3 py-1.5 rounded-lg backdrop-blur-sm bg-amber-100/95">
              <span className="text-xs font-bold uppercase font-poppins text-amber-700">
                {getPeriodLabel(periodType)}
              </span>
            </div>
          )}

          {/* Pilule Âge */}
          {ageRange && (
            <div className="px-3 py-1.5 rounded-lg backdrop-blur-sm bg-slate-100/95">
              <span className="text-xs font-bold uppercase font-poppins text-slate-600">
                {ageRange.replace(/ ans$/, "")}
              </span>
            </div>
          )}
          {/* Badge Échelonné - LOT 1 T1_3: Sans emoji */}
          {paymentEchelonned && (
            <div className="px-3 py-1.5 rounded-lg backdrop-blur-sm bg-gradient-to-r from-orange-500/95 to-amber-500/95">
              <span className="text-xs font-bold uppercase font-poppins text-white">
                Échelonné
              </span>
            </div>
          )}

          {/* Badge Aides - LOT 1 T1_3: Sans emoji */}
          {aidesEligibles && aidesEligibles.length > 0 && (
            <div className="px-3 py-1.5 rounded-lg backdrop-blur-sm bg-green-100/95">
              <span className="text-xs font-bold uppercase font-poppins text-green-700">
                Aides possibles
              </span>
            </div>
          )}
          
          {vacationType && VACATION_TYPE_STYLES[vacationType] && (
            <div className={`px-3 py-1.5 rounded-lg backdrop-blur-sm ${VACATION_TYPE_STYLES[vacationType].bg}`}>
              <span className={`text-xs font-bold uppercase font-poppins ${VACATION_TYPE_STYLES[vacationType].text}`}>
                {VACATION_TYPE_STYLES[vacationType].label}
              </span>
            </div>
          )}
          
          {hasAccessibility && (
            <div className="px-3 py-1.5 rounded-lg backdrop-blur-sm bg-white/95 flex items-center gap-1">
              <Accessibility size={12} className="text-foreground" />
              <span className="text-xs font-bold uppercase font-poppins text-foreground">
                InKlusif
              </span>
            </div>
          )}
        </div>

        {/* FAVORITE BUTTON */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/90 hover:bg-white h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implement favorites functionality
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
              <span className="line-clamp-2 text-xs">
                {structureName}
                {structureAddress && " • " + getCity(structureAddress)}
              </span>
            </div>
          )}
        </div>

        {/* PRICING + CTA - Reduced spacing */}
        <div className="flex items-end justify-between pt-2 border-t border-border mt-auto">
          <div className="space-y-0">
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
            {!priceUnit && price > 0 && (
              <p className="text-[10px] text-muted-foreground">
                {getPriceUnitLabel(periodType, vacationType)}
              </p>
            )}
            {/* LOT 1 T1_3: Utilise formatAidLabel() pour les labels */}
            {aidesEligibles && aidesEligibles.length > 0 && (
              <div className="mt-1 text-[10px] text-muted-foreground">
                <span className="font-medium">Financeurs possibles :</span>{" "}
                {aidesEligibles.slice(0, 2).map((aide, index) => (
                  <span key={index}>
                    {formatAidLabel(aide)}
                    {index < Math.min(aidesEligibles.length, 2) - 1 ? ", " : ""}
                  </span>
                ))}
                {aidesEligibles.length > 2 && (
                  <span> +{aidesEligibles.length - 2}</span>
                )}
              </div>
            )}
          </div>

          <Button
            size="sm"
            className="h-8 text-xs px-3 flex-shrink-0"
            onClick={onRequestClick}
            aria-label={"Voir les détails de " + title}
          >
            + de détails
          </Button>
        </div>
      </div>
    </Card>
  );
};
