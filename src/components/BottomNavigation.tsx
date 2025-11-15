import { Home, Search, Users, Bike, UserCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NotificationBadge } from "./NotificationBadge";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
  showSplash?: boolean;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Accueil", path: "/home", showSplash: false },
  { icon: Search, label: "Recherche", path: "/search" },
  { icon: Users, label: "Mes enfants", path: "/mon-compte/enfants" },
  { icon: Bike, label: "Éco-mobilité", path: "/eco-mobilite" },
  { icon: UserCircle, label: "Mon compte", path: "/mon-compte" },
];

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [showSplash, setShowSplash] = useState(false);

  const handleNavigation = (item: NavItem) => {
    // Rediriger vers /auth si l'utilisateur n'est pas connecté et tente d'accéder à un espace privé
    if (!isAuthenticated && (item.path.startsWith("/mon-compte") || item.path === "/mes-enfants")) {
      navigate("/auth");
      return;
    }

    if (item.showSplash) {
      setShowSplash(true);
      setTimeout(() => {
        setShowSplash(false);
        navigate(item.path);
      }, 1800);
    } else {
      navigate(item.path);
    }
  };

  // Filtrer les items selon l'état de connexion
  const visibleItems = navItems.filter(item => {
    // "Mes enfants" et "Mon compte" uniquement si connecté
    if (!isAuthenticated && (item.path.startsWith("/mon-compte") || item.label === "Mes enfants")) {
      return false;
    }
    return true;
  });

  return (
    <>
      {/* Flooow Splash Overlay */}
      {showSplash && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] animate-in fade-in duration-300">
          <div className="text-center space-y-4">
            <h1 className="text-6xl font-bold text-white tracking-tight">Flooow</h1>
            <p className="text-xl text-white/90">Mes activités, mes aides et mes trajets. Nananare !</p>
          </div>
        </div>
      )}

      <nav 
        className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-[0_-2px_8px_rgba(0,0,0,0.08)]"
        role="navigation"
        aria-label="Navigation principale"
      >
        <div className="container px-2 py-2.5">
          <ul className="flex items-center justify-around">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.label}>
                  <button
                    onClick={() => handleNavigation(item)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[48px] min-h-[48px] rounded-lg transition-colors relative"
                    )}
                    style={{
                      color: isActive ? "#FF8A3D" : "#AFAFAF"
                    }}
                    aria-label={item.label}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon 
                      size={22} 
                      strokeWidth={isActive ? 2.5 : 2}
                      className="md:w-6 md:h-6"
                    />
                    <span className="text-[12px] font-medium">{item.label}</span>
                    {/* Badge de notification pour Mon compte */}
                    {item.path === "/mon-compte" && isAuthenticated && <NotificationBadge />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
};
