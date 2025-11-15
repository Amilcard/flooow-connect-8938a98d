import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

const Splash = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only show splash on actual app entry, not on navigation
    const isNavigating = location.state?.from || document.referrer.includes(window.location.origin);
    
    if (isNavigating) {
      // User is navigating within the app, go directly to home
      navigate("/home", { replace: true });
      return;
    }

    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    
    setTimeout(() => {
      if (hasSeenOnboarding) {
        navigate("/home", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    }, 2000);
  }, [navigate, location]);

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
