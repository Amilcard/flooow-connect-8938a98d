import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingState } from "@/components/LoadingState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

type AppRole = 'structure' | 'territory_admin' | 'partner' | 'superadmin' | 'family';

const ROLE_DASHBOARD_MAP: Record<AppRole, string> = {
  structure: "/dashboard/structure",
  territory_admin: "/dashboard/collectivite",
  partner: "/dashboard/financeur",
  superadmin: "/dashboard/superadmin",
  family: "/"
};

const DashboardRedirect = () => {
  const navigate = useNavigate();

  const { data: userRole, isLoading, error } = useQuery({
    queryKey: ["user-role-redirect"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Non authentifié");
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      const role = (data?.role as AppRole | undefined) ?? 'family';
      return role;
    }
  });

  useEffect(() => {
    if (userRole) {
      const dashboardPath = ROLE_DASHBOARD_MAP[userRole];
      navigate(dashboardPath, { replace: true });
    }
  }, [userRole, navigate]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !userRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-6 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erreur d'accès</h2>
          <p className="text-muted-foreground mb-4">
            Impossible de déterminer votre rôle. Veuillez vous reconnecter.
          </p>
          <Button onClick={() => navigate("/auth")}>
            Se connecter
          </Button>
        </Card>
      </div>
    );
  }

  return <LoadingState />;
};

export default DashboardRedirect;
