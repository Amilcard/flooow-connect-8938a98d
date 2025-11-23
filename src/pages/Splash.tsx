import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

const Splash = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [shouldShowSplash, setShouldShowSplash] = useState(true);

  useEffect(() => {
    // Marquer que le splash a été vu dans cette session
    const splashShownThisSession = sessionStorage.getItem("splashShown");

    // Détecter si c'est une navigation interne (back/forward, liens internes)
    const isInternalNavigation =
      location.state?.from || // Navigation via React Router avec state
      window.history.length > 1 || // Historique existant
      document.referrer.includes(window.location.origin) || // Referrer interne
      splashShownThisSession === "true"; // Déjà vu dans cette session

    if (isInternalNavigation) {
      // Navigation interne : aller directement à l'accueil sans splash
      setShouldShowSplash(false);
      navigate("/home", { replace: true });
      return;
    }

    // Première visite de la session : montrer le splash
    sessionStorage.setItem("splashShown", "true");

    // ===== MODE TESTS BÊTA : ONBOARDING AVEC OPTION DE DÉSACTIVATION =====
    // Système de comptage des visites pour permettre aux testeurs de désactiver l'onboarding
    
    // Récupérer le compteur de visites et le statut de désactivation
    const viewCount = parseInt(localStorage.getItem("onboardingViewCount") || "0");
    const hasDisabledOnboarding = localStorage.getItem("hasDisabledOnboarding") === "true";
    
    // Incrémenter le compteur de visites
    localStorage.setItem("onboardingViewCount", String(viewCount + 1));

    const timer = setTimeout(() => {
      // TOUJOURS afficher l'onboarding (demande utilisateur)
      navigate("/onboarding", { replace: true });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate, location]);

  // Ne pas afficher le splash si c'est une navigation interne
  if (!shouldShowSplash) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary to-accent p-6">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-white">Flooow</h1>
        <p className="text-xl text-white/90">Mes activités, mes aides et mes trajets. Nananare !</p>
        <Loader2 className="w-12 h-12 text-white animate-spin mx-auto" />
      </div>
    </div>
  );
};

export default Splash;
