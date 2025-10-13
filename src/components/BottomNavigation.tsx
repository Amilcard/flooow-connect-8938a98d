import { Home, Search, DollarSign, User, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: typeof Home;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Accueil", active: true },
  { icon: Search, label: "Recherche" },
  { icon: DollarSign, label: "Aides" },
  { icon: User, label: "Mon compte" },
  { icon: MessageCircle, label: "Support" },
];

export const BottomNavigation = () => {
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
            return (
              <li key={item.label}>
                <button
                  onClick={item.onClick}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[48px] min-h-[48px] rounded-lg transition-colors",
                    item.active 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-label={item.label}
                  aria-current={item.active ? "page" : undefined}
                >
                  <Icon size={24} strokeWidth={item.active ? 2.5 : 2} />
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
