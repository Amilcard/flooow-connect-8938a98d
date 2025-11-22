import React, { useEffect } from "react";
import Lottie from "lottie-react";
import { cn } from "@/lib/utils";

export interface AnimationConfig {
  lottieData?: any;
  lottieStyle?: React.CSSProperties;
  cssClass?: string;
  type?: "lottie" | "css" | "image";
  imageSrc?: string;
}

export interface IllustrationConfig {
  type: "floating_icons" | "static_icon" | "none";
  icons?: React.ReactNode[];
  mainIcon?: React.ReactNode;
}

interface OnboardingScreenProps {
  title: string;
  text: React.ReactNode;
  animation: AnimationConfig;
  illustration?: IllustrationConfig;
  isActive: boolean;
  additionalContent?: React.ReactNode;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  title,
  text,
  animation,
  illustration,
  isActive,
  additionalContent,
}) => {
  
  return (
    <div className={cn(
      "flex flex-col items-center justify-center px-6 text-center h-full w-full transition-opacity duration-500",
      isActive ? "opacity-100" : "opacity-0 pointer-events-none absolute inset-0"
    )}>
      {/* Animation / Illustration Area */}
      <div className="relative w-full max-w-[320px] h-[320px] flex items-center justify-center mb-8">
        
        {/* Main Lottie Animation */}
        {animation.type === "lottie" && animation.lottieData && (
          <div className={cn("w-full h-full", animation.cssClass)} style={animation.lottieStyle}>
            <Lottie 
              animationData={animation.lottieData} 
              loop={true}
              autoplay={isActive}
            />
          </div>
        )}

        {/* CSS / Image Animation */}
        {animation.type === "image" && animation.imageSrc && (
          <img 
            src={animation.imageSrc} 
            alt="Illustration" 
            className={cn("w-full h-full object-contain", animation.cssClass)} 
          />
        )}

        {/* Floating Icons (Screen 1) */}
        {illustration?.type === "floating_icons" && illustration.icons && (
          <div className="absolute inset-0 pointer-events-none">
            {illustration.icons.map((icon, index) => (
              <div 
                key={index}
                className={cn(
                  "absolute text-primary/80 animate-float", 
                  index === 0 ? "top-10 left-10 delay-0" : 
                  index === 1 ? "top-20 right-10 delay-1000" : 
                  "bottom-20 left-1/2 delay-2000"
                )}
                style={{ 
                  animationDelay: `${index * 1.5}s`,
                  animationDuration: "4s"
                }}
              >
                {icon}
              </div>
            ))}
          </div>
        )}

        {/* Static/CSS Icon (Screen 2, 3) */}
        {illustration?.type === "static_icon" && illustration.mainIcon && (
          <div className={cn("text-primary", animation.cssClass)}>
            {illustration.mainIcon}
          </div>
        )}
        
        {/* Additional Effects (Sparkles, etc) */}
        {additionalContent}
      </div>

      {/* Text Content */}
      <div className="space-y-4 max-w-md z-10">
        <h2 className="text-2xl font-bold text-gray-900 font-poppins">
          {title}
        </h2>
        <div className="text-gray-600 text-base leading-relaxed">
          {text}
        </div>
      </div>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes tilt {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          75% { transform: rotate(3deg); }
        }
        .animate-tilt {
          animation: tilt 3s ease-in-out infinite;
        }
        @keyframes pulse-scale {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        .animate-pulse-scale {
          animation: pulse-scale 2s ease-in-out infinite;
        }
        @keyframes slide-horizontal {
          0% { transform: translateX(-10px); }
          50% { transform: translateX(10px); }
          100% { transform: translateX(-10px); }
        }
        .animate-slide-horizontal {
          animation: slide-horizontal 4s ease-in-out infinite;
        }
        @keyframes pop {
          0% { transform: scale(0); opacity: 0; }
          80% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop {
          animation: pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
