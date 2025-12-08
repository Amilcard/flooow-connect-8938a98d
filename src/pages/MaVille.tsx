import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Phone,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin
} from "lucide-react";

/**
 * Page "Notre ville, nos actus"
 * Ton CityCrunch + ON • Sérieux et léger • Agile • Family Flooow
 * Route: /ma-ville
 */

// Types
interface Alerte {
  id: string;
  type: 'inscription' | 'aide' | 'alerte' | 'evenement';
  texte: string;
  cta?: string;
  ctaAction?: string;
  niveau: 'urgent' | 'info';
}

interface Actu {
  id: string;
  type: 'evenement' | 'nouveaute' | 'actualite';
  badge: string;
  badgeCouleur: string;
  titre: string;
  description: string;
  date?: string;
  lieu?: string;
  photo?: string;
  ctaTexte: string;
  ctaAction: string;
}

interface Contact {
  id: string;
  nom: string;
  categorie: string;
  telephone: string;
  siteWeb?: string;
  horaires: string;
  services: string[];
  infoComplementaire: string;
  couleur: string;
}

interface Structure {
  id: string;
  nom: string;
  categorie: string;
  telephone: string;
  badgeSolidaire: boolean;
  lienActivites: string;
  lienDon?: string;
  infosSolidaire?: string[];
}

