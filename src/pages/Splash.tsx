import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
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

    // ===== MODE TESTS BÊTA : ONBOARDING POUR LES 8 PREMIÈRES VISITES =====
    // Système de comptage des visites : onboarding affiché 8 fois maximum
    // Respecte aussi le flag "onboardingDisabled" si l'utilisateur a choisi "Ne plus afficher"

    // Vérifier si l'utilisateur a désactivé l'onboarding
    const onboardingDisabled = localStorage.getItem("onboardingDisabled") === "true";

    // Récupérer le compteur de visites
    const viewCount = Number.parseInt(localStorage.getItem("onboardingViewCount") || "0", 10);

    const timer = setTimeout(() => {
      // Afficher l'onboarding UNIQUEMENT si:
      // - Pas désactivé par l'utilisateur
      // - Moins de 8 visites
      if (!onboardingDisabled && viewCount < 8) {
        // Incrémenter le compteur AVANT de naviguer
        localStorage.setItem("onboardingViewCount", String(viewCount + 1));
        navigate("/onboarding", { replace: true });
      } else {
        // Après 8 visites OU si désactivé, aller directement à /home
        navigate("/home", { replace: true });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate, location]);

  // Ne pas afficher le splash si c'est une navigation interne
  if (!shouldShowSplash) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-white">Flooow</h1>
        <p className="text-xl text-white/90">Mes activités, mes aides et mes trajets.</p>
        <Loader2 className="w-12 h-12 text-white animate-spin mx-auto" />
      </div>
      {/* Liens légaux requis pour validation Google OAuth */}
      <div className="absolute bottom-4 text-center text-xs text-muted-foreground/60 space-x-3">
        <Link to="/legal/privacy" className="hover:text-primary transition-colors">Confidentialité</Link>
        <span>·</span>
        <Link to="/legal/mentions" className="hover:text-primary transition-colors">Mentions légales</Link>
      </div>
    </div>
  );
};

export default Splash;
