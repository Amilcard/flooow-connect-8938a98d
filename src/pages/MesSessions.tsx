import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Smartphone, 
  Monitor, 
  Shield, 
  Clock, 
  MapPin, 
  XCircle,
  AlertTriangle 
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Session {
  id: string;
  session_id: string;
  device_info: {
    browser?: string;
    os?: string;
    device?: string;
  };
  ip_address: string;
  user_agent: string;
  created_at: string;
  last_seen: string;
  expires_at: string;
  revoked: boolean;
}

const MesSessions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sessionToRevoke, setSessionToRevoke] = useState<string | null>(null);
  const [showRevokeAllDialog, setShowRevokeAllDialog] = useState(false);

  // Fetch sessions
  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ["user-sessions"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sessions-management`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch sessions");
      return response.json();
    },
  });

  // Revoke session mutation
  const revokeMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sessions-management/${sessionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ revoke_reason: "User revoked via UI" }),
        }
      );

      if (!response.ok) throw new Error("Failed to revoke session");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-sessions"] });
      toast({
        title: "Session révoquée",
        description: "La session a été révoquée avec succès",
      });
      setSessionToRevoke(null);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de révoquer la session",
        variant: "destructive",
      });
    },
  });

  // Revoke all sessions mutation
  const revokeAllMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sessions-management`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to revoke all sessions");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-sessions"] });
      toast({
        title: "Sessions révoquées",
        description: "Toutes vos sessions ont été révoquées",
      });
      setShowRevokeAllDialog(false);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de révoquer les sessions",
        variant: "destructive",
      });
    },
  });

  const sessions: Session[] = sessionsData?.sessions || [];
  const activeSessions = sessions.filter(s => !s.revoked);

  const getDeviceIcon = (deviceInfo: Session["device_info"]) => {
    const device = deviceInfo?.device?.toLowerCase() || "";
    if (device.includes("mobile") || device.includes("phone")) {
      return <Smartphone className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Mes sessions</h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos connexions actives
            </p>
          </div>
          {activeSessions.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRevokeAllDialog(true)}
              className="border-destructive text-destructive hover:bg-destructive hover:text-white"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Tout révoquer
            </Button>
          )}
        </div>

        <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Sécurité de votre compte
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Vérifiez régulièrement vos sessions actives. Si vous ne reconnaissez pas une session, révoquez-la immédiatement.
              </p>
            </div>
          </div>
        </Card>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="h-20 bg-muted rounded" />
              </Card>
            ))}
          </div>
        ) : activeSessions.length === 0 ? (
          <Card className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Aucune session active</h3>
            <p className="text-muted-foreground text-sm">
              Vous n'avez actuellement aucune session active
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {activeSessions.map((session) => (
              <Card key={session.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {getDeviceIcon(session.device_info)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">
                          {session.device_info?.browser || "Navigateur inconnu"}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          Actif
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>IP: {session.ip_address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            Dernière activité: {format(new Date(session.last_seen), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                          </span>
                        </div>
                        <div className="text-xs">
                          Créée le {format(new Date(session.created_at), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSessionToRevoke(session.session_id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomNavigation />

      {/* Revoke single session dialog */}
      <AlertDialog open={!!sessionToRevoke} onOpenChange={() => setSessionToRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Révoquer cette session ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action déconnectera cet appareil. Vous devrez vous reconnecter pour y accéder à nouveau.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => sessionToRevoke && revokeMutation.mutate(sessionToRevoke)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Révoquer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke all sessions dialog */}
      <AlertDialog open={showRevokeAllDialog} onOpenChange={setShowRevokeAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Révoquer toutes les sessions ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action déconnectera tous vos appareils, y compris celui-ci. Vous devrez vous reconnecter.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => revokeAllMutation.mutate()}
              className="bg-destructive hover:bg-destructive/90"
            >
              Tout révoquer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MesSessions;
