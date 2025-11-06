import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BookingCard } from "@/components/BookingCard";
import { SimulateAidModal } from "@/components/simulations/SimulateAidModal";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { BottomNavigation } from "@/components/BottomNavigation";
import { BackButton } from "@/components/BackButton";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
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
import { useState, useEffect } from "react";
import { ContactOrganizerModal } from "@/components/ContactOrganizerModal";
import { EcoMobilitySection } from "@/components/Activity/EcoMobilitySection";
import { useActivityViewTracking } from "@/lib/tracking";
import { FinancialAidsCalculator } from "@/components/activities/FinancialAidsCalculator";
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
  const { toast } = useToast();
  const [selectedSlotId, setSelectedSlotId] = useState<string>();
  const [selectedChildId, setSelectedChildId] = useState<string>();
  const [showAidModal, setShowAidModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [adjustedPrice, setAdjustedPrice] = useState<number | null>(null);
  const [calculatedAids, setCalculatedAids] = useState<any[]>([]);
  
  // États pour le calculateur d'aides intégré
  const [quotientFamilial, setQuotientFamilial] = useState<string>("");
  const [cityCode, setCityCode] = useState<string>("");

  // Tracking consultation activité (durée)
  const trackActivityView = useActivityViewTracking(id, 'direct');
  
  useEffect(() => {
    // Cleanup: logger la durée de consultation à la fermeture
    return trackActivityView;
  }, [id]);

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

  // Pré-remplir le QF et le code postal depuis le profil utilisateur
  useEffect(() => {
    if (userProfile) {
      if (userProfile.quotient_familial) {
        setQuotientFamilial(String(userProfile.quotient_familial));
      }
      if (userProfile.postal_code) {
        setCityCode(userProfile.postal_code);
      }
    }
  }, [userProfile]);

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
      toast({
        title: "Créneau requis",
        description: "Veuillez sélectionner un créneau",
        variant: "destructive"
      });
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
          <BackButton fallback="/activities" variant="ghost" size="icon" className="hover:bg-muted" />
        </div>
      </div>

      {/* Hero Image - Airbnb Style with Limited Height */}
      <div className="relative w-full h-[48vh] md:h-[52vh] max-h-[560px] min-h-[280px] md:min-h-[420px] overflow-hidden">
        <img
          src={imgError ? fallbackImage : displayImage}
          alt={activity.title}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
        
        {/* Bottom gradient overlay - 20-30% */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        
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

      {/* Main Content Container - Airbnb Style with Grid */}
      <div className="container px-4 md:px-6 py-8 max-w-[1140px] mx-auto">
        {/* Header Section - Réorganisé: Titre → Méta → Organisateur */}
        <div className="space-y-4 pb-8 border-b mb-8">
          {/* Titre H1 fort */}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            {activity.title}
          </h1>
          
          {/* Méta informations (âge, durée, lieu) */}
          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm">
            <span className="flex items-center gap-2">
              <Users size={20} className="text-primary" />
              <span className="font-medium text-foreground">{ageRange}</span>
            </span>
            
            {activity.period_type && (
              <span className="flex items-center gap-2">
                <CalendarRange size={20} className="text-primary" />
                <span className="text-muted-foreground">
                  {activity.period_type === 'annual' || activity.period_type === 'trimester' 
                    ? 'Année scolaire' 
                    : 'Vacances scolaires'}
                </span>
              </span>
            )}
            
            {activity.structures?.address && (
              <span className="flex items-center gap-2">
                <MapPin size={20} className="text-primary" />
                <span className="text-muted-foreground">{activity.structures.address}</span>
              </span>
            )}
          </div>

          {/* Organisateur avec lien contact discret */}
          {activity.structures?.name && (
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Building2 size={20} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  Organisé par {activity.structures.name}
                </span>
              </div>
              <Button
                variant="link"
                size="sm"
                onClick={() => setShowContactModal(true)}
                className="h-auto p-0 text-sm text-primary hover:underline font-medium"
              >
                <MessageCircle size={16} className="mr-1.5" />
                Contacter l'organisateur
              </Button>
            </div>
          )}
        </div>

        {/* Grid 12 colonnes: 8 pour contenu, 4 pour booking card */}
        <div className="grid md:grid-cols-12 gap-8">
          {/* Left Column - Main content (8/12) */}
          <div className="md:col-span-8 space-y-8">
            {activity.description && (
              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">À propos de cette activité</h2>
                <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                  {activity.description}
                </p>
              </section>
            )}

            {/* Informations pratiques - Airbnb style */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Informations pratiques</h2>
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

            {/* Financial Aids Section with integrated calculator */}
            {Array.isArray(activity.accepts_aid_types) && activity.accepts_aid_types.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">💰 Évaluer ton aide</h2>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    {/* Aides acceptées */}
                    <div>
                      <p className="text-sm font-medium mb-2">Aides financières acceptées</p>
                      <div className="flex flex-wrap gap-2">
                        {activity.accepts_aid_types.map((aid: string) => (
                          <Badge key={aid} variant="secondary" className="px-3 py-1">
                            {aid}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Formulaire de saisie QF et Ville */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Quotient Familial */}
                        <div className="space-y-2">
                          <Label htmlFor="qf">
                            Quotient Familial CAF <span className="text-muted-foreground">(€/mois)</span>
                          </Label>
                          <Input
                            id="qf"
                            type="number"
                            min="0"
                            max="9999"
                            placeholder="Ex: 800"
                            value={quotientFamilial}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Validation: maximum 4 chiffres
                              if (value === "" || (parseInt(value) >= 0 && parseInt(value) <= 9999)) {
                                setQuotientFamilial(value);
                              }
                            }}
                          />
                          {userProfile?.quotient_familial && (
                            <p className="text-xs text-muted-foreground">
                              Pré-rempli depuis votre profil
                            </p>
                          )}
                        </div>

                        {/* Code Postal / Ville */}
                        <div className="space-y-2">
                          <Label htmlFor="city">
                            Ville de résidence <span className="text-muted-foreground">(code postal)</span>
                          </Label>
                          <Input
                            id="city"
                            type="text"
                            maxLength={5}
                            placeholder="Ex: 42000"
                            value={cityCode}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Validation: seulement des chiffres, max 5
                              if (/^\d{0,5}$/.test(value)) {
                                setCityCode(value);
                              }
                            }}
                          />
                          {userProfile?.postal_code && (
                            <p className="text-xs text-muted-foreground">
                              Pré-rempli depuis votre profil
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Info message */}
                      {(!quotientFamilial || !cityCode) && (
                        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-muted-foreground">
                            Renseignez votre QF et votre ville pour voir les aides disponibles et votre reste à charge
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Aids Calculator - Affichage des résultats */}
                {quotientFamilial && cityCode && selectedChild && (
                  <FinancialAidsCalculator
                    activityPrice={activity.price_base || 0}
                    activityCategories={activity.categories || [activity.category]}
                    childAge={calculateAge(selectedChild.dob)}
                    quotientFamilial={parseInt(quotientFamilial) || 0}
                    cityCode={cityCode}
                    durationDays={calculateDurationDays(selectedSlot)}
                  />
                )}

                {/* Message si pas d'enfant sélectionné */}
                {quotientFamilial && cityCode && !selectedChild && children.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          Sélectionnez un enfant dans la carte de réservation à droite pour voir les aides disponibles
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </section>
            )}

            {/* Eco Mobility Section - En bas de page */}
            <EcoMobilitySection 
              activityId={activity.id}
              activityAddress={activity.structures?.address}
              structureName={activity.structures?.name}
              structureContactJson={activity.structures?.contact_json}
            />
          </div>

          {/* Right Column - Booking Card Sticky (4/12) */}
          <div className="md:col-span-4">
            <BookingCard
              activity={activity}
              slots={slots}
              children={children}
              userProfile={userProfile}
              selectedSlotId={selectedSlotId}
              selectedChildId={selectedChildId}
              onSelectSlot={setSelectedSlotId}
              onSelectChild={setSelectedChildId}
              onBooking={handleBooking}
              calculateAge={calculateAge}
              calculateDurationDays={calculateDurationDays}
              adjustedPrice={adjustedPrice}
              calculatedAids={calculatedAids}
            />
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
          onSimulationComplete={(finalPrice, aids) => {
            setAdjustedPrice(finalPrice);
            setCalculatedAids(aids);
          }}
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
