import { Button } from "@/components/ui/button";
import { Heart, Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AuthNavigation from "@/components/authentification/AuthNavigation";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

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
            <a href="#a-propos" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              À propos
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
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
              <AuthNavigation />
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
