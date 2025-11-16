import { Button } from "@/components/ui/button";

interface NewOnboardingStepProps {
  title: string;
  body: string;
  illustration: string;
  accentColor: "orange" | "blue";
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
  isLastStep?: boolean;
  primaryCtaLabel?: string;
}

export const NewOnboardingStep = ({
  title,
  body,
  illustration,
  accentColor,
  currentStep,
  totalSteps,
  onNext,
  onSkip,
  isLastStep = false,
  primaryCtaLabel = "Continuer",
}: NewOnboardingStepProps) => {
  const accentColorClass = accentColor === "orange" ? "text-primary" : "text-accent-blue";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with skip button */}
      <div className="flex justify-end p-4">
        <Button
          variant="ghost"
          onClick={onSkip}
          className="text-muted-foreground hover:text-foreground"
        >
          Passer
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        {/* Illustration */}
        <div className="mb-8">
          <img
            src={illustration}
            alt=""
            className="w-64 h-64 object-contain"
          />
        </div>

        {/* Title */}
        <h2 className={`text-2xl font-bold text-center mb-4 ${accentColorClass}`}>
          {title}
        </h2>

        {/* Body text */}
        <p className="text-base text-foreground/80 text-center max-w-md whitespace-pre-line leading-relaxed">
          {body}
        </p>
      </div>

      {/* Footer with pagination dots and CTA */}
      <div className="pb-8 px-6 space-y-6">
        {/* Pagination dots */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index + 1 === currentStep
                  ? accentColor === "orange"
                    ? "w-8 bg-primary"
                    : "w-8 bg-accent-blue"
                  : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Primary CTA */}
        <Button
          onClick={onNext}
          className={`w-full ${
            accentColor === "orange" ? "bg-primary" : "bg-accent-blue"
          }`}
          size="lg"
        >
          {primaryCtaLabel}
        </Button>
      </div>
    </div>
  );
};
