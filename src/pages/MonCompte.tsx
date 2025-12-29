import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import {
  User,
  Users,
  UserPlus,
  FileText,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Settings,
  Shield,
  Car,
  Euro,
  Heart
} from "lucide-react";

const MonCompte = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications(user?.id);

  // Redirect to auth if not authenticated
  if (!isLoading && !isAuthenticated) {
    navigate("/login");
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <PageLayout showHeader={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

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
      navigate("/home");
    } catch (error: unknown) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    }
  };

  // SECTION A : Mes espaces principaux (9 items prioritaires)
  const mainSpacesItems = [
    {
      icon: <User size={20} />,
      title: "Mes informations personnelles",
      subtitle: "Gérer mon profil et mes coordonnées",
      badge: null,
      onClick: () => navigate("/mon-compte/informations"),
      tourId: "account-profile",
    },
    {
      icon: <Shield size={20} />,
      title: "Profil d'éligibilité",
      subtitle: "Vérifier mes droits et aides disponibles",
      badge: null,
      onClick: () => navigate("/mon-compte/eligibilite"),
      tourId: "account-eligibility",
    },
    {
      icon: <Edit size={20} />,
      title: "Mes demandes d'inscription",
      subtitle: "Suivre l'état de mes demandes",
      badge: null,
      onClick: () => navigate("/mon-compte/validations"),
      tourId: "account-registrations",
    },
    {
      icon: <Car size={20} />,
      title: "Mon Covoiturage",
      subtitle: "Demander ou proposer un covoiturage",
      badge: null,
      onClick: () => navigate("/mon-compte/covoiturage"),
      tourId: "account-carpooling",
    },
    {
      icon: <Users size={20} />,
      title: "Mes enfants",
      subtitle: "Gérer les profils de vos enfants",
      badge: userStats.enfants,
      onClick: () => navigate("/mon-compte/enfants"),
      tourId: "account-children",
    },
    {
      icon: <UserPlus size={20} />,
      title: "Lier un enfant",
      subtitle: "Valider les inscriptions de vos enfants",
      badge: null,
      onClick: () => navigate("/mon-compte/lier-enfant"),
      tourId: "account-link-child",
    },
    {
      icon: <Calendar size={20} />,
      title: "Mes réservations",
      subtitle: "Historique et réservations en cours",
      badge: userStats.reservations,
      onClick: () => navigate("/mon-compte/reservations"),
      tourId: "account-reservations",
    },
    {
      icon: <FileText size={20} />,
      title: "Mes justificatifs",
      subtitle: "Télécharger mes documents",
      badge: null,
      onClick: () => navigate("/mon-compte/justificatifs"),
      tourId: "account-documents",
    },
    {
      icon: <Bell size={20} />,
      title: "Mes notifications",
      subtitle: "Événements et préférences",
      badge: unreadCount > 0 ? unreadCount : null,
      onClick: () => navigate("/mon-compte/notifications"),
      tourId: "account-notifications",
    },
    {
      icon: <Heart size={20} />,
      title: "Mes événements favoris",
      subtitle: "Événements sauvegardés",
      badge: null,
      onClick: () => navigate("/mes-evenements-favoris"),
      tourId: "account-favorites",
    },
  ];

  // SECTION B : Autres infos (items secondaires)
  const otherInfoItems = [
    {
      icon: <Calendar size={18} className="text-primary" />,
      label: "Mes sessions",
      onClick: () => navigate("/mon-compte/sessions"),
    },
    {
      icon: <Settings size={18} className="text-muted-foreground" />,
      label: "Paramètres",
      onClick: () => navigate("/mon-compte/parametres"),
    },
    {
      icon: <HelpCircle size={18} className="text-primary" />,
      label: "Aide & Support",
      onClick: () => navigate("/support"),
    },
  ];

  return (
    <PageLayout showHeader={false}>
      {/* PageHeader blanc standard */}
      <PageHeader
        title="Mon compte"
        showBackButton={false}
        tourId="account-page-header"
        rightContent={
          <>
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
          </>
        }
      />

      {/* Bloc Bonjour [Prénom] avec avatar - max-w-5xl pour alignement cohérent */}
      <div className="max-w-5xl mx-auto px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-primary/10">
          <Avatar className="h-12 w-12 ring-2 ring-primary/20">
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold text-lg">
              {user?.firstName?.[0]?.toUpperCase() || 'P'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Bonjour, {user?.firstName || 'Parent'} !
            </h2>
            <p className="text-sm text-muted-foreground">
              Gérez votre compte et vos démarches
            </p>
          </div>
        </div>
      </div>

      {/* SECTION A : Mes espaces principaux */}
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-4">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-foreground">Mes espaces principaux</h3>
          <p className="text-sm text-muted-foreground">Accès rapide à vos informations et démarches</p>
        </div>

        <div className="space-y-3" data-tour-id="account-main-list">
          {mainSpacesItems.map((item, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.01]"
              onClick={item.onClick}
              data-tour-id={item.tourId}
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
                    {item.badge ? (
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {item.badge}
                      </Badge>
                    ) : null}
                    <ChevronRight className="text-muted-foreground" size={20} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* SECTION B : Autres infos */}
      <div className="max-w-5xl mx-auto px-4 pb-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Autres infos</h3>
        </div>

        <div className="bg-muted/30 rounded-xl p-4 space-y-2">
          {otherInfoItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-muted-foreground hover:bg-background hover:text-foreground transition-all duration-200"
            >
              {item.icon}
              <span>{item.label}</span>
              <ChevronRight className="ml-auto" size={16} />
            </button>
          ))}

          {/* Version de l'application */}
          <div className="pt-2 mt-2 border-t border-border/50">
            <div className="px-3 py-2 text-xs text-muted-foreground text-center">
              Version 1.0.0 InKlusif
            </div>
          </div>
        </div>
      </div>

      {/* Bouton déconnexion discret */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-4 text-sm text-muted-foreground hover:text-destructive transition-colors duration-200 underline"
        >
          <LogOut size={16} />
          <span>Se déconnecter</span>
        </button>
      </div>
    </PageLayout>
  );
};

export default MonCompte;
