import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { logEvent } from "@/hooks/useEventLogger";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VACATION_PERIOD_DATES } from "@/components/VacationPeriodFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { BottomNavigation } from "@/components/BottomNavigation";
import { PageHeader } from "@/components/PageHeader";
import { ActivityShareButton } from "@/components/ActivityShareButton";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  CheckCircle2,
  Share2,
  Copy,
  Check,
  Leaf
} from "lucide-react";
import { useState, useEffect } from "react";
import { ContactOrganizerModal } from "@/components/ContactOrganizerModal";
import { WaitlistRequestModal } from "@/components/FlooowFamily/WaitlistRequestModal";
import { EcoMobilitySection } from "@/components/Activity/EcoMobilitySection";
import { useActivityViewTracking } from "@/lib/tracking";
import { SharedAidCalculator } from "@/components/aids/SharedAidCalculator";
import { useActivityBookingState } from "@/hooks/useActivityBookingState";
import activitySportImg from "@/assets/activity-sport.jpg";
import activityLoisirsImg from "@/assets/activity-loisirs.jpg";
import activityVacancesImg from "@/assets/activity-vacances.jpg";
import activityCultureImg from "@/assets/activity-culture.jpg";
import { CompactHeroHeader } from "@/components/Activity/CompactHeroHeader";
import { QuickInfoBar } from "@/components/Activity/QuickInfoBar";
import { StickyBookingCTA } from "@/components/Activity/StickyBookingCTA";

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
  
  // Guard: id requis
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const periodFilter = searchParams.get("period") || undefined;
  const tabParam = searchParams.get("tab");
  const visualParam = searchParams.get("visual");
  const [activeTab, setActiveTab] = useState<string>(
    ["infos", "tarifs", "trajets"].includes(tabParam || "")
      ? tabParam!
      : "infos"
  );
  const [selectedSlotId, setSelectedSlotId] = useState<string>();
  const [selectedSessionIdx, setSelectedSessionIdx] = useState<number | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistSlotId, setWaitlistSlotId] = useState<string | undefined>();
  const [waitlistSlotLabel, setWaitlistSlotLabel] = useState<string | undefined>();
  const [imgError, setImgError] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Feature flag: mode visuel mobile
  const mobileVisualMode = visualParam === "true";
  
  // Hook pour la persistance des données d'aides et de transport
  const { state: bookingState, saveAidCalculation, saveTransportMode } = useActivityBookingState(id || "");
  
  // États pour les aides calculées
  const [aidsData, setAidsData] = useState<{
    childId: string;
    quotientFamilial: string;
    cityCode: string;
    aids: any[];
    totalAids: number;
    remainingPrice: number;
  } | null>(null);

  // Restaurer les données d'aides depuis le state persisté
  useEffect(() => {
    if (bookingState?.calculated && !aidsData) {
      setAidsData({
        childId: bookingState.childId,
        quotientFamilial: bookingState.quotientFamilial,
        cityCode: bookingState.cityCode,
        aids: bookingState.aids,
        totalAids: bookingState.totalAids,
        remainingPrice: bookingState.remainingPrice
      });
    }
  }, [bookingState, aidsData]);

  // Tracking consultation activité (durée)
  const trackActivityView = useActivityViewTracking(id, 'direct');

  useEffect(() => {
    // Cleanup: logger la durée de consultation à la fermeture
    return trackActivityView;
  }, [trackActivityView]);

  // Fetch activity details
  const { data: activity, isLoading, error } = useQuery({
    queryKey: ["activity", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          organisms:organism_id (
            name,
            address,
            phone
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 300000,
    gcTime: 600000
  });


  // Fetch sessions pour cette activité
  const { data: sessions = [] } = useQuery({
    queryKey: ["activity_sessions", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_sessions")
        .select("*")
        .eq("activity_id", id)
        .order("age_min", { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 300000,
    gcTime: 600000
  });

  // Log consultation activité
  useEffect(() => {
    if (activity && id) {
      logEvent({
        eventType: "view_activity",
        activityId: id,
        metadata: {
          title: activity.title,
          category: activity.categories?.[0],
          periodType: activity.period_type,
          price: activity.price_base
        }
      });
    }
  }, [activity, id]);
  // Fetch availability slots
  const { data: allSlots = [] } = useQuery({
    queryKey: ["slots", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("availability_slots")
        .select("*")
        .eq("activity_id", id)
        .gte("seats_remaining", 0) // Show ALL slots (available AND full) - full slots are disabled in UI
        .order("start", { ascending: true });

      if (error) throw error;
      return data;
    },
    staleTime: 300000,
    gcTime: 600000
  });

  // Filtrer les créneaux selon la période sélectionnée
  const slots = allSlots.filter(slot => {
    if (!periodFilter) return true; // Pas de filtre, on affiche tout
    
    const periodDates = VACATION_PERIOD_DATES[periodFilter as keyof typeof VACATION_PERIOD_DATES];
    if (!periodDates) return true;

    const slotStart = new Date(slot.start);
    const periodStart = new Date(periodDates.start);
    const periodEnd = new Date(periodDates.end);

    return slotStart >= periodStart && slotStart <= periodEnd;
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
    },
    staleTime: 300000, // 5min cache
    gcTime: 600000
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
    },
    staleTime: 300000,
    gcTime: 600000
  });

  // Nettoyer les données persistées si l'utilisateur n'est pas connecté
  useEffect(() => {
    const checkAndCleanState = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Si pas d'utilisateur connecté et qu'il y a des données persistées
      if (!user && (bookingState?.calculated || aidsData)) {
        setAidsData(null);
        // Ne pas appeler saveAidCalculation ici pour éviter de persister des données vides
        // Le localStorage sera nettoyé au prochain logout
      }
    };
    
    checkAndCleanState();
  }, [userProfile]);

  // Logique des états d'inscription basée sur les VRAIES données (places disponibles)
  // Pas de règle arbitraire "après octobre c'est fermé"
  const hasAvailableSlots = slots.some(slot => slot.seats_remaining > 0);
  const hasAvailableSessions = sessions.length > 0; // Sessions scolaires considérées dispo par défaut
  const isActivityOpen = activity ? (activity.period_type === "scolaire" ? hasAvailableSessions : hasAvailableSlots) : false;
  const isActivityClosed = !!activity && !isActivityOpen;

  // Fetch activités alternatives si activité complète (DOIT être avant early returns)
  const { data: alternatives = [] } = useQuery({
    queryKey: ["alternatives", activity?.id, activity?.categories, activity?.age_min, activity?.age_max],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("id, title, categories, age_min, age_max, price_base, period_type, images")
        .neq("id", activity!.id)
        .eq("is_published", true)
        .lte("age_min", activity!.age_max)
        .gte("age_max", activity!.age_min)
        .limit(3);
      if (error) throw error;
      return data || [];
    },
    enabled: isActivityClosed
  });

  if (isLoading) return <LoadingState />;
  if (error || !activity) {
    return (
      <div className="min-h-screen bg-background p-4">
        <ErrorState 
          message="Activité introuvable" 
          onRetry={() => navigate("/home")} 
        />
      </div>
    );
  }

  const handleBooking = () => {
    if (activity.period_type === "scolaire" ? selectedSessionIdx === null : !selectedSlotId) {
      toast({
        title: "Créneau requis",
        description: "Veuillez sélectionner un créneau",
        variant: "destructive"
      });
      return;
    }

    // Rediriger vers la page d'inscription
    // Les aides sont optionnelles, elles seront reprises si calculées
    const bookingUrl = activity.period_type === "scolaire" && selectedSessionIdx !== null ? `/booking/${id}?sessionIdx=${selectedSessionIdx}` : `/booking/${id}?slotId=${selectedSlotId}`; navigate(bookingUrl);
  };

  const handleAidsCalculated = (data: {
    childId: string;
    quotientFamilial: string;
    cityCode: string;
    aids: any[];
    totalAids: number;
    remainingPrice: number;
  }) => {
    setAidsData(data);
    saveAidCalculation(data); // Sauvegarder dans le state persisté
  };

  const handleTransportModeSelected = (mode: { type: "bus" | "bike" | "walk"; label: string; duration: number; details?: string }) => {
    saveTransportMode(mode);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = activity.title;
    const shareText = `Découvrez cette activité: ${activity.title}`;

    // Try Web Share API (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      // Desktop: toggle share menu
      setShowShareMenu(!showShareMenu);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowShareMenu(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Découvrez cette activité: ${activity.title}`);
    const body = encodeURIComponent(`Je pense que cette activité pourrait vous intéresser:\n\n${activity.title}\n${window.location.href}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`Découvrez cette activité: ${activity.title}\n${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
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

  const selectedSlot = slots.find(s => s.id === selectedSlotId);

  const fallbackImage = getCategoryImage(activity.category);
  const displayImage = activity.images?.[0] || fallbackImage;
  const ageRange = sessions.length > 0 ? sessions.map(s => `${s.age_min}-${s.age_max} ans`).filter((v, i, a) => a.indexOf(v) === i).join(" / ") : `${activity.age_min}-${activity.age_max} ans`;

  // Calculer les prochaines dates pour un jour de semaine donné
  const getNextDates = (dayOfWeek: number | null, count: number = 3): string[] => {
    if (dayOfWeek === null) return [];
    const dates: string[] = [];
    const today = new Date();
    const currentDay = today.getDay();
    let daysUntil = dayOfWeek - currentDay;
    if (daysUntil <= 0) daysUntil += 7;
    for (let i = 0; i < count; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + daysUntil + (i * 7));
      dates.push(nextDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }));
    }
    return dates;
  };
  const getNextDate = (dayOfWeek: number | null): string => getNextDates(dayOfWeek, 1)[0] || "";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Compact Hero Header (160px optimisé) */}
      <CompactHeroHeader
        imageUrl={displayImage}
        title={activity.title}
        category={activity.category}
        categories={activity.categories}
        backFallback="/home"
        rightContent={
          <div className="relative">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleShare}
                    className="bg-white/90 backdrop-blur-md hover:bg-white shadow-md w-10 h-10 rounded-full"
                  >
                    <Share2 size={18} className="text-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Partager</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Share menu for desktop */}
            {showShareMenu && (
              <Card className="absolute right-0 top-12 z-50 w-56 p-2 shadow-lg">
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={shareViaWhatsApp}
                  >
                    <MessageCircle size={16} className="mr-2" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={shareViaEmail}
                  >
                    <Mail size={16} className="mr-2" />
                    E-mail
                  </Button>
                  <Separator className="my-1" />
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={copyLink}
                  >
                    {copied ? (
                      <>
                        <Check size={16} className="mr-2 text-green-600" />
                        <span className="text-green-600">Lien copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} className="mr-2" />
                        Copier le lien
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            )}
          </div>
        }
      />

      {/* Quick Info Bar - Informations essentielles en un coup d'œil */}
      <QuickInfoBar
        ageRange={{ min: activity.age_min, max: activity.age_max }}
        isFree={activity.price_base === 0}
        spotsRemaining={slots.reduce((min, slot) => Math.min(min, slot.seats_remaining), Infinity)}
        paymentEchelonned={activity.payment_echelonned || false}
        hasAccessibility={
          typeof activity.accessibility_checklist === 'object' &&
          activity.accessibility_checklist !== null &&
          'wheelchair' in activity.accessibility_checklist &&
          Boolean((activity.accessibility_checklist as any).wheelchair)
        }
      />

      {/* Main Content Container - Airbnb Style with Grid */}
      <div className="container px-4 md:px-6 py-8 max-w-[1140px] mx-auto">
        {/* Header Section - Réorganisé: Titre → Méta → Organisateur */}
        <div className="space-y-4 pb-8 border-b mb-8" data-tour-id="activity-header">
          {/* Titre H1 fort sans bouton partage (maintenant sur l'image) */}
          <h1 className="title-page md:text-4xl">
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
                  {activity.period_type === 'scolaire' 
                    ? 'Année scolaire' 
                    : 'Vacances scolaires'}
                </span>
              </span>
            )}
            
            {activity.organisms?.address && (
              <span className="flex items-center gap-2">
                <MapPin size={20} className="text-primary" />
                <span className="text-muted-foreground">{activity.organisms.address}</span>
              </span>
            )}
          </div>

          {/* Organisateur avec lien contact discret */}
          {activity.organisms?.name && (
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Building2 size={20} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  Organisé par {activity.organisms.name}
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
          {/* Left Column - Main content with Tabs (8/12) */}
          <div className="md:col-span-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2 md:grid-cols-3 gap-1 h-auto p-1 mb-6">
                <TabsTrigger value="infos" className="text-xs md:text-sm">Infos</TabsTrigger>
                <TabsTrigger value="tarifs" className="text-xs md:text-sm flex items-center gap-1.5" data-tour-id="tab-tarifs">
                  <Euro size={14} className="hidden md:inline" />
                  Tarifs & aides
                </TabsTrigger>
                <TabsTrigger value="trajets" className="text-xs md:text-sm flex items-center gap-1.5">
                  <Leaf size={14} className="hidden md:inline" />
                  Trajets
                </TabsTrigger>
              </TabsList>

              {/* Onglet Infos */}
              <TabsContent value="infos" className="space-y-8 mt-0">
                {activity.description && (
                  <section className="space-y-3" data-tour-id="activity-infos-main">
                    <h2 className="text-2xl font-bold text-foreground">À propos de cette activité</h2>
                    <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                      {activity.description}
                    </p>
                  </section>
                )}

                {/* Informations pratiques - Layout en colonnes alignées */}
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">Informations pratiques</h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Colonne gauche */}
                    <div className="space-y-4">
                      {sessions.length > 0 && (
                        <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                          <Calendar size={20} className="text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">Rythme</p>
                            <p className="text-sm text-muted-foreground">
                              {activity.period_type === "scolaire" ? "Atelier hebdomadaire" : "Stage vacances"} — voir créneaux disponibles
                            </p>
                          </div>
                        </div>
                      )}























                      {typeof activity.accessibility_checklist === 'object' &&
                       activity.accessibility_checklist !== null &&
                       'wheelchair' in activity.accessibility_checklist &&
                       activity.accessibility_checklist.wheelchair && (
                        <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors" data-tour-id="inklusif-badge-detail">
                          <Accessibility size={20} className="text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">Activité InKlusif</p>
                            <p className="text-sm text-muted-foreground">Adaptée aux personnes en situation de handicap</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Colonne droite */}
                    <div className="space-y-4">
                      {activity.organisms?.address && (
                        <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                          <MapPin size={20} className="text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">Lieu</p>
                            <p className="text-sm text-muted-foreground">{activity.organisms.address}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Informations supplémentaires en dessous */}
                  {(activity.covoiturage_enabled || activity.payment_echelonned) && (
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      {activity.covoiturage_enabled && (
                        <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                          <Car size={20} className="text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">Covoiturage</p>
                            <p className="text-sm text-muted-foreground">Service disponible</p>
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
                  )}
                </section>
              </TabsContent>

              {/* Onglet Tarifs & aides */}
              <TabsContent value="tarifs" className="space-y-8 mt-0">
                <section className="space-y-4">
                  <div className="flex items-baseline gap-4 mb-6">
                    <h2 className="text-2xl font-bold text-foreground">Tarifs</h2>
                    <span className="text-3xl font-bold text-primary">
                      {activity.price_base === 0 ? "Gratuit" : `${activity.price_base}€`}
                    </span>
                    {(activity.price_note || activity.period_type) && (
                      <span className="text-sm text-muted-foreground">{activity.price_note || (activity.period_type === "scolaire" ? "la saison" : "le séjour")}</span>
                    )}
                  </div>

                  {aidsData && (
                    <Card className="p-4 bg-accent/50">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Prix initial</span>
                          <span className="font-medium">{activity.price_base.toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between text-sm text-primary">
                          <span>Aides appliquées</span>
                          <span className="font-medium">- {aidsData.totalAids.toFixed(2)}€</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg font-bold" data-tour-id="reste-charge-title">
                          <span>Reste à charge estimé</span>
                          <span className="text-primary">{aidsData.remainingPrice.toFixed(2)}€</span>
                        </div>
                      </div>
                    </Card>
                  )}
                </section>

                {/* Évaluer son aide */}
                {Array.isArray(activity.accepts_aid_types) && activity.accepts_aid_types.length > 0 && (
                  <section id="aides-section" className="space-y-4" data-tour-id="aid-simulation-section">
                    <h3 className="text-xl font-semibold text-foreground">Évaluer son aide</h3>
                    <Alert className="bg-muted/50 border-primary/20">
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        <strong>L'estimation des aides est facultative.</strong> Inscription directe possible sans calcul préalable.
                        Pour connaître son reste à charge avant de s'inscrire, utiliser le calculateur ci-dessous.
                      </AlertDescription>
                    </Alert>

                    <div data-tour-id="aid-simulation-calculator">
                      <SharedAidCalculator
                        resetOnMount={false}
                        activityId={id!}
                        activityPrice={activity.price_base || 0}
                        activityCategories={activity.categories || [activity.category]}
                        periodType={activity.period_type}
                        ageMin={activity.age_min || 3}
                        ageMax={activity.age_max || 17}
                        userProfile={userProfile}
                        children={children}
                        onAidsCalculated={handleAidsCalculated}
                      />
                    </div>
                  </section>
                )}
              </TabsContent>

              {/* Onglet Trajets */}
              <TabsContent value="trajets" className="mt-0">
                <div data-tour-id="mobility-cards">
                  <EcoMobilitySection
                    activityId={activity.id}
                    activityAddress={activity.organisms?.address}
                    structureName={activity.organisms?.name}
                    structureContactJson={activity.organisms?.phone}
                    onTransportModeSelected={(mode) => {
                      console.log('Transport mode selected:', mode);
                    }}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sticky Booking Card (4/12) */}
          <div className="md:col-span-4">
            <Card className="p-6 md:sticky md:top-24 space-y-6">
              <h3 className="font-bold text-lg">Tarifs & créneaux disponibles</h3>
              {/* Prix et aides */}
              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold">
                    {activity.price_base === 0 ? "Gratuit" : `${activity.price_base}€`}
                  </span>
                  {(activity.price_note || activity.period_type) && (
                    <span className="text-sm text-muted-foreground">{activity.price_note || (activity.period_type === "scolaire" ? "la saison" : "le séjour")}</span>
                  )}
                </div>

                {aidsData && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Prix initial</span>
                        <span className="font-medium">{activity.price_base.toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between text-sm text-primary">
                        <span>Aides appliquées</span>
                        <span className="font-medium">- {aidsData.totalAids.toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2" data-tour-id="reste-charge-sticky">
                        <span>Reste à charge estimé</span>
                        <span className="text-primary">{aidsData.remainingPrice.toFixed(2)}€</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Créneaux disponibles */}
              {(activity.period_type === "scolaire" ? sessions.length > 0 : slots.length > 0) && (
                <>
                  <Separator />
                  <div className="space-y-4" data-tour-id="aid-creneaux-list">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Horaires</h3>
                      {periodFilter && (
                        <Badge variant="secondary" className="text-xs">
                          {periodFilter === "printemps_2026" ? "🌸 Printemps" : "☀️ Été"}
                        </Badge>
                      )}
                    </div>

                    {/* Notice: saison déjà commencée mais inscription possible */}
                    {activity.period_type === "scolaire" && !isActivityClosed && (
                      <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                        <Info size={14} />
                        <span>Saison en cours · Inscription toujours possible</span>
                      </div>
                    )}
                    
                    {activity.period_type === "scolaire" ? (
                    <div className="space-y-2">
                      {sessions.map((s, idx) => {
                        const nextDate = getNextDate(s.day_of_week);
                        const dayName = s.day_of_week !== null ? ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"][s.day_of_week] : null;
                        return (
                          <Card
                            key={idx}
                            className={`p-3 cursor-pointer transition-all ${selectedSessionIdx === idx ? "ring-2 ring-primary bg-accent" : "hover:bg-accent/50"}`}
                            onClick={() => setSelectedSessionIdx(idx)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{s.age_min}-{s.age_max} ans</span>
                              <span className="text-sm text-muted-foreground">
                                {dayName} {s.start_time?.slice(0,5)}-{s.end_time?.slice(0,5)}
                              </span>
                            </div>
                            {dayName && nextDate && (
                              <p className="text-xs text-primary mt-1">
                                Prochaine séance : {dayName} {nextDate}
                              </p>
                            )}
                            {dayName && getNextDates(s.day_of_week, 3).length > 1 && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Voir les autres dates ({getNextDates(s.day_of_week, 3).length - 1})
                              </p>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                      {slots.map(slot => {
                        const startDate = new Date(slot.start);
                        const endDate = new Date(slot.end);
                        const isFull = slot.seats_remaining <= 0;
                        const isSelected = selectedSlotId === slot.id;
                        return (
                          <Card
                            key={slot.id}
                            className={`p-3 transition-all ${
                              isFull
                                ? 'opacity-60 bg-muted cursor-not-allowed'
                                : isSelected
                                  ? 'ring-2 ring-primary bg-accent cursor-pointer'
                                  : 'hover:bg-accent/50 cursor-pointer'
                            }`}
                            onClick={() => !isFull && setSelectedSlotId(slot.id)}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Calendar size={14} className={isFull ? "text-muted-foreground" : "text-primary"} />
                                  <span className="text-sm font-medium">
                                    {startDate.toLocaleDateString('fr-FR', {
                                      weekday: 'short',
                                      day: 'numeric',
                                      month: 'short'
                                    })}
                                  </span>
                                </div>
                                <Badge variant={isFull ? "secondary" : "outline"} className="text-xs">
                                  {isFull ? "Complet" : `${slot.seats_remaining} places`}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground ml-5">
                                {startDate.toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })} - {endDate.toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                              {isFull && (
                                <button
                                  type="button"
                                  className="text-xs text-primary mt-1 ml-5 hover:underline text-left"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const d = new Date(slot.start);
                                    const label = `${d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
                                    setWaitlistSlotId(slot.id);
                                    setWaitlistSlotLabel(label);
                                    setShowWaitlistModal(true);
                                  }}
                                >
                                  → Demander une place via la Flooow Family
                                </button>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}

                    {/* Récap "Votre choix" quand un créneau est sélectionné */}
                    {activity.period_type === "scolaire" && selectedSessionIdx !== null && sessions[selectedSessionIdx] && (
                      <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="text-xs text-muted-foreground">Vous allez inscrire :</p>
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {sessions[selectedSessionIdx].age_min}-{sessions[selectedSessionIdx].age_max} ans · {sessions[selectedSessionIdx].day_of_week !== null ? ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"][sessions[selectedSessionIdx].day_of_week] : ""} {getNextDate(sessions[selectedSessionIdx].day_of_week)} · {sessions[selectedSessionIdx].start_time?.slice(0,5)}-{sessions[selectedSessionIdx].end_time?.slice(0,5)}
                        </p>
                      </div>
                    )}
                    {activity.period_type !== "scolaire" && selectedSlotId && slots.find(s => s.id === selectedSlotId) && (() => {
                      const sel = slots.find(s => s.id === selectedSlotId)!;
                      const d = new Date(sel.start);
                      return (
                        <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                          <p className="text-xs text-muted-foreground">Vous allez inscrire :</p>
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} · {d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      );
                    })()}

                    {/* Bloc si certains créneaux sont complets mais pas tous */}
                    {!isActivityClosed && slots.some(s => s.seats_remaining <= 0) && slots.some(s => s.seats_remaining > 0) && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg text-xs">
                        <p className="font-medium">Le créneau que vous visiez est complet ?</p>
                        <p className="text-muted-foreground mt-1">Inscrivez votre enfant sur un créneau disponible, ou demandez une place sur liste d'attente via la Flooow Family.</p>
                      </div>
                    )}

                    <Button
                      onClick={handleBooking}
                      disabled={isActivityClosed || (activity.period_type === "scolaire" ? selectedSessionIdx === null : !selectedSlotId)}
                      className="w-full h-12 text-base font-semibold"
                      size="lg"
                    >
                      {isActivityClosed
                        ? "Inscriptions complètes"
                        : (activity.period_type === "scolaire" ? selectedSessionIdx === null : !selectedSlotId)
                          ? "Sélectionnez un créneau"
                          : "Inscrire mon enfant"}
                    </Button>

                    {isActivityClosed && (
                      <div className="mt-4 p-4 bg-accent/50 rounded-lg space-y-3">
                        <p className="text-sm font-medium text-center">
                          Ça se bouscule pour cet atelier... mais on a encore des cartes en main ! 💪
                        </p>
                        <div className="text-xs text-center text-muted-foreground space-y-2">
                          <p>La <strong className="text-primary">Flooow Family</strong> peut vous trouver une place.</p>
                          <Button
                            variant="default"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              setWaitlistSlotId(undefined);
                              setWaitlistSlotLabel(undefined);
                              setShowWaitlistModal(true);
                            }}
                          >
                            Demander une place
                          </Button>
                        </div>
                      </div>
                    )}
                    {isActivityClosed && alternatives.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <p className="text-sm font-medium text-center">
                          La <span className="text-primary">Flooow Family</span> a d'autres idées pour vous :
                        </p>
                        {alternatives.slice(0, 3).map((alt: any) => (
                          <Card key={alt.id} className="p-3 cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate(`/activity/${alt.id}`)}>
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm font-medium">{alt.title}</p>
                                <p className="text-xs text-muted-foreground">{alt.age_min}-{alt.age_max} ans</p>
                              </div>
                              <span className="text-sm font-bold text-primary">{alt.price_base === 0 ? "Gratuit" : `${alt.price_base}€`}</span>
                            </div>
                          </Card>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs text-muted-foreground hover:text-primary"
                          onClick={() => navigate(`/home?ageMin=${activity.age_min}&ageMax=${activity.age_max}`)}
                        >
                          Voir d'autres activités pour cette tranche d'âge →
                        </Button>
                      </div>
                    )}
                    {!aidsData && (
                      <p className="text-xs text-center text-muted-foreground">
                        {activeTab === "infos" ? "💡 Avant de confirmer, estimez vos aides dans l'onglet « Tarifs & aides »." : activeTab === "trajets" ? "💡 Estimez vos aides dans « Tarifs & aides » puis choisissez votre trajet." : "💡 Utilisez le calculateur ci-dessus pour estimer vos aides."}
                      </p>
                    )}
                  </div>
                </>
              )}

              <Separator />

              {/* Garanties */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary" />
                  <span>Annulation gratuite</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary" />
                  <span>Confirmation immédiate</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>


      {activity.organisms && typeof activity.organisms.phone === 'object' && activity.organisms.phone !== null && (
        <ContactOrganizerModal
          open={showContactModal}
          onOpenChange={setShowContactModal}
          organizerName={activity.organisms.name}
          organizerEmail={'email' in activity.organisms.phone ? String(activity.organisms.phone.email) : ''}
          organizerPhone={'phone' in activity.organisms.phone ? String(activity.organisms.phone.phone) : undefined}
          activityTitle={activity.title}
        />
      )}

      {/* Modale Flooow Family - Liste d'attente */}
      <WaitlistRequestModal
        open={showWaitlistModal}
        onOpenChange={setShowWaitlistModal}
        activityId={activity.id}
        activityTitle={activity.title}
        slotId={waitlistSlotId}
        slotLabel={waitlistSlotLabel}
        ageRange={ageRange}
      />

      {/* Sticky Booking CTA - Mobile only */}
      <StickyBookingCTA
        price={activity.price_base || 0}
        discountedPrice={aidsData?.remainingPrice}
        priceUnit={activity.price_note || "par activité"}
        onBook={handleBooking}
        onShare={handleShare}
        disabled={isActivityClosed || (activity.period_type === "scolaire" ? selectedSessionIdx === null : !selectedSlotId)}
        buttonText={(activity.period_type === "scolaire" ? selectedSessionIdx === null : !selectedSlotId) ? "Sélectionnez un créneau" : "Réserver"}
        mobileOnly={true}
      />

      <BottomNavigation />
    </div>
  );
};

export default ActivityDetail;
