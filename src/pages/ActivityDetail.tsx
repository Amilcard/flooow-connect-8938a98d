import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { logEvent } from "@/hooks/useEventLogger";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VACATION_PERIOD_DATES } from "@/components/VacationPeriodFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { BottomNavigation } from "@/components/BottomNavigation";
import { PageHeader } from "@/components/PageHeader";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MapPin,
  Accessibility,
  Euro,
  Car,
  CreditCard,
  Calendar,
  Info,
  Mail,
  MessageCircle,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  Leaf
} from "lucide-react";
import { useState, useEffect } from "react";
import { ContactOrganizerModal } from "@/components/ContactOrganizerModal";
import { EcoMobilitySection } from "@/components/Activity/EcoMobilitySection";
import { useActivityViewTracking } from "@/lib/tracking";
import { SharedAidCalculator } from "@/components/aids/SharedAidCalculator";
import { useActivityBookingState } from "@/hooks/useActivityBookingState";
import activitySportImg from "@/assets/activity-sport.jpg";
import activityLoisirsImg from "@/assets/activity-loisirs.jpg";
import activityVacancesImg from "@/assets/activity-vacances.jpg";
import activityCultureImg from "@/assets/activity-culture.jpg";
import { ActivityDetailHero } from "@/components/Activity/ActivityDetailHero";
import { SessionAccordion, SelectedSessionSummary } from "@/components/Activity/SessionAccordion";
import { SlotAccordion, SelectedSlotSummary } from "@/components/Activity/SlotAccordion";
import { StickyBookingCTA } from "@/components/Activity/StickyBookingCTA";
import { formatAgeRangeForDetail } from "@/utils/categoryMapping";

interface CalculatedAidItem {
  aid_name: string;
  amount: number;
  territory_level: string;
  official_link: string | null;
  is_informational?: boolean;
}

interface SessionData {
  id: string;
  day_of_week: number | null;
  start_time: string | null;
  end_time: string | null;
  age_min: number | null;
  age_max: number | null;
}

interface SlotData {
  id: string;
  start: string;
  end: string;
}

// ========== Helper Functions (outside component) ==========

const CATEGORY_IMAGES: Record<string, string> = {
  Sport: activitySportImg,
  Loisirs: activityLoisirsImg,
  Vacances: activityVacancesImg,
  Scolarité: activityCultureImg,
  Culture: activityCultureImg,
};

const getCategoryImage = (category: string): string => {
  return CATEGORY_IMAGES[category] || activityLoisirsImg;
};

const DAY_NAMES = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

const formatSessionLabel = (session: SessionData): { dayLabel: string; timeLabel: string } => {
  const dayLabel = session.day_of_week !== null ? DAY_NAMES[session.day_of_week] : "Vacances";
  const timeLabel = session.start_time && session.end_time
    ? `${session.start_time.slice(0, 5)} – ${session.end_time.slice(0, 5)}`
    : "";
  return { dayLabel, timeLabel };
};

const formatSlotLabel = (slot: SlotData): { dayNameCapitalized: string; dateFormatted: string; timeStart: string; timeEnd: string } => {
  const startDate = new Date(slot.start);
  const endDate = new Date(slot.end);
  const dayName = startDate.toLocaleDateString('fr-FR', { weekday: 'long' });
  return {
    dayNameCapitalized: dayName.charAt(0).toUpperCase() + dayName.slice(1),
    dateFormatted: startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
    timeStart: startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    timeEnd: endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  };
};

