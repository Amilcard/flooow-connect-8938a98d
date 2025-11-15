import { Home, Search, Grid3x3, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { NotificationBadge } from "./NotificationBadge";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
  activeColor: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Accueil", path: "/", activeColor: "text-primary" },
  { icon: Search, label: "Recherche", path: "/search", activeColor: "text-accent-blue" },
  { icon: Grid3x3, label: "Univers", path: "/univers", activeColor: "text-accent-green" },
  { icon: User, label: "Mon compte", path: "/mon-compte", activeColor: "text-accent-orange" },
];

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-[0_-2px_8px_rgba(0,0,0,0.08)]"
      role="navigation"
      aria-label="Navigation principale"
    >
      <div className="container px-2 py-2">
        <ul className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.label}>
                <button
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[48px] min-h-[48px] rounded-lg transition-colors relative",
                    isActive 
                      ? item.activeColor
                      : "text-text-muted hover:text-text-main"
                  )}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-xs font-medium">{item.label}</span>
                  {/* Badge de notification pour Mon compte */}
                  {item.path === "/mon-compte" && isAuthenticated && <NotificationBadge />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
