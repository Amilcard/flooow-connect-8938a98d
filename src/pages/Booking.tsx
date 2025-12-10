import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { ArrowLeft, User, Calendar, MapPin, AlertCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBookingDraft } from "@/hooks/useBookingDraft";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSmartBack } from "@/hooks/useSmartBack";
import { useActivityBookingState } from "@/hooks/useActivityBookingState";
import { KidQuickAddModal } from "@/components/KidQuickAddModal";
import { ParentalValidationModal } from "@/components/ParentalValidationModal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Booking = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const slotId = searchParams.get("slotId");
  const handleBack = useSmartBack(id ? `/activity/${id}` : "/activities");

  const { draft, saveDraft, clearDraft, hasDraft } = useBookingDraft(id!, slotId!);
  const [selectedChildId, setSelectedChildId] = useState<string>(draft?.childId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [showParentalValidationModal, setShowParentalValidationModal] = useState(false);

  // Récupérer les aides depuis le localStorage si elles existent
  const { state: bookingState } = useActivityBookingState(id!);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast({
          title: "Connexion requise",
          description: "Connectez-vous pour réserver cette activité",
          variant: "default"
        });
        navigate("/login");
        return;
      }

      setUserId(session.user.id);
      setAuthChecked(true);
    };

    checkAuth();
  }, [navigate, toast]);

  // Auto-save draft when child selection changes
  useEffect(() => {
    if (selectedChildId && id && slotId) {
      saveDraft(selectedChildId);
    }
  }, [selectedChildId, id, slotId]);

  // Fetch activity
  const { data: activity, isLoading: loadingActivity } = useQuery({
    queryKey: ["activity", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*, structures:structure_id(name, address)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    }
  });

  // Fetch slot
  const { data: slot, isLoading: loadingSlot } = useQuery({
    queryKey: ["slot", slotId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("availability_slots")
        .select("*")
        .eq("id", slotId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slotId
  });

  // Fetch user's children (only for authenticated user)
  const { data: children = [], isLoading: loadingChildren, refetch: refetchChildren } = useQuery({
    queryKey: ["children", userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("user_id", userId); // Filter by authenticated user's ID

      if (error) throw error;
      return data;
    },
    enabled: authChecked && !!userId // Only run query after auth check and if user is logged in
  });

  // Fetch user's profile to check if they need parental validation
  const { data: userProfile, isLoading: loadingProfile, refetch: refetchProfile } = useQuery({
    queryKey: ["user-profile-parental", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("id, parent_id, linking_code")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: authChecked && !!userId
  });

  // Déterminer si l'utilisateur a besoin de validation parentale
  // Un utilisateur est considéré comme mineur s'il n'a pas d'enfants ET n'a pas de parent lié
  const needsParentalValidation = !loadingChildren && !loadingProfile &&
    children.length === 0 &&
    userProfile &&
    !userProfile.parent_id;

  // Auto-open parental validation modal for minors, or add child modal for parents
  useEffect(() => {
    if (!authChecked || loadingChildren || loadingProfile) return;

    // Si c'est un mineur (pas d'enfants et pas de parent lié) → validation parentale
    if (needsParentalValidation && !showParentalValidationModal) {
      setShowParentalValidationModal(true);
      return;
    }

    // Si c'est un parent sans enfants enregistrés → ajouter un enfant
    if (children.length === 0 && !needsParentalValidation && !showAddChildModal && userProfile?.parent_id) {
      toast({
        title: "Ajoutez un enfant",
        description: "Pour réserver cette activité, ajoutez d'abord les informations d'un enfant",
      });
      setShowAddChildModal(true);
    }
  }, [authChecked, loadingChildren, loadingProfile, children.length, needsParentalValidation, showAddChildModal, showParentalValidationModal, toast, userProfile]);

  // Helper function to calculate age and check eligibility
  const getChildEligibility = (child: any) => {
    if (!activity || !slot) return { age: 0, isEligible: true, reason: null };
    
    const birthDate = new Date(child.dob);
    const slotDate = new Date(slot.start);
    let age = slotDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = slotDate.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && slotDate.getDate() < birthDate.getDate())) {
      age--;
    }
    
    const minAge = activity.age_min || 0;
    const maxAge = activity.age_max || 999;
    const isEligible = age >= minAge && age <= maxAge;
    
    let reason = null;
    if (!isEligible) {
      if (age < minAge) {
        reason = `Activité réservée aux enfants à partir de ${minAge} ans`;
      } else {
        reason = `Activité réservée aux enfants jusqu'à ${maxAge} ans`;
      }
    }
    
    return { age, isEligible, reason };
  };

  const handleChildAdded = (childId?: string) => {
    refetchChildren();
    if (childId) {
      setSelectedChildId(childId);
    }
  };

  const handleSubmit = async () => {
    if (!selectedChildId) {
      toast({
        title: "Sélection requise",
        description: "Choisissez un enfant pour continuer",
        variant: "default"
      });
      return;
    }

    // Check if selected child is eligible
    const selectedChild = children.find(c => c.id === selectedChildId);
    if (selectedChild) {
      const { isEligible, reason } = getChildEligibility(selectedChild);
      if (!isEligible) {
        toast({
          title: "Âge incompatible",
          description: reason || "L'âge de cet enfant ne correspond pas à cette activité",
          variant: "destructive"
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Connexion requise",
          description: "Connectez-vous pour finaliser la réservation",
          variant: "default"
        });
        navigate("/login");
        return;
      }

      // Generate idempotency key
      const compact = (s: string) => s.replace(/-/g, "").slice(0, 8);
      const idempotencyKey = `bkg_${compact(id!)}_${compact(slotId!)}_${compact(selectedChildId)}_${Date.now().toString(36)}`;

      // Préparer les données de réservation
      const bookingData: any = {
        activity_id: id,
        slot_id: slotId,
        child_id: selectedChildId,
        idempotency_key: idempotencyKey,
        express_flag: false
      };

      // Ajouter les aides si elles ont été calculées (optionnel)
      if (bookingState?.calculated && bookingState.aids) {
        bookingData.aids_applied = bookingState.aids;
        bookingData.aids_total_cents = Math.round(bookingState.totalAids * 100);
        bookingData.final_price_cents = Math.round(bookingState.remainingPrice * 100);
      }

      // Call bookings edge function
      const { data, error } = await supabase.functions.invoke("bookings", {
        body: bookingData
      });

      if (error) {
        console.error("Edge function error:", error);
        
        // Check for idempotency - booking already exists
        if (error.message?.includes("idempotency") || error.message?.includes("already exists")) {
          toast({
            title: "Demande déjà envoyée",
            description: "Cette réservation a déjà été traitée",
            variant: "default"
          });
          navigate(`/booking-status/${id}?status=pending`);
          return;
        }
        
        throw error;
      }

      if (!data || data.error) {
        throw new Error(data?.error || "Erreur lors de la création de la réservation");
      }

      // Success
      clearDraft();
      toast({
        title: "Demande envoyée",
        description: "Ta demande d'inscription a bien été transmise au club",
      });

      // Navigate to status page
      navigate(`/booking-status/${id}?status=pending&bookingId=${data.booking?.id}`);
      
    } catch (error: any) {
      console.error("Booking error:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de finaliser la réservation",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!authChecked || loadingActivity || loadingSlot || loadingChildren || loadingProfile) {
    return <LoadingState />;
  }

  if (!activity || !slot) {
    return (
      <div className="min-h-screen bg-background p-4">
        <ErrorState 
          message="Données introuvables" 
          onRetry={() => navigate(-1)} 
        />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container flex items-center gap-3 py-3 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            aria-label="Retour"
          >
            <ArrowLeft />
          </Button>
          <h1 className="font-semibold text-lg">Inscription</h1>
        </div>
      </div>

      <div className="container px-4 py-6 space-y-6">
        {/* Draft recovery alert */}
        {hasDraft && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Réservation en cours récupérée. Vous pouvez continuer là où vous vous êtes arrêté.
            </AlertDescription>
          </Alert>
        )}

        {/* Info sur les aides */}
        {bookingState?.calculated && bookingState.totalAids > 0 && (
          <Alert className="bg-primary/10 border-primary/20">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription>
              <strong>Tes aides ont été prises en compte :</strong> {bookingState.totalAids.toFixed(2)}€ d'aides seront appliquées. 
              Reste à charge : <strong>{bookingState.remainingPrice.toFixed(2)}€</strong>
            </AlertDescription>
          </Alert>
        )}

        {!bookingState?.calculated && (
          <Alert className="bg-muted/50 border-muted">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Vous pouvez revenir sur la fiche activité pour calculer vos aides avant de valider (optionnel).
            </AlertDescription>
          </Alert>
        )}

        {/* Age restrictions info */}
        {(activity.age_min !== null || activity.age_max !== null) && (
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-900">
              <strong>Tranche d'âge :</strong> Cette activité est réservée aux enfants de {activity.age_min || 0} à {activity.age_max || '99+'} ans.
            </AlertDescription>
          </Alert>
        )}

        {/* Activity summary */}
        <Card className="p-4">
          <h2 className="font-semibold text-lg mb-3">Récapitulatif</h2>
          <div className="space-y-2 text-sm">
            <p className="font-medium">{activity.title}</p>
            
            {activity.structures?.address && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={14} />
                <span>{activity.structures.address}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar size={14} />
              <span>
                {formatDate(slot.start)} · {formatTime(slot.start)} - {formatTime(slot.end)}
              </span>
            </div>

            <div className="pt-2 border-t">
              <p className="text-2xl font-bold text-primary">
                {activity.price_base === 0 ? "Gratuit" : `${activity.price_base}€`}
              </p>
            </div>
          </div>
        </Card>

        {/* Child selection */}
        <Card className="p-4">
          <h2 className="font-semibold text-lg mb-4">Sélectionner un enfant</h2>
          
          {children.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Aucun enfant enregistré. Ajoutez un enfant pour continuer.
              </p>
            </div>
          ) : (
            <>
              <TooltipProvider>
                <RadioGroup value={selectedChildId} onValueChange={setSelectedChildId}>
                  <div className="space-y-3">
                    {children.map((child) => {
                      const { age, isEligible, reason } = getChildEligibility(child);
                      
                      return (
                        <div key={child.id} className="flex items-center space-x-3">
                          <RadioGroupItem 
                            value={child.id} 
                            id={child.id} 
                            disabled={!isEligible}
                          />
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Label
                                htmlFor={child.id}
                                className={`flex-1 flex items-center gap-3 p-3 rounded-lg border ${
                                  isEligible 
                                    ? 'cursor-pointer hover:bg-accent/50' 
                                    : 'cursor-not-allowed opacity-50 bg-muted'
                                }`}
                              >
                                <User size={20} className="text-muted-foreground" />
                                <div className="flex-1">
                                  <p className="font-medium">{child.first_name}</p>
                                  <p className="text-sm text-muted-foreground">{age} ans</p>
                                </div>
                                {!isEligible && (
                                  <Badge variant="destructive" className="text-xs">
                                    Âge non éligible
                                  </Badge>
                                )}
                              </Label>
                            </TooltipTrigger>
                            {!isEligible && reason && (
                              <TooltipContent>
                                <p className="text-sm">{reason}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>
              </TooltipProvider>
              
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setShowAddChildModal(true)}
              >
                Ajouter un autre enfant
              </Button>
            </>
          )}
        </Card>

        {/* Submit button */}
        {(() => {
          const selectedChild = children.find(c => c.id === selectedChildId);
          const isEligible = selectedChild ? getChildEligibility(selectedChild).isEligible : true;
          const reason = selectedChild ? getChildEligibility(selectedChild).reason : null;
          
          return (
            <>
              {selectedChildId && !isEligible && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {reason}
                  </AlertDescription>
                </Alert>
              )}
              
              <Button
                onClick={handleSubmit}
                disabled={!selectedChildId || isSubmitting || children.length === 0 || !isEligible}
                className="w-full h-14 text-lg"
                size="lg"
              >
                {isSubmitting ? "En cours..." : "Confirmer la demande"}
              </Button>
            </>
          );
        })()}

        <p className="text-xs text-center text-muted-foreground">
          Votre demande sera transmise à la structure. Vous recevrez une confirmation par email.
        </p>
      </div>

      <KidQuickAddModal
        open={showAddChildModal}
        onClose={() => setShowAddChildModal(false)}
        onChildAdded={handleChildAdded}
        allowAnonymous={false}
      />

      <ParentalValidationModal
        open={showParentalValidationModal}
        onClose={() => setShowParentalValidationModal(false)}
        onValidated={() => {
          refetchProfile();
          setShowParentalValidationModal(false);
        }}
        activityId={id!}
        slotId={slotId || undefined}
        activityTitle={activity?.title}
      />
    </div>
  );
};

export default Booking;
