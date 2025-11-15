import { useNavigate } from "react-router-dom";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calculator } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import PageLayout from "@/components/PageLayout";

interface AidCard {
  id: string;
  title: string;
  badges: string[];
  text: string;
  footer: string;
  cta_label: string;
  cta_url?: string;
  cta_action?: string;
}

interface AidSection {
  section_id: string;
  title: string;
  cards: AidCard[];
}

const sections: AidSection[] = [
  {
    section_id: "school_year",
    title: "Pendant l'année scolaire",
    cards: [
      {
        id: "PASS_SPORT",
        title: "Pass'Sport – 70 € pour le sport",
        badges: ["Saison scolaire", "6–30 ans"],
        text: "Réduction de 70 € sur l'inscription dans un club sportif partenaire.",
        footer: "Ministère des Sports",
        cta_label: "En savoir plus",
        cta_url: "https://www.pass.sports.gouv.fr"
      },
      {
        id: "BOURSE_COLLEGE",
        title: "Bourse des collèges",
        badges: ["Collège", "Année scolaire"],
        text: "Aide annuelle pour les familles d'élèves de collège, selon les revenus.",
        footer: "Éducation nationale",
        cta_label: "Vérifier mon éligibilité",
        cta_url: "https://www.education.gouv.fr"
      },
      {
        id: "ARS",
        title: "ARS – Aide de rentrée",
        badges: ["6–18 ans", "Rentrée"],
        text: "Aide pour les dépenses de rentrée scolaire (équipement, activités).",
        footer: "CAF / MSA",
        cta_label: "Voir sur caf.fr",
        cta_url: "https://www.caf.fr"
      },
      {
        id: "PASS_CULTURE",
        title: "Pass Culture",
        badges: ["15–18 ans", "Culture"],
        text: "Crédit pour financer livres, cinéma, concerts et sorties culturelles.",
        footer: "Ministère de la Culture",
        cta_label: "Ouvrir le Pass Culture",
        cta_url: "https://pass.culture.fr"
      },
      {
        id: "PASS_REGION",
        title: "PASS'Région Jeunes (AURA)",
        badges: ["AURA", "Lycéens / apprentis"],
        text: "Aides pour manuels, équipement, culture, sport et parfois le permis.",
        footer: "Région Auvergne-Rhône-Alpes",
        cta_label: "Découvrir le PASS'Région",
        cta_url: "https://www.auvergnerhonealpes.fr/passregionjeunes"
      }
    ]
  },
  {
    section_id: "holidays",
    title: "Vacances & séjours",
    cards: [
      {
        id: "PASS_COLO",
        title: "Pass Colo",
        badges: ["Vacances", "11 ans"],
        text: "Aide de 200 à 350 € pour une colonie labellisée.",
        footer: "État / VACAF",
        cta_label: "Infos Pass Colo",
        cta_url: "https://www.jeunes.gouv.fr/la-foire-aux-questions-pass-colo-pour-les-familles-2127"
      },
      {
        id: "VACAF",
        title: "Aides vacances CAF / VACAF",
        badges: ["Vacances", "Enfants & familles"],
        text: "Participation au coût des séjours, colos et centres de loisirs agréés.",
        footer: "CAF",
        cta_label: "Voir sur caf.fr",
        cta_url: "https://www.caf.fr"
      },
      {
        id: "DEPART_18_25",
        title: "Départ 18–25",
        badges: ["Vacances", "18–25 ans"],
        text: "Jusqu'à 200 € d'aide pour partir en vacances avec un budget limité.",
        footer: "ANCV",
        cta_label: "Tester mon éligibilité",
        cta_url: "https://depart1825.com"
      }
    ]
  },
  {
    section_id: "local_deals",
    title: "Aides & bons plans locaux",
    cards: [
      {
        id: "LOCAL_YOUTH_DEALS",
        title: "Bons plans jeunesse",
        badges: ["Local", "Jeunes"],
        text: "Réductions et gratuités sur sport, culture, loisirs et transports.",
        footer: "Ville / Espace Info Jeunes",
        cta_label: "Voir près de chez moi",
        cta_url: "https://www.laboge.fr"
      }
    ]
  },
  {
    section_id: "dynamic_for_activity",
    title: "Pour cette activité",
    cards: [
      {
        id: "AIDES_POUR_CETTE_ACTIVITE",
        title: "Aides possibles pour cette activité",
        badges: ["Calcul personnalisé"],
        text: "En fonction de l'âge, du QF et du type d'activité, certaines aides peuvent réduire votre reste à charge.",
        footer: "Simulation Flooow",
        cta_label: "Lancer la simulation",
        cta_action: "open_aid_estimator_for_current_activity"
      }
    ]
  }
];

const Aides = () => {
  const navigate = useNavigate();

  const handleCTA = (card: AidCard) => {
    if (card.cta_action === "open_aid_estimator_for_current_activity") {
      navigate("/aides/simulateur");
    } else if (card.cta_url) {
      window.open(card.cta_url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-6 pb-24">
        <BackButton />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Aides financières</h1>
          <p className="text-muted-foreground">
            Découvrez les aides qui peuvent réduire le coût des activités.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.section_id} className="space-y-4">
              <h2 className="text-2xl font-semibold">{section.title}</h2>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {section.cards.map((card) => (
                  <Card key={card.id} className="flex flex-col">
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
                        {card.cta_action === "open_aid_estimator_for_current_activity" ? (
                          <Calculator className="w-4 h-4 mr-2" />
                        ) : (
                          <ExternalLink className="w-4 h-4 mr-2" />
                        )}
                        {card.cta_label}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Help Section */}
        <Card className="mt-10 bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Besoin d'aide pour choisir ?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Notre simulateur vous aide à identifier automatiquement les aides auxquelles vous avez droit.
            </p>
            <Button onClick={() => navigate("/aides/simulateur")} variant="outline">
              <Calculator className="w-4 h-4 mr-2" />
              Simuler mes aides
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <BottomNavigation />
    </PageLayout>
  );
};

export default Aides;
