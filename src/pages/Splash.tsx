import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    
    setTimeout(() => {
      if (hasSeenOnboarding) {
        navigate("/home");
      } else {
        navigate("/onboarding");
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
