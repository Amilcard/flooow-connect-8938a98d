/**
 * LOT 4 - RecommendedActivitiesSection Component
 * Horizontal carousel of activity cards with CRITICAL optimizations:
 * - GAP: 12px (NOT 60-80px as before) - standard UX
 * - Cards: 220px width (wider thanks to reduced gap)
 * - Smooth horizontal scroll with snap
 * - CRITICAL: padding 0 16px for consistency
 */

import { useNavigate } from 'react-router-dom';
import { ActivityCarouselCard } from './ActivityCarouselCard';

// Mock data - TODO: Replace with real Supabase query
const mockActivities = [
  {
    id: '1',
    title: 'Judo pour débutants',
    category: 'sport',
    age_min: 6,
    age_max: 12,
    price_amount: 15,
    price_is_free: false,
    location_name: 'Dojo Municipal - Saint-Étienne',
    image_url: undefined
  },
  {
    id: '2',
    title: 'Atelier d\'arts plastiques',
    category: 'culture',
    age_min: 8,
    age_max: 14,
    price_amount: 0,
    price_is_free: true,
    location_name: 'Maison des Arts',
    image_url: undefined
  },
  {
    id: '3',
    title: 'Stage de foot été',
    category: 'sport',
    age_min: 10,
    age_max: 16,
    price_amount: 25,
    price_is_free: false,
    location_name: 'Stade Geoffroy-Guichard',
    image_url: undefined
  },
  {
    id: '4',
    title: 'Soutien scolaire gratuit',
    category: 'scolaire',
    age_min: 12,
    age_max: 16,
    price_amount: 0,
    price_is_free: true,
    location_name: 'Bibliothèque Tarentaize',
    image_url: undefined
  },
  {
    id: '5',
    title: 'Initiation robotique',
    category: 'loisirs',
    age_min: 10,
    age_max: 14,
    price_amount: 20,
    price_is_free: false,
    location_name: 'Fab Lab Saint-Étienne',
    image_url: undefined
  },
  {
    id: '6',
    title: 'Séjour montagne',
    category: 'vacances',
    age_min: 8,
    age_max: 15,
    price_amount: 50,
    price_is_free: false,
    location_name: 'Massif du Pilat',
    image_url: undefined
  }
];

export function RecommendedActivitiesSection() {
  const navigate = useNavigate();

  const handleSeeAll = () => {
    navigate('/recherche?featured=true');
  };

  return (
    <section className="px-4 mb-10 md:px-6">
      {/* Section Header */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="font-poppins text-[22px] md:text-2xl font-bold text-gray-900">
          Activités recommandées
        </h2>

        <button
          onClick={handleSeeAll}
          className="font-poppins text-sm font-semibold text-[#FF8C42] hover:underline transition-all"
        >
          Voir tout
        </button>
      </div>

      {/* Carousel Container - CRITICAL: gap-3 = 12px (NOT 60-80px!) */}
      <div className="flex gap-3 overflow-x-auto overflow-y-hidden scroll-snap-x-mandatory scrollbar-hide pb-2 -webkit-overflow-scrolling-touch">
        {mockActivities.map((activity) => (
          <ActivityCarouselCard key={activity.id} activity={activity} />
        ))}
      </div>

      {/* Hide scrollbar styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scroll-snap-x-mandatory {
          scroll-snap-type: x mandatory;
        }
        .scroll-snap-start {
          scroll-snap-align: start;
        }
      `}</style>
    </section>
  );
}
