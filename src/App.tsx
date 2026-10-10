import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages — public
import Index          from "./pages/Index";
import MethodsPage    from "./pages/MethodsPage";
import ResourcesPage  from "./pages/ResourcesPage";
import AboutPage      from "./pages/AboutPage";
import GuidePage      from "./pages/GuidePage";
import ContactPage    from "./pages/ContactPage";
import NumericalLab   from "./pages/NumericalLab";
import AuthPage       from "./components/AuthPage";
import NotFound       from "./pages/NotFound";
import PracticePage   from "./pages/PracticePage";

// Pages — authenticated (no sidebar wrapper — navbar handles nav)
import Modules            from "./pages/Modules";
import Module             from "./pages/Module";
import HistoryPage        from "./pages/HistoryPage";
import ModeExamPage       from "./pages/ModeExamPage";
import ProfessorDashboard from "./pages/ProfessorDashboard";
import ModuleWizard       from "./pages/ModuleWizard";
import LessonEditor       from "./pages/LessonEditor";
import LessonView         from "./pages/LessonView";

import ScrollToTop from "@/components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen w-full paper-canvas-bg">
            <Routes>
              {/* ── Public ── */}
              <Route path="/"          element={<Index />} />
              <Route path="/methods"   element={<MethodsPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/about"     element={<AboutPage />} />
              <Route path="/guide"     element={<GuidePage />} />
              <Route path="/contact"   element={<ContactPage />} />
              <Route path="/tools"     element={<NumericalLab />} />
              <Route path="/mathtools" element={<NumericalLab />} />
              <Route path="/tools/linear-system-solver" element={<NumericalLab />} />
              <Route path="/practice"  element={<PracticePage />} />
              <Route path="/auth"      element={<AuthPage />} />

              {/* ── Redirect old dashboard routes → modules ── */}
              <Route path="/dashboard"            element={<Navigate to="/modules" replace />} />
              <Route path="/professor-dashboard"  element={<Navigate to="/modules" replace />} />

              {/* ── Student routes (protected) ── */}
              <Route path="/modules" element={<ProtectedRoute><Modules /></ProtectedRoute>} />
              <Route path="/module/:moduleId" element={<ProtectedRoute><Module /></ProtectedRoute>} />
              <Route path="/history" element={
                <ProtectedRoute><HistoryPage /></ProtectedRoute>
              } />
              <Route path="/mode-exam" element={
                <ProtectedRoute><ModeExamPage /></ProtectedRoute>
              } />
              <Route path="/lesson-view/:lessonId/:moduleId" element={<ProtectedRoute><LessonView /></ProtectedRoute>} />

              {/* ── Professor routes (protected) ── */}
              <Route path="/module-wizard" element={
                <ProtectedRoute requiredRole="professeur"><ModuleWizard /></ProtectedRoute>
              } />
              <Route path="/lesson/:lessonId/:moduleId" element={
                <ProtectedRoute requiredRole="professeur"><LessonEditor /></ProtectedRoute>
              } />

              {/* ── Fallback ── */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
