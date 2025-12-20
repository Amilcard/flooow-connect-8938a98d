/**
 * Bulle de guidage pour les tours in-app
 * S ancre a un element via data-tour attribute
 */

import { useEffect, useState, useRef, useCallback, KeyboardEvent } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { TourStep } from '@/hooks/useGuidedTour';

interface GuidedTourBubbleProps {
  step: TourStep;
  currentIndex: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
}

export function GuidedTourBubble({
  step,
  currentIndex,
  totalSteps,
  isFirstStep,
  isLastStep,
  onNext,
  onPrevious,
  onSkip,
}: GuidedTourBubbleProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isPositioned, setIsPositioned] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Handle keyboard events for accessibility
  const handleOverlayKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
      e.preventDefault();
      onSkip();
    }
  }, [onSkip]);

  useEffect(() => {
    const targetElement = document.querySelector(`[data-tour="${step.target}"]`);

    if (!targetElement || !bubbleRef.current) {
      // Fallback to center of screen
      setPosition({
        top: window.innerHeight / 2 - 100,
        left: window.innerWidth / 2 - 150,
      });
      setIsPositioned(true);
      return;
    }

    const targetRect = targetElement.getBoundingClientRect();
    const bubbleRect = bubbleRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    const padding = 12;
    const arrowSize = 8;

    switch (step.position || 'bottom') {
      case 'top':
        top = targetRect.top - bubbleRect.height - padding - arrowSize;
        left = targetRect.left + (targetRect.width - bubbleRect.width) / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + padding + arrowSize;
        left = targetRect.left + (targetRect.width - bubbleRect.width) / 2;
        break;
      case 'left':
        top = targetRect.top + (targetRect.height - bubbleRect.height) / 2;
        left = targetRect.left - bubbleRect.width - padding - arrowSize;
        break;
      case 'right':
        top = targetRect.top + (targetRect.height - bubbleRect.height) / 2;
        left = targetRect.right + padding + arrowSize;
        break;
      default:
        top = targetRect.bottom + padding + arrowSize;
        left = targetRect.left + (targetRect.width - bubbleRect.width) / 2;
    }

    // Keep bubble within viewport
    const viewportPadding = 16;
    left = Math.max(viewportPadding, Math.min(left, window.innerWidth - bubbleRect.width - viewportPadding));
    top = Math.max(viewportPadding, Math.min(top, window.innerHeight - bubbleRect.height - viewportPadding));

    setPosition({ top, left });
    setIsPositioned(true);

    // Highlight target element
    targetElement.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'z-40', 'relative');

    return () => {
      targetElement.classList.remove('ring-2', 'ring-primary', 'ring-offset-2', 'z-40', 'relative');
    };
  }, [step]);

  return (
    <>
      {/* Overlay - accessible with keyboard */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Fermer le guide"
        className="fixed inset-0 bg-black/40 z-40 cursor-pointer"
        onClick={onSkip}
        onKeyDown={handleOverlayKeyDown}
      />

      {/* Bubble */}
      <div
        ref={bubbleRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        className={`fixed z-50 bg-white rounded-2xl shadow-2xl max-w-xs w-full p-4 transition-opacity duration-300 ${
          isPositioned ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ top: position.top, left: position.left }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onSkip}
          className="absolute -top-2 -right-2 bg-gray-100 hover:bg-gray-200 rounded-full p-1 transition-colors"
          aria-label="Fermer le guide"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        {/* Content */}
        <div className="mb-4">
          <h3 id="tour-title" className="font-semibold text-gray-900 mb-1">{step.title}</h3>
          <p className="text-sm text-gray-600">{step.content}</p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-4" aria-label={`Etape ${currentIndex + 1} sur ${totalSteps}`}>
          {Array.from({ length: totalSteps }, (_, idx) => `${step.id}-dot-${idx}`).map((dotId, idx) => (
            <div
              key={dotId}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === currentIndex ? 'bg-primary' : 'bg-gray-200'
              }`}
              aria-hidden="true"
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-2">
          {!isFirstStep && (
            <button
              type="button"
              onClick={onPrevious}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-sm"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              Precedent
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors text-sm"
          >
            {isLastStep ? 'Terminer' : 'Suivant'}
            {!isLastStep && <ChevronRight className="w-4 h-4" aria-hidden="true" />}
          </button>
        </div>

        {/* Skip link */}
        <button
          type="button"
          onClick={onSkip}
          className="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-3 transition-colors"
        >
          Ne plus afficher
        </button>
      </div>
    </>
  );
}
