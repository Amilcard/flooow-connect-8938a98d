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
}

export const BackButton = ({ 
  fallback, 
  variant = "outline", 
  size = "default",
  className = "",
  showText = true,
  label = "Retour"
}: BackButtonProps) => {
  const handleBack = useSmartBack(fallback);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleBack}
      aria-label={label}
      className={`min-h-[44px] ${className}`}
    >
      <ArrowLeft className={showText ? "mr-2" : ""} size={20} />
      {showText && label}
    </Button>
  );
};
