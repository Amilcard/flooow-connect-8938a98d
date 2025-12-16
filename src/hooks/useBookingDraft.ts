import { useState, useEffect } from "react";
import { safeErrorMessage } from "@/utils/sanitize";

export interface BookingDraft {
  activityId: string;
  slotId: string;
  childId?: string;
  timestamp: number;
}

const DRAFT_KEY = "booking_draft";
const DRAFT_TTL = 1000 * 60 * 30; // 30 minutes

export const useBookingDraft = (activityId: string, slotId: string) => {
  const [draft, setDraft] = useState<BookingDraft | null>(null);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft) as BookingDraft;
        
        // Check if draft is for same activity/slot and not expired
        if (
          parsed.activityId === activityId &&
          parsed.slotId === slotId &&
          Date.now() - parsed.timestamp < DRAFT_TTL
        ) {
          setDraft(parsed);
        } else {
          // Clean up expired or different draft
          localStorage.removeItem(DRAFT_KEY);
        }
      } catch (error) {
        console.error(safeErrorMessage(error, 'Parse booking draft'));
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, [activityId, slotId]);

  const saveDraft = (childId: string) => {
    const newDraft: BookingDraft = {
      activityId,
      slotId,
      childId,
      timestamp: Date.now()
    };
    
    localStorage.setItem(DRAFT_KEY, JSON.stringify(newDraft));
    setDraft(newDraft);
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setDraft(null);
  };

  return {
    draft,
    saveDraft,
    clearDraft,
    hasDraft: !!draft
  };
};
