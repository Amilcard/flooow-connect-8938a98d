import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);

        const errorParam = hashParams.get("error") || queryParams.get("error");
        if (errorParam) {
          setError(
            hashParams.get("error_description") ||
              queryParams.get("error_description") ||
              "Erreur de connexion"
          );
          return;
        }

        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        );

        if (sessionError) {
          const { data: sessionData } = await supabase.auth.getSession();
          if (!sessionData.session) {
            setError("Session non récupérée. Réessayez.");
            return;
          }
        }

        navigate("/home", { replace: true });
      } catch {
        setError("Erreur inattendue");
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center p-6 bg-white rounded-xl shadow-md max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Erreur de connexion</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
    </div>
  );
}
