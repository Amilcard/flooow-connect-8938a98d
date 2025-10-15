import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Splash from "./pages/Splash";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import ProfileCompletion from "./pages/ProfileCompletion";
import ProfileEdit from "./pages/ProfileEdit";
import StructureAuth from "./pages/StructureAuth";
import StructureDashboard from "./pages/StructureDashboard";
import StructureActivityForm from "./pages/StructureActivityForm";
import Activities from "./pages/Activities";
import Search from "./pages/Search";
import ActivityDetail from "./pages/ActivityDetail";
import Booking from "./pages/Booking";
import BookingStatus from "./pages/BookingStatus";
import MonCompte from "./pages/MonCompte";
import Aides from "./pages/Aides";
import Support from "./pages/Support";
import ChildSignup from "./pages/ChildSignup";
import Alternatives from "./pages/Alternatives";
import Covoiturage from "./pages/Covoiturage";
import MesSessions from "./pages/MesSessions";
import AdminSessions from "./pages/AdminSessions";
import NotFound from "./pages/NotFound";
import ParentSignup from "./pages/ParentSignup";
import ValidationParentale from "./pages/ValidationParentale";
import ActivitiesMap from "./pages/ActivitiesMap";
import ChildDashboard from "./pages/ChildDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/splash" element={<Splash />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile-completion" element={<ProfileCompletion />} />
          <Route path="/profile-edit" element={<ProfileEdit />} />
          <Route path="/structure-auth" element={<StructureAuth />} />
          <Route path="/structure-dashboard" element={<StructureDashboard />} />
          <Route path="/structure/activity/new" element={<StructureActivityForm />} />
          <Route path="/structure/activity/:id" element={<StructureActivityForm />} />
          <Route path="/" element={<Index />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/search" element={<Search />} />
          <Route path="/activity/:id" element={<ActivityDetail />} />
          <Route path="/booking/:id" element={<Booking />} />
          <Route path="/booking-status/:id" element={<BookingStatus />} />
          <Route path="/mon-compte" element={<MonCompte />} />
          <Route path="/aides" element={<Aides />} />
          <Route path="/support" element={<Support />} />
          <Route path="/child-signup" element={<ChildSignup />} />
          <Route path="/alternatives" element={<Alternatives />} />
          <Route path="/covoiturage" element={<Covoiturage />} />
          <Route path="/mes-sessions" element={<MesSessions />} />
          <Route path="/admin/sessions" element={<AdminSessions />} />
          <Route path="/inscription/parent" element={<ParentSignup />} />
          <Route path="/validations/:bookingId" element={<ValidationParentale />} />
          <Route path="/activites/carte" element={<ActivitiesMap />} />
          <Route path="/dashboard/enfant" element={<ChildDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
