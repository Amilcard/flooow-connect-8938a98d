import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Users, Building2, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Community = () => {
  const { user, isAuthenticated } = useAuth();
  const [selectedSpace, setSelectedSpace] = useState<string>("parents");

  // Fetch user role to determine which community space to show
  const { data: userRole } = useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data?.role || 'family';
    },
    enabled: isAuthenticated && !!user
  });

  // Heartbeat deep links (à personnaliser avec vos vrais espaces Heartbeat)
  const HEARTBEAT_LINKS = {
    parents: "https://heartbeat.app/flooow-parents",
    structures: "https://heartbeat.app/flooow-structures",
    collectivites: "https://heartbeat.app/flooow-collectivites"
  };

  const communitySpaces = [
    {
      id: "parents",
      title: "Communauté Parents",
      description: "Échangez avec d'autres parents, partagez vos expériences et posez vos questions sur les activités pour vos enfants.",
      icon: Users,
      color: "bg-primary/10 text-primary",
      link: HEARTBEAT_LINKS.parents,
      roles: ['family']
    },
    {
      id: "structures",
      title: "Espace Organismes & Clubs",
      description: "Connectez-vous avec d'autres structures, partagez vos bonnes pratiques et collaborez sur des projets.",
      icon: Building2,
      color: "bg-secondary/10 text-secondary",
      link: HEARTBEAT_LINKS.structures,
      roles: ['structure']
    },
    {
      id: "collectivites",
      title: "Réseau Collectivités",
      description: "Participez aux discussions entre acteurs territoriaux, partagez des retours d'expérience et des données.",
      icon: Building2,
      color: "bg-accent/10 text-accent-foreground",
      link: HEARTBEAT_LINKS.collectivites,
      roles: ['territory_admin', 'partner', 'superadmin']
    }
  ];

  // Auto-select space based on user role
  useEffect(() => {
    if (userRole) {
      const matchingSpace = communitySpaces.find(space => 
        space.roles.includes(userRole)
      );
      if (matchingSpace) {
        setSelectedSpace(matchingSpace.id);
      }
    }
  }, [userRole]);

  return (
    <PageLayout>
      <div className="container px-4 py-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Échanges & Communauté
          </h1>
          <p className="text-muted-foreground text-lg">
            Rejoignez la communauté de votre territoire pour échanger, partager et collaborer
          </p>
        </div>

        {/* Community Spaces */}
        <Tabs value={selectedSpace} onValueChange={setSelectedSpace} className="w-full">
          <TabsList className="grid grid-cols-1 md:grid-cols-3 w-full">
            <TabsTrigger value="parents">
              <Users className="h-4 w-4 mr-2" />
              Parents
            </TabsTrigger>
            <TabsTrigger value="structures">
              <Building2 className="h-4 w-4 mr-2" />
              Structures
            </TabsTrigger>
            <TabsTrigger value="collectivites">
              <Building2 className="h-4 w-4 mr-2" />
              Collectivités
            </TabsTrigger>
          </TabsList>

          {communitySpaces.map((space) => (
            <TabsContent key={space.id} value={space.id} className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <div className={`p-3 rounded-lg ${space.color} w-fit mb-4`}>
                    <space.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-2xl">{space.title}</CardTitle>
                  <CardDescription className="text-base">
                    {space.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Fonctionnalités :</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 mt-0.5" />
                        <span>Discussions en temps réel avec les membres de votre communauté</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 mt-0.5" />
                        <span>Fils de discussion dédiés par activité ou thématique</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 mt-0.5" />
                        <span>Partage de documents, photos et ressources utiles</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 mt-0.5" />
                        <span>Notifications pour rester informé des nouveaux messages</span>
                      </li>
                    </ul>
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full"
                    onClick={() => window.open(space.link, '_blank')}
                  >
                    <ExternalLink className="h-5 w-5 mr-2" />
                    Accéder à la communauté {space.title.split(' ')[1]}
                  </Button>

                  {!isAuthenticated && (
                    <p className="text-sm text-center text-muted-foreground">
                      Connectez-vous pour accéder aux espaces communautaires
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Community Guidelines */}
              <Card>
                <CardHeader>
                  <CardTitle>Règles de la communauté</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Respectez les autres membres et leurs opinions</li>
                    <li>• Partagez des informations utiles et pertinentes</li>
                    <li>• Protégez la vie privée des enfants et des familles</li>
                    <li>• Signalez tout contenu inapproprié aux modérateurs</li>
                    <li>• Restez courtois et bienveillant dans vos échanges</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default Community;
