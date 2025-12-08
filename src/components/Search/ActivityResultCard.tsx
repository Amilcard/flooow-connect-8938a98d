/**
 * LOT 6 - ActivityResultCard Component
 * Similar to ActivityCarouselCard (LOT 4) but adapted for grid layout
 * NO decorative icons
 */

import { useNavigate } from 'react-router-dom';
import { getCategoryStyle } from '@/constants/categories';

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

  const handleClick = () => {
    navigate(`/activity/${id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="rounded-2xl bg-card shadow-sm hover:shadow-xl overflow-hidden transition-all duration-200 hover:-translate-y-1 cursor-pointer"
    >
      {/* Image Section */}
      <div className="relative h-[180px] w-full overflow-hidden">
        <img
          src={imageUrl || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=280&fit=crop'}
          alt={title}
          className="w-full h-full object-cover object-center"
          loading="lazy"
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

        {/* Gratuit Badge */}
        {priceIsFree && (
          <div className="absolute top-3 right-3 px-3 py-1.5 bg-emerald-500/95 rounded-lg">
            <span className="text-xs font-bold text-white uppercase font-poppins">
              GRATUIT
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
          {/* Age Badge */}
          {ageMin !== undefined && ageMax !== undefined && (
            <div className="px-2.5 py-1 bg-blue-50 rounded-md">
              <span className="text-xs font-semibold text-blue-600 font-poppins">
                {ageMin === ageMax ? `${ageMin} ans` : `${ageMin}-${ageMax} ans`}
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
            <span className="text-base font-bold text-emerald-600 font-poppins">
              Gratuit
            </span>
          )}
        </div>

        {/* Location */}
        {location && (
          <p className="text-sm text-muted-foreground line-clamp-1 font-poppins">
            {location}
          </p>
        )}

        {/* Financial Aids Tags */}
        {financialAids.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {financialAids.slice(0, 2).map((aid, index) => (
              <div key={index} className="px-2 py-1 bg-amber-50 rounded-md">
                <span className="text-[11px] font-semibold text-amber-600 font-poppins">
                  {aid}
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
