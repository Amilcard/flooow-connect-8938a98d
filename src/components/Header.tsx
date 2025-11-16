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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white shadow-sm">
      <div className="container px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo FLOOOW */}
          <Link to="/" className="flex items-center">
            <img
              src={logoFlooow}
              alt="Flooow"
              className="h-8 md:h-10 w-auto object-contain"
            />
          </Link>

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
        {mobileMenuOpen && !isAuthenticated && (
          <div className="md:hidden py-4 border-t border-border/40">
            <nav className="flex flex-col gap-2">
              <Button variant="ghost" asChild className="justify-start">
                <Link to="/login">Se connecter</Link>
              </Button>
              <Button variant="default" asChild>
                <Link to="/signup">S'inscrire</Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
