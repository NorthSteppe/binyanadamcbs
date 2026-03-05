import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import StaffRoute from "@/components/StaffRoute";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Education from "./pages/Education";
import Therapy from "./pages/Therapy";
import Families from "./pages/Families";
import Organisations from "./pages/Organisations";
import Supervision from "./pages/Supervision";
import OfferDetail from "./pages/OfferDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import TeamAdam from "./pages/TeamAdam";
import TeamBrionny from "./pages/TeamBrionny";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";
// Client portal
import Dashboard from "./pages/portal/Dashboard";
import Resources from "./pages/portal/Resources";
import Messages from "./pages/portal/Messages";
import Booking from "./pages/portal/Booking";
import Chat from "./pages/portal/Chat";
import Toolkit from "./pages/portal/Toolkit";
import ToolkitACTMatrix from "./pages/portal/ToolkitACTMatrix";
import ToolkitPomodoro from "./pages/portal/ToolkitPomodoro";
// Admin portal
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCalendar from "./pages/admin/AdminCalendar";
import ClientManagement from "./pages/admin/ClientManagement";
import ClientDetail from "./pages/admin/ClientDetail";
import TeamRequests from "./pages/admin/TeamRequests";
import HeroImageManager from "./pages/admin/HeroImageManager";
import SiteContentManager from "./pages/admin/SiteContentManager";
import TeamMemberManager from "./pages/admin/TeamMemberManager";
import ServiceOptionsManager from "./pages/admin/ServiceOptionsManager";
import ClientAssignments from "./pages/admin/ClientAssignments";
// Staff portal
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffACTMatrix from "./pages/staff/StaffACTMatrix";
import TodoManager from "./pages/admin/TodoManager";

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
              {/* Public */}
              <Route path="/" element={<Index />} />
              <Route path="/services" element={<Services />} />
              <Route path="/education" element={<Education />} />
              <Route path="/therapy" element={<Therapy />} />
              <Route path="/families" element={<Families />} />
              <Route path="/organisations" element={<Organisations />} />
              <Route path="/supervision" element={<Supervision />} />
              <Route path="/:serviceArea/:offerSlug" element={<OfferDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/team/adam-dayan" element={<TeamAdam />} />
              <Route path="/team/brionny-pearson" element={<TeamBrionny />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Client portal */}
              <Route path="/portal" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/portal/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
              <Route path="/portal/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/portal/booking" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
              <Route path="/portal/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/portal/toolkit" element={<ProtectedRoute><Toolkit /></ProtectedRoute>} />
              <Route path="/portal/toolkit/act-matrix" element={<ProtectedRoute><ToolkitACTMatrix /></ProtectedRoute>} />
              <Route path="/portal/toolkit/pomodoro" element={<ProtectedRoute><ToolkitPomodoro /></ProtectedRoute>} />

              {/* Admin portal */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/calendar" element={<AdminRoute><AdminCalendar /></AdminRoute>} />
              <Route path="/admin/clients" element={<AdminRoute><ClientManagement /></AdminRoute>} />
              <Route path="/admin/clients/:clientId" element={<AdminRoute><ClientDetail /></AdminRoute>} />
              <Route path="/admin/team-requests" element={<AdminRoute><TeamRequests /></AdminRoute>} />
              <Route path="/admin/hero-images" element={<AdminRoute><HeroImageManager /></AdminRoute>} />
              <Route path="/admin/site-content" element={<AdminRoute><SiteContentManager /></AdminRoute>} />
              <Route path="/admin/team-members" element={<AdminRoute><TeamMemberManager /></AdminRoute>} />
              <Route path="/admin/service-options" element={<AdminRoute><ServiceOptionsManager /></AdminRoute>} />
              <Route path="/admin/assignments" element={<AdminRoute><ClientAssignments /></AdminRoute>} />

              {/* Staff/Therapist portal */}
              <Route path="/staff" element={<StaffRoute><StaffDashboard /></StaffRoute>} />
              <Route path="/staff/todos" element={<StaffRoute><TodoManager /></StaffRoute>} />
              <Route path="/staff/resources" element={<StaffRoute><Resources /></StaffRoute>} />
              <Route path="/staff/toolkit/act-matrix" element={<StaffRoute><StaffACTMatrix /></StaffRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
