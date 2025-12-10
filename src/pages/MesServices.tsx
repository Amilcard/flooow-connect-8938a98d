import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Phone, Clock, MapPin, Info } from "lucide-react";

const MesServices = () => {
  const services = [
    {
      id: "aides_familiales",
      title: "Où parler de mes aides familiales ?",
      description: "Allocations, quotient familial, aides vacances... L'organisme dédié répond à vos questions.",
      cards: [
        {
          label: "Caisse d'Allocations Familiales",
          adresse: "26 boulevard Dalgabio, 42000 Saint-Étienne",
          telephone: "32 30",
          horaires: ["Du lundi au vendredi : 09h00 – 16h30"],
          infos_plus: [
            "Calcul du quotient familial",
            "Aides vacances, prestations familiales",
            "Pensez à mettre à jour votre situation régulièrement"
          ]
        }
      ]
    },
    {
      id: "transports",
      title: "Où poser une question sur les transports ?",
      description: "Bus, tram, tarifs réduits, objets trouvés... Le réseau de transport vous renseigne.",
      cards: [
        {
          label: "Réseau de transport métropolitain",
          telephone: "0 800 041 042 (gratuit)",
          horaires: ["Du lundi au vendredi : 09h00 – 12h30 et 14h30 – 18h30"],
          infos_plus: [
            "Lignes, horaires, titres de transport",
            "Transport adapté",
            "Service objets trouvés"
          ]
        }
      ]
    },
    {
      id: "activites_jeunesse",
      title: "Où m'orienter sur les activités jeunesse ?",
      description: "Inscriptions, Pass'Sport, clubs locaux... Le service jeunesse vous accompagne.",
      cards: [
        {
          label: "Accueil principal de la ville",
          adresse: "Place de l'Hôtel-de-Ville, 42000 Saint-Étienne",
          telephone: "04 77 48 77 48",
          horaires: [
            "Lundi-Mercredi-Jeudi : 08h45 – 17h00",
            "Mardi : 08h45 – 18h00",
            "Vendredi : 08h45 – 16h30"
          ],
          infos_plus: [
            "Orientation vers services enfance, sport, jeunesse",
            "Inscriptions scolaires et périscolaires"
          ]
        }
      ]
    },
    {
      id: "velos",
      title: "Où louer un vélo ?",
      description: "Vélos en libre-service et location longue durée pour vos trajets quotidiens.",
      cards: [
        {
          label: "Service vélos en libre-service",
          adresse: "Rue Jacques Constant Milleret, 42100 Saint-Étienne",
          telephone: "04 77 37 18 36",
          horaires: [
            "Lundi-Jeudi : 08h30 – 12h30 et 13h30 – 17h30",
            "Vendredi : 09h00 – 12h30 et 13h30 – 17h00"
          ],
          infos_plus: [
            "Vélos classiques et électriques",
            "Trajets urbains et interurbains"
          ]
        }
      ]
    },
    {
      id: "handicap",
      title: "Où trouver de l'aide pour le handicap ?",
      description: "Droits, accompagnement, aménagements... L'organisme départemental vous guide.",
      cards: [
        {
          label: "Service départemental handicap",
          telephone: "04 77 49 91 91",
          horaires: ["Du lundi au vendredi : 08h30 – 12h00 et 13h30 – 17h00"],
          infos_plus: [
            "Droits et prestations",
            "Accompagnement personnalisé",
            "Aménagements et aides techniques"
          ]
        }
      ]
    }
  ];

  return (
    <PageLayout showHeader={false}>
      <PageHeader
        title="Mes dossiers"
        subtitle="Les contacts utiles pour vos démarches liées aux activités, aux aides et aux déplacements."
        backFallback="/home"
      />
      
      <div className="max-w-[1200px] mx-auto px-4 py-8 space-y-8">
        {services.map((service) => (
          <section key={service.id} className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">{service.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {service.cards.map((card, idx) => (
                <Card key={idx} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      {card.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {card.adresse && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{card.adresse}</span>
                      </div>
                    )}
                    {card.telephone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{card.telephone}</span>
                      </div>
                    )}
                    {card.horaires && (
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="space-y-0.5">
                          {card.horaires.map((h, i) => (
                            <p key={i}>{h}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {card.infos_plus && (
                      <div className="flex items-start gap-2 pt-2 border-t">
                        <Info className="h-4 w-4 text-primary mt-0.5" />
                        <ul className="space-y-1">
                          {card.infos_plus.map((info, i) => (
                            <li key={i} className="text-muted-foreground">{info}</li>
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
    </PageLayout>
  );
};

export default MesServices;