const formatSelectedDate = (dateIso: string | null): string | null => {
  if (!dateIso) return null;
  return new Date(dateIso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
};

// ========== Sub-components (outside main component) ==========

interface SelectedCreneauSessionProps {
  session: SessionData;
  selectedOccurrenceDate: string | null;
}

const SelectedCreneauSession = ({ session, selectedOccurrenceDate }: SelectedCreneauSessionProps) => {
  const { dayLabel, timeLabel } = formatSessionLabel(session);
  const selectedDateLabel = formatSelectedDate(selectedOccurrenceDate);

  return (
    <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/30 rounded-xl space-y-2">
      <div className="flex items-center gap-2">
        <CheckCircle2 size={18} className="text-primary" />
        <p className="text-sm font-semibold text-primary">Créneau sélectionné</p>
      </div>
      <div className="pl-6 space-y-1">
        <p className="text-base font-semibold text-foreground">{dayLabel} {timeLabel}</p>
        {selectedDateLabel && (
          <p className="text-sm font-medium text-primary">
            📅 Séance du {selectedDateLabel}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {session.age_min}-{session.age_max} ans
        </p>
      </div>
    </div>
  );
};

interface SelectedCreneauSlotProps {
  slot: SlotData;
}

const SelectedCreneauSlot = ({ slot }: SelectedCreneauSlotProps) => {
  const { dayNameCapitalized, dateFormatted, timeStart, timeEnd } = formatSlotLabel(slot);

  return (
    <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/30 rounded-xl space-y-2">
      <div className="flex items-center gap-2">
        <CheckCircle2 size={18} className="text-primary" />
        <p className="text-sm font-semibold text-primary">Créneau sélectionné</p>
      </div>
      <div className="pl-6 space-y-1">
        <p className="text-base font-semibold text-foreground">{dayNameCapitalized} {dateFormatted}</p>
        <p className="text-sm text-muted-foreground">
          {timeStart} – {timeEnd}
        </p>
      </div>
    </div>
  );
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
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedOccurrenceDate, setSelectedOccurrenceDate] = useState<string | null>(null); // Date ISO de la séance choisie
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null); // Pour l'accordéon
  const [showContactModal, setShowContactModal] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Feature flag: mode visuel mobile (reserved for future use)
  const _mobileVisualMode = visualParam === "true";

  // Hook pour la persistance des données d'aides et de transport
  const { state: bookingState, saveAidCalculation, saveTransportMode } = useActivityBookingState(id || "");
  
  // États pour les aides calculées
  const [aidsData, setAidsData] = useState<{
    childId: string;
    quotientFamilial: string;
    cityCode: string;
    aids: CalculatedAidItem[];
    totalAids: number;
    remainingPrice: number;
  } | null>(null);

  // Restaurer les données d'aides depuis le state persisté
  // Only runs when bookingState changes and aidsData is null (initial restore)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentional: only restore once when state available
  }, [bookingState?.calculated]);

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
      // FIX: Removed structures join to avoid Supabase embed error
      const { data, error } = await supabase
        .from("activities")
        .select("*")
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Runs on userProfile change, refs stable state
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
      // Guard: query only enabled when activity exists (isActivityClosed requires activity)
      if (!activity) return [];
      const { data, error } = await supabase
        .from("activities")
        .select("id, title, categories, age_min, age_max, price_base, period_type, images")
        .neq("id", activity.id)
        .eq("is_published", true)
        .lte("age_min", activity.age_max ?? 99)
        .gte("age_max", activity.age_min ?? 0)
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
    if (activity.period_type === "scolaire" ? !selectedSessionId : !selectedSlotId) {
      toast({
        title: "Créneau requis",
        description: "Veuillez sélectionner un créneau",
        variant: "destructive"
      });
      return;
    }

    // Rediriger vers la page d'inscription
    // Les aides sont optionnelles, elles seront reprises si calculées
    // Pour les sessions scolaires, on passe sessionId + occurrenceDate (date ISO de la séance choisie)
    if (activity.period_type === "scolaire" && selectedSessionId) {
      const params = new URLSearchParams({ sessionId: selectedSessionId });
      if (selectedOccurrenceDate) {
        params.append('occurrenceDate', selectedOccurrenceDate);
      }
      navigate(`/booking/${id}?${params.toString()}`);
    } else if (selectedSlotId) {
      navigate(`/booking/${id}?slotId=${selectedSlotId}`);
    }
  };

  const handleAidsCalculated = (data: {
    childId: string;
    quotientFamilial: string;
    cityCode: string;
    aids: CalculatedAidItem[];
    totalAids: number;
    remainingPrice: number;
  }) => {
    setAidsData(data);
    saveAidCalculation(data); // Sauvegarder dans le state persisté
  };

  // Reserved for future transport mode selection feature
  const _handleTransportModeSelected = (mode: { type: "bus" | "bike" | "walk"; label: string; duration: number; details?: string }) => {
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
        // Ignore AbortError (user cancelled share)
        if ((err as Error).name !== 'AbortError') {
          // Share failed silently
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
    } catch {
      // Clipboard copy failed silently
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

  // Calculate age from date of birth (reserved for future use)
  const _calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Calculate duration in days from slot (reserved for future use)
  const _calculateDurationDays = (slot?: { start: string | Date; end: string | Date } | null): number => {
    if (!slot || !slot.start || !slot.end) return 1;
    const start = new Date(slot.start);
    const end = new Date(slot.end);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  };

  // Selected slot lookup (reserved for potential future use)
  const _selectedSlot = slots.find(s => s.id === selectedSlotId);

  const fallbackImage = getCategoryImage(activity.category);
  // Fix: vérifie aussi les strings vides dans images
  const rawImage = activity.images?.[0];
  const displayImage = (rawImage && rawImage.trim() !== '') ? rawImage : fallbackImage;
  // Age range formatted for display (reserved for future use)
  const _ageRange = sessions.length > 0
    ? sessions.map(s => formatAgeRangeForDetail(s.age_min, s.age_max)).filter((v, i, a) => a.indexOf(v) === i).join(" / ")
    : formatAgeRangeForDetail(activity.age_min, activity.age_max);

  // Calculer les prochaines dates pour un jour de semaine donné - retourne objets {iso, label, labelShort}
  const getNextDatesWithISO = (dayOfWeek: number | null, count = 5): Array<{iso: string, label: string, labelShort: string}> => {
    if (dayOfWeek === null) return [];
    const dates: Array<{iso: string, label: string, labelShort: string}> = [];
    const today = new Date();
    const currentDay = today.getDay();
    let daysUntil = dayOfWeek - currentDay;
    if (daysUntil <= 0) daysUntil += 7;
    const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    for (let i = 0; i < count; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + daysUntil + (i * 7));
      dates.push({
        iso: nextDate.toISOString().split('T')[0],
        label: nextDate.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }),
        labelShort: `${dayNames[nextDate.getDay()]} ${nextDate.getDate()} ${nextDate.toLocaleDateString("fr-FR", { month: "short" })}`
      });
    }
    return dates;
  };
  // Ancienne fonction pour compatibilité
  const getNextDates = (dayOfWeek: number | null, count = 3): string[] => {
    return getNextDatesWithISO(dayOfWeek, count).map(d => d.label.replace(/^\w+\.?\s*/, ''));
  };
  // Single next date helper (reserved for future use)
  const _getNextDate = (dayOfWeek: number | null): string => getNextDates(dayOfWeek, 1)[0] || "";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Page Header avec flèche retour alignée à gauche */}
      <PageHeader
        title={activity.title}
        backFallback="/home"
        rightContent={
          <div className="relative">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShare}
                    className="h-9 w-9"
                  >
                    <Share2 size={18} />
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

      {/* Hero Section - Photo + Infos Organisateur (layout cohérent avec Accueil/Recherche) */}
      <ActivityDetailHero
        title={activity.title}
        category={activity.category}
        categories={activity.categories}
        periodType={activity.period_type}
        ageMin={activity.age_min}
        ageMax={activity.age_max}
        priceBase={activity.price_base}
        imageUrl={displayImage}
        organismName={activity.organism_name}
        organismType={activity.organism_type}
        organismPhone={activity.organism_phone}
        organismEmail={activity.organism_email}
        organismWebsite={activity.organism_website}
        address={activity.address}
        city={activity.city}
        postalCode={activity.postal_code}
        venueName={activity.venue_name}
        nextSessionLabel={sessions.length > 0 && sessions[0].day_of_week !== null 
          ? `Prochaine : ${getNextDates(sessions[0].day_of_week, 1)[0] || ''}`
          : slots.length > 0 
            ? `Prochaine : ${new Date(slots[0].start).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`
            : undefined
        }
        onContactClick={() => setShowContactModal(true)}
      />

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6">
        {/* Grid 12 colonnes: 8 pour contenu principal, 4 pour panneau latéral d'action */}
        <div className="grid md:grid-cols-12 gap-6 lg:gap-8">
          {/* Main Content - Informations détaillées (8/12) */}
          <main className="md:col-span-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3 gap-1 h-auto p-1 mb-6">
                <TabsTrigger value="infos" className="text-xs md:text-sm flex items-center justify-center gap-1.5">
                  <Info size={14} />
                  <span className="hidden sm:inline">Infos</span>
                </TabsTrigger>
                <TabsTrigger value="tarifs" className="text-xs md:text-sm flex items-center justify-center gap-1.5" data-tour-id="tab-tarifs">
                  <Euro size={14} />
                  <span className="hidden sm:inline">Tarifs</span>
                  <span className="hidden md:inline">&nbsp;& aides</span>
                </TabsTrigger>
                <TabsTrigger value="trajets" className="text-xs md:text-sm flex items-center justify-center gap-1.5">
                  <Leaf size={14} />
                  <span className="hidden sm:inline">Trajets</span>
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

                      {/* Dates du séjour (colonies/camps vacances) */}
                      {activity.period_type === "vacances" && (activity.date_debut || activity.date_fin) && (
                        <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                          <Calendar size={20} className="text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">Dates du séjour</p>
                            <p className="text-sm text-muted-foreground">
                              {activity.date_debut && new Date(activity.date_debut).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                              {activity.date_debut && activity.date_fin && ' → '}
                              {activity.date_fin && new Date(activity.date_fin).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                            {activity.duration_days && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Durée : {activity.duration_days} jour{activity.duration_days > 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Horaires départ/retour et lieu de RDV (séjours avec hébergement) */}
                      {activity.period_type === "vacances" && activity.jours_horaires && (
                        <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                          <Info size={20} className="text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">Horaires départ / retour</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                              {activity.jours_horaires}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Lieu de rendez-vous */}
                      {activity.period_type === "vacances" && activity.lieu_nom && (
                        <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                          <MapPin size={20} className="text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">Lieu de rendez-vous</p>
                            <p className="text-sm text-muted-foreground">
                              {activity.lieu_nom}
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
                      {/* Lieu d'entraînement (peut être différent du siège du club) */}
                      {(activity.venue_name || activity.location_name) && (
                        <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                          <MapPin size={20} className="text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">Lieu d'entraînement</p>
                            <p className="text-sm font-medium text-foreground">
                              {activity.venue_name || activity.location_name}
                            </p>
                            {activity.location_address && (
                              <p className="text-sm text-muted-foreground">{activity.location_address}</p>
                            )}
                            {(activity.location_postal_code || activity.location_city) && (
                              <p className="text-sm text-muted-foreground">
                                {activity.location_postal_code} {activity.location_city}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Covoiturage */}
                      {activity.covoiturage_enabled && (
                        <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                          <Car size={20} className="text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">Covoiturage</p>
                            <p className="text-sm text-muted-foreground">Service disponible</p>
                          </div>
                        </div>
                      )}

                      {/* Paiement échelonné */}
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
                  </div>
                </section>

                {/* Cross-links vers autres onglets - texte d'orientation discret */}
                <div className="mt-6 p-3 bg-muted/30 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    💡 Consultez l'onglet <button onClick={() => setActiveTab("tarifs")} className="font-medium text-primary hover:underline">Tarifs & aides</button> pour estimer votre reste à charge,
                    ou <button onClick={() => setActiveTab("trajets")} className="font-medium text-primary hover:underline">Trajets</button> pour préparer vos déplacements (transports en commun, vélo, covoiturage).
                  </p>
                </div>
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
                    activityAddress={[
                      activity.venue_name,
                      activity.address,
                      activity.city,
                      activity.postal_code
                    ].filter(Boolean).join(', ') || activity.address}
                    activityLatLng={activity.latitude && activity.longitude ? {
                      lat: activity.latitude,
                      lng: activity.longitude
                    } : undefined}
                    structureName={activity.organism_name}
                    structureContactJson={activity.organism_phone}
                    onTransportModeSelected={() => {}}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </main>

          {/* ============================================
              PANNEAU LATÉRAL D'ACTION (Aside) - Sticky
              Contient: Tarifs, Créneaux, CTA Inscription
              ============================================ */}
          <aside className="md:col-span-4" aria-label="Panneau de réservation">
            <Card className="p-5 md:sticky md:top-20 space-y-5 shadow-lg border-2 border-border/50">
              {/* En-tête du panneau */}
              <div className="space-y-1">
                <h2 className="font-bold text-lg text-foreground">Tarifs & créneaux disponibles</h2>
                <p className="text-xs text-muted-foreground">Sélectionnez un créneau pour inscrire votre enfant</p>
              </div>
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
                    <div className="space-y-3">
                      {/* Accordéons de sessions scolaires */}
                      {sessions.map((s, index) => (
                        <SessionAccordion
                          key={s.id}
                          session={{
                            id: s.id,
                            day_of_week: s.day_of_week,
                            start_time: s.start_time,
                            end_time: s.end_time,
                            age_min: s.age_min,
                            age_max: s.age_max,
                            location: s.location,
                            price: s.price,
                          }}
                          isExpanded={expandedSessionId === s.id || (index === 0 && expandedSessionId === null)}
                          onToggle={() => setExpandedSessionId(expandedSessionId === s.id ? null : s.id)}
                          selectedDate={selectedSessionId === s.id ? selectedOccurrenceDate : null}
                          onSelectDate={(sessionId, date) => {
                            setSelectedSessionId(sessionId);
                            setSelectedOccurrenceDate(date);
                            setExpandedSessionId(sessionId);
                          }}
                          activityLocation={activity.location_name || undefined}
                        />
                      ))}
                      
                      {/* Récap séance choisie */}
                      {selectedSessionId && selectedOccurrenceDate && (
                        <SelectedSessionSummary
                          session={sessions.find(s => s.id === selectedSessionId) || null}
                          selectedDate={selectedOccurrenceDate}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Accordéon de slots vacances */}
                      <SlotAccordion
                        slots={slots}
                        ageMin={activity.age_min}
                        ageMax={activity.age_max}
                        selectedSlotId={selectedSlotId || null}
                        onSelectSlot={(slotId) => setSelectedSlotId(slotId)}
                        periodLabel={periodFilter === "printemps_2026" ? "Vacances de Printemps" : periodFilter === "ete_2026" ? "Vacances d'Été" : "Vacances"}
                        defaultExpanded={true}
                      />
                      
                      {/* Récap créneau choisi */}
                      {selectedSlotId && (
                        <SelectedSlotSummary
                          slot={slots.find(s => s.id === selectedSlotId) || null}
                          ageMin={activity.age_min}
                          ageMax={activity.age_max}
                        />
                      )}
                    </div>
                  )}
                    
                    {/* Récap "Créneau sélectionné" - bien visible avant le bouton */}
                    {activity.period_type === "scolaire" && selectedSessionId && (() => {
                      const session = sessions.find(s => s.id === selectedSessionId);
                      return session ? (
                        <SelectedCreneauSession
                          session={session}
                          selectedOccurrenceDate={selectedOccurrenceDate}
                        />
                      ) : null;
                    })()}
                    {activity.period_type !== "scolaire" && selectedSlotId && (() => {
                      const slot = slots.find(s => s.id === selectedSlotId);
                      return slot ? (
                        <SelectedCreneauSlot slot={slot} />
                      ) : null;
                    })()}

                    <Button
                      onClick={handleBooking}
                      disabled={isActivityClosed || (activity.period_type === "scolaire" ? !selectedSessionId : !selectedSlotId)}
                      className="w-full h-12 text-base font-semibold"
                      size="lg"
                    >
                      {isActivityClosed
                        ? "Inscriptions complètes"
                        : (activity.period_type === "scolaire" ? !selectedSessionId : !selectedSlotId)
                          ? "Sélectionnez un créneau"
                          : selectedOccurrenceDate
                            ? `Inscrire (${new Date(selectedOccurrenceDate).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })})`
                            : "Inscrire mon enfant"}
                    </Button>

                    {isActivityClosed && (
                      <div className="mt-4 p-4 bg-accent/50 rounded-lg space-y-3">
                        <p className="text-sm font-medium text-center">
                          L'atelier affiche complet, mais on ne vous laisse pas tomber 💪
                        </p>
                        <div className="text-xs text-center text-muted-foreground space-y-1">
                          <p>Vous pouvez demander une place sur liste d'attente via la <strong className="text-primary">Flooow Family</strong>.</p>
                          <Button variant="outline" size="sm" className="mt-2" onClick={() => setShowContactModal(true)}>
                            <MessageCircle size={14} className="mr-1" />
                            Contacter via Flooow Family
                          </Button>
                        </div>
                      </div>
                    )}
                    {isActivityClosed && alternatives.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <p className="text-sm font-medium text-center">Autres idées pour votre enfant :</p>
                        {alternatives.map((alt) => (
                          <Card key={alt.id} className="p-3 cursor-pointer hover:bg-accent/50" onClick={() => navigate("/activity/" + alt.id)}>
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm font-medium">{alt.title}</p>
                                <p className="text-xs text-muted-foreground">{alt.age_min}-{alt.age_max} ans</p>
                              </div>
                              <span className="text-sm font-bold text-primary">{alt.price_base === 0 ? "Gratuit" : `${alt.price_base}€`}</span>
                            </div>
                          </Card>
                        ))}
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
          </aside>
        </div>
      </div>


      {activity.organism_name && typeof activity.organism_phone === 'object' && activity.organism_phone !== null && (
        <ContactOrganizerModal
          open={showContactModal}
          onOpenChange={setShowContactModal}
          organizerName={activity.organism_name}
          organizerEmail={'email' in activity.organism_phone ? String(activity.organism_phone.email) : ''}
          organizerPhone={'phone' in activity.organism_phone ? String(activity.organism_phone.phone) : undefined}
          activityTitle={activity.title}
        />
      )}

      {/* Sticky Booking CTA - Mobile only */}
      <StickyBookingCTA
        price={activity.price_base || 0}
        discountedPrice={aidsData?.remainingPrice}
        priceUnit={activity.price_note || "par activité"}
        onBook={handleBooking}
        onShare={handleShare}
        disabled={isActivityClosed || (activity.period_type === "scolaire" ? !selectedSessionId : !selectedSlotId)}
        buttonText={(activity.period_type === "scolaire" ? !selectedSessionId : !selectedSlotId) ? "Sélectionnez un créneau" : "Réserver"}
        mobileOnly={true}
      />

      <BottomNavigation />
    </div>
  );
};

export default ActivityDetail;
