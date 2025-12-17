import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { safeErrorMessage } from "@/utils/sanitize";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Log 404 errors without exposing full pathname which could contain PII
    console.error(safeErrorMessage(new Error(`Route not found: ${location.pathname.split('/')[1] || 'root'}`), '404'));
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page introuvable</p>
        <a href="/" className="text-primary underline hover:text-primary/80">
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
};

export default NotFound;
