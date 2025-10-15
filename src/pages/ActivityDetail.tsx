import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SlotPicker } from "@/components/SlotPicker";
import { SimulateAidModal } from "@/components/SimulateAidModal";
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
  Building2
} from "lucide-react";
import { useState } from "react";
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
            address
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
  const calculateDurationDays = (slot: any): number => {
    if (!slot) return 1;
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
      {/* Header with back button */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container flex items-center gap-3 py-3 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Retour"
          >
            <ArrowLeft />
          </Button>
          <h1 className="font-semibold text-lg truncate">{activity.title}</h1>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        <img
          src={imgError ? fallbackImage : displayImage}
          alt={activity.title}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Category badge */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-primary text-primary-foreground">
            {activity.category}
          </Badge>
        </div>

        {/* Accessibility badge */}
        <div className="absolute top-4 right-4 flex gap-2">
          {typeof activity.accessibility_checklist === 'object' && 
           activity.accessibility_checklist !== null && 
           'wheelchair' in activity.accessibility_checklist &&
           activity.accessibility_checklist.wheelchair && (
            <Badge className="bg-white/90 text-foreground">
              <Accessibility size={14} className="mr-1" />
              PMR
            </Badge>
          )}
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h2 className="text-2xl font-bold mb-1">{activity.title}</h2>
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1">
              <Users size={16} />
              {ageRange}
            </span>
            {activity.structures?.name && (
              <span className="flex items-center gap-1">
                <Building2 size={16} />
                {activity.structures.name}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container px-4 py-6 space-y-4">
        {/* Price Card - Prominent */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tarif</p>
                <p className="text-4xl font-bold text-primary">
                  {activity.price_base === 0 ? "Gratuit" : `${activity.price_base}€`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">par enfant</p>
              </div>
              
              {Array.isArray(activity.accepts_aid_types) && activity.accepts_aid_types.length > 0 && (
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => setShowAidModal(true)}
                  className="min-h-[56px]"
                >
                  <Euro size={20} className="mr-2" />
                  Simuler les aides
                </Button>
              )}
            </div>

            {activity.payment_echelonned && (
              <Badge variant="secondary" className="mt-4 bg-accent/10 text-accent border-accent/20">
                <CreditCard size={14} className="mr-1" />
                Paiement en plusieurs fois possible
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Child Selection */}
        {children.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users size={18} />
                Sélectionner un enfant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedChildId} onValueChange={setSelectedChildId}>
                <div className="space-y-3">
                  {children.map((child) => {
                    const age = calculateAge(child.dob);
                    const isEligible = age >= activity.age_min && age <= activity.age_max;
                    
                    return (
                      <div
                        key={child.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border ${
                          isEligible ? 'border-border' : 'border-destructive/30 bg-destructive/5'
                        }`}
                      >
                        <RadioGroupItem value={child.id} id={child.id} disabled={!isEligible} />
                        <Label
                          htmlFor={child.id}
                          className={`flex-1 cursor-pointer ${!isEligible && 'text-muted-foreground'}`}
                        >
                          <div className="font-medium">{child.first_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {age} ans {!isEligible && `(requis: ${activity.age_min}-${activity.age_max} ans)`}
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

        {/* Financial Aid Eligibility Badges */}
        {userProfile && selectedChild && (
          <FinancialAidBadges
            activityCategories={[activity.category]}
            childAge={calculateAge(selectedChild.dob)}
            quotientFamilial={userProfile.quotient_familial ? Number(userProfile.quotient_familial) : 0}
            cityCode={userProfile.postal_code || ''}
          />
        )}

        {/* Financial Aids Calculator - Detailed calculation when slot selected */}
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

        {/* Quick Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info size={18} />
              Informations pratiques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activity.structures?.address && (
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Lieu</p>
                  <p className="text-sm text-muted-foreground">{activity.structures.address}</p>
                </div>
              </div>
            )}
            
            <Separator />
            
            <div className="flex items-start gap-3">
              <Users size={18} className="text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Âge requis</p>
                <p className="text-sm text-muted-foreground">{ageRange}</p>
              </div>
            </div>

            {activity.covoiturage_enabled && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <Car size={18} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Covoiturage</p>
                    <p className="text-sm text-muted-foreground">Proposez ou rejoignez un covoiturage</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Description */}
        {activity.description && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText size={18} />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                {activity.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Accessibility Features */}
        {typeof activity.accessibility_checklist === 'object' && 
         activity.accessibility_checklist !== null && 
         Object.keys(activity.accessibility_checklist).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Accessibility size={18} />
                Accessibilité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {typeof activity.accessibility_checklist === 'object' && 
               activity.accessibility_checklist !== null &&
               !Array.isArray(activity.accessibility_checklist) &&
               'wheelchair' in activity.accessibility_checklist &&
               activity.accessibility_checklist.wheelchair && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Accessible en fauteuil roulant</span>
                </div>
              )}
              {typeof activity.accessibility_checklist === 'object' && 
               activity.accessibility_checklist !== null &&
               !Array.isArray(activity.accessibility_checklist) &&
               'sensory_support' in activity.accessibility_checklist &&
               activity.accessibility_checklist.sensory_support && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Accompagnement sensoriel adapté</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Available Aids */}
        {Array.isArray(activity.accepts_aid_types) && activity.accepts_aid_types.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Euro size={18} />
                Aides financières acceptées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {activity.accepts_aid_types.map((aid: string) => (
                  <Badge key={aid} variant="outline">
                    {aid}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Slot Picker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar size={18} />
              Créneaux disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {slots.length > 0 ? (
              <SlotPicker
                slots={slots}
                onSelectSlot={setSelectedSlotId}
                selectedSlotId={selectedSlotId}
              />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun créneau disponible pour le moment
              </p>
            )}
          </CardContent>
        </Card>

        {/* Booking button */}
        <Button
          onClick={handleBooking}
          disabled={!selectedSlotId || !selectedChildId || slots.length === 0}
          className="w-full h-14 text-lg shadow-lg"
          size="lg"
        >
          {!selectedChildId 
            ? "Sélectionnez un enfant"
            : !selectedSlotId 
            ? "Sélectionnez un créneau"
            : "Réserver cette activité"}
        </Button>
      </div>

      <SimulateAidModal
        open={showAidModal}
        onOpenChange={setShowAidModal}
        activityPrice={activity.price_base || 0}
        acceptedAids={Array.isArray(activity.accepts_aid_types) ? activity.accepts_aid_types as string[] : []}
      />

      <BottomNavigation />
    </div>
  );
};

export default ActivityDetail;
