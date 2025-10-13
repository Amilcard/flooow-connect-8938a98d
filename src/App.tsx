import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Splash from "./pages/Splash";
import Onboarding from "./pages/Onboarding";
import Activities from "./pages/Activities";
import Search from "./pages/Search";
import ActivityDetail from "./pages/ActivityDetail";
import Booking from "./pages/Booking";
import BookingStatus from "./pages/BookingStatus";
import MonCompte from "./pages/MonCompte";
import Aides from "./pages/Aides";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

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
          <Route path="/" element={<Index />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/search" element={<Search />} />
          <Route path="/activity/:id" element={<ActivityDetail />} />
          <Route path="/booking/:id" element={<Booking />} />
          <Route path="/booking-status/:id" element={<BookingStatus />} />
          <Route path="/mon-compte" element={<MonCompte />} />
          <Route path="/aides" element={<Aides />} />
          <Route path="/support" element={<Support />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
