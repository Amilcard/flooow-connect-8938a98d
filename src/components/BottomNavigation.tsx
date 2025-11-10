import { Grid3x3, Calendar, User, Calculator } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: typeof Grid3x3;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Grid3x3, label: "Activités", path: "/activities" },
  { icon: Calculator, label: "Aides & Mobilité", path: "/aides-mobilite" },
  { icon: Calendar, label: "Agenda & Échanges", path: "/agenda-community" },
  { icon: User, label: "Mon espace", path: "/mon-compte" },
];

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t"
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
                    "flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[48px] min-h-[48px] rounded-lg transition-colors",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
