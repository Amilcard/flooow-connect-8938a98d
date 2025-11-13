import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/ui/app-icon";
import { HelpCircle, Calculator, ExternalLink, MapPin } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTerritory } from "@/hooks/useUserTerritory";
import { Skeleton } from "@/components/ui/skeleton";

// Types
interface Aid {
  name: string;
  type: string;
  amount: string;
  description: string;
  eligibility: string;
  links?: { label: string; url: string }[];
  validity?: string;
}

interface TerritoryAids {
  label: string;
  city: string;
  aides: Aid[];
}

// Données des aides par territoire
const TERRITORY_AIDS: Record<string, TerritoryAids> = {
  "saint-etienne": {
    label: "Saint-Étienne (42) / Loire / AURA",
    city: "Saint-Étienne",
    aides: [
      {
        name: "Pass'Sport 2025-2026",
        type: "Nationale",
        amount: "70€",
        description: "70 € sur ma licence sportive",
        eligibility: "Enfants 6-18 ans, allocataires AAH, ARS ou AEEH",
        links: [
          { label: "Service-Public", url: "https://www.service-public.fr/particuliers/vosdroits/F35915" },
          { label: "Sports.gouv.fr", url: "https://www.sports.gouv.fr/pass-sport" }
        ]
      },
      {
        name: "PASS'Région jeunes",
        type: "Régionale",
        amount: "Variable",
        description: "Sport, culture, santé, permis — services multiples",
        eligibility: "15-25 ans, lycéens et apprentis de la région AURA",
        links: [{ label: "Région AURA", url: "https://www.auvergnerhonealpes.fr" }],
        validity: "Septembre 2025 - Août 2026"
      },
      {
        name: "CAF Loire — Loisirs & Séjours",
        type: "CAF",
        amount: "Variable",
        description: "Aides pour loisirs et séjours vacances",
        eligibility: "Allocataires CAF selon quotient familial",
        links: [
          { label: "Service-Public", url: "https://www.service-public.fr/particuliers/vosdroits/F1319" },
          { label: "CAF.fr", url: "https://www.caf.fr" }
        ]
      },
      {
        name: "La Ricamarie — Transport collégiens + Bourse étudiants",
        type: "Locale",
        amount: "Variable",
        description: "Aide transport collégiens et bourse pour étudiants",
        eligibility: "Résidents La Ricamarie selon critères CCAS",
        links: [{ label: "Ville La Ricamarie", url: "https://www.ville-laricamarie.fr" }]
      }
    ]
  },
  "grenoble": {
    label: "Grenoble (38) / Isère / AURA",
    city: "Grenoble",
    aides: [
      {
        name: "PASS'Région Jeunes",
        type: "Régionale",
        amount: "Variable",
        description: "Sport, culture, manuels scolaires (crédits)",
        eligibility: "Lycéens, apprentis, stagiaires AURA (≈15–25 ans)",
        links: [{ label: "Région AURA", url: "https://www.auvergnerhonealpes.fr" }]
      },
      {
        name: "Carte Tattoo Isère",
        type: "Département",
        amount: "60€",
        description: "Cagnotte 60 € pour activités sport/culture/art",
        eligibility: "Tous les collégiens domiciliés en Isère",
        links: [{ label: "Isère.fr", url: "https://www.isere.fr" }]
      },
      {
        name: "Bonus Culture CAF Isère",
        type: "CAF",
        amount: "60€",
        description: "+60 € pour activités culturelles annuelles",
        eligibility: "Collégiens avec QF < 1 200 €",
        links: [{ label: "CAF.fr", url: "https://www.caf.fr" }]
      },
      {
        name: "CAF Isère – VACAF (AVE/AVF)",
        type: "CAF",
        amount: "Variable",
        description: "Aides vacances + transport (selon QF et distance)",
        eligibility: "Allocataires CAF 38, QF ≤ 900 € (janv. 2025)",
        links: [{ label: "CAF.fr", url: "https://www.caf.fr" }]
      },
      {
        name: "Éco-mobilité locale",
        type: "Mobilité",
        amount: "Variable",
        description: "Tram, bus, vélo pour se rendre aux activités",
        eligibility: "Résidents de l'agglo grenobloise",
        links: [{ label: "Tag Mobilités", url: "https://www.tag.fr" }]
      }
    ]
  },
  "lyon": {
    label: "Lyon (69) / Métropole de Lyon / AURA",
    city: "Lyon",
    aides: [
      {
        name: "PASS'Région Jeunes",
        type: "Régionale",
        amount: "Variable",
        description: "Sport (licence), culture (ciné, musées), scolarité",
        eligibility: "Jeunes en lycée / apprentissage / formation AURA",
        links: [{ label: "Région AURA", url: "https://www.auvergnerhonealpes.fr" }]
      },
      {
        name: "Culture Campus",
        type: "Locale",
        amount: "18€",
        description: "3 spectacles + 1 ciné pour 18 €",
        eligibility: "Étudiants de la Métropole de Lyon",
        links: [{ label: "Métropole de Lyon", url: "https://www.grandlyon.com" }]
      },
      {
        name: "CAF Rhône (69)",
        type: "CAF",
        amount: "Variable",
        description: "Aides locales vacances/loisirs (selon règlement)",
        eligibility: "Allocataires CAF 69 (conditions QF à vérifier)",
        links: [{ label: "CAF.fr", url: "https://www.caf.fr" }]
      },
      {
        name: "Bons plans La Boge",
        type: "Info Jeunes",
        amount: "Variable",
        description: "Réductions et gratuités en AURA",
        eligibility: "Jeunes 13–29 ans via Info Jeunes",
        links: [{ label: "Info Jeunes AURA", url: "https://www.info-jeunes-aura.fr" }]
      }
    ]
  },
  "marseille": {
    label: "Marseille (13) / Bouches-du-Rhône",
    city: "Marseille",
    aides: [
      {
        name: "Carte CJeune",
        type: "Département",
        amount: "150€",
        description: "150 € (sport/culture/loisirs + soutien scolaire)",
        eligibility: "Tous les collégiens du 13 (carte annuelle)",
        links: [{ label: "Département 13", url: "https://www.departement13.fr" }]
      },
      {
        name: "Pass'Sport Loisirs Culture CAF 13",
        type: "CAF",
        amount: "50-150€",
        description: "50 à 150 € selon QF pour activités enfants",
        eligibility: "Enfants 3–11 ans, QF ≤ 1 200 € (CAF 13)",
        links: [{ label: "CAF.fr", url: "https://www.caf.fr" }]
      },
      {
        name: "Départ 18:25",
        type: "Nationale",
        amount: "≈200€",
        description: "≈200 € pour un séjour vacances (ANCV)",
        eligibility: "Jeunes 18–25 ans, sous conditions de revenus ou statut",
        links: [{ label: "ANCV", url: "https://www.ancv.com" }]
      }
    ]
  },
  "paris": {
    label: "Paris (75) / Île-de-France",
    city: "Paris",
    aides: [
      {
        name: "Pass Culture – part collective",
        type: "Nationale / Établissements",
        amount: "Variable",
        description: "Financement sorties/ateliers pour les classes",
        eligibility: "Collèges et lycéens (6e à Terminale)",
        links: [{ label: "Pass Culture", url: "https://pass.culture.fr" }]
      },
      {
        name: "Fonds sociaux",
        type: "National / Établissements",
        amount: "Variable",
        description: "Aides pour cantine, internat, frais scolaires",
        eligibility: "Collégiens et lycéens selon fonds social",
        links: [{ label: "Service-Public", url: "https://www.service-public.fr/particuliers/vosdroits/F984" }]
      },
      {
        name: "CAF Paris (VACAF)",
        type: "CAF",
        amount: "Variable",
        description: "Aides vacances AVE/AVF selon QF",
        eligibility: "Allocataires CAF 75 selon QF",
        links: [{ label: "CAF.fr", url: "https://www.caf.fr" }]
      },
      {
        name: "Départ 18:25",
        type: "Nationale",
        amount: "≈200€",
        description: "≈200 € pour séjours vacances (ANCV)",
        eligibility: "Jeunes 18–25 ans, conditions revenus/statut",
        links: [{ label: "ANCV", url: "https://www.ancv.com" }]
      }
    ]
  }
};

