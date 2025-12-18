/**
 * ActivityDetailHero - Layout hero refait
 * 
 * Desktop: Photo à gauche (4/12) + Infos à droite (8/12)
 * Mobile: Photo compacte + Infos en dessous
 * 
 * Cohérent avec le pattern visuel Accueil/Recherche (pas de full-width)
 */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Building2, 
  Calendar,
  Users,
  Euro,
  MessageCircle
} from "lucide-react";
import { getMainCategory, getPeriodLabel, formatAgeRangeForDetail } from "@/utils/categoryMapping";
import { getCategoryStyle } from "@/constants/categories";
import { getActivityImage } from "@/lib/imageMapping";

interface ActivityDetailHeroProps {
  // Activité
  title: string;
  category: string;
  categories?: string[];
  periodType?: string;
  ageMin?: number;
  ageMax?: number;
  priceBase?: number;
  imageUrl?: string;
  
  // Organisme
  organismName?: string;
  organismType?: string;
  organismPhone?: string;
  organismEmail?: string;
  organismWebsite?: string;
  
  // Localisation
  address?: string;
  city?: string;
  postalCode?: string;
  venueName?: string;
  
  // Prochaine date (optionnel)
  nextSessionLabel?: string;
  
  // Callbacks
  onContactClick?: () => void;
}