const MaVille = () => {
  const navigate = useNavigate();
  const [currentAlerte, setCurrentAlerte] = useState(0);
  const [expandedContacts, setExpandedContacts] = useState<string[]>([]);

  // ========== DONNÉES ALERTES URGENTES ==========
  const alertes: Alerte[] = [
    {
      id: "1",
      type: "inscription",
      texte: "Centres loisirs été. On s'inscrit. Deadline : 15 déc.",
      cta: "Voir",
      ctaAction: "/activities?type=vacances",
      niveau: "urgent"
    },
    {
      id: "2",
      type: "aide",
      texte: "Pass'Sport 50€. On y a droit. Deadline : 30 nov.",
      cta: "Simuler",
      ctaAction: "/aides",
      niveau: "urgent"
    }
  ];

  // ========== DONNÉES ACTUS & AGENDA ==========
  const actus: Actu[] = [
    {
      id: "1",
      type: "evenement",
      badge: "À venir",
      badgeCouleur: "bg-blue-100 text-blue-700",
      titre: "ASSE vs Clermont. On y va en famille.",
      description: "Tarif famille. Ambiance garantie. Dim 1 déc, 17h.",
      lieu: "Stade Geoffroy-Guichard",
      date: "2025-12-01",
      ctaTexte: "Voir",
      ctaAction: "/activities/asse-match"
    },
    {
      id: "2",
      type: "nouveaute",
      badge: "Nouveau",
      badgeCouleur: "bg-green-100 text-green-700",
      titre: "Nouvelle salle hip-hop Beaulieu. Ça ouvre en janvier.",
      description: "Cours dès 4 ans. On s'inscrit maintenant.",
      ctaTexte: "S'inscrire",
      ctaAction: "/activities?search=hip-hop"
    },
    {
      id: "3",
      type: "actualite",
      badge: "Info",
      badgeCouleur: "bg-orange-100 text-orange-700",
      titre: "Pass'Sport 2026. On vérifie nos droits.",
      description: "50€ d'aide sport. Nouvelles conditions. On simule.",
      ctaTexte: "Simuler",
      ctaAction: "/aides"
    }
  ];

  // ========== DONNÉES CONTACTS UTILES ==========
  const contacts: Contact[] = [
    {
      id: "1",
      nom: "CAF Loire",
      categorie: "Aides sociales",
      telephone: "08 10 25 42 00",
      siteWeb: "https://www.caf.fr",
      horaires: "Lun-Ven 9h-16h30",
      services: ["Aides logement", "Allocations familiales", "Prime activité", "RSA"],
      infoComplementaire: "On simule nos aides sur Flooow d'abord.",
      couleur: "green"
    },
    {
      id: "2",
      nom: "Mairie Saint-Étienne",
      categorie: "Administration",
      telephone: "04 77 49 21 21",
      siteWeb: "https://www.saint-etienne.fr",
      horaires: "Lun-Ven 8h30-17h",
      services: ["Inscriptions scolaires", "État civil", "Services quartier", "Démarches en ligne"],
      infoComplementaire: "Guichets dans nos quartiers.",
      couleur: "blue"
    },
    {
      id: "3",
      nom: "STAS (Transports)",
      categorie: "Mobilité",
      telephone: "0800 882 224",
      siteWeb: "https://www.reseau-stas.fr",
      horaires: "Lun-Sam 7h-19h",
      services: ["Infos trafic temps réel", "Horaires lignes", "Tarifs sociaux", "Lignes scolaires"],
      infoComplementaire: "On pense planète et santé. On prend le bus.",
      couleur: "orange"
    },
    {
      id: "4",
      nom: "Bibliothèques municipales",
      categorie: "Culture",
      telephone: "04 77 34 45 67",
      siteWeb: "https://mediatheques.saint-etienne.fr",
      horaires: "Variables selon lieu",
      services: ["12 médiathèques", "Inscription gratuite", "Espace jeunesse", "Animations famille"],
      infoComplementaire: "On lit, on apprend, on se cultive.",
      couleur: "purple"
    }
  ];

  // ========== DONNÉES STRUCTURES LOCALES ==========
  const structures: Structure[] = [
    {
      id: "1",
      nom: "MJC Beaulieu",
      categorie: "MJC",
      telephone: "04 77 80 XX XX",
      badgeSolidaire: true,
      lienActivites: "/activities?organizer=mjc-beaulieu",
      lienDon: "https://helloasso.com/mjc-beaulieu",
      infosSolidaire: ["Tarifs selon QF", "Paiement 3x sans frais", "Prêt judogi gratuit"]
    },
    {
      id: "2",
      nom: "Gymnase Municipal",
      categorie: "Sport",
      telephone: "04 77 49 XX XX",
      badgeSolidaire: false,
      lienActivites: "/activities?organizer=gymnase-municipal"
    }
  ];

  // ========== GESTION ROTATION ALERTES ==========
  const nextAlerte = () => {
    setCurrentAlerte((prev) => (prev + 1) % alertes.length);
  };

  // ========== GESTION EXPANSION CONTACTS ==========
  const toggleContact = (id: string) => {
    setExpandedContacts((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  // ========== GESTION APPEL TÉLÉPHONE ==========
  const handlePhoneCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  // ========== GESTION LIEN EXTERNE ==========
  const handleExternalLink = (url: string, nom: string) => {
    if (window.confirm(`On ouvre le site de ${nom}. OK ?`)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <PageLayout showHeader={false}>
      <PageHeader
        title="Notre ville, nos actus"
        subtitle="Actus, agenda, contacts. On y est."
        backFallback="/home"
      />

      <div className="min-h-screen bg-background pb-24">

        <div className="container max-w-[1200px] mx-auto px-4 py-6 space-y-8">
          {/* ========== SECTION 1: ALERTES URGENTES ========== */}
          {alertes.length > 0 && (
            <div className="relative">
              <div
                className={`rounded-lg p-4 ${
                  alertes[currentAlerte].niveau === 'urgent'
                    ? 'bg-orange-50 border-2 border-orange-300'
                    : 'bg-blue-50 border-2 border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium flex-1">
                    {alertes[currentAlerte].texte}
                  </p>
                  {alertes[currentAlerte].cta && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => navigate(alertes[currentAlerte].ctaAction!)}
                    >
                      {alertes[currentAlerte].cta}
                    </Button>
                  )}
                </div>
                {alertes.length > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-3">
                    {alertes.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentAlerte(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentAlerte ? 'bg-orange-500 w-6' : 'bg-gray-300'
                        }`}
                        aria-label={`Alerte ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========== SECTION 2: ACTUS & AGENDA ========== */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Mon actu & Agenda</h2>
              <p className="text-sm text-muted-foreground">Événements, nouveautés, infos du territoire.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {actus.map((actu) => (
                <Card key={actu.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge className={`${actu.badgeCouleur} text-xs`}>{actu.badge}</Badge>
                    </div>
                    <CardTitle className="text-base leading-tight">{actu.titre}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{actu.description}</p>
                    {actu.lieu && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{actu.lieu}</span>
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(actu.ctaAction)}
                    >
                      {actu.ctaTexte}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* ========== SECTION 3: CONTACTS UTILES ========== */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Nos contacts utiles</h2>
              <p className="text-sm text-muted-foreground">On appelle direct.</p>
            </div>

            <div className="space-y-3">
              {contacts.map((contact) => (
                <Card key={contact.id} className="overflow-hidden">
                  <button
                    onClick={() => toggleContact(contact.id)}
                    className="w-full text-left"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{contact.nom}</CardTitle>
                          <p className="text-sm text-muted-foreground">{contact.categorie}</p>
                        </div>
                        {expandedContacts.includes(contact.id) ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </CardHeader>
                  </button>

                  {expandedContacts.includes(contact.id) && (
                    <CardContent className="pt-0 space-y-3">
                      {/* Téléphone */}
                      <button
                        onClick={() => handlePhoneCall(contact.telephone)}
                        className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                      >
                        <Phone className="h-4 w-4" />
                        {contact.telephone}
                      </button>

                      {/* Horaires */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {contact.horaires}
                      </div>

                      {/* Site web */}
                      {contact.siteWeb && (
                        <button
                          onClick={() => handleExternalLink(contact.siteWeb!, contact.nom)}
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Site web
                        </button>
                      )}

                      {/* Services */}
                      <div className="space-y-1">
                        <p className="text-xs font-medium">Services :</p>
                        <div className="flex flex-wrap gap-1">
                          {contact.services.map((service, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Info complémentaire */}
                      <p className="text-xs text-muted-foreground italic">
                        {contact.infoComplementaire}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </section>

          {/* ========== SECTION 4: ANNUAIRE STRUCTURES ========== */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Nos structures locales</h2>
              <p className="text-sm text-muted-foreground">Centres sociaux, MJC, assos. On les connaît.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {structures.map((structure) => (
                <Card key={structure.id}>
                  <CardHeader className="pb-3">
                    <div className="space-y-2">
                      <CardTitle className="text-base">{structure.nom}</CardTitle>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {structure.categorie}
                        </Badge>
                        {structure.badgeSolidaire && (
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            🤝 Club Solidaire
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Téléphone */}
                    <button
                      onClick={() => handlePhoneCall(structure.telephone)}
                      className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                      <Phone className="h-4 w-4" />
                      {structure.telephone}
                    </button>

                    {/* Infos solidaires */}
                    {structure.badgeSolidaire && structure.infosSolidaire && (
                      <div className="text-xs text-muted-foreground space-y-1">
                        {structure.infosSolidaire.map((info, idx) => (
                          <div key={idx} className="flex items-start gap-1">
                            <span className="text-green-600">•</span>
                            <span>{info}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(structure.lienActivites)}
                        className="w-full"
                      >
                        Voir activités
                      </Button>
                      {structure.lienDon && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleExternalLink(structure.lienDon!, structure.nom)}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          💝 On soutient
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* ========== SECTION 5: CTA CONTRIBUTION ========== */}
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6 text-center space-y-3">
              <h3 className="text-lg font-semibold">Votre actu manque ?</h3>
              <p className="text-sm text-muted-foreground">
                Assos, clubs, structures. On propose nos actus.
              </p>
              <Button
                onClick={() => navigate("/contribuer-actualite")}
                className="bg-primary hover:bg-primary/90"
              >
                Proposer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default MaVille;
