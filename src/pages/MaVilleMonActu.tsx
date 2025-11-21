import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, ExternalLink, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MaVilleMonActu = () => {
  const navigate = useNavigate();

  const actus = [
    {
      id: 1,
      titre: "Nouvelle salle hip-hop quartier Beaulieu",
      resume: "Ouverture d'un nouvel espace danse et hip-hop pour les enfants et ados, avec créneaux après l'école et le mercredi.",
      categorie: "Culture & sport",
      public: "Enfants / ados",
      type: "info_structure_locale"
    },
    {
      id: 2,
      titre: "Inscriptions centres de loisirs vacances",
      resume: "Les inscriptions pour les accueils de loisirs de la ville de Saint-Étienne ouvrent plusieurs semaines avant chaque période de vacances scolaires.",
      categorie: "Loisirs & vacances",
      public: "4–17 ans",
      type: "info_inscription"
    },
    {
      id: 3,
      titre: "Pass'Sport et aides activités",
      resume: "Plusieurs aides peuvent diminuer le coût d'une licence ou d'un stage (Pass'Sport, aides CAF, aides ville ou métropole selon le quotient familial).",
      categorie: "Aides financières",
      public: "Familles",
      type: "info_aides"
    }
  ];

  const agenda = [
    {
      id: 1,
      titre: "Match de foot en famille",
      resume: "Rencontres au stade Geoffroy-Guichard avec tarifs famille selon les matchs et compétitions.",
      lieu: "Saint-Étienne",
      public: "Familles / jeunes",
      type: "evenement_sportif"
    },
    {
      id: 2,
      titre: "Ateliers en médiathèque",
      resume: "Animations régulières pour enfants et ados (lecture, jeux, ateliers numériques) dans les médiathèques municipales.",
      lieu: "Médiathèques de Saint-Étienne",
      public: "Enfants / ados / familles",
      type: "evenement_culturel"
    },
    {
      id: 3,
      titre: "Fête de quartier ou temps fort local",
      resume: "Moments conviviaux organisés par les maisons de quartier, centres sociaux ou associations du territoire.",
      lieu: "Quartiers de Saint-Étienne",
      public: "Habitants du quartier",
      type: "evenement_quartier"
    }
  ];

  return (
    <PageLayout showHeader={false}>
      <PageHeader
        title="Ma ville, mon actu"
        subtitle="Les actus locales, l'agenda et les repères utiles à Saint-Étienne."
        backFallback="/home"
      />

      <div className="container mx-auto px-4 py-6 pb-24 max-w-[1200px]">
        {/* Section Actus */}
        <section className="mb-10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Actus du moment</h2>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {actus.map((actu) => (
              <Card key={actu.id} className="flex flex-col hover:shadow-lg transition-shadow border-l-4 border-l-primary/40">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                      {actu.categorie}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight">{actu.titre}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4">
                  <p className="text-sm text-muted-foreground flex-1">
                    {actu.resume}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mt-auto pt-2 border-t">
                    <span className="bg-accent/50 px-2 py-1 rounded-full">
                      Public : {actu.public}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Section Agenda */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">À venir près de chez vous</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agenda.map((event) => (
              <Card key={event.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg leading-tight">{event.titre}</CardTitle>
                  <CardDescription className="flex items-center gap-1 text-sm mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {event.lieu}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4">
                  <p className="text-sm text-muted-foreground flex-1">
                    {event.resume}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mt-auto pt-2 border-t">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Bientôt</span>
                    <span className="mx-1">•</span>
                    <span className="bg-accent/50 px-2 py-1 rounded-full">
                      {event.public}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA vers Mes Services */}
        <div className="mt-12 text-center">
          <Button 
            onClick={() => navigate('/mes-services')}
            size="lg"
            className="rounded-full px-8"
          >
            Voir tous mes services
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default MaVilleMonActu;
