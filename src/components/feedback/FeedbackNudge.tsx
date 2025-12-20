/**
 * Mini feedback nudge - 2 questions max
 * S affiche apres une action importante (ouverture activite, demande envoyee)
 */

import { useState, useCallback, ChangeEvent } from 'react';
import { X, ThumbsUp, ThumbsDown, Send } from 'lucide-react';

interface FeedbackNudgeProps {
  onSubmit: (response: { rating?: number; question1?: string; question2?: string }) => void;
  onDismiss: () => void;
}

export function FeedbackNudge({ onSubmit, onDismiss }: FeedbackNudgeProps) {
  const [step, setStep] = useState<'rating' | 'questions' | 'thanks'>('rating');
  const [rating, setRating] = useState<number | undefined>();
  const [q1Answer, setQ1Answer] = useState('');

  const handleRatingPositive = useCallback(() => {
    setRating(1);
    setStep('questions');
  }, []);

  const handleRatingNegative = useCallback(() => {
    setRating(0);
    setStep('questions');
  }, []);

  const handleQ1Change = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setQ1Answer(e.target.value);
  }, []);

  const handleSubmit = useCallback(() => {
    onSubmit({
      rating,
      question1: q1Answer || undefined,
    });
    setStep('thanks');
    setTimeout(onDismiss, 2000);
  }, [onSubmit, rating, q1Answer, onDismiss]);

  const handleSkipToSubmit = useCallback(() => {
    onSubmit({ rating });
    setStep('thanks');
    setTimeout(onDismiss, 2000);
  }, [onSubmit, rating, onDismiss]);

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Close button */}
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>

        <div className="p-4">
          {step === 'rating' && (
            <>
              <h3 className="font-semibold text-gray-900 mb-2 pr-6">
                Cette page vous a-t-elle ete utile ?
              </h3>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleRatingPositive}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all group"
                >
                  <ThumbsUp className="w-5 h-5 text-gray-400 group-hover:text-green-500" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">Oui</span>
                </button>
                <button
                  type="button"
                  onClick={handleRatingNegative}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-all group"
                >
                  <ThumbsDown className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-orange-700">Non</span>
                </button>
              </div>
            </>
          )}

          {step === 'questions' && (
            <>
              <h3 className="font-semibold text-gray-900 mb-2 pr-6">
                {rating === 1 ? 'Super ! Qu avez-vous apprecie ?' : 'Que pouvons-nous ameliorer ?'}
              </h3>
              <textarea
                value={q1Answer}
                onChange={handleQ1Change}
                placeholder="Votre avis en quelques mots (optionnel)"
                className="w-full p-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                rows={2}
                maxLength={200}
              />
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleSkipToSubmit}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
                >
                  Passer
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Envoyer
                </button>
              </div>
            </>
          )}

          {step === 'thanks' && (
            <div className="text-center py-2">
              <div className="text-2xl mb-1">🙏</div>
              <p className="font-medium text-gray-900">Merci pour votre retour !</p>
              <p className="text-sm text-gray-500">Votre avis nous aide a ameliorer Flooow.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
