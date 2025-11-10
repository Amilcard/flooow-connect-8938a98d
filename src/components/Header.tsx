import { Button } from "@/components/ui/button";
import { Heart, Menu, Presentation, Bell } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AuthNavigation from "@/components/authentification/AuthNavigation";
import { NotificationBadge } from "@/components/NotificationBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/80 backdrop-blur-lg">
      <div className="container px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            <span className="text-xl font-semibold text-foreground">InKlusif Flooow</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#activites" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Activités
            </a>
            <a href="#aides" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Aides financières
            </a>
            <a href="#organismes" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Pour les organismes
            </a>
            {isAuthenticated && (
              <Link to="/dashboards" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Dashboard
              </Link>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1">
                <Presentation className="w-4 h-4" />
                Démos
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/demo/parent" className="w-full cursor-pointer">
                    Démo Parent
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/demo/lemoine" className="w-full cursor-pointer">
                    Démo Mme Lemoine
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/demo/collectivite" className="w-full cursor-pointer">
                    Démo Collectivité
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/demo/financeur" className="w-full cursor-pointer">
                    Démo Financeur
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/demo/structure" className="w-full cursor-pointer">
                    Démo Structure
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <a href="#a-propos" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              À propos
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <>
                <Button variant="ghost" className="hidden md:inline-flex" asChild>
                  <Link to="/login">Se connecter</Link>
                </Button>
                <Button variant="default" asChild>
                  <Link to="/signup">S'inscrire</Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={() => navigate("/account/mes-notifications")}
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <NotificationBadge />
                </Button>
                <AuthNavigation />
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/40">
            <nav className="flex flex-col gap-4">
              <a href="#activites" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Activités
              </a>
              <a href="#aides" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Aides financières
              </a>
              <a href="#organismes" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Pour les organismes
              </a>
              {isAuthenticated && (
                <Link to="/dashboards" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              )}
              <div className="flex flex-col gap-2 border-t border-border/40 pt-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Presentation className="w-3 h-3" />
                  Démos
                </span>
                <Link to="/demo/parent" className="text-sm font-medium text-foreground hover:text-primary transition-colors pl-4">
                  Démo Parent
                </Link>
                <Link to="/demo/lemoine" className="text-sm font-medium text-foreground hover:text-primary transition-colors pl-4">
                  Démo Mme Lemoine
                </Link>
                <Link to="/demo/collectivite" className="text-sm font-medium text-foreground hover:text-primary transition-colors pl-4">
                  Démo Collectivité
                </Link>
                <Link to="/demo/financeur" className="text-sm font-medium text-foreground hover:text-primary transition-colors pl-4">
                  Démo Financeur
                </Link>
                <Link to="/demo/structure" className="text-sm font-medium text-foreground hover:text-primary transition-colors pl-4">
                  Démo Structure
                </Link>
              </div>
              <a href="#a-propos" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                À propos
              </a>
              {!isAuthenticated && (
                <div className="flex flex-col gap-2 pt-4 border-t border-border/40">
                  <Button variant="ghost" asChild className="justify-start">
                    <Link to="/login">Se connecter</Link>
                  </Button>
                  <Button variant="default" asChild>
                    <Link to="/signup">S'inscrire</Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
