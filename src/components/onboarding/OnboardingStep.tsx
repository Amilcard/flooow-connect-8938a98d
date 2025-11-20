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
    <div className="flex flex-col h-full bg-background min-h-screen">
      {/* Skip button */}
      {onSkip && !isLastStep && (
        <div className="flex justify-end p-4 absolute top-0 right-0 z-10 w-full">
          <Button
            onClick={onSkip}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground text-sm font-medium"
          >
            Passer
          </Button>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8 pt-16">
        {/* Illustration */}
        <div className="w-full max-w-xs flex items-center justify-center aspect-square bg-muted/20 rounded-2xl mb-4">
          {illustration}
        </div>

        {/* Title & Description */}
        <div className="space-y-4 max-w-md mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-base text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Footer with Flooow branding and progress */}
      <div className="p-6 space-y-6 bg-background pb-8">
        <Button
          onClick={onNext}
          className="w-full h-12 text-base font-semibold rounded-full"
          size="lg"
        >
          {isLastStep ? "Commencer" : "Suivant"}
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>

        {/* Progress indicator */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === currentStep - 1
                    ? "w-8 bg-primary"
                    : "w-1.5 bg-muted"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
