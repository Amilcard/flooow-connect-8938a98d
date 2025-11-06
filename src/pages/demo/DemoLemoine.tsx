import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, MapPin, Euro, Sparkles, CheckCircle2 } from "lucide-react";
import PageLayout from "@/components/PageLayout";

// Mock data for demo - Mme LEMOINE
const DEMO_FAMILY = {
  nom: "LEMOINE",
  prenom: "Sophie",
  ville: "Saint-Étienne",
  postal_code: "42000",
  quotient_familial: 800,
  enfants: [
    { id: "demo-emma", prenom: "Emma", age: 9, dob: "2016-06-15" },
    { id: "demo-lucas", prenom: "Lucas", age: 7, dob: "2018-03-20" }
  ]
};

const DEMO_SEJOUR = {
  id: "demo-sejour-ete",
  title: "Séjour Nature & Aventure",
  category: "Vacances",
  period: "Été 2026",
  age_min: 6,
  age_max: 10,
  price_base: 580,
  duration_days: 7,
  dates: "20-26 juillet 2026",
  lieu: "Centre Nature Le Pilat - Saint-Étienne",
  description: "Séjour de 7 jours en pleine nature : randonnées, jeux en forêt, bivouac, découverte de la faune et la flore. Encadrement diplômé 24h/24.",
  images: ["/placeholder.svg"],
  activities: ["Randonnée", "Bivouac", "Orientation", "Jeux nature", "Veillées"],
  included: ["Hébergement", "Pension complète", "Encadrement", "Matériel", "Assurance"]
};

const DEMO_AIDS = [
  { name: "Chèques Vacances ANCV", amount: 80, level: "national" },
  { name: "Bon CAF Vacances", amount: 50, level: "national" }
];

const DemoLemoine = () => {
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [showSimulation, setShowSimulation] = useState(false);
  const [showBookingConfirm, setShowBookingConfirm] = useState(false);

  const handleSimulate = () => {
    setShowSimulation(true);
    // Auto-select both children
    setSelectedChildren([DEMO_FAMILY.enfants[0].id, DEMO_FAMILY.enfants[1].id]);
  };

  const totalAidsPerChild = DEMO_AIDS.reduce((sum, aid) => sum + aid.amount, 0);
  const resteAChargePerChild = DEMO_SEJOUR.price_base - totalAidsPerChild;
  const totalFamily = selectedChildren.length * DEMO_SEJOUR.price_base;
  const totalAidsFamily = selectedChildren.length * totalAidsPerChild;
  const totalResteACharge = selectedChildren.length * resteAChargePerChild;
  const savingsPercent = Math.round((totalAidsFamily / totalFamily) * 100);

  return (
    <PageLayout showHeader={false}>
      {/* Banner DEMO */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-3 px-4">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">MODE DÉMO - Parcours Mme LEMOINE</span>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            Accès Public
          </Badge>
        </div>
      </div>

      {/* Header famille */}
      <div className="bg-card border-b">
        <div className="container py-6 px-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Bienvenue {DEMO_FAMILY.prenom} {DEMO_FAMILY.nom}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {DEMO_FAMILY.ville}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {DEMO_FAMILY.enfants.length} enfants
                </div>
                <div className="flex items-center gap-1">
                  <Euro className="w-4 h-4" />
                  QF: {DEMO_FAMILY.quotient_familial}€
                </div>
              </div>
            </div>
          </div>

          {/* Enfants */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEMO_FAMILY.enfants.map((enfant) => (
              <Card key={enfant.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{enfant.prenom}</p>
                    <p className="text-sm text-muted-foreground">{enfant.age} ans</p>
                  </div>
                  <Badge variant="outline">{enfant.age >= 6 && enfant.age <= 10 ? "Éligible" : "Non éligible"}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 space-y-8">
        {/* Section recherche */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Séjour de vacances été 2026</h2>
          
          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-[300px_1fr] gap-0">
              {/* Image */}
              <div className="bg-muted h-48 md:h-auto flex items-center justify-center">
                <img 
                  src={DEMO_SEJOUR.images[0]} 
                  alt={DEMO_SEJOUR.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Contenu */}
              <div className="p-6 space-y-4">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-2xl font-bold">{DEMO_SEJOUR.title}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge>{DEMO_SEJOUR.category}</Badge>
                        <Badge variant="outline">{DEMO_SEJOUR.age_min}-{DEMO_SEJOUR.age_max} ans</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-primary">{DEMO_SEJOUR.price_base}€</p>
                      <p className="text-sm text-muted-foreground">par enfant</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {DEMO_SEJOUR.dates}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {DEMO_SEJOUR.lieu}
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground">{DEMO_SEJOUR.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold mb-2">Activités</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {DEMO_SEJOUR.activities.map((act, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                          {act}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2">Inclus</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {DEMO_SEJOUR.included.map((inc, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                          {inc}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    size="lg" 
                    className="flex-1"
                    onClick={handleSimulate}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Calculer mes aides
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Section aides (si simulées) */}
        {showSimulation && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Vos aides financières</h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              {DEMO_AIDS.map((aid, idx) => (
                <Card key={idx} className="p-4">
                  <p className="font-semibold text-sm mb-1">{aid.name}</p>
                  <p className="text-2xl font-bold text-primary">{aid.amount}€</p>
                  <Badge variant="outline" className="mt-2 text-xs">{aid.level}</Badge>
                </Card>
              ))}
              
              <Card className="p-4 bg-primary text-primary-foreground">
                <p className="font-semibold text-sm mb-1">Reste à charge</p>
                <p className="text-2xl font-bold">{resteAChargePerChild}€</p>
                <p className="text-xs mt-2 opacity-90">par enfant</p>
              </Card>
            </div>

            {/* Synthèse famille */}
            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Coût total famille</p>
                  <p className="text-3xl font-bold">{totalResteACharge}€</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    au lieu de {totalFamily}€
                  </p>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-600 text-white text-lg px-4 py-2">
                    -{savingsPercent}%
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    Économie: {totalAidsFamily}€
                  </p>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => setShowBookingConfirm(true)}
              >
                Réserver pour {selectedChildren.length} enfant{selectedChildren.length > 1 ? 's' : ''}
              </Button>
            </Card>
          </div>
        )}

        {/* Confirmation réservation */}
        {showBookingConfirm && (
          <Card className="p-6 border-2 border-primary">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg mb-2">Réservation confirmée !</h3>
                <p className="text-muted-foreground mb-4">
                  Vos {selectedChildren.length} enfant{selectedChildren.length > 1 ? 's sont inscrits' : ' est inscrit'} au séjour "{DEMO_SEJOUR.title}".
                  Vous recevrez un email de confirmation avec tous les détails.
                </p>
                <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Enfants inscrits:</span>
                    <span className="font-semibold">{selectedChildren.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Aides mobilisées:</span>
                    <span className="font-semibold text-green-600">-{totalAidsFamily}€</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>À payer:</span>
                    <span className="text-primary">{totalResteACharge}€</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Info démo */}
        <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200">
          <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
            💡 Mode démonstration
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Ce parcours illustre comment une famille peut facilement trouver un séjour de vacances, 
            calculer automatiquement les aides financières disponibles et réduire significativement 
            le coût grâce aux dispositifs nationaux (Chèques Vacances, CAF). 
            Dans le cas de Mme LEMOINE, ses deux enfants peuvent partir en séjour pour {totalResteACharge}€ 
            au lieu de {totalFamily}€, soit une économie de {savingsPercent}%.
          </p>
        </Card>
      </div>
    </PageLayout>
  );
};

export default DemoLemoine;
