/**
 * MapPreviewCard - Preview overlay quand on clique sur un pin
 * Reprend les infos clés Flooow avec CTA vers détail
 */
import { X, MapPin, Calendar, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMainCategory, getPeriodLabel } from "@/utils/categoryMapping";
import { getCategoryStyle } from "@/constants/categories";
import { getActivityImage } from "@/lib/imageMapping";

interface MapPreviewCardProps {
  activity: {
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
  };
  onClose: () => void;
  onViewDetail: () => void;
}

export const MapPreviewCard = ({ activity, onClose, onViewDetail }: MapPreviewCardProps) => {
  const { title, image, category, price, ageRange, periodType, structureName, structureCity, nextDate } = activity;
  
  // Fallback image
  const ageMatch = ageRange?.match(/^(\d+)-(\d+)/);
  const ageMin = ageMatch ? Number.parseInt(ageMatch[1], 10) : 6;
  const ageMax = ageMatch ? Number.parseInt(ageMatch[2], 10) : 17;
  const displayImage = image || getActivityImage(title, category, ageMin, ageMax);
  
  const categoryStyle = getCategoryStyle(category);

  // Format organizer line
  const organizerLine = structureName 
    ? `Organisé par ${structureName}${structureCity ? ` – ${structureCity}` : ''}`
    : null;

  return (
    <Card className="w-[320px] overflow-hidden shadow-xl border-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Header with image */}
      <div className="relative h-32 bg-muted">
        <img
          src={displayImage}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = getActivityImage(title, category, ageMin, ageMax);
          }}
        />
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Badge gratuit */}
        {price === 0 && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-emerald-500 rounded-lg text-xs font-bold text-white">
            GRATUIT
          </div>
        )}

        {/* Badges row */}
        <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
          <Badge
            className="text-[10px] px-2 py-0.5 backdrop-blur-sm"
            style={{ 
              backgroundColor: `${categoryStyle.color}ee`,
              color: 'white' 
            }}
          >
            {getMainCategory(undefined, category)}
          </Badge>
          {periodType && (
            <Badge className="text-[10px] px-2 py-0.5 bg-amber-500 text-white backdrop-blur-sm">
              {getPeriodLabel(periodType)}
            </Badge>
          )}
          {ageRange && (
            <Badge className="text-[10px] px-2 py-0.5 bg-slate-700 text-white backdrop-blur-sm">
              {ageRange.replace(/ ans$/, " ans")}
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-base leading-tight line-clamp-2">
          {title}
        </h3>

        {/* Organizer */}
        {organizerLine && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-1">{organizerLine}</span>
          </div>
        )}

        {/* Price + Next date row */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            {price === 0 ? 'Gratuit' : `${price}€`}
          </span>
          {nextDate && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">
              <Calendar className="w-4 h-4" />
              <span>{nextDate}</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <Button 
          className="w-full" 
          onClick={onViewDetail}
        >
          Voir le détail
        </Button>
      </div>
    </Card>
  );
};
