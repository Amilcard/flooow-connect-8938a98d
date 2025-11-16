import { Button } from "@/components/ui/button";
import { Heart, Instagram, Facebook, Linkedin, MessageCircle } from "lucide-react";

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
  showSocialIcons?: boolean;
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
  showSocialIcons = false,
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

        {/* Social Icons */}
        {showSocialIcons && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <a
              href="https://app.heartbeat.chat/my-communities"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
              aria-label="Heartbeat Community"
            >
              <Heart className="w-5 h-5 text-primary" />
            </a>
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 hover:bg-green-200 transition-colors"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-5 h-5 text-green-600" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-12 h-12 rounded-full bg-pink-100 hover:bg-pink-200 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5 text-pink-600" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5 text-blue-600" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5 text-blue-700" />
            </a>
          </div>
        )}
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
