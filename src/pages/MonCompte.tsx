import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import {
  User, 
  Users, 
  FileText, 
  Bell, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Settings,
  Shield,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Edit,
  ArrowLeft,
  Car,
  Euro,
  Heart
} from "lucide-react";

const MonCompte = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications(user?.id);

  // Données simulées pour la démonstration
  const userStats = {
    enfants: 2,
    reservations: 5,
    sessions: 1,
    notifications: 3,
  };

  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
      } else {
        await supabase.auth.signOut();
      }
      toast({
        title: "D\u00E9connexion r\u00E9ussie",
        description: "\u00C0 bient\u00F4t !",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error?.message || String(error),
        variant: "destructive",
      });
    }
  };

  // Cards principales (fréquemment utilisées)
  const primaryMenuItems = [
    {
      icon: <Users size={20} />,
      title: "Mes enfants",
      subtitle: "Gérer les profils de vos enfants",
      badge: userStats.enfants,
      onClick: () => navigate("/mon-compte/enfants"),
    },
    {
      icon: <Calendar size={20} />,
      title: "Mes réservations",
      subtitle: "Historique et réservations en cours",
      badge: userStats.reservations,
      onClick: () => navigate("/mon-compte/reservations"),
    },
    {
      icon: <Heart size={20} />,
      title: "Mes événements favoris",
      subtitle: "Événements sauvegardés",
      badge: null,
      onClick: () => navigate("/mes-evenements-favoris"),
    },
    {
      icon: <Bell size={20} />,
      title: "Mes notifications",
      subtitle: "Événements et préférences",
      badge: unreadCount > 0 ? unreadCount : null,
      onClick: () => navigate("/mon-compte/notifications"),
    },
    {
      icon: <Car size={20} />,
      title: "Mon Covoiturage",
      subtitle: "Demander ou proposer un covoiturage",
      badge: null,
      onClick: () => navigate("/mon-compte/covoiturage"),
    },
    {
      icon: <Euro size={20} />,
      title: "Mes justificatifs",
      subtitle: "Télécharger mes documents",
      badge: null,
      onClick: () => navigate("/mon-compte/justificatifs"),
    },
  ];

  // Menu secondaire (options moins fréquentes)
  const secondaryMenuItems = [
    {
      icon: <User size={18} />,
      label: "Mes informations personnelles",
      onClick: () => navigate("/mon-compte/informations"),
    },
    {
      icon: <Euro size={18} />,
      label: "Profil d'éligibilité",
      onClick: () => navigate("/mon-compte/eligibilite"),
    },
    {
      icon: <FileText size={18} />,
      label: "Demandes d'inscription",
      onClick: () => navigate("/mon-compte/validations"),
    },
    {
      icon: <Shield size={18} />,
      label: "Mes sessions",
      onClick: () => navigate("/mon-compte/sessions"),
    },
    {
      icon: <Settings size={18} />,
      label: "Paramètres",
      onClick: () => navigate("/mon-compte/parametres"),
    },
    {
      icon: <HelpCircle size={18} />,
      label: "Aide & Support",
      onClick: () => navigate("/support"),
    },
  ];

  return (
    <PageLayout showHeader={false}>
      {/* Header simplifié */}
      <div className="bg-white border-b border-border">
        <div className="container px-5 py-4 flex items-center justify-between">
          {/* Partie gauche: Avatar + Bonjour */}
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user?.avatar} alt={user?.firstName} />
              <AvatarFallback className="bg-primary text-white text-sm font-semibold">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-base font-semibold text-foreground">
              Bonjour {user?.firstName}
            </span>
          </div>

          {/* Partie droite: Icons notifications + settings */}
          <div className="flex items-center gap-4">
            {/* Icon notifications avec badge */}
            <button 
              onClick={() => navigate("/mon-compte/notifications")}
              className="relative p-2 hover:bg-muted/50 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-xs font-semibold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Icon settings */}
            <button 
              onClick={() => navigate("/mon-compte/parametres")}
              className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
              aria-label="Paramètres"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Menu principal - Cards */}
      <div className="container px-4 pt-6 pb-6 space-y-3">
        {primaryMenuItems.map((item, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.01]"
            onClick={item.onClick}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl text-primary">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {item.badge && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {item.badge}
                    </Badge>
                  )}
                  <ChevronRight className="text-muted-foreground" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Menu secondaire - Autres options */}
        <div className="mt-10 mb-6">
          <div className="max-w-[600px] mx-auto bg-muted/30 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-2">
              Autres options
            </h3>
            <div className="space-y-1">
              {secondaryMenuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-muted-foreground hover:bg-background hover:text-foreground transition-all duration-200"
                >
                  <div className="text-muted-foreground">
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bouton déconnexion discret */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-4 text-sm text-muted-foreground hover:text-destructive transition-colors duration-200 underline"
        >
          <LogOut size={16} />
          <span>Se déconnecter</span>
        </button>

        <div className="text-center text-sm text-muted-foreground pt-2">
          Version 1.0.0 • InKlusif
        </div>
      </div>
    </PageLayout>
  );
};

export default MonCompte;
