import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OnboardingNavigationProps {
  onNext: () => void;
  onSkip?: () => void;
  isLastStep: boolean;
  className?: string;
  labels: {
    next: string;
    start: string;
    skip: string;
  };
}

export const OnboardingNavigation: React.FC<OnboardingNavigationProps> = ({
  onNext,
  onSkip,
  isLastStep,
  className,
  labels,
}) => {
  return (
    <div className={cn("flex flex-col gap-3 w-full px-6 pb-8", className)}>
      <Button 
        onClick={onNext} 
        className="w-full rounded-full py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
        size="lg"
      >
        {isLastStep ? labels.start : labels.next}
      </Button>
      
      {!isLastStep && onSkip && (
        <Button 
          variant="ghost" 
          onClick={onSkip}
          className="text-gray-500 hover:text-gray-700 hover:bg-transparent font-normal"
        >
          {labels.skip}
        </Button>
      )}
    </div>
  );
};
