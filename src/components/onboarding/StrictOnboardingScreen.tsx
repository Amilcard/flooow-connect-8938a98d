import React from 'react';
import Lottie from 'lottie-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Define the interface for the screen configuration based on the provided JSON
export interface StrictOnboardingScreenConfig {
  meta?: {
    important?: string;
  };
  screenId: string;
  layout: {
    type: "vertical";
    safeArea: boolean;
    paddingHorizontal: number;
    spacing: number;
    background?: {
      type: "lottie";
      file: any;
      loop: boolean;
      autoplay: boolean;
      zIndex?: number; // Optional, defaults to 0
      opacity: number;
      mode: "cover";
    };
  };
  illustration?: {
    file: any; // Lottie JSON data or Image source
    type: "lottie" | "image";
    heightPercent: number;
    loop: boolean;
    autoplay: boolean;
    className?: string; // Added for CSS animations
  };
  title: string;
  body: string | React.ReactNode;
  cta: {
    label: string;
    action: string;
    position?: string;
  };
  pagination: {
    index: number;
    total: number;
    alignment?: string;
  };
  fallback?: {
    ifAnimationError: {
      useImage: string;
      applyCssAnimation: string;
      note: string;
    };
  };
}

interface StrictOnboardingScreenProps {
  config: StrictOnboardingScreenConfig;
  onNext: () => void;
  onSkip?: () => void;
  onPrevious?: () => void; // Added for back navigation
}

export const StrictOnboardingScreen: React.FC<StrictOnboardingScreenProps> = ({
  config,
  onNext,
  onPrevious,
  onSkip,
}) => {
  const { layout, illustration, title, body, cta, pagination, fallback } = config;

  return (
    <div className="flex flex-col min-h-screen bg-white text-foreground overflow-hidden relative">
      {/* Skip Button - Top Right */}
      {onSkip && (
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={onSkip}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
          >
            Passer
          </button>
        </div>
      )}

      {/* Background Animation Layer - Rendered FIRST to be behind content */}
      {layout.background && layout.background.type === 'lottie' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 0,
            opacity: layout.background.opacity
          }}
        >
           <Lottie
              animationData={layout.background.file}
              loop={layout.background.loop}
              autoplay={layout.background.autoplay}
              className="w-full h-full object-cover"
            />
        </div>
      )}

      {/* Main Content Container - Centered with max-width */}
      <div className="flex-1 flex flex-col items-center justify-between w-full max-w-xl mx-auto px-6 py-8 relative z-10">
        
        {/* Illustration Section */}
        <div 
          className="flex justify-center items-center w-full flex-shrink-0"
          style={{ 
            minHeight: illustration ? `${Math.min(illustration.heightPercent, 40)}%` : '35%',
            maxHeight: '45%'
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            {illustration?.type === 'lottie' && illustration.file ? (
              <Lottie 
                animationData={illustration.file}
                loop={illustration.loop}
                autoplay={illustration.autoplay}
                className={cn("w-full h-full max-w-sm object-contain", illustration.className)}
              />
            ) : illustration?.type === 'image' || fallback ? (
              <img 
                src={illustration?.type === 'image' ? (illustration.file as string) : fallback?.ifAnimationError.useImage} 
                alt="Illustration"
                className={cn(
                  "max-w-[180px] md:max-w-[220px] object-contain",
                  illustration?.className,
                  fallback?.ifAnimationError.applyCssAnimation === 'fade-in-scale' && "animate-in fade-in zoom-in duration-700"
                )}
              />
            ) : null}
          </div>
        </div>

        {/* Text Section (Title + Body) - Centered block with controlled width */}
        <div 
          className="flex flex-col items-center text-center w-full flex-shrink-0 py-6"
          style={{ gap: layout.spacing }}
        >
          <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight text-foreground max-w-md">
            {title}
          </h1>
          <div className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-md">
            {body}
          </div>
        </div>

        {/* Bottom Section - Pagination + Navigation */}
        <div className="flex flex-col items-center w-full gap-4 flex-shrink-0 mt-auto">
          {/* Pagination Dots */}
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: pagination.total }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === pagination.index
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted"
                )}
              />
            ))}
          </div>

          {/* Previous Button (if available) */}
          {onPrevious && (
            <Button
              onClick={onPrevious}
              variant="ghost"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Précédent
            </Button>
          )}

          {/* CTA Button */}
          <Button
            onClick={onNext}
            className="w-full max-w-xs h-12 text-base font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            {cta.label}
          </Button>
        </div>
      </div>
    </div>
  );
};
