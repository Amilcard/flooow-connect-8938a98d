import { useNavigate } from "react-router-dom";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Gift, GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import PageLayout from "@/components/PageLayout";

interface DealCard {
  id: string;
  title: string;
  badges: string[];
  text: string;
  footer: string;
  cta_label: string;
  cta_url?: string;
  cta_action?: string;
}

const localDeals: DealCard[] = [
  {
    id: "LOCAL_YOUTH_DEALS",
    title: "Carte jeune locale",
    badges: ["Réductions", "Jeunes"],
    text: "Réductions sur les activités, culture, sport et transports du territoire.",
    footer: "Ville / Intercommunalité",
    cta_label: "Voir les offres locales",
    cta_action: "open_local_youth_card"
  },
  {
    id: "TAXE_APPRENTISSAGE",
    title: "Taxe d'apprentissage",
    badges: ["Apprentis", "Financement formation"],
    text: "Aide pour financer formations certifiées (CFA, lycées pro).",
    footer: "Employeurs / CFA",
    cta_label: "En savoir plus",
    cta_url: "https://entreprendre.service-public.fr/vosdroits/F22574"
  }
];

const BonsPlansLocaux = () => {
  const navigate = useNavigate();

  const handleCTA = (card: DealCard) => {
    if (card.cta_action === "open_local_youth_card") {
      // TODO: implémenter navigation vers page carte jeune locale
    } else if (card.cta_url) {
      window.open(card.cta_url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <PageLayout showHeader={false}>
      {/* PageHeader blanc standard */}
      <PageHeader
        title="Bons plans locaux"
        subtitle="Profitez des offres et réductions de votre territoire"
        backFallback="/"
        tourId="local-deals-page-header"
      />

      <div className="container mx-auto px-4 py-6" data-tour-id="local-deals-page">
        {/* Zone Hero CTA principal */}
        <Card className="mb-8 bg-gradient-to-br from-accent/10 to-primary/10 border-accent/20">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-accent text-white">
                <Gift className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl mb-2">Découvrez vos avantages locaux</CardTitle>
                <CardDescription className="text-base">
                  Votre territoire propose des réductions et bons plans pour faciliter l'accès aux activités et services.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Section Bons plans */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Vos bons plans</h2>

          <div className="grid gap-4 md:grid-cols-2">
            {localDeals.map((card) => (
              <Card key={card.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {card.badges.map((badge, idx) => (
                      <Badge key={idx} variant="secondary">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <CardDescription className="text-sm leading-relaxed">
                    {card.text}
                  </CardDescription>
                </CardContent>

                <CardFooter className="flex flex-col items-start gap-3">
                  <p className="text-xs text-muted-foreground">{card.footer}</p>
                  <Button
                    onClick={() => handleCTA(card)}
                    variant="default"
                    className="w-full"
                  >
                    {card.cta_url && <ExternalLink className="w-4 h-4 mr-2" />}
                    {card.cta_label}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* Note informative en bas */}
        <Card className="mt-10 bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              💡 Bon à savoir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Les bons plans locaux varient selon votre territoire. Renseignez-vous auprès de votre mairie ou intercommunalité pour connaître toutes les offres disponibles.
            </p>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </PageLayout>
  );
};

export default BonsPlansLocaux;
