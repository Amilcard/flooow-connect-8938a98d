/**
 * ActivityCardCompact - Variante compacte pour liste carte/bottom-sheet
 * Cohérent avec ActivityCard mais optimisé pour affichage horizontal
 */
import { MapPin, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMainCategory, getPeriodLabel } from "@/utils/categoryMapping";
import { getCategoryStyle } from "@/constants/categories";
import { getActivityImage } from "@/lib/imageMapping";
import { cn } from "@/lib/utils";

interface ActivityCardCompactProps {
  id: string;
  title: string;
  image?: string;
  category: string;
  price: number;
  ageRange?: string;
  periodType?: string;
  structureName?: string;
  structureCity?: string;
  nextDate?: string;
  isSelected?: boolean;
  onClick?: () => void;
  onViewDetail?: () => void;
}

export const ActivityCardCompact = ({
  id,
  title,
  image,
  category,
  price,
  ageRange,
  periodType,
  structureName,
  structureCity,
  nextDate,
  isSelected = false,
  onClick,
  onViewDetail,
}: ActivityCardCompactProps) => {
  // Fallback image
  const ageMatch = ageRange?.match(/^(\d+)-(\d+)/);
  const ageMin = ageMatch ? parseInt(ageMatch[1]) : 6;
  const ageMax = ageMatch ? parseInt(ageMatch[2]) : 17;
  const displayImage = image || getActivityImage(title, category, ageMin, ageMax);

  const categoryStyle = getCategoryStyle(category);

  // Format organizer line: "Organisé par **Nom** – Ville"
  const organizerLine = structureName 
    ? `${structureName}${structureCity ? ` – ${structureCity}` : ''}`
    : null;

  return (
    <Card
      className={cn(
        "overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md",
        isSelected && "ring-2 ring-primary shadow-lg"
      )}
      onClick={onClick}
    >
      <div className="flex gap-3 p-3">
        {/* Image */}
        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
          <img
            src={displayImage}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = getActivityImage(title, category, ageMin, ageMax);
            }}
          />
          {/* Badge gratuit */}
          {price === 0 && (
            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-emerald-500 rounded text-[10px] font-bold text-white">
              GRATUIT
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          {/* Badges row */}
          <div className="flex flex-wrap gap-1 mb-1">
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-5"
              style={{ 
                backgroundColor: `${categoryStyle.color}15`,
                color: categoryStyle.color 
              }}
            >
              {getMainCategory(undefined, category)}
            </Badge>
            {periodType && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 text-amber-700 border-amber-200 bg-amber-50">
                {getPeriodLabel(periodType)}
              </Badge>
            )}
            {ageRange && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 text-slate-600 border-slate-200 bg-slate-50">
                {ageRange.replace(/ ans$/, "")}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-1">
            {title}
          </h3>

          {/* Organizer */}
          {organizerLine && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{organizerLine}</span>
            </div>
          )}

          {/* Bottom row: Price + Next date */}
          <div className="flex items-center justify-between mt-auto">
            <span className="font-bold text-sm text-primary">
              {price === 0 ? 'Gratuit' : `${price}€`}
            </span>
            {nextDate && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{nextDate}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA - Voir le détail */}
      {onViewDetail && (
        <div className="px-3 pb-3 pt-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail();
            }}
          >
            Voir le détail
          </Button>
        </div>
      )}
    </Card>
  );
};
