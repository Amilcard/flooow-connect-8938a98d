import { Home, Search, MapPin, Building2, UserCircle } from "lucide-react";
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
  requiresAuth?: boolean;
}

/**
 * Navigation principale en bas d'écran (5 onglets)
 * Alignée avec l'onboarding : Mes activités / Mes services / Mes trajets
 *
 * Note: Les tuiles "Ma ville & mon actu" et "Mes aides financières" de la page d'accueil
 * correspondent respectivement aux onglets "Ma ville" et "Mes services" ci-dessous.
 * L'état actif s'allume automatiquement grâce à la correspondance des routes.
 */
const navItems: NavItem[] = [
  { icon: Home, label: "Accueil", path: "/home", showSplash: false },
  { icon: Search, label: "Recherche", path: "/search" },
  { icon: MapPin, label: "Ma ville", path: "/ma-ville-mon-actu" }, // Correspond à la tuile "Ma ville & mon actu"
  { icon: Building2, label: "Mes services", path: "/mes-services" }, // Remplace "Mes aides"
  { icon: UserCircle, label: "Mon compte", path: "/mon-compte", requiresAuth: true },
];

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [showSplash, setShowSplash] = useState(false);

  const handleNavigation = (item: NavItem) => {
    // Si l'onglet nécessite une authentification et que l'utilisateur n'est pas connecté
    if (item.requiresAuth && !isAuthenticated) {
      // Rediriger vers la page de connexion avec le message approprié
      navigate("/login", {
        state: {
          from: item.path,
          message: "Connectez-vous pour accéder à votre compte"
        }
      });
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

  // Tous les items sont toujours visibles
  const visibleItems = navItems;

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
                    data-tour-id={
                      item.path === "/home" ? "nav-item-home" :
                      item.path === "/search" ? "nav-item-search" :
                      item.path === "/ma-ville-mon-actu" ? "nav-item-maville" :
                      item.path === "/mes-services" ? "nav-item-services" :
                      "nav-item-account"
                    }
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
