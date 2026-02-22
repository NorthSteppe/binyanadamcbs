import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Education from "./pages/Education";
import Therapy from "./pages/Therapy";
import Families from "./pages/Families";
import Organisations from "./pages/Organisations";
import Supervision from "./pages/Supervision";
import OfferDetail from "./pages/OfferDetail";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import Dashboard from "./pages/portal/Dashboard";
import Resources from "./pages/portal/Resources";
import Messages from "./pages/portal/Messages";
import Booking from "./pages/portal/Booking";
import Chat from "./pages/portal/Chat";
import AdminCalendar from "./pages/admin/AdminCalendar";
import ClientManagement from "./pages/admin/ClientManagement";
import ClientDetail from "./pages/admin/ClientDetail";
import TeamRequests from "./pages/admin/TeamRequests";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/services" element={<Services />} />
              <Route path="/education" element={<Education />} />
              <Route path="/therapy" element={<Therapy />} />
              <Route path="/families" element={<Families />} />
              <Route path="/organisations" element={<Organisations />} />
              <Route path="/supervision" element={<Supervision />} />
              <Route path="/:serviceArea/:offerSlug" element={<OfferDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/portal" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/portal/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
              <Route path="/portal/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/portal/booking" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
              <Route path="/portal/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/admin/calendar" element={<AdminRoute><AdminCalendar /></AdminRoute>} />
              <Route path="/admin/clients" element={<AdminRoute><ClientManagement /></AdminRoute>} />
              <Route path="/admin/clients/:clientId" element={<AdminRoute><ClientDetail /></AdminRoute>} />
              <Route path="/admin/team-requests" element={<AdminRoute><TeamRequests /></AdminRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
