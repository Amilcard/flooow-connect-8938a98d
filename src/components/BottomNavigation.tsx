import { Home, Search, DollarSign, User, MessageCircle, BarChart3 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
  requiresRole?: boolean;
}

const baseNavItems: NavItem[] = [
  { icon: Home, label: "Accueil", path: "/" },
  { icon: Search, label: "Recherche", path: "/activities" },
  { icon: DollarSign, label: "Aides", path: "/aides" },
  { icon: User, label: "Mon compte", path: "/mon-compte" },
];

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Check if user has admin/structure role
  const { data: hasAdminRole } = useQuery({
    queryKey: ["has-admin-role"],
    queryFn: async () => {
      if (!isAuthenticated) return false;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["structure", "territory_admin", "partner", "superadmin"])
        .maybeSingle();

      return !!data;
    },
    enabled: isAuthenticated,
  });

  // Add dashboard item if user has admin role
  const navItems = hasAdminRole 
    ? [...baseNavItems.slice(0, 3), { icon: BarChart3, label: "Dashboard", path: "/dashboards" }, baseNavItems[3]]
    : baseNavItems;

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
