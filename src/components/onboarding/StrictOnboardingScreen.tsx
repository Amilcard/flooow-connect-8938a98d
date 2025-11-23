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
}) => {
  const { layout, illustration, title, body, cta, pagination, fallback } = config;

  return (
    <div className="flex flex-col h-screen bg-white text-foreground overflow-hidden relative">
      {/* Background Animation Layer - Rendered FIRST to be behind content */}
      {layout.background && layout.background.type === 'lottie' && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ 
            zIndex: 0, // Ensure it's above the bg-white but below content (z-10)
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

      {/* Illustration Section */}
      <div 
        className="flex justify-center items-center w-full relative z-10"
        style={{ 
          height: illustration ? `${illustration.heightPercent}%` : '45%',
          paddingLeft: layout.paddingHorizontal,
          paddingRight: layout.paddingHorizontal
        }}
      >
        <div className="w-full h-full flex items-center justify-center">
             {illustration?.type === 'lottie' && illustration.file ? (
            <Lottie 
              animationData={illustration.file}
              loop={illustration.loop}
              autoplay={illustration.autoplay}
              className={cn("w-full h-full max-w-md object-contain", illustration.className)}
            />
          ) : illustration?.type === 'image' || fallback ? (
             // Fallback or Image type
             <img 
               src={illustration?.type === 'image' ? (illustration.file as string) : fallback?.ifAnimationError.useImage} 
               alt="Illustration"
               className={cn(
                 "max-w-[200px] object-contain",
                 illustration?.className, // Apply custom class from config
                 fallback?.ifAnimationError.applyCssAnimation === 'fade-in-scale' && "animate-in fade-in zoom-in duration-700"
               )}
             />
          ) : null}
        </div>
      </div>

      {/* Text Section (Title + Body) */}
      <div 
        className="flex flex-col items-center text-center w-full z-10"
        style={{ 
          height: '30%',
          paddingLeft: layout.paddingHorizontal,
          paddingRight: layout.paddingHorizontal,
          gap: layout.spacing
        }}
      >
        <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight text-gray-900">
          {title}
        </h1>
        <p className="text-base text-gray-500 leading-relaxed">
          {body}
        </p>
      </div>

      {/* Pagination Section */}
      <div 
        className={cn(
          "flex items-center w-full z-10",
          pagination.alignment === 'center' ? "justify-center" : "justify-center"
        )}
        style={{ height: '5%' }}
      >
        <div className="flex gap-2">
          {Array.from({ length: pagination.total }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === pagination.index
                  ? "w-8 bg-primary"
                  : "w-2 bg-gray-200"
              )}
            />
          ))}
        </div>
      </div>

      {/* Previous Button Section (if available) */}
      {onPrevious && (
        <div className="flex justify-center items-center w-full z-10 pb-2">
          <Button
            onClick={onPrevious}
            variant="ghost"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Précédent
          </Button>
        </div>
      )}

      {/* CTA Section */}
      <div 
        className="flex justify-center items-center w-full pb-8 z-10"
        style={{ height: onPrevious ? '13%' : '15%' }}
      >
        <Button
          onClick={onNext}
          className="w-full max-w-[320px] h-12 text-base font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
          size="lg"
        >
          {cta.label}
        </Button>
      </div>
    </div>
  );
};
