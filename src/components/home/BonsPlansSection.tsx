import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Briefcase, Heart, Gift, Calendar, Users } from "lucide-react";

// TODO: Connecter plus tard un back d'events/forums type Heartbeat
// Pour l'instant, données mockées et statiques en attendant l'intégration

interface BonPlan {
  id: string;
  title: string;
  description: string;
  category: "jeunes" | "familles";
  type: string;
  date?: string;
  link?: string;
  verified: boolean;
}

const mockBonsPlans: BonPlan[] = [
  {
    id: "1",
    title: "Concours photo jeunes talents",
    description: "Participe au concours photo organisé par la ville pour les 14-18 ans. Thème : 'Ma ville, mon quartier'. Prix à gagner !",
    category: "jeunes",
    type: "Concours",
    date: "Jusqu'au 15 décembre",
    link: "https://www.saint-etienne.fr",
    verified: true
  },
  {
    id: "2",
    title: "Jobs d'été - inscriptions ouvertes",
    description: "La mairie recrute des jeunes pour des missions d'été. Postulez dès maintenant pour les animations et l'accueil.",
    category: "jeunes",
    type: "Emploi",
    date: "Candidatures ouvertes",
    link: "https://www.saint-etienne.fr",
    verified: true
  },
  {
    id: "3",
    title: "Stages découverte métiers",
    description: "Programme de stages courts pour découvrir différents métiers pendant les vacances scolaires.",
    category: "jeunes",
    type: "Stage",
    date: "Vacances de février",
    verified: true
  },
  {
    id: "4",
    title: "Aide aux devoirs gratuite",
    description: "Séances d'aide aux devoirs organisées à la médiathèque tous les mercredis après-midi. Sans inscription.",
    category: "familles",
    type: "Aide",
    date: "Tous les mercredis",
    verified: true
  },
  {
    id: "5",
    title: "Atelier parents-enfants",
    description: "Ateliers créatifs gratuits pour partager un moment en famille. Arts plastiques, cuisine, jardinage.",
    category: "familles",
    type: "Atelier",
    date: "Samedis 10h-12h",
    verified: true
  },
  {
    id: "6",
    title: "Rencontre avec les associations",
    description: "Forum des associations le samedi 2 décembre à la Maison des Jeunes. Découvrez toutes les activités disponibles.",
    category: "familles",
    type: "Rendez-vous",
    date: "2 décembre",
    link: "https://www.saint-etienne.fr",
    verified: true
  }
];

const getCategoryIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "emploi":
    case "job":
      return Briefcase;
    case "concours":
      return Gift;
    case "stage":
      return Calendar;
    case "aide":
      return Heart;
    case "atelier":
    case "rendez-vous":
      return Users;
    default:
      return Gift;
  }
};

export const BonsPlansSection = () => {
  const jeunesBonsPlans = mockBonsPlans.filter(bp => bp.category === "jeunes");
  const famillesBonsPlans = mockBonsPlans.filter(bp => bp.category === "familles");

  const renderBonPlanCard = (bonPlan: BonPlan) => {
    const Icon = getCategoryIcon(bonPlan.type);
    
    return (
      <Card key={bonPlan.id} className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4 text-primary" />
                <Badge variant="secondary" className="text-xs">
                  {bonPlan.type}
                </Badge>
                {bonPlan.verified && (
                  <Badge variant="outline" className="text-xs border-green-500 text-green-700">
                    ✓ Vérifié
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg">{bonPlan.title}</CardTitle>
              {bonPlan.date && (
                <p className="text-xs text-muted-foreground mt-1">
                  📅 {bonPlan.date}
                </p>
              )}
            </div>
          </div>
          <CardDescription className="mt-2">
            {bonPlan.description}
          </CardDescription>
        </CardHeader>
        {bonPlan.link && (
          <CardContent>
            <Button variant="outline" size="sm" asChild>
              <a href={bonPlan.link} target="_blank" rel="noopener noreferrer">
                En savoir plus <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Bons plans & infos utiles
        </h2>
        <p className="text-muted-foreground">
          Ici, tu retrouves les bons plans et infos utiles autour de tes activités. 
          Les messages sont vérifiés par les structures ou la collectivité pour rester fiables et bienveillants.
        </p>
      </div>

      <Tabs defaultValue="jeunes" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="jeunes">
            Pour les jeunes ({jeunesBonsPlans.length})
          </TabsTrigger>
          <TabsTrigger value="familles">
            Pour les familles ({famillesBonsPlans.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jeunes" className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Concours, jobs d'été, stages découverte et plus encore pour les jeunes de 14 à 18 ans
          </p>
          {jeunesBonsPlans.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Gift className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Pas de bons plans pour le moment
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {jeunesBonsPlans.map(renderBonPlanCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="familles" className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Aides, rendez-vous, ateliers et infos pratiques pour toute la famille
          </p>
          {famillesBonsPlans.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Pas de bons plans pour le moment
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {famillesBonsPlans.map(renderBonPlanCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Card className="bg-accent/10 border-accent">
        <CardContent className="py-4">
          <p className="text-sm">
            <strong>💡 Bon à savoir :</strong> Tous les bons plans sont vérifiés 
            par les structures partenaires ou la collectivité avant publication. 
            Pour proposer un bon plan, contacte ta structure ou la mairie.
          </p>
        </CardContent>
      </Card>
    </section>
  );
};
