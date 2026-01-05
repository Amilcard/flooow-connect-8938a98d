import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingState } from "@/components/LoadingState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

type AppRole = 'structure' | 'territory_admin' | 'partner' | 'superadmin' | 'family';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: AppRole[];
  redirectTo?: string;
}

export const RoleProtectedRoute = ({ 
  children, 
  allowedRoles,
  redirectTo = "/" 
}: RoleProtectedRouteProps) => {
  const { data: userRole, isLoading, error } = useQuery({
    queryKey: ["user-role-check", allowedRoles],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Non authentifié");
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        // If table doesn't exist or RLS blocks, default to family
        if (error) {
          console.warn("user_roles query failed, defaulting to family role");
          return 'family' as AppRole;
        }

        return (data?.role as AppRole | undefined) ?? 'family';
      } catch {
        // Table might not exist yet - default to family role
        return 'family' as AppRole;
      }
    },
    retry: false // Don't retry on error - use default
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !userRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-6 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Accès non autorisé</h2>
          <p className="text-muted-foreground mb-4">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <Button onClick={() => window.location.href = "/"}>
            Retour à l'accueil
          </Button>
        </Card>
      </div>
    );
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
