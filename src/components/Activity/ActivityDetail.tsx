import { ArrowLeft, Calendar, Users, MapPin, Info, FileText, Car, Accessibility, CreditCard, AlertCircle } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ActivityDetailProps {
  activity: {
    id: string;
    title: string;
    category: string;
    description: string;
    images: string[];
    video_url?: string;
    age_min: number;
    age_max: number;
    price_base: number;
    price_note?: string;
    structure: {
      name: string;
      address: string;
      contact_json: {
        email: string;
        phone: string;
      };
    };
    accepts_aid_types: string[];
    payment_echelonned: boolean;
    payment_plans: Array<{
      name: string;
      installments: number;
      description: string;
    }>;
    covoiturage_enabled: boolean;
    transport_options: Array<{
      type: string;
      details: string;
    }>;
    accessibility_checklist: {
      pmr_access: boolean;
      adapted_equipment: boolean;
      specialized_staff: boolean;
      sensory_friendly: boolean;
    };
    documents_required: Array<{
      key: string;
      mandatory: boolean;
      label: string;
    }>;
    capacity_policy: {
      seats_total: number;
      seats_remaining: number;
      waitlist_enabled: boolean;
    };
    slots?: Array<{
      id: string;
      start: string;
      end: string;
      seats_remaining: number;
    }>;
  };
  onBack?: () => void;
  onEnroll?: () => void;
}

