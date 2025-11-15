import { Home, Heart, Grid3x3, MessageCircle, User } from "lucide-react";
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
  { icon: Grid3x3, label: "Univers", path: "/univers", activeColor: "text-[#FF6B35]" },
  { icon: Heart, label: "Favoris", path: "/favoris", activeColor: "text-[#FF6B35]" },
  { icon: Home, label: "Accueil", path: "/", activeColor: "text-[#FF6B35]" },
  { icon: MessageCircle, label: "Chat", path: "/chat", activeColor: "text-[#FF6B35]" },
  { icon: User, label: "Mon compte", path: "/mon-compte", activeColor: "text-[#FF6B35]" },
];

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-[1000] h-16 bg-white border-t border-[#E5E7EB] pt-2 pb-2"
      role="navigation"
      aria-label="Navigation principale"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="h-full">
        <ul className="flex items-center justify-around h-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.label} className="flex-1">
                <button
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 w-full transition-all duration-150",
                    isActive 
                      ? "text-[#FF6B35]"
                      : "text-[#9CA3AF]"
                  )}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className="transition-colors duration-150" />
                  <span className={cn(
                    "text-[11px] leading-none transition-all duration-150",
                    isActive ? "text-[#FF6B35] font-semibold" : "text-[#6B7280] font-normal"
                  )}>{item.label}</span>
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
