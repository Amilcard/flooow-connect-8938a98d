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

  const menuItems = [
    {
      icon: <User size={20} />,
      title: "Mes informations personnelles",
      subtitle: "Email, téléphone, adresse",
      badge: null,
      onClick: () => navigate("/mon-compte/informations"),
    },
    {
      icon: <Users size={20} />,
      title: "Mes enfants",
      subtitle: "Gérer les profils de vos enfants",
      badge: userStats.enfants,
      onClick: () => navigate("/mon-compte/enfants"),
    },
    {
      icon: <Euro size={20} />,
      title: "Profil d'éligibilité",
      subtitle: "Estimer mes aides potentielles",
      badge: null,
      onClick: () => navigate("/mon-compte/eligibilite"),
    },
    {
      icon: <FileText size={20} />,
      title: "Mes justificatifs",
      subtitle: "Télécharger mes documents",
      badge: null,
      onClick: () => navigate("/mon-compte/justificatifs"),
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
      icon: <FileText size={20} />,
      title: "Demandes d'inscription",
      subtitle: "Valider les demandes de vos enfants",
      badge: null,
      onClick: () => navigate("/mon-compte/validations"),
    },
    {
      icon: <Shield size={20} />,
      title: "Mes sessions",
      subtitle: "Gérer vos connexions actives",
      badge: userStats.sessions,
      onClick: () => navigate("/mon-compte/sessions"),
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
      icon: <Settings size={20} />,
      title: "Paramètres",
      subtitle: "Langue, confidentialité, sécurité",
      badge: null,
      onClick: () => navigate("/mon-compte/parametres"),
    },
    {
      icon: <HelpCircle size={20} />,
      title: "Aide & Support",
      subtitle: "FAQ, contact, assistance",
      badge: null,
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

      {/* Menu principal */}
      <div className="container px-4 pt-6 pb-6 space-y-3">
        {menuItems.map((item, index) => (
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

        <Button
          variant="outline"
          className="w-full h-12 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-2" size={20} />
          Se déconnecter
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Version 1.0.0 • InKlusif
        </div>
      </div>
    </PageLayout>
  );
};

export default MonCompte;
