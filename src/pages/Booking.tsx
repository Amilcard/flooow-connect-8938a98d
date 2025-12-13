/**
 * Booking Page - Flux d'inscription à une activité
 * 
 * P0 Refonte:
 * - INS-01: Empty state + ajout enfant inline
 * - INS-02: Liste enfants triée (compatibles en premier)
 * - INS-03: Bouton désactivé avec message explicite
 * - INS-04: Récap enrichi
 * - INS-05: Skeleton + performance perçue
 * - Layout desktop 2 colonnes
 */
import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, AlertCircle, Info, UserPlus, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBookingDraft } from "@/hooks/useBookingDraft";
import { useSmartBack } from "@/hooks/useSmartBack";
import { useActivityBookingState } from "@/hooks/useActivityBookingState";
import { ParentalValidationModal } from "@/components/ParentalValidationModal";

// Composants spécifiques Booking
import { ChildCard } from "@/components/Booking/ChildCard";
import { BookingSkeleton } from "@/components/Booking/BookingSkeleton";
import { BookingRecap } from "@/components/Booking/BookingRecap";
import { InlineChildForm } from "@/components/Booking/InlineChildForm";

const Booking = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const slotId = searchParams.get("slotId");
  const sessionId = searchParams.get("sessionId");
  const occurrenceDate = searchParams.get("occurrenceDate");
  const handleBack = useSmartBack(id ? `/activity/${id}` : "/activities");

  const { draft, saveDraft, clearDraft, hasDraft } = useBookingDraft(id!, slotId || sessionId || "");
  const [selectedChildId, setSelectedChildId] = useState<string>(draft?.childId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showAddChildForm, setShowAddChildForm] = useState(false);
  const [showParentalValidationModal, setShowParentalValidationModal] = useState(false);

  // Récupérer les aides depuis le localStorage
  const { state: bookingState } = useActivityBookingState(id!);

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTH CHECK
  // ═══════════════════════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA FETCHING
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Fetch activity
  const { 
    data: activity, 
    isLoading: loadingActivity,
    error: activityError,
    refetch: refetchActivity
  } = useQuery({
    queryKey: ["activity", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // Cache 5 min
  });

  // Fetch slot (vacances)
  const { 
    data: slot, 
    isLoading: loadingSlot,
    error: slotError,
    refetch: refetchSlot
  } = useQuery({
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
    enabled: !!slotId,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch session (scolaire)
  const { 
    data: session, 
    isLoading: loadingSession,
    error: sessionError,
    refetch: refetchSession
  } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch children (avec prefetch possible)
  const { 
    data: children = [], 
    isLoading: loadingChildren,
    error: childrenError,
    refetch: refetchChildren
  } = useQuery({
    queryKey: ["children", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      return data || [];
    },
    enabled: authChecked && !!userId,
    staleTime: 2 * 60 * 1000, // Cache 2 min pour les enfants
  });

  // Fetch user profile (parental validation check)
  const { 
    data: userProfile, 
    isLoading: loadingProfile,
    refetch: refetchProfile
  } = useQuery({
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
    enabled: authChecked && !!userId,
    staleTime: 5 * 60 * 1000,
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTO-SAVE DRAFT
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (selectedChildId && id && (slotId || sessionId)) {
      saveDraft(selectedChildId);
    }
  }, [selectedChildId, id, slotId, sessionId, saveDraft]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ELIGIBILITY HELPERS
  // ═══════════════════════════════════════════════════════════════════════════
  const getChildEligibility = (child: { dob: string }) => {
    if (!activity) return { age: 0, isEligible: true, reason: null };
    
    const birthDate = new Date(child.dob);
    const referenceDate = slot ? new Date(slot.start) : new Date();
    let age = referenceDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = referenceDate.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) {
      age--;
    }
    
    const minAge = session?.age_min ?? activity.age_min ?? 0;
    const maxAge = session?.age_max ?? activity.age_max ?? 999;
    const isEligible = age >= minAge && age <= maxAge;
    
    let reason: string | null = null;
    if (!isEligible) {
      const ageRange = maxAge < 999 ? `${minAge}–${maxAge} ans` : `à partir de ${minAge} ans`;
      reason = `Activité réservée aux enfants de ${ageRange}`;
    }
    
    return { age, isEligible, reason };
  };

  // Trier les enfants: compatibles en premier
  const sortedChildren = useMemo(() => {
    if (!children.length) return [];
    
    return [...children].sort((a, b) => {
      const aEligible = getChildEligibility(a).isEligible;
      const bEligible = getChildEligibility(b).isEligible;
      
      if (aEligible && !bEligible) return -1;
      if (!aEligible && bEligible) return 1;
      return 0;
    });
  }, [children, activity, session, slot]);

  // ═══════════════════════════════════════════════════════════════════════════
  // PARENTAL VALIDATION CHECK
  // ═══════════════════════════════════════════════════════════════════════════
  const needsParentalValidation = !loadingChildren && !loadingProfile &&
    children.length === 0 &&
    userProfile &&
    !userProfile.parent_id;

  useEffect(() => {
    if (!authChecked || loadingChildren || loadingProfile) return;

    if (needsParentalValidation && !showParentalValidationModal) {
      setShowParentalValidationModal(true);
    }
  }, [authChecked, loadingChildren, loadingProfile, needsParentalValidation, showParentalValidationModal]);

  // ═══════════════════════════════════════════════════════════════════════════
  // CHILD ADDED HANDLER
  // ═══════════════════════════════════════════════════════════════════════════
  const handleChildAdded = (childId: string) => {
    refetchChildren();
    setSelectedChildId(childId);
    setShowAddChildForm(false);
    
    // Vérifier l'éligibilité du nouvel enfant
    setTimeout(() => {
      const newChild = children.find(c => c.id === childId);
      if (newChild) {
        const { isEligible } = getChildEligibility(newChild);
        if (!isEligible) {
          toast({
            title: "Âge non compatible",
            description: "Cet enfant a été ajouté mais n'est pas éligible à cette activité.",
            variant: "default"
          });
        }
      }
    }, 500);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SUBMIT HANDLER
  // ═══════════════════════════════════════════════════════════════════════════
  const handleSubmit = async () => {
    if (!selectedChildId) {
      toast({
        title: "Sélection requise",
        description: "Choisissez un enfant pour continuer",
        variant: "default"
      });
      return;
    }

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
      const { data: { session: authSession } } = await supabase.auth.getSession();
      
      if (!authSession) {
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
      const slotOrSessionId = slotId || sessionId || "";
      const idempotencyKey = `bkg_${compact(id!)}_${compact(slotOrSessionId)}_${compact(selectedChildId)}_${Date.now().toString(36)}`;

      // Préparer les données
      const bookingData: Record<string, unknown> = {
        activity_id: id,
        slot_id: slotId,
        session_id: sessionId,
        child_id: selectedChildId,
        idempotency_key: idempotencyKey,
        express_flag: false
      };

      // Ajouter les aides si calculées
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

      clearDraft();
      toast({
        title: "Demande envoyée",
        description: "Ta demande d'inscription a bien été transmise au club",
      });

      navigate(`/booking-status/${id}?status=pending&bookingId=${data.booking?.id}`);
      
    } catch (error: unknown) {
      console.error("Booking error:", error);
      const errorMessage = error instanceof Error ? error.message : "Impossible de finaliser la réservation";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // LOADING STATE - SKELETON
  // ═══════════════════════════════════════════════════════════════════════════
  const isInitialLoading = !authChecked || loadingActivity || 
    (slotId && loadingSlot) || (sessionId && loadingSession);

  if (isInitialLoading) {
    return <BookingSkeleton />;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ERROR STATE
  // ═══════════════════════════════════════════════════════════════════════════
  const hasError = activityError || slotError || sessionError;
  
  if (hasError || !activity) {
    return (
      <div className="min-h-screen bg-background pb-6">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
          <div className="container flex items-center gap-3 py-3 px-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft />
            </Button>
            <h1 className="font-semibold text-lg">Inscription</h1>
          </div>
        </div>
        
        <div className="container px-4 py-12">
          <Card className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h2 className="text-lg font-semibold mb-2">Données introuvables</h2>
            <p className="text-muted-foreground mb-4">
              Impossible de charger les informations de cette activité.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleBack}>
                Retour
              </Button>
              <Button onClick={() => {
                refetchActivity();
                if (slotId) refetchSlot();
                if (sessionId) refetchSession();
              }}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Réessayer
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BUTTON STATE LOGIC
  // ═══════════════════════════════════════════════════════════════════════════
  const selectedChild = children.find(c => c.id === selectedChildId);
  const selectedChildEligibility = selectedChild ? getChildEligibility(selectedChild) : null;
  const isSelectedChildEligible = selectedChildEligibility?.isEligible ?? true;

  let buttonDisabled = false;
  let buttonLabel = "Confirmer la demande";

  if (children.length === 0 && !showAddChildForm) {
    buttonDisabled = true;
    buttonLabel = "Ajoutez un enfant pour continuer";
  } else if (!selectedChildId) {
    buttonDisabled = true;
    buttonLabel = "Sélectionnez un enfant";
  } else if (!isSelectedChildEligible) {
    buttonDisabled = true;
    buttonLabel = "Enfant non éligible";
  }

  if (isSubmitting) {
    buttonLabel = "En cours...";
  }

  // Age range for display
  const ageMin = session?.age_min ?? activity.age_min ?? 0;
  const ageMax = session?.age_max ?? activity.age_max;

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
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

      <div className="container px-4 py-6">
        {/* Draft recovery */}
        {hasDraft && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Réservation en cours récupérée. Vous pouvez continuer là où vous vous êtes arrêté.
            </AlertDescription>
          </Alert>
        )}

        {/* Layout: 2 colonnes desktop, empilé mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* COLONNE GAUCHE - Sélection enfant */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Info aides */}
            {bookingState?.calculated && bookingState.totalAids > 0 && (
              <Alert className="bg-green-50 border-green-200">
                <Info className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Tes aides ont été prises en compte :</strong> {bookingState.totalAids.toFixed(2)}€ d'aides seront appliquées.
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

            {/* Age range info */}
            {(activity.age_min !== null || activity.age_max !== null) && (
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-900">
                  <strong>Tranche d'âge :</strong> Cette activité est réservée aux enfants de {ageMin} à {ageMax || '99+'} ans.
                </AlertDescription>
              </Alert>
            )}

            {/* Bloc sélection enfant */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Sélectionner un enfant</h2>
                {children.length > 0 && !showAddChildForm && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddChildForm(true)}
                  >
                    <UserPlus size={16} className="mr-2" />
                    Ajouter
                  </Button>
                )}
              </div>

              {/* Loading enfants */}
              {loadingChildren ? (
                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="flex items-center gap-4 p-4 border rounded-lg animate-pulse">
                      <div className="w-12 h-12 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 w-32 bg-muted rounded" />
                        <div className="h-4 w-24 bg-muted rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : childrenError ? (
                /* Erreur chargement enfants */
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-10 w-10 text-destructive mb-3" />
                  <p className="text-muted-foreground mb-4">
                    Impossible de charger vos enfants.
                  </p>
                  <Button variant="outline" onClick={() => refetchChildren()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Réessayer
                  </Button>
                </div>
              ) : children.length === 0 && !showAddChildForm ? (
                /* Empty state - INS-01 */
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserPlus size={32} className="text-primary" />
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Aucun enfant enregistré. Ajoutez un enfant pour continuer.
                  </p>
                  <Button onClick={() => setShowAddChildForm(true)}>
                    <UserPlus size={18} className="mr-2" />
                    Ajouter un enfant
                  </Button>
                </div>
              ) : (
                /* Liste des enfants - INS-02 */
                <div className="space-y-3">
                  {sortedChildren.map((child) => {
                    const { age, isEligible, reason } = getChildEligibility(child);
                    
                    return (
                      <ChildCard
                        key={child.id}
                        id={child.id}
                        firstName={child.first_name}
                        lastName={child.last_name}
                        age={age}
                        birthDate={child.dob}
                        isSelected={selectedChildId === child.id}
                        isEligible={isEligible}
                        eligibilityReason={reason}
                        onClick={() => setSelectedChildId(child.id)}
                      />
                    );
                  })}
                </div>
              )}

              {/* Formulaire inline - INS-01 */}
              {showAddChildForm && userId && (
                <div className={children.length > 0 ? "mt-4" : ""}>
                  <InlineChildForm
                    userId={userId}
                    ageMin={ageMin}
                    ageMax={ageMax || undefined}
                    onChildAdded={handleChildAdded}
                    onCancel={() => setShowAddChildForm(false)}
                    showCancel={children.length > 0}
                  />
                </div>
              )}
            </Card>

            {/* Message âge incompatible inline - INS-03 */}
            {selectedChildId && !isSelectedChildEligible && selectedChildEligibility?.reason && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {selectedChildEligibility.reason}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* COLONNE DROITE - Récap + Bouton */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 space-y-4">
            {/* Récap enrichi - INS-04 */}
            <BookingRecap
              activity={activity}
              slot={slot}
              session={session}
              occurrenceDate={occurrenceDate}
              totalAids={bookingState?.calculated ? bookingState.totalAids : undefined}
              remainingPrice={bookingState?.calculated ? bookingState.remainingPrice : undefined}
            />

            {/* Bouton confirmer - INS-03 */}
            <Button
              onClick={handleSubmit}
              disabled={buttonDisabled || isSubmitting}
              className="w-full h-14 text-lg"
              size="lg"
            >
              {buttonLabel}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Votre demande sera transmise à la structure. Vous recevrez une confirmation par email.
            </p>
          </div>
        </div>
      </div>

      {/* Modal validation parentale */}
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
