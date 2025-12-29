import React from "react";
import { cn } from "@/lib/utils";

interface ProgressDotsProps {
  totalSteps: number;
  currentStep: number;
  className?: string;
}

export const ProgressDots: React.FC<ProgressDotsProps> = ({
  totalSteps,
  currentStep,
  className,
}) => {
  return (
    <div className={cn("flex gap-2 justify-center", className)}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        
        return (
          <div
            key={index}
            className={cn(
              "h-2 rounded-full transition-all duration-300 ease-in-out",
              isActive ? "w-8 bg-primary" : "w-2 bg-muted"
            )}
            aria-label={`Étape ${stepNumber} sur ${totalSteps}`}
            aria-current={isActive ? "step" : undefined}
          />
        );
      })}
    </div>
  );
};
