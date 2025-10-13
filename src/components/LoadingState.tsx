import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export const LoadingState = ({ 
  text = "Chargement...", 
  fullScreen = false,
  className 
}: LoadingStateProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        fullScreen && "min-h-screen",
        !fullScreen && "py-12",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{text}</p>
      <span className="sr-only">{text}</span>
    </div>
  );
};
