import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { Calendar, MapPin, Clock, User, ExternalLink, MessageSquare, Users, Lightbulb } from "lucide-react";
import { format, isWithinInterval, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";

const EVENT_TYPE_LABELS: Record<string, string> = {
  all: "Tous les événements",
  workshop: "Ateliers enfants/ados",
  vacation_camp: "Séjours vacances",
  parent_meeting: "Réunions parents",
  community_info: "Actualités collectivités",
  cultural_event: "Événements culturels",
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  workshop: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  vacation_camp: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  parent_meeting: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  community_info: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  cultural_event: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
};

const HEARTBEAT_LINKS = {
  parents: "https://heartbeat.com/parents",
  structures: "https://heartbeat.com/structures",
  collectivites: "https://heartbeat.com/collectivites"
};

// Périodes de vacances scolaires 2025-2026 Zone A
const VACATION_PERIODS = [
  { start: "2025-10-18", end: "2025-11-03", name: "Toussaint 2025" },
  { start: "2025-12-20", end: "2026-01-05", name: "Noël 2025" },
  { start: "2026-02-07", end: "2026-02-23", name: "Hiver 2026" },
  { start: "2026-04-04", end: "2026-04-20", name: "Printemps 2026" },
  { start: "2026-07-04", end: "2026-08-31", name: "Été 2026" },
];

const isEventInVacation = (eventDate: string) => {
  const date = parseISO(eventDate);
  return VACATION_PERIODS.some(period => 
    isWithinInterval(date, { start: parseISO(period.start), end: parseISO(period.end) })
  );
};

const AgendaCommunity = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("agenda");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [selectedTerritory, setSelectedTerritory] = useState<string>("all");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "community") {
      setActiveTab("community");
    }
  }, [searchParams]);

  // Fetch user role
  const { data: userRole } = useQuery({
    queryKey: ["user-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      return data?.role || "family";
    },
    enabled: isAuthenticated,
  });

  // Fetch territories
  const { data: territories } = useQuery({
    queryKey: ["territories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("territories")
        .select("id, name")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data;
    }
  });

  // Fetch events
  const { data: events, isLoading, error, refetch } = useQuery({
    queryKey: ["territory-events", selectedType, selectedTerritory],
    queryFn: async () => {
      let query = supabase
        .from("territory_events")
        .select("*")
        .eq("published", true)
        .gte("end_date", new Date().toISOString())
        .order("start_date", { ascending: true });

      if (selectedType !== "all") {
        query = query.eq("event_type", selectedType);
      }

      if (selectedTerritory !== "all") {
        query = query.eq("territory_id", selectedTerritory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Filter events by period (client-side filtering)
  const filteredEvents = events?.filter(event => {
    if (selectedPeriod === "all") return true;
    if (selectedPeriod === "vacation") return isEventInVacation(event.start_date);
    if (selectedPeriod === "school") return !isEventInVacation(event.start_date);
    return true;
  });

  const communitySpaces = [
    {
      id: "parents",
      title: "Espace Parents",
      description: "Échangez avec d'autres parents, posez vos questions et partagez vos astuces",
      icon: <Users className="w-6 h-6" />,
      color: "text-primary",
      link: HEARTBEAT_LINKS.parents,
      allowedRoles: ["family"],
    },
    {
      id: "structures",
      title: "Espace Structures",
      description: "Espace dédié aux organismes et structures proposant des activités",
      icon: <Lightbulb className="w-6 h-6" />,
      color: "text-accent",
      link: HEARTBEAT_LINKS.structures,
      allowedRoles: ["structure", "partner"],
    },
    {
      id: "collectivites",
      title: "Espace Collectivités",
      description: "Espace réservé aux collectivités et financeurs",
      icon: <MapPin className="w-6 h-6" />,
      color: "text-secondary",
      link: HEARTBEAT_LINKS.collectivites,
      allowedRoles: ["territory_admin", "superadmin"],
    },
  ];

  // Auto-select space based on role
  const [selectedSpace, setSelectedSpace] = useState<string>("parents");

  return (
    <PageLayout>
      <div className="container py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Vivre mon territoire</h1>
          <p className="text-muted-foreground">
            Retrouvez les événements, infos pratiques et les échanges avec les autres parents
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="agenda">Agenda du territoire</TabsTrigger>
            <TabsTrigger value="community">Échanges & communauté</TabsTrigger>
          </TabsList>

          {/* Onglet Agenda */}
          <TabsContent value="agenda" className="space-y-6 mt-6">
            {isLoading && <LoadingState text="Chargement des événements..." />}
            
            {error && (
              <ErrorState 
                title="Erreur de chargement"
                message="Impossible de charger les événements. Veuillez réessayer."
                onRetry={refetch}
              />
            )}

            {!isLoading && !error && (
              <>
                {/* Filtres */}
                <div className="space-y-4">
                  {/* Filtres de type */}
                  <Tabs value={selectedType} onValueChange={setSelectedType}>
                    <TabsList className="w-full justify-start flex-wrap h-auto">
                      <TabsTrigger value="all">Tous</TabsTrigger>
                      <TabsTrigger value="workshop">Ateliers</TabsTrigger>
                      <TabsTrigger value="vacation_camp">Séjours</TabsTrigger>
                      <TabsTrigger value="parent_meeting">Réunions</TabsTrigger>
                      <TabsTrigger value="community_info">Actualités</TabsTrigger>
                      <TabsTrigger value="cultural_event">Culture</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Filtres de période et territoire */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Période</label>
                      <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger>
                          <SelectValue placeholder="Toutes les périodes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les périodes</SelectItem>
                          <SelectItem value="vacation">🌴 Vacances scolaires</SelectItem>
                          <SelectItem value="school">📚 Temps scolaire</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Territoire</label>
                      <Select value={selectedTerritory} onValueChange={setSelectedTerritory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Tous les territoires" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les territoires</SelectItem>
                          {territories?.map((territory) => (
                            <SelectItem key={territory.id} value={territory.id}>
                              {territory.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Liste des événements */}
                <div className="space-y-4">
                  {filteredEvents && filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                      <Card key={event.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={EVENT_TYPE_COLORS[event.event_type]}>
                                  {EVENT_TYPE_LABELS[event.event_type]}
                                </Badge>
                              </div>
                              <CardTitle className="text-xl">{event.title}</CardTitle>
                              <CardDescription className="mt-2">
                                {event.description}
                              </CardDescription>
                            </div>
                            {event.image_url && (
                              <img
                                src={event.image_url}
                                alt={event.title}
                                className="w-24 h-24 object-cover rounded-lg"
                              />
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {format(new Date(event.start_date), "EEEE d MMMM yyyy", { locale: fr })}
                              {event.end_date && event.end_date !== event.start_date && format(new Date(event.end_date), " - EEEE d MMMM yyyy", { locale: fr })}
                            </span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          {event.organizer_name && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="w-4 h-4" />
                              <span>{event.organizer_name}</span>
                            </div>
                          )}
                          {event.external_link && (
                            <Button
                              variant="outline"
                              className="w-full mt-2"
                              onClick={() => window.open(event.external_link, "_blank")}
                            >
                              En savoir plus
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-center">
                        <p className="text-muted-foreground">
                          Aucun événement trouvé pour ce filtre.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          {/* Onglet Communauté */}
          <TabsContent value="community" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-primary" />
                  <div>
                    <CardTitle>Rejoignez la communauté</CardTitle>
                    <CardDescription>
                      Posez vos questions, partagez vos astuces et retrouvez les infos pratiques
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {communitySpaces
                    .filter(space => !userRole || space.allowedRoles.includes(userRole))
                    .map((space) => (
                      <Card key={space.id} className="border-2">
                        <CardHeader>
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg bg-muted ${space.color}`}>
                              {space.icon}
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-lg">{space.title}</CardTitle>
                              <CardDescription className="mt-1">
                                {space.description}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {isAuthenticated ? (
                            <Button
                              className="w-full"
                              onClick={() => window.open(space.link, "_blank")}
                            >
                              Accéder à l'espace
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                          ) : (
                            <div className="text-sm text-muted-foreground text-center py-2">
                              Connectez-vous pour accéder à cet espace
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Fonctionnalités communauté */}
            <Card>
              <CardHeader>
                <CardTitle>Fonctionnalités de la communauté</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 mt-0.5 text-primary shrink-0" />
                    <div>
                      <p className="font-medium">Forum de discussion</p>
                      <p className="text-sm text-muted-foreground">
                        Échangez avec les autres membres de votre territoire
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Users className="w-5 h-5 mt-0.5 text-primary shrink-0" />
                    <div>
                      <p className="font-medium">Groupes thématiques</p>
                      <p className="text-sm text-muted-foreground">
                        Rejoignez des groupes selon vos centres d'intérêt
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 mt-0.5 text-primary shrink-0" />
                    <div>
                      <p className="font-medium">Conseils et astuces</p>
                      <p className="text-sm text-muted-foreground">
                        Partagez vos bons plans et découvrez ceux des autres
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Charte communauté */}
            <Card>
              <CardHeader>
                <CardTitle>Charte de la communauté</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Respectez les autres membres et leurs opinions</p>
                <p>• Partagez des informations utiles et vérifiées</p>
                <p>• Évitez les contenus commerciaux non sollicités</p>
                <p>• Signalez tout contenu inapproprié aux modérateurs</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default AgendaCommunity;