export const ActivityDetailHero = ({
  title,
  category,
  categories,
  periodType,
  ageMin,
  ageMax,
  priceBase,
  imageUrl,
  organismName,
  organismType,
  organismPhone,
  organismEmail,
  organismWebsite,
  address,
  city,
  postalCode,
  venueName,
  nextSessionLabel,
  onContactClick,
}: ActivityDetailHeroProps) => {
  // Fallback image basé sur catégorie - vérifie aussi les strings vides
  const displayImage = (imageUrl?.trim() !== '')
    ? imageUrl
    : getActivityImage(title, category, ageMin || 6, ageMax || 17);
  const categoryStyle = getCategoryStyle(category);
  
  // Format localisation
  const locationParts = [address, city, postalCode].filter(Boolean);
  const fullAddress = locationParts.join(', ');
  
  // Format âge (tranches cohérentes: 3-5, 6-8, 9-11, 12-14, 15-17)
  const ageRange = ageMin !== undefined && ageMax !== undefined
    ? formatAgeRangeForDetail(ageMin, ageMax)
    : null;
  
  // Format prix
  const priceLabel = priceBase === 0 || priceBase === undefined 
    ? 'Gratuit' 
    : `${priceBase}€`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 md:py-6">
      <div className="grid md:grid-cols-12 gap-6">
        {/* Colonne gauche: Photo (4/12 sur desktop) */}
        <div className="md:col-span-5 lg:col-span-4">
          <div className="relative aspect-[4/3] md:aspect-[3/4] rounded-2xl overflow-hidden bg-muted">
            <img
              src={displayImage}
              alt={title}
              fetchPriority="high"
              decoding="async"
              width={400}
              height={300}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = getActivityImage(title, category, ageMin || 6, ageMax || 17);
              }}
            />
            
            {/* Badges overlay sur l'image */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[calc(100%-1.5rem)]">
              {/* Badge Catégorie */}
              <Badge
                className="text-xs font-bold uppercase backdrop-blur-sm"
                style={{ 
                  backgroundColor: `${categoryStyle.color}ee`,
                  color: 'white' 
                }}
              >
                {getMainCategory(undefined, categories?.[0] || category)}
              </Badge>
              
              {/* Badge Période */}
              {periodType && (
                <Badge className="text-xs font-bold uppercase bg-amber-500 text-white backdrop-blur-sm">
                  {getPeriodLabel(periodType)}
                </Badge>
              )}
            </div>
            
            {/* Badge Gratuit */}
            {priceBase === 0 && (
              <div className="absolute top-3 right-3 px-3 py-1.5 bg-emerald-500 rounded-lg">
                <span className="text-xs font-bold text-white uppercase">
                  Gratuit
                </span>
              </div>
            )}
          </div>
          
          {/* Titre et badges sous l'image (mobile) */}
          <div className="mt-4 md:hidden space-y-3">
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {title}
            </h1>
            
            {/* Quick info badges */}
            <div className="flex flex-wrap gap-2">
              {ageRange && (
                <Badge variant="outline" className="text-xs">
                  <Users size={12} className="mr-1" />
                  {ageRange}
                </Badge>
              )}
              {priceBase !== undefined && priceBase > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Euro size={12} className="mr-1" />
                  {priceLabel}
                </Badge>
              )}
              {nextSessionLabel && (
                <Badge variant="outline" className="text-xs text-primary border-primary/30">
                  <Calendar size={12} className="mr-1" />
                  {nextSessionLabel}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Colonne droite: Infos (8/12 sur desktop) */}
        <div className="md:col-span-7 lg:col-span-8 space-y-4">
          {/* Titre (desktop only) */}
          <div className="hidden md:block space-y-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">
              {title}
            </h1>
            
            {/* Quick info badges */}
            <div className="flex flex-wrap gap-2">
              {ageRange && (
                <Badge variant="outline" className="text-sm">
                  <Users size={14} className="mr-1.5" />
                  {ageRange}
                </Badge>
              )}
              {priceBase !== undefined && priceBase > 0 && (
                <Badge variant="outline" className="text-sm">
                  <Euro size={14} className="mr-1.5" />
                  {priceLabel}
                </Badge>
              )}
              {nextSessionLabel && (
                <Badge variant="outline" className="text-sm text-primary border-primary/30">
                  <Calendar size={14} className="mr-1.5" />
                  {nextSessionLabel}
                </Badge>
              )}
            </div>
          </div>

          {/* Card Organisateur */}
          {organismName && (
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 size={18} className="text-primary" />
                  <h2 className="font-semibold text-base">Organisateur</h2>
                </div>
                {onContactClick && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onContactClick}
                    className="h-8 text-xs"
                  >
                    <MessageCircle size={14} className="mr-1.5" />
                    Contacter
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                <p className="font-medium text-foreground">{organismName}</p>
                {organismType && (
                  <p className="text-xs text-muted-foreground">{organismType}</p>
                )}
                
                {/* Coordonnées */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground pt-2">
                  {organismPhone && (
                    <a 
                      href={`tel:${organismPhone}`} 
                      className="flex items-center gap-1.5 hover:text-primary transition-colors"
                    >
                      <Phone size={14} />
                      <span>{organismPhone}</span>
                    </a>
                  )}
                  {organismEmail && (
                    <a 
                      href={`mailto:${organismEmail}`} 
                      className="flex items-center gap-1.5 hover:text-primary transition-colors"
                    >
                      <Mail size={14} />
                      <span className="truncate max-w-[200px]">{organismEmail}</span>
                    </a>
                  )}
                  {organismWebsite && (
                    <a 
                      href={organismWebsite} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-primary transition-colors"
                    >
                      <Globe size={14} />
                      <span>Site web</span>
                    </a>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Card Lieu */}
          {(venueName || fullAddress) && (
            <Card className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-primary" />
                <h2 className="font-semibold text-base">Lieu</h2>
              </div>
              
              <div className="space-y-1">
                {venueName && (
                  <p className="font-medium text-foreground">{venueName}</p>
                )}
                {fullAddress && (
                  <p className="text-sm text-muted-foreground">{fullAddress}</p>
                )}
              </div>
            </Card>
          )}

          {/* Infos pratiques rapides */}
          <div className="flex flex-wrap gap-3 pt-2">
            {periodType && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar size={14} className="text-primary" />
                <span>
                  {periodType === 'scolaire' ? 'Période scolaire' : 
                   periodType === 'vacances' ? 'Vacances' : 
                   periodType === 'annuel' ? 'Toute l\'année' : periodType}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailHero;
