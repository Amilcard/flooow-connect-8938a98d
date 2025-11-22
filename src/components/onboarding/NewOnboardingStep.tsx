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
  illustration: string | React.ReactNode; // ✅ Accepte URL ou composant React
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  onDisable?: () => void; // ✅ Nouveau : fonction pour désactiver l'onboarding
  showDisableButton?: boolean; // ✅ Nouveau : afficher le bouton de désactivation
  navigationLabels?: {
    back?: string;
    skip?: string;
    continue?: string;
  };
  "data-tour-id"?: string;
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
  onDisable,
  showDisableButton = false,
  navigationLabels = {
    continue: "CONTINUER"
  },
  "data-tour-id": dataTourId
}: NewOnboardingStepProps) => {
  return (
    <div 
      className="min-h-screen flex flex-col bg-background text-foreground"
      data-tour-id={dataTourId}
    >
      {/* Main Content Wrapper - Max width constraint */}
      <div className="max-w-3xl mx-auto px-4 flex flex-col flex-1 w-full">
        
        {/* 1. Header Navigation (Top) */}
        {/* Only show if back or skip is present (Screens 2, 3, 4) */}
        <div className="h-16 flex items-center justify-between shrink-0">
          {onBack ? (
            <button
              onClick={onBack}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              {navigationLabels.back || "← Retour"}
            </button>
          ) : (
            <div /> /* Spacer to keep Skip on the right if no Back button */
          )}

          {onSkip && (
            <button
              onClick={onSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              {navigationLabels.skip || "Passer →"}
            </button>
          )}
        </div>

        {/* 2. Visual Section (Centered) */}
        <div className="flex justify-center items-center py-6 md:py-10 shrink-0">
          <div className="w-full max-w-xs flex items-center justify-center aspect-square bg-muted/20 rounded-2xl p-4">
            {typeof illustration === 'string' ? (
              <img
                src={illustration}
                alt=""
                className="h-full w-full object-contain"
              />
            ) : (
              illustration
            )}
          </div>
        </div>

        {/* 3. Text Section (Aligned Left) - Scrollable to keep button visible */}
        <div className="flex flex-col items-start text-left space-y-4 mb-8 overflow-y-auto flex-1 max-h-[calc(100vh-500px)]">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight tracking-tight">
            {title}
          </h1>

          {/* Intro */}
          <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-line">
            {content.intro}
          </p>

          {/* Section Title */}
          {content.sectionTitle && (
            <h3 className="font-semibold text-lg text-foreground mt-2">
              {content.sectionTitle}
            </h3>
          )}

          {/* Bullet Points */}
          {content.bulletPoints && content.bulletPoints.length > 0 && (
            <ul className="space-y-3 w-full">
              {content.bulletPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-3 text-muted-foreground text-base">
                  <span className="block w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Hightlight */}
          {content.highlight && (
            <div className="mt-4 mb-4 w-full">
              <p className="text-gray-900 font-bold text-base text-center">
                💡 {content.highlight}
              </p>
            </div>
          )}

          {/* Eco Mobilite */}
          {content.ecoMobilite && (
            <div className="mt-4 p-4 bg-white rounded-xl border-2 border-gray-200 w-full shadow-sm">
              <p className="text-sm text-gray-900 leading-relaxed">
                <span className="font-bold text-gray-900">🌿 Éco-mobilité : </span>
                {content.ecoMobilite}
              </p>
            </div>
          )}

          {/* Closing */}
          {content.closing && (
            <p className="text-base text-foreground font-medium italic mt-4">
              {content.closing}
            </p>
          )}
        </div>

        {/* 4. CTA Section (Bottom) */}
        <div className="mt-auto pb-8 pt-4 flex flex-col items-center space-y-6 bg-background">
          {/* Progress Indicator */}
          <div className="flex justify-center gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index + 1 === currentStep
                    ? "w-8 bg-primary"
                    : "w-1.5 bg-muted"
                )}
              />
            ))}
          </div>

          {/* Primary Button */}
          <Button
            onClick={onNext}
            className="w-full md:w-[320px] h-12 text-base font-semibold shadow-sm rounded-full"
            size="lg"
          >
            {navigationLabels.continue}
          </Button>

          {/* Disable Onboarding Button - Only shown after 2+ visits */}
          {showDisableButton && onDisable && (
            <button
              onClick={onDisable}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
            >
              Ne plus afficher cet onboarding
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
