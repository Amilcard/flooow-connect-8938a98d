import { MapPin, Users, Accessibility } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  onRequestClick?: () => void;
}

export const ActivityCard = ({
  title,
  image,
  distance,
  ageRange,
  category,
  price,
  hasAccessibility = false,
  hasFinancialAid = false,
  onRequestClick,
}: ActivityCardProps) => {
  const displayImage = image || "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=600&fit=crop";
  
  return (
    <Card className="overflow-hidden border-0 shadow-card hover:shadow-card-hover transition-all">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={displayImage}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=600&fit=crop";
          }}
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <Badge 
            className="bg-badge-sport text-white"
            aria-label={`Catégorie: ${category}`}
          >
            {category}
          </Badge>
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
            <p className="text-2xl font-bold text-primary">
              {price === 0 ? "Gratuit" : `${price}€`}
            </p>
            {hasFinancialAid && (
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
