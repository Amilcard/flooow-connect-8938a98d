import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SlotPicker } from "@/components/SlotPicker";
import { SimulateAidModal } from "@/components/simulations/SimulateAidModal";
import { FinancialAidsCalculator } from "@/components/activities/FinancialAidsCalculator";
import { FinancialAidBadges } from "@/components/activities/FinancialAidBadges";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Accessibility, 
  Euro,
  Car,
  CreditCard,
  Calendar,
  Info,
  FileText,
  Building2,
  HelpCircle,
  Mail,
  Phone,
  MessageCircle,
  Bus,
  Bike,
  CalendarRange,
  CheckCircle2
} from "lucide-react";
import { useState } from "react";
import { ContactOrganizerModal } from "@/components/ContactOrganizerModal";
import activitySportImg from "@/assets/activity-sport.jpg";
import activityLoisirsImg from "@/assets/activity-loisirs.jpg";
import activityVacancesImg from "@/assets/activity-vacances.jpg";
import activityCultureImg from "@/assets/activity-culture.jpg";

const getCategoryImage = (category: string): string => {
  const categoryMap: Record<string, string> = {
    Sport: activitySportImg,
    Loisirs: activityLoisirsImg,
    Vacances: activityVacancesImg,
    Scolarité: activityCultureImg,
    Culture: activityCultureImg,
  };
  return categoryMap[category] || activityLoisirsImg;
};

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedSlotId, setSelectedSlotId] = useState<string>();
  const [selectedChildId, setSelectedChildId] = useState<string>();
  const [showAidModal, setShowAidModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Fetch activity details
  const { data: activity, isLoading, error } = useQuery({
    queryKey: ["activity", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          structures:structure_id (
            name,
            address,
            contact_json
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Fetch availability slots
  const { data: slots = [] } = useQuery({
    queryKey: ["slots", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("availability_slots")
        .select("*")
        .eq("activity_id", id)
        .gt("seats_remaining", 0)
        .order("start", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Fetch user profile
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Fetch user's children
  const { data: children = [] } = useQuery({
    queryKey: ["user-children"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return <LoadingState />;
  if (error || !activity) {
    return (
      <div className="min-h-screen bg-background p-4">
        <ErrorState 
          message="Activité introuvable" 
          onRetry={() => navigate("/")} 
        />
      </div>
    );
  }

  const handleBooking = () => {
    if (!selectedSlotId) {
      alert("Veuillez sélectionner un créneau");
      return;
    }
    if (!selectedChildId) {
      alert("Veuillez sélectionner un enfant");
      return;
    }
    navigate(`/booking/${id}?slotId=${selectedSlotId}`);
  };

  // Calculate age from date of birth
  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Calculate duration in days from slot
    const calculateDurationDays = (slot?: { start: string | Date; end: string | Date } | null): number => {
      if (!slot || !slot.start || !slot.end) return 1;
      const start = new Date(slot.start);
      const end = new Date(slot.end);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(1, diffDays);
    };

  // Get selected child details
  const selectedChild = children.find(c => c.id === selectedChildId);
  const selectedSlot = slots.find(s => s.id === selectedSlotId);

  const fallbackImage = getCategoryImage(activity.category);
  const displayImage = activity.images?.[0] || fallbackImage;
  const ageRange = `${activity.age_min}-${activity.age_max} ans`;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Minimalist Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container flex items-center gap-3 py-4 px-4 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Retour"
            className="hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Hero Image - Style Airbnb */}
      <div className="relative w-full h-[60vh] max-h-[600px] overflow-hidden">
        <img
          src={imgError ? fallbackImage : displayImage}
          alt={activity.title}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* Floating badges */}
        <div className="absolute top-6 left-6 flex gap-2 flex-wrap">
          {activity.categories && activity.categories.length > 0 ? (
            activity.categories.map((cat: string) => (
              <Badge key={cat} variant="secondary" className="bg-white/95 backdrop-blur-sm text-foreground shadow-lg">
                {cat}
              </Badge>
            ))
          ) : (
            <Badge variant="secondary" className="bg-white/95 backdrop-blur-sm text-foreground shadow-lg">
              {activity.category}
            </Badge>
          )}
          {typeof activity.accessibility_checklist === 'object' && 
           activity.accessibility_checklist !== null && 
           'wheelchair' in activity.accessibility_checklist &&
           activity.accessibility_checklist.wheelchair && (
            <Badge variant="secondary" className="bg-white/95 backdrop-blur-sm text-foreground shadow-lg">
              <Accessibility size={14} className="mr-1" />
              PMR
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content Container - Style Airbnb */}
      <div className="container px-4 md:px-6 py-8 max-w-5xl mx-auto">
        {/* Title Section - Airbnb style */}
        <div className="space-y-3 pb-6 border-b">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{activity.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Users size={18} className="text-primary" />
              {ageRange}
            </span>
            {activity.structures?.address && (
              <span className="flex items-center gap-1.5">
                <MapPin size={18} className="text-primary" />
                {activity.structures.address}
              </span>
            )}
            {activity.structures?.name && (
              <span className="flex items-center gap-1.5">
                <Building2 size={18} className="text-primary" />
                {activity.structures.name}
              </span>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-8">
          {/* Left Column - Main content */}
          <div className="md:col-span-2 space-y-10">
            {/* Description Section */}
            {activity.description && (
              <section>
                <h2 className="text-2xl font-semibold mb-4">À propos de cette activité</h2>
                <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                  {activity.description}
                </p>
              </section>
            )}

            {/* Service Period */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Période de prestation</h2>
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CalendarRange className="text-primary flex-shrink-0" size={24} />
                    <div>
                      <p className="font-medium">Du 1er Novembre 2025 au 30 Août 2026</p>
                      <p className="text-sm text-muted-foreground">
                        Les activités se déroulent sur cette période académique
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* What's Included - Airbnb style */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Ce qui est proposé</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                  <Users size={20} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Tranche d'âge</p>
                    <p className="text-sm text-muted-foreground">{ageRange}</p>
                  </div>
                </div>
                
                {activity.structures?.address && (
                  <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                    <MapPin size={20} className="text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Lieu</p>
                      <p className="text-sm text-muted-foreground">{activity.structures.address}</p>
                    </div>
                  </div>
                )}

                {activity.covoiturage_enabled && (
                  <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                    <Car size={20} className="text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Covoiturage</p>
                      <p className="text-sm text-muted-foreground">Service disponible</p>
                    </div>
                  </div>
                )}

                {typeof activity.accessibility_checklist === 'object' && 
                 activity.accessibility_checklist !== null && 
                 'wheelchair' in activity.accessibility_checklist &&
                 activity.accessibility_checklist.wheelchair && (
                  <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                    <Accessibility size={20} className="text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Accessibilité PMR</p>
                      <p className="text-sm text-muted-foreground">Adapté aux personnes à mobilité réduite</p>
                    </div>
                  </div>
                )}

                {activity.payment_echelonned && (
                  <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                    <CreditCard size={20} className="text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Paiement échelonné</p>
                      <p className="text-sm text-muted-foreground">Plusieurs fois possible</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Transport Information */}
            {typeof activity.transport_meta === 'object' && activity.transport_meta !== null && (
              <section>
                <h2 className="text-2xl font-semibold mb-4">Accès et transports</h2>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <Bus size={20} className="text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium mb-1">STAS (Saint-Étienne)</p>
                        <p className="text-sm text-muted-foreground mb-2">
                          Arrêt le plus proche - {
                            'bus_stop_distance_m' in activity.transport_meta && 
                            activity.transport_meta.bus_stop_distance_m
                              ? `${activity.transport_meta.bus_stop_distance_m}m` 
                              : 'À proximité'
                          }
                        </p>
                        <a 
                          href="https://www.reseau-stas.fr" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline font-medium"
                        >
                          Voir les horaires STAS →
                        </a>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-start gap-3">
                      <Bike size={20} className="text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium mb-1">Véliver</p>
                        <p className="text-sm text-muted-foreground mb-2">
                          Stations disponibles à proximité
                        </p>
                        <a 
                          href="https://www.veliver.fr" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline font-medium"
                        >
                          Localiser une station →
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Accessibility Features */}
            {typeof activity.accessibility_checklist === 'object' && 
             activity.accessibility_checklist !== null && 
             Object.keys(activity.accessibility_checklist).length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-4">Accessibilité</h2>
                <div className="space-y-3">
                  {typeof activity.accessibility_checklist === 'object' && 
                   activity.accessibility_checklist !== null &&
                   !Array.isArray(activity.accessibility_checklist) &&
                   'wheelchair' in activity.accessibility_checklist &&
                   activity.accessibility_checklist.wheelchair && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm">Accessible en fauteuil roulant</span>
                    </div>
                  )}
                  {typeof activity.accessibility_checklist === 'object' && 
                   activity.accessibility_checklist !== null &&
                   !Array.isArray(activity.accessibility_checklist) &&
                   'sensory_support' in activity.accessibility_checklist &&
                   activity.accessibility_checklist.sensory_support && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm">Accompagnement sensoriel adapté</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Financial Aids */}
            {Array.isArray(activity.accepts_aid_types) && activity.accepts_aid_types.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-4">Aides financières acceptées</h2>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap gap-2">
                      {activity.accepts_aid_types.map((aid: string) => (
                        <Badge key={aid} variant="secondary" className="px-3 py-1">
                          {aid}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowAidModal(true)}
                      className="w-full mt-4"
                    >
                      <Euro size={16} className="mr-2" />
                      Calculer mes aides personnalisées
                    </Button>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Host/Organizer Section - Airbnb style */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Organisé par</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{activity.structures?.name}</h3>
                        {activity.structures?.address && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {activity.structures.address}
                          </p>
                        )}
                        
                        {typeof activity.structures?.contact_json === 'object' && activity.structures?.contact_json !== null && (
                          <div className="space-y-2">
                            {'email' in activity.structures.contact_json && activity.structures.contact_json.email && (
                              <a 
                                href={`mailto:${activity.structures.contact_json.email}`}
                                className="flex items-center gap-2 text-sm text-primary hover:underline"
                              >
                                <Mail size={16} />
                                {String(activity.structures.contact_json.email)}
                              </a>
                            )}
                            {'phone' in activity.structures.contact_json && activity.structures.contact_json.phone && (
                              <a 
                                href={`tel:${activity.structures.contact_json.phone}`}
                                className="flex items-center gap-2 text-sm text-primary hover:underline"
                              >
                                <Phone size={16} />
                                {String(activity.structures.contact_json.phone)}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowContactModal(true)}
                  >
                    <MessageCircle size={16} className="mr-2" />
                    Contacter l'organisateur
                  </Button>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Right Column - Booking card (sticky) */}
          <div className="md:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Price Card */}
              <Card className="shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-semibold">
                        {activity.price_base === 0 ? "Gratuit" : `${activity.price_base}€`}
                      </span>
                      {activity.price_base > 0 && (
                        <span className="text-sm text-muted-foreground">par enfant</span>
                      )}
                    </div>
                    {activity.price_note && (
                      <p className="text-xs text-muted-foreground mt-1">{activity.price_note}</p>
                    )}
                  </div>

                  {/* Pricing Options */}
                  {Array.isArray(activity.payment_plans) && activity.payment_plans.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Options tarifaires</p>
                        {activity.payment_plans.map((plan: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm p-2 rounded hover:bg-muted/50">
                            <span className="text-muted-foreground">{plan.label}</span>
                            <span className="font-medium">{plan.price}€</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Child Selection */}
              {children.length > 0 && (
                <Card className="shadow-lg">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold">Sélectionner un enfant</h3>
                    <RadioGroup value={selectedChildId} onValueChange={setSelectedChildId}>
                      <div className="space-y-2">
                        {children.map((child) => {
                          const age = calculateAge(child.dob);
                          const isEligible = age >= activity.age_min && age <= activity.age_max;
                          
                          return (
                            <div
                              key={child.id}
                              className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                                isEligible 
                                  ? 'border-border hover:bg-muted/50 cursor-pointer' 
                                  : 'border-destructive/30 bg-destructive/5 opacity-60'
                              }`}
                            >
                              <RadioGroupItem value={child.id} id={child.id} disabled={!isEligible} />
                              <Label
                                htmlFor={child.id}
                                className={`flex-1 cursor-pointer ${!isEligible && 'cursor-not-allowed'}`}
                              >
                                <div className="font-medium">{child.first_name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {age} ans {!isEligible && `(âge requis: ${activity.age_min}-${activity.age_max} ans)`}
                                </div>
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              )}

              {/* Financial Aid Eligibility */}
              {userProfile && selectedChild && (
                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Vos aides éligibles</h3>
                    <FinancialAidBadges
                      activityCategories={[activity.category]}
                      activityAcceptedAidSlugs={
                        Array.isArray(activity.accepts_aid_types) 
                          ? activity.accepts_aid_types 
                          : typeof activity.accepts_aid_types === 'string'
                            ? JSON.parse(activity.accepts_aid_types || '[]')
                            : []
                      }
                      childAge={calculateAge(selectedChild.dob)}
                      quotientFamilial={userProfile.quotient_familial ? Number(userProfile.quotient_familial) : 0}
                      cityCode={userProfile.postal_code || ''}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Financial Aids Calculator */}
              {userProfile && selectedChild && selectedSlot && activity.price_base > 0 && (
                <FinancialAidsCalculator
                  activityPrice={activity.price_base}
                  activityCategories={[activity.category]}
                  childAge={calculateAge(selectedChild.dob)}
                  quotientFamilial={userProfile.quotient_familial ? Number(userProfile.quotient_familial) : 0}
                  cityCode={userProfile.postal_code || ''}
                  durationDays={calculateDurationDays(selectedSlot)}
                />
              )}

              {/* Slots Picker */}
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Créneaux disponibles</h3>
                  {slots.length > 0 ? (
                    <SlotPicker
                      slots={slots}
                      onSelectSlot={setSelectedSlotId}
                      selectedSlotId={selectedSlotId}
                    />
                  ) : (
                    <div className="text-center py-8 space-y-2">
                      <Calendar className="w-12 h-12 mx-auto text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">
                        Aucun créneau disponible actuellement
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Contactez l'organisateur pour plus d'informations
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Booking Button */}
              <Button
                onClick={handleBooking}
                disabled={!selectedSlotId || !selectedChildId || slots.length === 0}
                className="w-full h-12 text-base font-semibold shadow-lg"
                size="lg"
              >
                {!selectedChildId 
                  ? "Sélectionnez un enfant"
                  : !selectedSlotId 
                  ? "Sélectionnez un créneau"
                  : "Réserver"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showAidModal && (
        <SimulateAidModal
          open={showAidModal}
          onOpenChange={setShowAidModal}
          activityPrice={activity.price_base || 0}
          activityCategories={[activity.category].filter(Boolean)}
          durationDays={calculateDurationDays(selectedSlot)}
        />
      )}

      {activity.structures && typeof activity.structures.contact_json === 'object' && activity.structures.contact_json !== null && (
        <ContactOrganizerModal
          open={showContactModal}
          onOpenChange={setShowContactModal}
          organizerName={activity.structures.name}
          organizerEmail={'email' in activity.structures.contact_json ? String(activity.structures.contact_json.email) : ''}
          organizerPhone={'phone' in activity.structures.contact_json ? String(activity.structures.contact_json.phone) : undefined}
          activityTitle={activity.title}
        />
      )}

      <BottomNavigation />
    </div>
  );
};

export default ActivityDetail;
