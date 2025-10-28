import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Users, TrendingUp, Heart, MapPin, Euro, Leaf, LineChart, Mail, Phone, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const Collectivites = () => {
  const stats = [
    { label: "Familles accompagnées", value: "2 500+", icon: Users },
    { label: "Structures partenaires", value: "150+", icon: MapPin },
    { label: "Aides distribuées", value: "180K€", icon: Euro },
    { label: "Réduction CO2", value: "12T", icon: Leaf }
  ];

  const benefits = [
    {
      title: "Pilotage local intelligent",
      description: "Tableaux de bord en temps réel pour suivre l'impact de vos politiques publiques locales.",
      icon: LineChart
    },
    {
      title: "Aides financières automatisées",
      description: "Calcul et attribution automatique des aides selon les critères d'éligibilité. Simplification administrative.",
      icon: Euro
    },
    {
      title: "Éco-mobilité intégrée",
      description: "Calcul d'empreinte carbone, suggestions de covoiturage, itinéraires bas-carbone pour chaque activité.",
      icon: Leaf
    },
    {
      title: "Inclusion & mixité sociale",
      description: "Accès facilité pour familles QPV, personnes en situation de handicap, avec suivi des indicateurs d'inclusion.",
      icon: Heart
    }
  ];

  const pricingPlans = [
    {
      name: "Découverte",
      price: "Gratuit",
      duration: "3 mois",
      features: [
        "Accès démo complet",
        "Dashboard collectivité",
        "50 inscriptions test",
        "Support email"
      ]
    },
    {
      name: "Territoire",
      price: "990€",
      duration: "/mois",
      popular: true,
      features: [
        "Dashboard collectivité complet",
        "Inscriptions illimitées",
        "Gestion des aides financières",
        "Rapports mensuels",
        "Éco-mobilité incluse",
        "Support prioritaire",
        "Formation des équipes"
      ]
    },
    {
      name: "Métropole",
      price: "Sur mesure",
      duration: "",
      features: [
        "Multi-territoires",
        "API & intégrations",
        "Personnalisation avancée",
        "Accompagnement dédié",
        "Reporting sur mesure",
        "SLA garantis"
      ]
    }
  ];

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-subtle py-20 md:py-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Pilotez l'accès aux activités <span className="text-primary">de votre territoire</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Une plateforme complète pour les collectivités : pilotage en temps réel, 
              automatisation des aides financières, éco-mobilité et inclusion sociale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild>
                <Link to="/demo-dashboard">
                  Voir la démo
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/contact">
                  Prendre contact
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6 space-y-2">
                    <Icon className="w-8 h-8 mx-auto text-primary" />
                    <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Les plus-values pour votre territoire
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Une solution complète qui répond aux enjeux actuels des politiques publiques locales
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="hover:shadow-elegant transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl mb-2">{benefit.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Grille tarifaire
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Des offres adaptées à la taille et aux besoins de votre collectivité
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-primary shadow-elegant-xl' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Recommandé
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    {plan.duration && <span className="text-muted-foreground">{plan.duration}</span>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link to="/contact">
                      {plan.price === "Gratuit" ? "Démarrer l'essai" : "Nous contacter"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo & Contact Section */}
      <section className="py-20">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="bg-gradient-accent text-white">
              <CardHeader>
                <Calendar className="w-12 h-12 mb-4 opacity-90" />
                <CardTitle className="text-2xl text-white">Demander une démo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/90">
                  Découvrez en 30 minutes comment Flooow peut transformer la gestion 
                  des activités sur votre territoire.
                </p>
                <Button variant="secondary" size="lg" asChild>
                  <Link to="/demo-dashboard">
                    Voir la démo interactive
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Mail className="w-12 h-12 mb-4 text-primary" />
                <CardTitle className="text-2xl">Nous contacter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Notre équipe est à votre disposition pour répondre à vos questions 
                  et vous accompagner dans votre projet.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <a href="mailto:collectivites@flooow.site" className="hover:text-primary transition-colors">
                      collectivites@flooow.site
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    <a href="tel:+33123456789" className="hover:text-primary transition-colors">
                      01 23 45 67 89
                    </a>
                  </div>
                </div>
                <Button variant="outline" size="lg" className="w-full" asChild>
                  <Link to="/contact">
                    Envoyer un message
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-card">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold text-foreground">
              Rejoignez les collectivités qui font confiance à Flooow
            </h2>
            <p className="text-xl text-muted-foreground">
              Plus de 15 territoires pilotent déjà leurs politiques jeunesse avec notre plateforme.
            </p>
            <Button size="lg" asChild>
              <Link to="/contact">
                Commencer maintenant
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Collectivites;
