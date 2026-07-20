import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Auth
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";

// Public pages
import Index from "./pages/Index";
import About from "./pages/About";
import Features from "./pages/Features";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";
import Consent from "./pages/Consent";
import Pricing from "./pages/Pricing";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";

// Auth pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import AdminLogin from "./pages/AdminLogin";

// Dashboard
import Dashboard from "./pages/Dashboard";
import Overview from "./pages/dashboard/Overview";
import UploadMemory from "./pages/dashboard/UploadMemory";
import Conversation from "./pages/dashboard/Conversation";
import StoryLibrary from "./pages/dashboard/StoryLibrary";
import FamilySharing from "./pages/dashboard/FamilySharing";
import Settings from "./pages/dashboard/Settings";
import CreatePersonality from "./pages/dashboard/CreatePersonality";
import Personalities from "./pages/dashboard/Personalities";


// Admin
import AdminLayout from "./components/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminMemories from "./pages/admin/AdminMemories";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, staleTime: 30000 },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* ── Public ── */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/features" element={<Features />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/consent" element={<Consent />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />

            {/* ── Auth ── */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin-login" element={<AdminLogin />} />

            {/* ── Dashboard (protected) ── */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<Overview />} />
              <Route path="personalities" element={<Personalities />} />
              <Route path="create-personality" element={<CreatePersonality />} />
              <Route path="create-personality/:personaId" element={<CreatePersonality />} />
              <Route path="upload" element={<UploadMemory />} />
              <Route path="conversation" element={<Conversation />} />
              <Route path="library" element={<StoryLibrary />} />
              <Route path="family" element={<FamilySharing />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* ── Admin (admin only) ── */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="memories" element={<AdminMemories />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* ── 404 ── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
