/**
 * Hook pour gérer le feedback utilisateur
 * Stocke les feedbacks dans localStorage
 */

import { useState, useCallback } from 'react';

export interface FeedbackResponse {
  timestamp: string;
  trigger: string;
  rating?: number;
  comment?: string;
  question1?: string;
  question2?: string;
}

const STORAGE_KEY = 'flooow_feedback_responses';
const LAST_SHOWN_KEY = 'flooow_feedback_last_shown';
const MIN_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function useFeedback(trigger: string) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const canShowFeedback = useCallback((): boolean => {
    const lastShown = localStorage.getItem(LAST_SHOWN_KEY);
    if (!lastShown) return true;

    const lastShownDate = new Date(lastShown).getTime();
    const now = Date.now();
    return now - lastShownDate > MIN_INTERVAL_MS;
  }, []);

  const showFeedback = useCallback(() => {
    if (!canShowFeedback()) return;

    setIsVisible(true);
    localStorage.setItem(LAST_SHOWN_KEY, new Date().toISOString());
  }, [canShowFeedback]);

  const hideFeedback = useCallback(() => {
    setIsVisible(false);
  }, []);

  const submitFeedback = useCallback((response: Omit<FeedbackResponse, 'timestamp' | 'trigger'>) => {
    const fullResponse: FeedbackResponse = {
      ...response,
      timestamp: new Date().toISOString(),
      trigger,
    };

    // Store in localStorage
    const existing = localStorage.getItem(STORAGE_KEY);
    const responses: FeedbackResponse[] = existing ? JSON.parse(existing) : [];
    responses.push(fullResponse);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));

    setHasSubmitted(true);
    setIsVisible(false);
  }, [trigger]);

  const getAllFeedback = useCallback((): FeedbackResponse[] => {
    const existing = localStorage.getItem(STORAGE_KEY);
    return existing ? JSON.parse(existing) : [];
  }, []);

  return {
    isVisible,
    hasSubmitted,
    showFeedback,
    hideFeedback,
    submitFeedback,
    getAllFeedback,
    canShowFeedback,
  };
}
