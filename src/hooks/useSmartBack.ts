import { useLocation, useNavigate } from "react-router-dom";

/**
 * Smart back navigation:
 * - If there is meaningful history (same-origin referrer and history length > 1), go back
 * - Otherwise, navigate to provided fallback or home
 */
export const useSmartBack = (fallback?: string) => {
  const navigate = useNavigate();
  const location = useLocation();

  return () => {
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

    if (fallback) navigate(fallback, { replace: true });
    else navigate("/", { replace: true });
  };
};
