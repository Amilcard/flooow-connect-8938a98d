import { supabase } from '@/integrations/supabase/client';

type EventType = 'search' | 'view_activity' | 'simulate_aid' | 'click_details' | 'filter_change';

interface LogEventParams {
  eventType: EventType;
  activityId?: string;
  metadata?: Record<string, unknown>;
}

// Session ID pour les utilisateurs anonymes
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('flooow_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('flooow_session_id', sessionId);
  }
  return sessionId;
};

export const logEvent = async ({ eventType, activityId, metadata = {} }: LogEventParams) => {
  try {
    const { error } = await supabase.from('events').insert({
      event_type: eventType,
      session_id: getSessionId(),
      activity_id: activityId || null,
      territory_code: '42000', // Saint-Étienne par défaut
      metadata,
      created_at: new Date().toISOString()
    });
    
    if (error) {
      console.warn('Event logging failed:', error.message);
    }
  } catch (err) {
    console.warn('Event logging error:', err);
  }
};

export const useEventLogger = () => {
  return { logEvent };
};
