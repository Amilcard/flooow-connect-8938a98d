import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useSmartBack } from "@/hooks/useSmartBack";

interface BackButtonProps {
  fallback?: string;
  variant?: "ghost" | "outline" | "default";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
  label?: string;
  showSplash?: boolean;
}

export const BackButton = ({ 
  fallback, 
  variant = "outline", 
  size = "default",
  className = "",
  showText = true,
  label = "Retour",
  showSplash = false
}: BackButtonProps) => {
  const handleBack = useSmartBack(fallback);
  const [splashVisible, setSplashVisible] = useState(false);

  const handleClick = () => {
    if (showSplash) {
      setSplashVisible(true);
      setTimeout(() => {
        setSplashVisible(false);
        handleBack();
      }, 1500);
    } else {
      handleBack();
    }
  };

  return (
    <>
      {/* Flooow Splash Overlay */}
      {splashVisible && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] animate-in fade-in duration-300">
          <div className="text-center space-y-4">
            <h1 className="text-6xl font-bold text-white tracking-tight">Flooow</h1>
            <p className="text-xl text-white/90">Mes activités, mes aides et mes trajets. Nananare !</p>
          </div>
        </div>
      )}
      
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        aria-label={label}
        className={`min-h-[44px] ${className}`}
      >
        <ArrowLeft className={showText ? "mr-2" : ""} size={20} />
        {showText && label}
      </Button>
    </>
  );
};
