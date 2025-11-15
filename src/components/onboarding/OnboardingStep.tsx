import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingStepProps {
  title: string;
  description?: string;
  illustration: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onSkip?: () => void;
  isLastStep?: boolean;
}

export const OnboardingStep = ({
  title,
  description,
  illustration,
  currentStep,
  totalSteps,
  onNext,
  onSkip,
  isLastStep = false,
}: OnboardingStepProps) => {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Skip button */}
      {onSkip && !isLastStep && (
        <div className="flex justify-end p-4">
          <Button
            onClick={onSkip}
            variant="ghost"
            className="text-text-muted hover:text-text-main text-sm"
          >
            Passer
          </Button>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8">
        {/* Illustration */}
        <div className="w-full max-w-sm flex items-center justify-center">
          {illustration}
        </div>

        {/* Title */}
        <div className="space-y-4 max-w-md">
          <h1 className="text-3xl md:text-4xl font-bold text-text-main leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-base text-text-secondary leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Footer with Flooow branding and progress */}
      <div className="p-6 space-y-6">
        <Button
          onClick={onNext}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          {isLastStep ? "Commencer" : "Suivant"}
          <ChevronRight className="ml-2" size={20} />
        </Button>

        {/* Progress indicator */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === currentStep - 1
                    ? "w-8 bg-primary"
                    : "w-1.5 bg-border"
                )}
              />
            ))}
          </div>
          <p className="text-sm text-text-muted font-medium">Flooow</p>
        </div>
      </div>
    </div>
  );
};
