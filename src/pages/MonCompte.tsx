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
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Edit
} from "lucide-react";

const MonCompte = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();

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
      icon: <Calendar size={20} />,
      title: "Mes réservations",
      subtitle: "Historique et réservations en cours",
      badge: userStats.reservations,
      onClick: () => navigate("/mon-compte/reservations"),
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
      subtitle: "Gérer vos préférences de notification",
      badge: userStats.notifications > 0 ? userStats.notifications : null,
      onClick: () => navigate("/mon-compte/notifications"),
    },
    {
      icon: <CreditCard size={20} />,
      title: "Moyens de paiement",
      subtitle: "Cartes bancaires, portefeuille",
      badge: null,
      onClick: () => navigate("/mon-compte/paiement"),
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
      {/* Header avec profil utilisateur */}
      <div className="bg-gradient-to-br from-primary to-accent text-white">
        <div className="container p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16 border-4 border-white/20">
              <AvatarImage src={user?.avatar} alt={user?.firstName} />
              <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-white/90 text-sm">{user?.email}</p>
              <div className="flex items-center mt-2 space-x-4">
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                  <Users className="w-3 h-3 mr-1" />
                  {userStats.enfants} enfant{userStats.enfants > 1 ? "s" : ""}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                  <Calendar className="w-3 h-3 mr-1" />
                  {userStats.reservations} réservation{userStats.reservations > 1 ? "s" : ""}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/mon-compte/informations")}
              className="text-white hover:bg-white/20"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="container px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          <Card
            className="p-4 cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-primary"
            onClick={() => navigate("/activities")}
          >
            <div className="text-center">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="font-medium text-sm">Réserver</p>
              <p className="text-xs text-muted-foreground">Nouvelle activité</p>
            </div>
          </Card>
          <Card
            className="p-4 cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-accent"
            onClick={() => navigate("/mon-compte/reservations")}
          >
            <div className="text-center">
              <FileText className="w-6 h-6 mx-auto mb-2 text-accent" />
              <p className="font-medium text-sm">Mes réservations</p>
              <p className="text-xs text-muted-foreground">{userStats.reservations} en cours</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Menu principal */}
      <div className="container px-4 pb-6 space-y-3">
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
