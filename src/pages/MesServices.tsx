import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Phone, Clock, MapPin, Info } from "lucide-react";

const MesServices = () => {
  const services = [
    {
      id: "ville_saint_etienne",
      title: "Ville de Saint-Étienne – Mairie",
      description: "Pour les démarches liées à l'état civil, aux inscriptions scolaires, aux services enfance/jeunesse et à la vie sportive et associative.",
      cards: [
        {
          label: "Hôtel de Ville",
          adresse: "Place de l'Hôtel-de-Ville, 42000 Saint-Étienne",
          telephone: "04 77 48 77 48",
          horaires: [
            "Lundi : 08h45 – 17h00",
            "Mardi : 08h45 – 18h00",
            "Mercredi : 08h45 – 17h00",
            "Jeudi : 08h45 – 17h00",
            "Vendredi : 08h45 – 16h30"
          ],
          infos_plus: [
            "Accueil principal de la ville.",
            "Renseignements généraux, orientation vers les services enfance, sport, jeunesse et associations."
          ]
        }
      ]
    },
    {
      id: "saint_etienne_metropole",
      title: "Saint-Étienne Métropole",
      description: "La métropole coordonne une partie des politiques de mobilité, de culture, de sport et de solidarités sur l'agglomération.",
      cards: [
        {
          label: "Accueil Saint-Étienne Métropole",
          adresse: "2 avenue Grüner, CS 80257, 42006 Saint-Étienne Cedex 1",
          telephone: "04 77 49 21 49",
          horaires: [
            "Du lundi au vendredi : 08h00 – 17h00"
          ],
          infos_plus: [
            "Renseignements sur les politiques métropolitaines (mobilité, culture, sport, aménagement du territoire).",
            "Peut orienter vers les bons interlocuteurs selon le projet ou la question."
          ]
        }
      ]
    },
    {
      id: "caf_loire",
      title: "CAF de la Loire – Aides familles",
      description: "Pour les questions de prestations familiales, de quotient familial et des aides mobilisables pour les activités de vos enfants.",
      cards: [
        {
          label: "CAF de la Loire – Saint-Étienne (siège et accueil)",
          adresse: "26 boulevard Dalgabio, 42000 Saint-Étienne (accueil principal)",
          telephone_plateforme: "32 30 (depuis la France métropolitaine)",
          horaires_plateforme: [
            "Du lundi au vendredi : environ 09h00 – 16h30 (amplitude susceptible d'évoluer selon l'affluence)"
          ],
          remarques_horaires: [
            "Les horaires d'ouverture au public peuvent varier selon les jours et les points d'accueil.",
            "Il est recommandé de vérifier les horaires précis et, si possible, de privilégier les créneaux de moindre affluence."
          ],
          infos_plus: [
            "La CAF calcule votre quotient familial.",
            "Ce quotient est souvent utilisé pour déterminer les tarifs des activités, des centres de loisirs et certaines aides locales.",
            "Pensez à garder à jour vos informations de situation (enfants, revenus) pour des droits calculés au plus juste."
          ]
        }
      ]
    },
    {
      id: "transports_stas",
      title: "Transports en commun – STAS",
      description: "Pour les déplacements en tram, bus ou services spécifiques sur Saint-Étienne Métropole.",
      cards: [
        {
          label: "Réseau STAS – Informations et objets trouvés",
          telephone_service_infos: "0 800 041 042 (service et appel gratuits)",
          horaires_service_infos: [
            "Du lundi au vendredi : 09h00 – 12h30 et 14h30 – 18h30"
          ],
          infos_plus: [
            "Renseignements sur les lignes tram et bus, les horaires et les titres de transport.",
            "Service de renseignements et d’aide pour certaines réservations (transport adapté, questions pratiques).",
            "En cas d’objet perdu dans un tram ou un bus, le service objets trouvés est joignable aux mêmes coordonnées."
          ]
        }
      ]
    },
    {
      id: "velivert_velos",
      title: "Vélos en libre-service – Vélivert",
      description: "Pour vos trajets à vélo en ville ou entre communes de la métropole.",
      cards: [
        {
          label: "Agence Vélivert",
          adresse: "Rue Jacques Constant Milleret, 42100 Saint-Étienne",
          telephone: "04 77 37 18 36",
          horaires: [
            "Du lundi au jeudi : 08h30 – 12h30 et 13h30 – 17h00",
            "Le vendredi : 09h00 – 12h30 et 13h30 – 17h00"
          ],
          infos_plus: [
            "Service de vélos en libre-service et de location longue durée.",
            "Vélos 100 % électriques pour les trajets urbains et interurbains.",
            "Pratique pour rejoindre une activité sans voiture tout en faisant un peu d'activité physique."
          ]
        }
      ]
    },
    {
      id: "repères_familles",
      title: "Repères familles & loisirs",
      description: "Quelques repères utiles pour trouver des activités et des lieux adaptés aux enfants, aux ados et aux familles.",
      cards: [
        {
          label: "Médiathèques et bibliothèques",
          infos_plus: [
            "Réseau de médiathèques et bibliothèques municipales réparties dans plusieurs quartiers de Saint-Étienne.",
            "Proposent régulièrement des animations jeunesse (heures du conte, ateliers, jeux, numérique).",
            "Horaires et programmes variables selon l'établissement."
          ]
        },
        {
          label: "Maisons de quartier et centres sociaux",
          infos_plus: [
            "Présents dans plusieurs quartiers de la ville.",
            "Organisent des activités de loisirs, des ateliers familles et des actions de soutien à la parentalité.",
            "Peuvent être partenaires pour des activités repérées via Flooow."
          ]
        }
      ]
    }
  ];

  return (
    <PageLayout showHeader={false}>
      <PageHeader
        title="Mes services à Saint-Étienne"
        subtitle="Les principaux contacts utiles pour vos démarches liées aux activités, aux aides et aux déplacements."
        backFallback="/ma-ville-mon-actu"
      />

      <div className="container mx-auto px-4 py-6 pb-24 max-w-[1200px]">
        <div className="space-y-8">
          {services.map((service) => (
            <section key={service.id} className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-primary">{service.title}</h2>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {service.cards.map((card, index) => (
                  <Card key={index} className="border-l-4 border-l-primary/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        {card.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                      {card.adresse && (
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <span>{card.adresse}</span>
                        </div>
                      )}
                      
                      {(card.telephone || card.telephone_plateforme || card.telephone_service_infos) && (
                        <div className="flex items-start gap-3">
                          <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div className="flex flex-col">
                            {card.telephone && <span>{card.telephone}</span>}
                            {card.telephone_plateforme && <span>Plateforme : {card.telephone_plateforme}</span>}
                            {card.telephone_service_infos && <span>Service infos : {card.telephone_service_infos}</span>}
                          </div>
                        </div>
                      )}

                      {(card.horaires || card.horaires_plateforme || card.horaires_service_infos) && (
                        <div className="flex items-start gap-3">
                          <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div className="space-y-1">
                            {(card.horaires || card.horaires_plateforme || card.horaires_service_infos)?.map((horaire: string, idx: number) => (
                              <div key={idx}>{horaire}</div>
                            ))}
                            {card.remarques_horaires && (
                              <div className="text-xs text-muted-foreground mt-1 italic">
                                {card.remarques_horaires.join(" ")}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {card.infos_plus && (
                        <div className="flex items-start gap-3 pt-2 border-t border-border/50">
                          <Info className="h-4 w-4 text-primary/60 mt-0.5 shrink-0" />
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            {card.infos_plus.map((info, idx) => (
                              <li key={idx} className="leading-relaxed">{info}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default MesServices;