export const ActivityDetail = ({ activity, onBack, onEnroll }: ActivityDetailProps) => {
  const hasAids = activity.accepts_aid_types.length > 0;
  const mandatoryDocs = activity.documents_required.filter(d => d.mandatory);
  const optionalDocs = activity.documents_required.filter(d => !d.mandatory);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with back button */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container px-4 py-3 flex items-center gap-3">
          <BackButton
            positioning="relative"
            size="icon"
            className="rounded-full"
          />
          <h1 className="text-lg font-semibold line-clamp-1">{activity.title}</h1>
        </div>
      </header>

      {/* Image Gallery Carousel */}
      <section className="relative" aria-label="Galerie photos">
        <Carousel className="w-full">
          <CarouselContent>
            {activity.images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="aspect-[16/9] relative overflow-hidden">
                  <img
                    src={image}
                    alt={`${activity.title} - Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {activity.images.length > 1 && (
            <>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </>
          )}
        </Carousel>

        {/* Category badge overlay */}
        <Badge className="absolute top-4 left-4 bg-badge-sport text-white">
          {activity.category}
        </Badge>
      </section>

      <main className="container px-4 py-6 space-y-6">
        {/* Title & Structure */}
        <section>
          <h2 className="text-2xl font-bold mb-2">{activity.title}</h2>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin size={16} className="text-badge-distance" aria-hidden="true" />
            <span className="text-sm">{activity.structure.name}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{activity.structure.address}</p>
        </section>

        {/* Price & Financial Aid */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold text-primary">
                  {activity.price_base === 0 ? "Gratuit" : `${activity.price_base}€`}
                </p>
                {activity.price_note && (
                  <p className="text-sm text-muted-foreground mt-1">{activity.price_note}</p>
                )}
              </div>
              {hasAids && (
                <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                  Aides disponibles
                </Badge>
              )}
            </div>

            {hasAids && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Aides financières acceptées:</p>
                <div className="flex flex-wrap gap-2">
                  {activity.accepts_aid_types.map((aid) => (
                    <Badge key={aid} variant="outline" className="text-xs">
                      {aid}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {activity.payment_echelonned && activity.payment_plans.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-primary" aria-hidden="true" />
                    <p className="text-sm font-medium">Paiement échelonné disponible</p>
                  </div>
                  <ul className="space-y-1 ml-6">
                    {activity.payment_plans.map((plan, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">
                        • {plan.name}: {plan.description}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Description */}
        <section>
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p className="text-muted-foreground leading-relaxed">{activity.description}</p>
        </section>

        {/* Age Range */}
        <div className="flex items-center gap-2 text-sm">
          <Users size={16} className="text-badge-age" aria-hidden="true" />
          <span>
            <strong>Tranche d'âge:</strong> {activity.age_min}-{activity.age_max} ans
          </span>
        </div>

        {/* Available Slots */}
        {activity.slots && activity.slots.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold mb-3">Créneaux disponibles</h3>
            <div className="space-y-2">
              {activity.slots.map((slot) => (
                <Card key={slot.id} className="border-2 hover:border-primary cursor-pointer transition-colors">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar size={20} className="text-primary" aria-hidden="true" />
                      <div>
                        <p className="font-medium">
                          {new Date(slot.start).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(slot.start).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          -{' '}
                          {new Date(slot.end).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge variant={slot.seats_remaining > 5 ? "secondary" : "destructive"}>
                      {slot.seats_remaining} places
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Capacity Info */}
        <Alert>
          <Info size={16} />
          <AlertDescription>
            <strong>{activity.capacity_policy.seats_remaining}</strong> places restantes sur{' '}
            <strong>{activity.capacity_policy.seats_total}</strong>
            {activity.capacity_policy.waitlist_enabled && (
              <span className="block mt-1 text-xs">Liste d'attente disponible si complet</span>
            )}
          </AlertDescription>
        </Alert>

        {/* Transport Options */}
        {activity.covoiturage_enabled && (
          <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Car size={20} className="text-primary" aria-hidden="true" />
              Options de transport
            </h3>
            <Card>
              <CardContent className="p-4 space-y-2">
                {activity.transport_options.map((option, idx) => (
                  <div key={idx}>
                    <p className="font-medium text-sm">{option.type}</p>
                    <p className="text-sm text-muted-foreground">{option.details}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Accessibility */}
        <section>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Accessibility size={20} className="text-primary" aria-hidden="true" />
            Accessibilité
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(activity.accessibility_checklist).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center gap-2 text-sm"
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    value ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                  aria-hidden="true"
                >
                  {value && '✓'}
                </div>
                <span>
                  {key === 'pmr_access' && 'Accès INCLUSIVITÉ'}
                  {key === 'adapted_equipment' && 'Équipement adapté'}
                  {key === 'specialized_staff' && 'Personnel formé'}
                  {key === 'sensory_friendly' && 'Adapté sensoriel'}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Required Documents */}
        {activity.documents_required.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText size={20} className="text-primary" aria-hidden="true" />
              Documents requis
            </h3>
            <Alert>
              <AlertCircle size={16} />
              <AlertDescription>
                <div className="space-y-2">
                  {mandatoryDocs.length > 0 && (
                    <div>
                      <p className="font-medium text-sm mb-1">Obligatoires:</p>
                      <ul className="space-y-1 ml-4">
                        {mandatoryDocs.map((doc) => (
                          <li key={doc.key} className="text-sm">
                            • {doc.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {optionalDocs.length > 0 && (
                    <div>
                      <p className="font-medium text-sm mb-1">Optionnels:</p>
                      <ul className="space-y-1 ml-4">
                        {optionalDocs.map((doc) => (
                          <li key={doc.key} className="text-sm text-muted-foreground">
                            • {doc.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </section>
        )}

        {/* Contact Info */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Contact</h4>
            <div className="space-y-1 text-sm">
              <p>📧 {activity.structure.contact_json.email}</p>
              <p>📞 {activity.structure.contact_json.phone}</p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-40">
        <Button
          onClick={onEnroll}
          className="w-full h-14 text-lg rounded-full"
          size="lg"
          disabled={activity.capacity_policy.seats_remaining === 0}
        >
          {activity.capacity_policy.seats_remaining === 0
            ? 'Complet - Rejoindre liste d\'attente'
            : 'Inscription'}
        </Button>
      </div>
    </div>
  );
};
