import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BottomNavigation } from "@/components/BottomNavigation";
import { 
  User, 
  Users, 
  FileText, 
  Bell, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Settings,
  Shield
} from "lucide-react";

const MonCompte = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !"
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const menuItems = [
    {
      icon: <User size={20} />,
      title: "Mes informations",
      subtitle: "Email, téléphone, adresse",
      onClick: () => console.log("Mes informations")
    },
    {
      icon: <Users size={20} />,
      title: "Mes enfants",
      subtitle: "Gérer les profils de vos enfants",
      onClick: () => navigate("/mes-enfants")
    },
    {
      icon: <Shield size={20} />,
      title: "Mes sessions",
      subtitle: "Gérer vos connexions actives",
      onClick: () => navigate("/mes-sessions")
    },
    {
      icon: <FileText size={20} />,
      title: "Mes réservations",
      subtitle: "Historique et réservations en cours",
      onClick: () => navigate("/mes-reservations")
    },
    {
      icon: <Bell size={20} />,
      title: "Notifications",
      subtitle: "Gérer vos préférences",
      onClick: () => console.log("Notifications")
    },
    {
      icon: <HelpCircle size={20} />,
      title: "Aide & Support",
      subtitle: "FAQ et contact",
      onClick: () => console.log("Support")
    },
    {
      icon: <Settings size={20} />,
      title: "Paramètres",
      subtitle: "Langue, confidentialité",
      onClick: () => console.log("Paramètres")
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary-light text-white p-6">
        <div className="container">
          <h1 className="text-2xl font-bold mb-2">Mon Compte</h1>
          <p className="text-white/90">parent@example.com</p>
        </div>
      </div>

      <div className="container px-4 py-6 space-y-4">
        {menuItems.map((item, index) => (
          <Card
            key={index}
            className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={item.onClick}
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                {item.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.subtitle}</p>
              </div>
              <ChevronRight className="text-muted-foreground" size={20} />
            </div>
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

        <div className="text-center text-sm text-muted-foreground pt-4">
          Version 1.0.0
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default MonCompte;
