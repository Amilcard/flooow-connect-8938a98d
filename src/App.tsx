import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { RoleProtectedRoute } from "./components/authentification/RoleProtectedRoute";
import { SkipToContent } from "./components/a11y/SkipToContent";

// Analytics (Lucky Orange)
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";
import { ConsentBanner } from "@/components/analytics/ConsentBanner";
import { AnalyticsLoader } from "@/components/analytics/AnalyticsLoader";
import { UserTypeGate } from "@/components/analytics/UserTypeGate";

// Privacy & Territory
import { PrivacyProvider } from "./components/privacy/PrivacyProvider";
import { TerritoryProvider } from "./contexts/TerritoryContext";

// ============================================
// IMPORTS STATIQUES - Pages critiques (chargement initial)
// ============================================
import Index from "./pages/Index";
import Splash from "./pages/Splash";
import Search from "./pages/Search";
import ActivityDetail from "./pages/ActivityDetail";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";

// ============================================
// IMPORTS LAZY - Pages secondaires (code-splitting)
// ============================================

// Auth & Onboarding
const Onboarding = lazy(() => import("./pages/Onboarding"));
const _Auth = lazy(() => import("./pages/Auth")); // Reserved for future use
const ProfileCompletion = lazy(() => import("./pages/ProfileCompletion"));
const ProfileEdit = lazy(() => import("./pages/ProfileEdit"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const AuthCallback = lazy(() => import("./pages/auth/AuthCallback"));
const ParentSignup = lazy(() => import("./pages/ParentSignup"));

// Structure
const StructureAuth = lazy(() => import("./pages/StructureAuth"));
const StructureDashboard = lazy(() => import("./pages/StructureDashboard"));
const StructureActivityForm = lazy(() => import("./pages/StructureActivityForm"));

// Dashboards
const CollectiviteDashboard = lazy(() => import("./pages/CollectiviteDashboard"));
const FinanceurDashboard = lazy(() => import("./pages/FinanceurDashboard"));
const SuperadminDashboard = lazy(() => import("./pages/SuperadminDashboard"));
const EventStatistics = lazy(() => import("./pages/EventStatistics"));
const DashboardRedirect = lazy(() => import("./pages/DashboardRedirect"));
const ChildDashboard = lazy(() => import("./pages/ChildDashboard"));

// Demo
const DemoDashboard = lazy(() => import("./pages/DemoDashboard"));
const DemoParent = lazy(() => import("./pages/demo/DemoParent"));
const DemoCollectivite = lazy(() => import("./pages/demo/DemoCollectivite"));
const DemoFinanceur = lazy(() => import("./pages/demo/DemoFinanceur"));
const DemoStructure = lazy(() => import("./pages/demo/DemoStructure"));
const DemoLemoine = lazy(() => import("./pages/demo/DemoLemoine"));

// Activities & Booking
const Activities = lazy(() => import("./pages/Activities"));
const _SearchResults = lazy(() => import("./pages/SearchResults")); // Reserved for future use
const SearchFilters = lazy(() => import("./pages/SearchFilters"));
const Booking = lazy(() => import("./pages/Booking"));
const BookingRecap = lazy(() => import("./pages/BookingRecap"));
const BookingStatus = lazy(() => import("./pages/BookingStatus"));
const ActivitiesMap = lazy(() => import("./pages/ActivitiesMap"));
const Alternatives = lazy(() => import("./pages/Alternatives"));

// Account
const MonCompte = lazy(() => import("./pages/MonCompte"));
const MesInformations = lazy(() => import("./pages/account/MesInformations"));
const MesEnfants = lazy(() => import("./pages/account/kids/MesEnfants"));
const MesReservations = lazy(() => import("./pages/account/MesReservations"));
const ValidationsParentales = lazy(() => import("./pages/account/ValidationsParentales"));
const MesNotifications = lazy(() => import("./pages/account/MesNotifications"));
const MesSessionsAccount = lazy(() => import("./pages/account/MesSessions"));
const MoyensPaiement = lazy(() => import("./pages/account/MoyensPaiement"));
const MonCovoiturage = lazy(() => import("./pages/account/MonCovoiturage"));
const ProfilEligibilite = lazy(() => import("./pages/account/ProfilEligibilite"));
const MesJustificatifs = lazy(() => import("./pages/account/MesJustificatifs"));
const Parametres = lazy(() => import("./pages/account/Parametres"));
const LierEnfant = lazy(() => import("./pages/account/LierEnfant"));

// Aides & Finance
const Aides = lazy(() => import("./pages/Aides"));
const Simulateur = lazy(() => import("./pages/aides/Simulateur"));
const SimulateurV2 = lazy(() => import("./pages/aides/SimulateurV2"));
const AidesMobilite = lazy(() => import("./pages/AidesMobilite"));

// Community & Events
const MaVilleMonActu = lazy(() => import("./pages/MaVilleMonActu"));
const MesServices = lazy(() => import("./pages/MesServices"));
const Agenda = lazy(() => import("./pages/Agenda"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const Community = lazy(() => import("./pages/Community"));
const AgendaCommunity = lazy(() => import("./pages/AgendaCommunity"));
const MesEvenementsFavoris = lazy(() => import("./pages/MesEvenementsFavoris"));

// Features
const Univers = lazy(() => import("./pages/Univers"));
const Chat = lazy(() => import("./pages/Chat"));
const EcoMobilite = lazy(() => import("./pages/EcoMobilite"));
const BonsPlansLocaux = lazy(() => import("./pages/BonsPlansLocaux"));
const Inclusivite = lazy(() => import("./pages/Inclusivite"));
const Support = lazy(() => import("./pages/Support"));
const FAQ = lazy(() => import("./pages/FAQ"));
const BonEsprit = lazy(() => import("./pages/BonEsprit"));
const Contact = lazy(() => import("./pages/Contact"));

// Child & Family
const ChildSignup = lazy(() => import("./pages/ChildSignup"));
const ChildSelfSignup = lazy(() => import("./pages/ChildSelfSignup"));
const ValidateChildSignup = lazy(() => import("./pages/ValidateChildSignup"));
const ValidationParentale = lazy(() => import("./pages/ValidationParentale"));
const SaisirCodeParent = lazy(() => import("./pages/inscription/SaisirCodeParent"));
const GenererCodeEnfant = lazy(() => import("./pages/inscription/GenererCodeEnfant"));
const EnAttenteValidation = lazy(() => import("./pages/inscription/EnAttenteValidation"));

// Transport
const Covoiturage = lazy(() => import("./pages/Covoiturage"));
const Itineraire = lazy(() => import("./pages/Itineraire"));

// Territory
const MaVille = lazy(() => import("./pages/MaVille"));
const TerritoireNonCouvert = lazy(() => import("./pages/TerritoireNonCouvert"));

// Admin
const AdminSessions = lazy(() => import("./pages/AdminSessions"));

// Legal
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const RGPD = lazy(() => import("./pages/legal/RGPD"));
const Cookies = lazy(() => import("./pages/legal/Cookies"));
const MentionsLegales = lazy(() => import("./pages/legal/MentionsLegales"));
const CGU = lazy(() => import("./pages/legal/CGU"));

// ============================================
// PAGE LOADER COMPONENT
// ============================================
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AnalyticsProvider>
      <AuthProvider>
        <TerritoryProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <PrivacyProvider>
                <UserTypeGate />
                <ConsentBanner />
                <AnalyticsLoader />
                <SkipToContent />
                <Suspense fallback={<PageLoader />}>
                  <main id="main-content">
                    <Routes>
                      {/* Pages critiques (static imports) */}
                      <Route path="/" element={<Splash />} />
                      <Route path="/home" element={<Index />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/activity/:id" element={<ActivityDetail />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<SignUp />} />

                      {/* Auth & Onboarding (lazy) */}
                      <Route path="/onboarding" element={<Onboarding />} />
                      <Route path="/auth" element={<Navigate to="/login" replace />} />
                      <Route path="/profile-completion" element={<ProfileCompletion />} />
                      <Route path="/profile-edit" element={<ProfileEdit />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/auth/callback" element={<AuthCallback />} />
                      <Route path="/inscription/parent" element={<ParentSignup />} />
                      <Route path="/structure-auth" element={<StructureAuth />} />

                      {/* Dashboard auto-redirect based on role */}
                      <Route path="/dashboards" element={<DashboardRedirect />} />
                      <Route path="/dashboard" element={<DashboardRedirect />} />

                      {/* Superadmin Dashboard - Protected */}
                      <Route path="/dashboard/superadmin" element={
                        <RoleProtectedRoute allowedRoles={['superadmin']}>
                          <SuperadminDashboard />
                        </RoleProtectedRoute>
                      } />

                      {/* Structure Dashboard - Protected */}
                      <Route path="/dashboard/structure" element={
                        <RoleProtectedRoute allowedRoles={['structure']}>
                          <StructureDashboard />
                        </RoleProtectedRoute>
                      } />
                      <Route path="/structure/activity/new" element={
                        <RoleProtectedRoute allowedRoles={['structure']}>
                          <StructureActivityForm />
                        </RoleProtectedRoute>
                      } />
                      <Route path="/structure/activity/:id" element={
                        <RoleProtectedRoute allowedRoles={['structure']}>
                          <StructureActivityForm />
                        </RoleProtectedRoute>
                      } />

                      {/* Collectivité Dashboard - Protected */}
                      <Route path="/dashboard/collectivite" element={
                        <RoleProtectedRoute allowedRoles={['territory_admin', 'superadmin']}>
                          <CollectiviteDashboard />
                        </RoleProtectedRoute>
                      } />

                      {/* Event Statistics - Protected */}
                      <Route path="/event-statistics" element={
                        <RoleProtectedRoute allowedRoles={['territory_admin', 'superadmin']}>
                          <EventStatistics />
                        </RoleProtectedRoute>
                      } />

                      {/* Financeur Dashboard - Protected */}
                      <Route path="/dashboard/financeur" element={
                        <RoleProtectedRoute allowedRoles={['partner', 'superadmin']}>
                          <FinanceurDashboard />
                        </RoleProtectedRoute>
                      } />

                      {/* Demo Dashboards - No auth required */}
                      <Route path="/demo-dashboard" element={<DemoDashboard />} />
                      <Route path="/demo/parent" element={<DemoParent />} />
                      <Route path="/demo/collectivite" element={<DemoCollectivite />} />
                      <Route path="/demo/financeur" element={<DemoFinanceur />} />
                      <Route path="/demo/structure" element={<DemoStructure />} />
                      <Route path="/demo/lemoine" element={<DemoLemoine />} />

                      {/* Activities & Booking */}
                      <Route path="/activities" element={<Activities />} />
                      <Route path="/search/filters" element={<SearchFilters />} />
                      <Route path="/booking/:id" element={<Booking />} />
                      <Route path="/booking-recap/:id" element={<BookingRecap />} />
                      <Route path="/booking-status/:id" element={<BookingStatus />} />
                      <Route path="/activites/carte" element={<ActivitiesMap />} />
                      <Route path="/alternatives" element={<Alternatives />} />

                      {/* Account */}
                      <Route path="/mon-compte" element={<MonCompte />} />
                      <Route path="/mon-compte/informations" element={<MesInformations />} />
                      <Route path="/mon-compte/enfants" element={<MesEnfants />} />
                      <Route path="/mon-compte/reservations" element={<MesReservations />} />
                      <Route path="/mon-compte/validations" element={<ValidationsParentales />} />
                      <Route path="/mon-compte/notifications" element={<MesNotifications />} />
                      <Route path="/mon-compte/sessions" element={<MesSessionsAccount />} />
                      <Route path="/mon-compte/paiement" element={<MoyensPaiement />} />
                      <Route path="/mon-compte/covoiturage" element={<MonCovoiturage />} />
                      <Route path="/mon-compte/eligibilite" element={<ProfilEligibilite />} />
                      <Route path="/mon-compte/justificatifs" element={<MesJustificatifs />} />
                      <Route path="/mon-compte/parametres" element={<Parametres />} />
                      <Route path="/mon-compte/lier-enfant" element={<LierEnfant />} />

                      {/* Aides & Finance */}
                      <Route path="/aides" element={<Aides />} />
                      <Route path="/aides/simulateur" element={<Simulateur />} />
                      <Route path="/aides/simulateur-v2" element={<SimulateurV2 />} />
                      <Route path="/aides-mobilite" element={<AidesMobilite />} />

                      {/* Community & Events */}
                      <Route path="/ma-ville-mon-actu" element={<MaVilleMonActu />} />
                      <Route path="/mes-services" element={<MesServices />} />
                      <Route path="/agenda" element={<Agenda />} />
                      <Route path="/event/:id" element={<EventDetail />} />
                      <Route path="/community" element={<Community />} />
                      <Route path="/agenda-community" element={<AgendaCommunity />} />
                      <Route path="/mes-evenements-favoris" element={<MesEvenementsFavoris />} />

                      {/* Features */}
                      <Route path="/univers" element={<Univers />} />
                      <Route path="/chat" element={<Chat />} />
                      <Route path="/eco-mobilite" element={<EcoMobilite />} />
                      <Route path="/bons-plans-locaux" element={<BonsPlansLocaux />} />
                      <Route path="/inclusivite" element={<Inclusivite />} />
                      <Route path="/support" element={<Support />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/bon-esprit" element={<BonEsprit />} />
                      <Route path="/contact" element={<Contact />} />

                      {/* Child & Family */}
                      <Route path="/child-signup" element={<ChildSignup />} />
                      <Route path="/child-self-signup" element={<ChildSelfSignup />} />
                      <Route path="/validate-child-signup" element={<ValidateChildSignup />} />
                      <Route path="/validations/:bookingId" element={<ValidationParentale />} />
                      <Route path="/dashboard/enfant" element={<ChildDashboard />} />
                      <Route path="/inscription/saisir-code-parent" element={<SaisirCodeParent />} />
                      <Route path="/inscription/generer-code-enfant" element={<GenererCodeEnfant />} />
                      <Route path="/inscription/en-attente" element={<EnAttenteValidation />} />

                      {/* Transport */}
                      <Route path="/covoiturage" element={<Covoiturage />} />
                      <Route path="/itineraire" element={<Itineraire />} />

                      {/* Territory */}
                      <Route path="/ma-ville" element={<MaVille />} />
                      <Route path="/territoire-non-couvert" element={<TerritoireNonCouvert />} />

                      {/* Admin */}
                      <Route path="/admin/sessions" element={<AdminSessions />} />

                      {/* Legal */}
                      <Route path="/legal/privacy" element={<PrivacyPolicy />} />
                      <Route path="/legal/rgpd" element={<RGPD />} />
                      <Route path="/legal/cookies" element={<Cookies />} />
                      <Route path="/legal/mentions" element={<MentionsLegales />} />
                      <Route path="/legal/cgu" element={<CGU />} />

                      {/* Facebook OAuth URLs - Redirects for Meta compliance */}
                      <Route path="/privacy" element={<Navigate to="/legal/privacy" replace />} />
                      <Route path="/terms" element={<Navigate to="/legal/cgu" replace />} />
                      <Route path="/data-deletion" element={<Navigate to="/legal/privacy#suppression-des-donnees" replace />} />

                      {/* Catch-all */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </Suspense>
              </PrivacyProvider>
            </BrowserRouter>
          </TooltipProvider>
        </TerritoryProvider>
      </AuthProvider>
    </AnalyticsProvider>
  </QueryClientProvider>
);

export default App;
