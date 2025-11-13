import { Button } from "@/components/ui/button";
import { Menu, Bell } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AuthNavigation from "@/components/authentification/AuthNavigation";
import { NotificationBadge } from "@/components/NotificationBadge";
import logoFlooow from "@/assets/logo-flooow.png";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/80 backdrop-blur-lg">
      <div className="container px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center h-16">
            <img 
              src={logoFlooow} 
              alt="Flooow - Mon petit guichet du quotidien" 
              className="h-14 md:h-16 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation - Front Familles uniquement */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/activities" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Activités
            </Link>
            <Link to="/aides-mobilite" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Aides & Mobilité
            </Link>
            {isAuthenticated && (
              <Link to="/mon-compte" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Mon espace
              </Link>
            )}
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

        {/* Mobile Menu - Front Familles uniquement */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/40">
            <nav className="flex flex-col gap-4">
              <Link to="/activities" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Activités
              </Link>
              <Link to="/aides-mobilite" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Aides & Mobilité
              </Link>
              {isAuthenticated && (
                <Link to="/mon-compte" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  Mon espace
                </Link>
              )}
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
