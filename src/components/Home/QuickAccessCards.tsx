/**
 * LOT 4 - QuickAccessCards Component
 * 4 visual cards with warm gradient fallbacks
 * Directs to main sections: Aides, Trajets, Ville, Bon Esprit
 * CRITICAL: padding 0 16px for consistency
 */

import { useNavigate } from 'react-router-dom';

interface QuickAccessCard {
  id: string;
  title: string;
  subtitle: string;
  route: string;
  gradientFallback: string;
}

const cards: QuickAccessCard[] = [
  {
    id: 'mes_aides_financieres',
    title: 'Mes aides financières',
    subtitle: 'Réduisez le coût des activités',
    route: '/aides',
    gradientFallback: 'linear-gradient(135deg, #FEF3E2 0%, #FFE8CC 100%)'
  },
  {
    id: 'mes_trajets',
    title: 'Mes trajets',
    subtitle: 'Solutions éco-mobilité',
    route: '/eco-mobilite',
    gradientFallback: 'linear-gradient(135deg, #DCFCE7 0%, #D1FAE5 100%)'
  },
  {
    id: 'ma_ville',
    title: 'Ma ville, mon actu',
    subtitle: 'Actualités et événements',
    route: '/ma-ville-mon-actu',
    gradientFallback: 'linear-gradient(135deg, #DBEAFE 0%, #E0E7FF 100%)'
  },
  {
    id: 'prix_bon_esprit',
    title: 'Prix Bon Esprit',
    subtitle: 'Valorisons les acteurs locaux',
    route: '/bon-esprit',
    gradientFallback: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)'
  }
];

export function QuickAccessCards() {
  const navigate = useNavigate();

  const handleCardClick = (route: string) => {
    navigate(route);
  };

  return (
    <section className="px-4 mb-10 mt-6 md:px-6">
      {/* Responsive Grid: 1 col mobile / 2 cols tablet / 4 cols desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 max-w-[1200px] mx-auto">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card.route)}
            className="relative w-full h-[200px] sm:h-[220px] lg:h-[240px] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.15)] group"
          >
            {/* Background Gradient Fallback */}
            <div
              className="absolute inset-0 z-[1]"
              style={{ background: card.gradientFallback }}
            />

            {/* Gradient Overlay for Text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-[2]" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 z-[3] p-6 text-white">
              <h3 className="font-poppins text-xl sm:text-[22px] lg:text-2xl font-bold leading-tight text-white mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                {card.title}
              </h3>
              <p className="font-poppins text-sm sm:text-[15px] font-normal text-white/95 leading-snug drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
                {card.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
