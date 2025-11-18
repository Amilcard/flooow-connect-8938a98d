/**
 * LOT 4 - ActivityCarouselCard Component
 * Optimized activity card for horizontal carousel:
 * - Width: 220px (expanded from 160px thanks to reduced gap)
 * - Photo section: 140px height
 * - Category badge on photo
 * - GRATUIT badge if free
 * - Content: title, age/price, location, CTA button
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Activity {
  id: string;
  title: string;
  category: string;
  age_min?: number;
  age_max?: number;
  price_amount?: number;
  price_is_free: boolean;
  location_name: string;
  image_url?: string;
}

interface ActivityCarouselCardProps {
  activity: Activity;
}

const categoryColors: Record<string, string> = {
  sport: '#10B981',
  culture: '#F59E0B',
  loisirs: '#A855F7',
  vacances: '#EF4444',
  scolaire: '#4A90E2',
  insertion: '#6B7280'
};

const categoryGradients: Record<string, string> = {
  sport: 'linear-gradient(135deg, #DCFCE7 0%, #D1FAE5 100%)',
  culture: 'linear-gradient(135deg, #FEF3E2 0%, #FFE8CC 100%)',
  loisirs: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)',
  vacances: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
  scolaire: 'linear-gradient(135deg, #DBEAFE 0%, #E0E7FF 100%)',
  insertion: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)'
};

export function ActivityCarouselCard({ activity }: ActivityCarouselCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/activite/${activity.id}`);
  };

  const categoryColor = categoryColors[activity.category?.toLowerCase()] || '#6B7280';
  const categoryGradient = categoryGradients[activity.category?.toLowerCase()] || categoryGradients.insertion;

  const ageRange = activity.age_min && activity.age_max
    ? `${activity.age_min}-${activity.age_max} ans`
    : 'Tous âges';

  return (
    <div
      className="w-[220px] flex-shrink-0 scroll-snap-start bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1 cursor-pointer"
      onClick={handleClick}
    >
      {/* Image Section - 140px height */}
      <div className="relative w-full h-[140px] overflow-hidden">
        {/* Image or Gradient Fallback */}
        {activity.image_url ? (
          <img
            src={activity.image_url}
            alt={activity.title}
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: categoryGradient }}
          />
        )}

        {/* Category Badge - Top Left */}
        <Badge
          variant="secondary"
          className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide border-0 z-[2]"
          style={{ color: categoryColor }}
        >
          {activity.category}
        </Badge>

        {/* GRATUIT Badge - Top Right */}
        {activity.price_is_free && (
          <Badge
            variant="secondary"
            className="absolute top-2.5 right-2.5 bg-emerald-500/95 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase z-[2] border-0"
          >
            GRATUIT
          </Badge>
        )}
      </div>

      {/* Content Section - min-height 140px */}
      <div className="p-3.5 flex flex-col gap-2 min-h-[140px]">
        {/* Title */}
        <h3 className="font-poppins text-base font-semibold text-gray-900 leading-snug mb-1 line-clamp-2">
          {activity.title}
        </h3>

        {/* Meta Row: Age + Price */}
        <div className="flex gap-2 items-center flex-wrap mb-1">
          <Badge
            variant="secondary"
            className="bg-blue-50 text-[#4A90E2] px-2 py-0.5 rounded-md text-xs font-semibold border-0"
          >
            {ageRange}
          </Badge>

          <span className={`font-poppins text-[15px] font-bold ${
            activity.price_is_free ? 'text-emerald-500' : 'text-gray-900'
          }`}>
            {activity.price_is_free
              ? 'GRATUIT'
              : `${activity.price_amount}€`
            }
          </span>
        </div>

        {/* Location */}
        <p className="font-poppins text-[13px] text-gray-500 mb-2 line-clamp-1">
          {activity.location_name}
        </p>

        {/* CTA Button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className="mt-auto w-full bg-[#FF8C42] hover:bg-[#FF7A28] text-white py-2 px-3 rounded-lg font-poppins text-[13px] font-semibold transition-colors"
        >
          Plus d'infos
        </Button>
      </div>
    </div>
  );
}
