import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/hooks/use-language";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import RoomDetails from "./pages/RoomDetails.tsx";
import Booking from "./pages/Booking.tsx";
import BookingSuccess from "./pages/BookingSuccess.tsx";
import SubscriptionVerify from "./pages/SubscriptionVerify";
import RegisterProperty from "./pages/RegisterProperty.tsx";
import Login from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import AdminDashboard from "./pages/AdminDashboard";
import { ErrorBoundary } from "./components/ErrorBoundary";
import PendingApproval from "./pages/PendingApproval.tsx";
import Privacy from "./pages/Privacy.tsx";
import Terms from "./pages/Terms.tsx";
import About from "./pages/About.tsx";
import HowItWorks from "./pages/HowItWorks.tsx";
import PaymentConfirmation from "./pages/PaymentConfirmation.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/room/:id" element={<RoomDetails />} />
              <Route path="/book/:id" element={<Booking />} />
              <Route path="/booking/success" element={<BookingSuccess />} />
              <Route path="/payment/confirmation" element={<PaymentConfirmation />} />
              <Route path="/owner/subscription/verify" element={<SubscriptionVerify />} />
              <Route path="/register-property" element={<RegisterProperty />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
              <Route path="/pending-approval" element={<PendingApproval />} />
              
              {/* Admin Dashboard Routes - Protected */}
              <Route path="/dashboard/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/admin/owners" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/admin/properties" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/admin/approvals" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/admin/bookings" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/admin/alerts" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/admin/payments" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/admin/settings" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              {/* Footer Pages */}
              <Route path="/about" element={<About />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
