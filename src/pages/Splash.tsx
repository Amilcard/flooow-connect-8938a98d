import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

const Splash = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if this is a fresh app load (not internal navigation)
    const isAppEntry = !sessionStorage.getItem('appInitialized');
    
    if (!isAppEntry) {
      // User is already in the app, redirect immediately without splash
      navigate("/home", { replace: true });
      return;
    }

    // Mark app as initialized
    sessionStorage.setItem('appInitialized', 'true');

    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    
    setTimeout(() => {
      if (hasSeenOnboarding) {
        navigate("/home", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    }, 2000);
  }, [navigate]);

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
