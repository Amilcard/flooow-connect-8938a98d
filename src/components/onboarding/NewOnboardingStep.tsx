import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface OnboardingContent {
  intro: string;
  sectionTitle?: string;
  bulletPoints?: string[];
  highlight?: string;
  ecoMobilite?: string;
  closing?: string;
}

interface NewOnboardingStepProps {
  title: string;
  content: OnboardingContent;
  illustration: string;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  navigationLabels?: {
    back?: string;
    skip?: string;
    continue?: string;
  };
}

export const NewOnboardingStep = ({
  title,
  content,
  illustration,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSkip,
  navigationLabels = {
    continue: "CONTINUER"
  }
}: NewOnboardingStepProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Main Content Wrapper - Max width constraint */}
      <div className="max-w-3xl mx-auto px-4 flex flex-col flex-1 w-full">
        
        {/* 1. Header Navigation (Top) */}
        {/* Only show if back or skip is present (Screens 2, 3, 4) */}
        <div className="h-16 flex items-center justify-between shrink-0">
          {onBack ? (
            <button
              onClick={onBack}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              {navigationLabels.back || "← Retour"}
            </button>
          ) : (
            <div /> /* Spacer to keep Skip on the right if no Back button */
          )}

          {onSkip && (
            <button
              onClick={onSkip}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              {navigationLabels.skip || "Passer →"}
            </button>
          )}
        </div>

        {/* 2. Visual Section (Centered) */}
        <div className="flex justify-center items-center py-6 md:py-10 shrink-0">
          <img
            src={illustration}
            alt=""
            className="h-[180px] md:h-[240px] w-auto object-contain"
          />
        </div>

        {/* 3. Text Section (Aligned Left) */}
        <div className="flex flex-col items-start text-left space-y-4 mb-8">
          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            {title}
          </h1>

          {/* Intro */}
          <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
            {content.intro}
          </p>

          {/* Section Title */}
          {content.sectionTitle && (
            <h3 className="font-semibold text-lg text-gray-900 mt-2">
              {content.sectionTitle}
            </h3>
          )}

          {/* Bullet Points */}
          {content.bulletPoints && content.bulletPoints.length > 0 && (
            <ul className="space-y-2 w-full">
              {content.bulletPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-600 text-base">
                  <span className="block w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Highlight */}
          {content.highlight && (
            <div className="mt-2 p-3 bg-orange-50 rounded-lg border border-orange-100 w-full">
              <p className="text-orange-700 font-medium text-sm text-center">
                {content.highlight}
              </p>
            </div>
          )}

          {/* Eco Mobilite */}
          {content.ecoMobilite && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100 w-full">
              <p className="text-sm text-blue-800 leading-relaxed">
                <span className="font-semibold">🌿 Éco-mobilité : </span>
                {content.ecoMobilite}
              </p>
            </div>
          )}

          {/* Closing */}
          {content.closing && (
            <p className="text-base text-gray-700 font-medium italic mt-4">
              {content.closing}
            </p>
          )}
        </div>

        {/* 4. CTA Section (Bottom) */}
        <div className="mt-auto pb-8 pt-4 flex flex-col items-center space-y-6 bg-white">
          {/* Progress Indicator */}
          <div className="flex justify-center gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index + 1 === currentStep
                    ? "w-8 bg-primary"
                    : "w-2 bg-gray-200"
                )}
              />
            ))}
          </div>

          {/* Primary Button */}
          <Button
            onClick={onNext}
            className="w-full md:w-[320px] h-12 text-base font-semibold shadow-md"
            size="lg"
          >
            {navigationLabels.continue}
          </Button>
        </div>
      </div>
    </div>
  );
};
