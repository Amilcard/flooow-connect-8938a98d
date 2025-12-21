/**
 * LOT 6 - ActivityResultCard Component
 * Similar to ActivityCarouselCard (LOT 4) but adapted for grid layout
 * NO decorative icons
 *
 * LOT 1 - Améliorations UI/UX:
 * - Fallback image intelligent via getActivityImage()
 * - Formatage âge cohérent via formatAgeRange()
 */

import { useNavigate } from 'react-router-dom';
import { getCategoryStyle } from '@/constants/categories';
import { getActivityImage, optimizeSupabaseImage } from '@/lib/imageMapping';
import { formatAgeRange, formatAidLabel } from '@/utils/activityFormatters';

interface ActivityResultCardProps {
  id: string;
  title: string;
  category: string;
  imageUrl?: string;
  ageMin?: number;
  ageMax?: number;
  price?: number;
  priceIsFree: boolean;
  location?: string;
  financialAids?: string[];
}

export const ActivityResultCard = ({
  id,
  title,
  category,
  imageUrl,
  ageMin,
  ageMax,
  price,
  priceIsFree,
  location,
  financialAids = []
}: ActivityResultCardProps) => {
  const navigate = useNavigate();

  const categoryStyle = getCategoryStyle(category);

  // FIX: Priorité à l'image spécifique de l'activité, fallback sur le mapping intelligent
  const fallbackImage = getActivityImage(title, category, ageMin ?? 6, ageMax ?? 17);
  // PERF: Optimize Supabase images with transformations (saves ~60% bandwidth)
  const displayImage = imageUrl && imageUrl.length > 0
    ? optimizeSupabaseImage(imageUrl, { width: 360, height: 180 })
    : fallbackImage;

  // LOT 1 - T1_2: Formatage âge cohérent (utilise la fonction centralisée)
  const ageLabel = formatAgeRange(ageMin, ageMax);

  const handleClick = () => {
    navigate(`/activity/${id}`);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
      className="rounded-2xl bg-card shadow-sm hover:shadow-xl overflow-hidden transition-all duration-200 hover:-translate-y-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      {/* Image Section */}
      <div className="relative h-[180px] w-full overflow-hidden">
        <img
          src={displayImage}
          alt={title}
          className="w-full h-full object-cover object-center"
          loading="lazy"
          onError={(e) => {
            // Fallback en cas d'erreur de chargement
            e.currentTarget.src = fallbackImage;
          }}
        />

        {/* Category Badge */}
        <div
          className="absolute top-3 left-3 px-3 py-1.5 rounded-lg backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
        >
          <span
            className="text-xs font-bold uppercase font-poppins"
            style={{ color: categoryStyle.color }}
          >
            {category}
          </span>
        </div>

        {/* Badge Séance d'essai (pour activités avec essai gratuit) */}
        {priceIsFree && (
          <div className="absolute top-3 right-3 px-3 py-1.5 bg-emerald-500/95 rounded-lg">
            <span className="text-[11px] font-semibold text-white font-poppins">
              Séance d'essai
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col gap-2.5">
        {/* Title */}
        <h3 className="text-[17px] font-semibold text-foreground leading-snug line-clamp-2 font-poppins">
          {title}
        </h3>

        {/* Meta Row */}
        <div className="flex gap-2 flex-wrap items-center">
          {/* Age Badge - LOT 1 T1_2: Utilise formatAgeRange() */}
          {ageLabel && (
            <div className="px-2.5 py-1 bg-blue-50 rounded-md">
              <span className="text-xs font-semibold text-blue-600 font-poppins">
                {ageLabel}
              </span>
            </div>
          )}

          {/* Price */}
          {!priceIsFree && price !== undefined && (
            <span className="text-base font-bold text-foreground font-poppins">
              {price}€
            </span>
          )}
          {priceIsFree && (
            <span className="text-sm font-semibold text-emerald-600 font-poppins">
              Essai offert
            </span>
          )}
        </div>

        {/* Location */}
        {location && (
          <p className="text-sm text-muted-foreground line-clamp-2 font-poppins">
            {location}
          </p>
        )}

        {/* Financial Aids Tags - LOT 1 T1_3: Labels formatés */}
        {financialAids.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {financialAids.slice(0, 2).map((aid, index) => (
              <div key={index} className="px-2 py-1 bg-amber-50 rounded-md">
                <span className="text-[11px] font-semibold text-amber-600 font-poppins">
                  {formatAidLabel(aid)}
                </span>
              </div>
            ))}
            {financialAids.length > 2 && (
              <div className="px-2 py-1 bg-amber-50 rounded-md">
                <span className="text-[11px] font-semibold text-amber-600 font-poppins">
                  +{financialAids.length - 2}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
