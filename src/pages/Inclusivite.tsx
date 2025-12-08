import { useNavigate } from "react-router-dom";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, Info, ExternalLink } from "lucide-react";
import { BackButton } from "@/components/BackButton";

const Inclusivite = () => {
  const navigate = useNavigate();
  
  const inclusiveServices = [
    {
      name: "Handi'Stas",
      description: "Service de transport porte-à-porte métropolitain pour personnes à mobilité réduite",
      icon: <Heart className="w-5 h-5" />,
      eligibility: "Personnes à mobilité réduite résidant dans la métropole",
      cta: "Demander Handi'Stas",
      links: [
        { label: "Réseau STAS", url: "https://www.reseau-stas.fr" }
      ]
    },
    {
      name: "Clubs & Événements inclusifs",
      description: "Sport adapté et programme 'Ville en partage'",
      icon: <Users className="w-5 h-5" />,
      eligibility: "Tous publics, avec ou sans handicap",
      cta: "Découvrir les clubs",
      links: [
        { label: "Service-Public", url: "https://www.service-public.fr/particuliers/vosdroits/F15066" }
      ]
    },
    {
      name: "Participer à la Ville inclusive",
      description: "Ressources et droits pour l'accessibilité et l'inclusion",
      icon: <Info className="w-5 h-5" />,
      eligibility: "Tous les citoyens",
      cta: "Consulter les ressources",
      links: [
        { label: "Service-Public", url: "https://www.service-public.fr/particuliers/vosdroits/F15066" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="border-b bg-card">
        <div className="container flex items-center gap-4 py-4">
          <BackButton positioning="relative" size="sm" showText={true} label="Retour" fallback="/" />
          <div>
            <h1 className="text-xl font-semibold">Inclusivité & Accessibilité</h1>
          </div>
        </div>
      </header>
      
      <div className="container py-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Une ville pour tous</h2>
          <p className="text-muted-foreground">
            Services et activités adaptés pour tous les enfants
          </p>
        </div>

        {/* Hero message */}
        <Card className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/20 dark:to-rose-900/20 border-rose-200 dark:border-rose-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              Notre engagement pour l'inclusion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80">
              Chaque enfant a le droit de participer pleinement à la vie de la cité. 
              Découvrez les services et activités qui rendent cela possible.
            </p>
          </CardContent>
        </Card>

        {/* Services */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Services disponibles</h2>
          
          {inclusiveServices.map((service) => (
            <Card key={service.name}>
              <CardHeader>
                <div className="flex gap-3">
                  <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg shrink-0">
                    {service.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{service.name}</CardTitle>
                    <CardDescription className="mt-1">{service.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Qui peut en bénéficier :</span> {service.eligibility}
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    if (service.links && service.links.length > 0) {
                      window.open(service.links[0].url, "_blank");
                    }
                  }}
                >
                  {service.cta}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>

                {service.links && service.links.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Plus d'informations :</p>
                    <div className="flex flex-wrap gap-2">
                      {service.links.map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          {link.label}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Besoin d'aide ?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              Pour toute question sur l'accessibilité des activités ou pour signaler 
              un besoin particulier, contactez notre équipe support.
            </p>
            <Button variant="outline" onClick={() => window.location.href = "/support"}>
              Contacter le support
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Inclusivite;