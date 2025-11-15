import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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
import { BackButton } from "@/components/BackButton";
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
import { EcoMobilitySection } from "@/components/Activity/EcoMobilitySection";
import { useActivityViewTracking } from "@/lib/tracking";
import { EnhancedFinancialAidCalculator } from "@/components/activities/EnhancedFinancialAidCalculator";
import { useActivityBookingState } from "@/hooks/useActivityBookingState";
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
  const [searchParams] = useSearchParams();
  const periodFilter = searchParams.get("period") || undefined;
  const tabParam = searchParams.get("tab");
  const visualParam = searchParams.get("visual");
  const [activeTab, setActiveTab] = useState<string>(
    ["infos", "tarifs", "mobilite", "echanges"].includes(tabParam || "") 
      ? tabParam! 
      : "infos"
  );
  const [selectedSlotId, setSelectedSlotId] = useState<string>();
  const [showContactModal, setShowContactModal] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Feature flag: mode visuel mobile
  const mobileVisualMode = visualParam === "true";
  
  // Hook pour la persistance des données d'aides et de transport
  const { state: bookingState, saveAidCalculation, saveTransportMode } = useActivityBookingState(id!);
  
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
    if (bookingState?.calculated) {
      setAidsData({
        childId: bookingState.childId,
        quotientFamilial: bookingState.quotientFamilial,
        cityCode: bookingState.cityCode,
        aids: bookingState.aids,
        totalAids: bookingState.totalAids,
        remainingPrice: bookingState.remainingPrice
      });
    }
  }, [bookingState?.calculated]);

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
  const { data: allSlots = [] } = useQuery({
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

    // Rediriger vers la page d'inscription
    // Les aides sont optionnelles, elles seront reprises si calculées
    navigate(`/booking/${id}?slotId=${selectedSlotId}`);
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
  const ageRange = `${activity.age_min}-${activity.age_max} ans`;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Minimalist Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container flex items-center justify-between gap-3 py-4 px-4 md:px-6">
          <BackButton fallback="/activities" showText={true} label="Retour aux activités" />
          <ActivityShareButton 
            activity={{
              id: activity.id,
              title: activity.title,
              description: activity.description || undefined,
              category: activity.category,
              price: activity.price_base || undefined,
              location: (activity.structures as any)?.address || undefined
            }}
            variant="ghost"
            size="default"
            showLabel={false}
          />
        </div>
      </div>

      {/* Hero Image - Hauteur adaptée au mode visuel mobile */}
      <div 
        className="relative w-full overflow-hidden"
        style={{
          height: mobileVisualMode ? "360px" : "clamp(240px, 40vh, 480px)"
        }}
      >
        <img
          src={imgError ? fallbackImage : displayImage}
          alt={activity.title}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
        
        {/* Gradient overlay - plus prononcé en mode visuel mobile */}
        <div 
          className="absolute inset-0"
          style={{
            background: mobileVisualMode 
              ? "linear-gradient(to top, rgba(0,0,0,0.45), transparent 50%)"
              : "linear-gradient(to top, rgba(0,0,0,0.40), transparent)"
          }}
        />
        
        {/* Badges flottants repositionnés */}
        <div className="absolute top-4 left-4 flex gap-2 flex-wrap max-w-[80%]">
          {activity.categories && activity.categories.length > 0 ? (
            activity.categories.slice(0, 2).map((cat: string) => (
              <Badge key={cat} variant="secondary" className="bg-white/95 backdrop-blur-sm text-foreground shadow-md">
                {cat}
              </Badge>
            ))
          ) : (
            <Badge variant="secondary" className="bg-white/95 backdrop-blur-sm text-foreground shadow-md">
              {activity.category}
            </Badge>
          )}
          {typeof activity.accessibility_checklist === 'object' && 
           activity.accessibility_checklist !== null && 
           'wheelchair' in activity.accessibility_checklist &&
           activity.accessibility_checklist.wheelchair && (
            <Badge variant="secondary" className="bg-white/95 backdrop-blur-sm text-foreground shadow-md">
              <Accessibility size={14} className="mr-1" />
              PMR
            </Badge>
          )}
        </div>
        
        {/* Bouton de partage en superposition - en haut à droite */}
        <div className="absolute top-4 right-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleShare}
                  className="bg-white/95 backdrop-blur-sm hover:bg-white shadow-md"
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
      </div>

      {/* Main Content Container - Airbnb Style with Grid */}
      <div className="container px-4 md:px-6 py-8 max-w-[1140px] mx-auto">
        {/* Header Section - Réorganisé: Titre → Méta → Organisateur */}
        <div className="space-y-4 pb-8 border-b mb-8">
          {/* Titre H1 fort sans bouton partage (maintenant sur l'image) */}
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
          {/* Left Column - Main content with Tabs (8/12) */}
          <div className="md:col-span-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 gap-1 h-auto p-1 mb-6">
                <TabsTrigger value="infos" className="text-xs md:text-sm">Infos</TabsTrigger>
                <TabsTrigger value="tarifs" className="text-xs md:text-sm">Tarifs & aides</TabsTrigger>
                <TabsTrigger value="mobilite" className="text-xs md:text-sm">Mobilité</TabsTrigger>
                <TabsTrigger value="echanges" className="text-xs md:text-sm">Échanges</TabsTrigger>
              </TabsList>

              {/* Onglet Infos */}
              <TabsContent value="infos" className="space-y-8 mt-0">
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
              </TabsContent>

              {/* Onglet Tarifs & aides */}
              <TabsContent value="tarifs" className="space-y-8 mt-0">
                <section className="space-y-4">
                  <div className="flex items-baseline gap-4 mb-6">
                    <h2 className="text-2xl font-bold text-foreground">Tarifs</h2>
                    <span className="text-3xl font-bold text-primary">
                      {activity.price_base === 0 ? "Gratuit" : `${activity.price_base}€`}
                    </span>
                    {activity.price_note && (
                      <span className="text-sm text-muted-foreground">{activity.price_note}</span>
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
                        <div className="flex justify-between text-lg font-bold">
                          <span>Reste à charge</span>
                          <span className="text-primary">{aidsData.remainingPrice.toFixed(2)}€</span>
                        </div>
                      </div>
                    </Card>
                  )}
                </section>

                {/* Financial Aids Section with integrated calculator - OPTIONNEL */}
                {Array.isArray(activity.accepts_aid_types) && activity.accepts_aid_types.length > 0 && (
                  <section id="aides-section" className="space-y-4">
                    <Alert className="bg-muted/50 border-primary/20">
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        <strong>L'estimation des aides est facultative.</strong> Tu peux t'inscrire directement sans la faire. 
                        Si tu souhaites connaître ton reste à charge avant de t'inscrire, utilise le calculateur ci-dessous.
                      </AlertDescription>
                    </Alert>
                    
                    <EnhancedFinancialAidCalculator
                      activityId={id!}
                      activityPrice={activity.price_base || 0}
                      activityCategories={activity.categories || [activity.category]}
                      userProfile={userProfile}
                      children={children}
                      onAidsCalculated={handleAidsCalculated}
                    />
                  </section>
                )}
              </TabsContent>

              {/* Onglet Mobilité - Version allégée */}
              <TabsContent value="mobilite" className="mt-0">
                <section className="space-y-6">
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-foreground">Comment s'y rendre ?</h2>
                    <p className="text-base text-muted-foreground">
                      Des solutions de mobilité douce seront bientôt disponibles sur ton territoire.
                    </p>
                  </div>

                  <Card className="p-6 bg-muted/30">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Leaf size={24} className="text-primary mt-1" />
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">Bientôt disponible</h3>
                          <p className="text-sm text-muted-foreground">
                            Nous travaillons sur l'intégration des services STAS et VéliVert pour te proposer 
                            des trajets en transport en commun et vélo partagé. En attendant, tu peux calculer 
                            ton itinéraire ci-dessous.
                          </p>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline"
                        className="w-full"
                        size="lg"
                        onClick={() => {
                          const address = activity.structures?.address;
                          if (address) {
                            const encodedAddress = encodeURIComponent(address);
                            window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
                          } else {
                            toast({
                              title: "Adresse non disponible",
                              description: "Impossible de calculer l'itinéraire",
                              variant: "destructive"
                            });
                          }
                        }}
                      >
                        <MapPin className="mr-2" size={18} />
                        Calculer mon itinéraire
                      </Button>
                    </div>
                  </Card>
                </section>
              </TabsContent>

              {/* Onglet Échanges */}
              <TabsContent value="echanges" className="mt-0">
                <section className="space-y-6">
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-foreground">Rejoignez la communauté</h2>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      Échangez avec d'autres parents, posez vos questions et partagez vos expériences sur cette activité et bien d'autres.
                    </p>
                  </div>

                  <Card className="p-6 bg-accent/30">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MessageCircle size={24} className="text-primary mt-1" />
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">Communauté Parents</h3>
                          <p className="text-sm text-muted-foreground">
                            Retrouvez des retours d'expérience, des conseils pratiques et des réponses à vos questions.
                          </p>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => navigate('/agenda-community?tab=community')}
                        className="w-full"
                        size="lg"
                      >
                        <MessageCircle className="mr-2" size={18} />
                        Accéder aux échanges
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Info size={24} className="text-primary mt-1" />
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">Contactez l'organisateur</h3>
                          <p className="text-sm text-muted-foreground">
                            Pour des questions spécifiques sur cette activité, contactez directement {activity.structures?.name}.
                          </p>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => setShowContactModal(true)}
                        variant="outline"
                        className="w-full"
                        size="lg"
                      >
                        <Mail className="mr-2" size={18} />
                        Contacter l'organisateur
                      </Button>
                    </div>
                  </Card>
                </section>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sticky Booking Card (4/12) */}
          <div className="md:col-span-4">
            <Card className="p-6 md:sticky md:top-24 space-y-6">
              {/* Prix et aides */}
              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold">
                    {activity.price_base === 0 ? "Gratuit" : `${activity.price_base}€`}
                  </span>
                  {activity.price_note && (
                    <span className="text-sm text-muted-foreground">{activity.price_note}</span>
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
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Reste à charge</span>
                        <span className="text-primary">{aidsData.remainingPrice.toFixed(2)}€</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Créneaux disponibles */}
              {slots.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Créneaux disponibles</h3>
                      {periodFilter && (
                        <Badge variant="secondary" className="text-xs">
                          {periodFilter === "printemps_2026" ? "🌸 Printemps" : "☀️ Été"}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                      {slots.map(slot => {
                        const startDate = new Date(slot.start);
                        const endDate = new Date(slot.end);
                        return (
                          <Card 
                            key={slot.id}
                            className={`p-3 cursor-pointer transition-all ${
                              selectedSlotId === slot.id 
                                ? 'ring-2 ring-primary bg-accent' 
                                : 'hover:bg-accent/50'
                            }`}
                            onClick={() => setSelectedSlotId(slot.id)}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Calendar size={14} className="text-primary" />
                                  <span className="text-sm font-medium">
                                    {startDate.toLocaleDateString('fr-FR', { 
                                      day: 'numeric', 
                                      month: 'short' 
                                    })}
                                  </span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {slot.seats_remaining} places
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
                            </div>
                          </Card>
                        );
                      })}
                    </div>

                    <Button
                      onClick={handleBooking}
                      disabled={!selectedSlotId}
                      className="w-full h-12 text-base font-semibold"
                      size="lg"
                    >
                      {!selectedSlotId 
                        ? "Sélectionnez un créneau"
                        : "Inscrire mon enfant"}
                    </Button>

                    {!aidsData && (
                      <p className="text-xs text-center text-muted-foreground">
                        💡 Tu peux calculer tes aides dans l'onglet "Tarifs" (optionnel)
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
