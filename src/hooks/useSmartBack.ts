import { useLocation, useNavigate } from "react-router-dom";

/**
 * Smart back navigation:
 * - If no fallback is provided, always use navigate(-1) to preserve search context
 * - If fallback is provided, use it only when there's no meaningful history
 */
export const useSmartBack = (fallback?: string) => {
  const navigate = useNavigate();
  const location = useLocation();

  return () => {
    // If no fallback provided, always go back - let browser handle edge cases
    if (!fallback) {
      navigate(-1);
      return;
    }

    // If fallback provided, check if we have meaningful history
    try {
      const state = location.state as any;
      if (state?.from) {
        navigate(-1);
        return;
      }

      const sameOriginReferrer = document.referrer &&
        new URL(document.referrer).origin === window.location.origin;

      if (window.history.length > 1 && sameOriginReferrer) {
        navigate(-1);
        return;
      }
    } catch (_) {
      // noop — fallback below
    }

    // Use fallback only if provided and no history
    navigate(fallback, { replace: true });
  };
};
