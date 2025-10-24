import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useSmartBack } from "@/hooks/useSmartBack";

interface BackButtonProps {
  fallback?: string;
  variant?: "ghost" | "outline" | "default";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
}

export const BackButton = ({ 
  fallback, 
  variant = "ghost", 
  size = "icon",
  className = "",
  showText = false
}: BackButtonProps) => {
  const handleBack = useSmartBack(fallback);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleBack}
      aria-label="Retour"
      className={className}
    >
      <ArrowLeft className={showText ? "mr-2" : ""} size={showText ? 18 : 20} />
      {showText && "Retour"}
    </Button>
  );
};
