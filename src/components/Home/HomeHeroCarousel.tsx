/**
 * LOT 4 - HomeHeroCarousel Component
 * Optimized hero carousel with:
 * - Reduced height (180px mobile / 200px desktop)
 * - Auto-rotation 5s
 * - Interactive indicators
 * - Gradient overlay for text readability
 */

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  gradientFallback: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Découvrez les activités près de chez vous',
    subtitle: 'Plus de 500 activités pour tous les âges',
    gradientFallback: 'linear-gradient(135deg, #FF8C42 0%, #F59E0B 100%)'
  },
  {
    id: 2,
    title: 'Aides financières disponibles',
    subtitle: 'Jusqu\'à 300€ d\'aides pour vos enfants',
    gradientFallback: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
  },
  {
    id: 3,
    title: 'Mobilité éco-responsable',
    subtitle: 'Solutions de transport pour vos trajets',
    gradientFallback: 'linear-gradient(135deg, #4A90E2 0%, #2563EB 100%)'
  },
  {
    id: 4,
    title: 'Actualités de votre ville',
    subtitle: 'Restez informé des événements locaux',
    gradientFallback: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)'
  }
];

export function HomeHeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-rotation every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="relative w-full h-[180px] md:h-[200px] overflow-hidden">
      {/* Slide Background */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ background: currentSlideData.gradientFallback }}
      />

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t from-black/60 to-transparent z-[2]" />

      {/* Text Content */}
      <div className="absolute bottom-5 left-4 right-4 z-[3] text-white">
        <h2 className="font-poppins text-[22px] md:text-[28px] font-bold leading-tight text-white mb-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
          {currentSlideData.title}
        </h2>
        {currentSlideData.subtitle && (
          <p className="hidden md:block font-poppins text-sm font-normal text-white/95 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
            {currentSlideData.subtitle}
          </p>
        )}
      </div>

      {/* Navigation Arrows - Desktop Only */}
      <button
        onClick={goToPrev}
        className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full items-center justify-center cursor-pointer z-[10] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} className="text-gray-900" />
      </button>

      <button
        onClick={goToNext}
        className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full items-center justify-center cursor-pointer z-[10] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
        aria-label="Next slide"
      >
        <ChevronRight size={24} className="text-gray-900" />
      </button>

      {/* Indicators Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-[10]">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer border-0 ${
              index === currentSlide
                ? 'w-6 bg-white'
                : 'w-2 bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