const NATIONAL_AIDS: Aid[] = [
  {
    name: "Pass'Sport",
    type: "Nationale",
    amount: "70€",
    description: "70 € sur ma licence sportive",
    eligibility: "Enfants 6-18 ans, allocataires AAH, ARS ou AEEH",
    links: [
      { label: "Service-Public", url: "https://www.service-public.fr/particuliers/vosdroits/F35915" },
      { label: "Sports.gouv.fr", url: "https://www.sports.gouv.fr/pass-sport" }
    ]
  },
  {
    name: "Départ 18:25",
    type: "Nationale",
    amount: "≈200€",
    description: "Aide pour séjours vacances (ANCV)",
    eligibility: "Jeunes 18–25 ans, sous conditions"
  }
];

const getTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "nationale":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "régionale":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "département":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "locale":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case "caf":
      return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200";
    case "mobilité":
      return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  }
};

const Aides = () => {
  const navigate = useNavigate();

  // Récupérer le territoire de l'utilisateur (avec mapping automatique)
  const { data: userTerritory, isLoading } = useUserTerritory();

  // Sélectionner les aides du territoire ou null si non configuré
  const territoryKey = userTerritory?.key;
  const territoryAids = territoryKey ? TERRITORY_AIDS[territoryKey] : null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="border-b bg-card">
        <div className="container flex items-center gap-4 py-4">
          <BackButton fallback="/" />
          <div>
            <h1 className="text-xl font-semibold">Aides Financières</h1>
          </div>
        </div>
      </header>
      
      <div className="container py-6 space-y-6">
        {/* Intro */}
        <div>
          <h2 className="text-2xl font-bold mb-2">💰 Jusqu'à 80% de réduction sur vos activités</h2>
          <p className="text-muted-foreground">
            Découvrez les aides disponibles pour financer les activités de vos enfants
          </p>
        </div>

        {/* Territory indicator */}
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-48" />
          </div>
        ) : territoryAids ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AppIcon Icon={MapPin} size="xs" color="muted" data-testid="icon-aide-territory" />
            <span>Territoire : <strong>{territoryAids.label}</strong></span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AppIcon Icon={MapPin} size="xs" color="muted" data-testid="icon-aide-territory" />
            <span>Aides nationales disponibles</span>
          </div>
        )}

        {/* Simulator CTA */}
        <Card className="bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AppIcon Icon={Calculator} size="sm" color="default" data-testid="icon-aide-calculator" />
              Simulateur d'aides
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Estimez le montant des aides auxquelles vous avez droit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Le simulateur calcule votre reste à charge en fonction de l'activité, de votre territoire et des aides disponibles.
            </p>
            <Button 
              onClick={() => navigate('/aides/simulateur')} 
              variant="secondary" 
              className="bg-white text-primary hover:bg-white/90"
            >
              <AppIcon Icon={Calculator} size="xs" color="primary" className="mr-2" />
              Lancer la simulation
            </Button>
          </CardContent>
        </Card>

        {/* Aides list */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            {territoryAids ? `Aides disponibles à ${territoryAids.city}` : "Aides nationales"}
          </h2>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {(territoryAids?.aides || NATIONAL_AIDS).map((aide, index) => (
                <Card key={`${aide.name}-${index}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-base">{aide.name}</CardTitle>
                          <Badge className={getTypeColor(aide.type)} variant="secondary">
                            {aide.type}
                          </Badge>
                        </div>
                        <CardDescription className="mt-1">{aide.description}</CardDescription>
                        {aide.validity && (
                          <p className="text-xs text-muted-foreground">
                            Validité : {aide.validity}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="ml-2 shrink-0 text-base font-semibold">
                        {aide.amount}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <AppIcon Icon={HelpCircle} size="xs" color="muted" className="shrink-0 mt-0.5" data-testid="icon-aide-eligibility" />
                      <span><strong>Éligibilité :</strong> {aide.eligibility}</span>
                    </div>
                    {aide.links && aide.links.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Sources officielles :</p>
                        <div className="flex flex-wrap gap-2">
                          {aide.links.map((link, idx) => (
                            <a
                              key={`${link.url}-${idx}`}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              {link.label}
                              <AppIcon Icon={ExternalLink} size="xs" color="primary" data-testid="icon-aide-lien" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>

        {/* Note mobilité */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Bon à savoir :</strong> Le simulateur prend en compte les aides financières et, à l'avenir, intégrera également les solutions de mobilité pour accéder aux activités.
            </p>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Questions fréquentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">Comment bénéficier des aides ?</h3>
              <p className="text-sm text-muted-foreground">
                Les aides sont automatiquement calculées lors de votre réservation en fonction de votre quotient familial et de votre territoire.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Puis-je cumuler plusieurs aides ?</h3>
              <p className="text-sm text-muted-foreground">
                Oui, certaines aides sont cumulables. Le simulateur vous indiquera automatiquement les combinaisons possibles selon votre situation.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Et si mon territoire n'est pas encore couvert ?</h3>
              <p className="text-sm text-muted-foreground">
                Les aides nationales restent accessibles partout en France. Nous travaillons à l'ajout de nouveaux territoires régulièrement.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Aides;
