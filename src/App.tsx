import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RedirectIfAuthenticated } from "@/components/auth/RedirectIfAuthenticated";

// Public pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HowItWorksPage from "./pages/HowItWorks";
import PlansPage from "./pages/Plans";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCompanies from "./pages/admin/Companies";
import AdminCandidates from "./pages/admin/Candidates";

// Company pages
import CompanyDashboard from "./pages/empresa/Dashboard";
import CompanyJobs from "./pages/empresa/Jobs";
import CompanyApplications from "./pages/empresa/Applications";
import CompanyCandidates from "./pages/empresa/Candidates";
import CompanyCandidateProfile from "./pages/empresa/CandidateProfile";
import CompanyMessages from "./pages/empresa/Messages";
import CompanySettings from "./pages/empresa/Settings";

// Candidate pages
import CandidateDashboard from "./pages/candidato/Dashboard";
import CandidateJobSearch from "./pages/candidato/JobSearch";
import CandidateTests from "./pages/candidato/Tests";
import CandidateMessages from "./pages/candidato/Messages";
import CandidateProfile from "./pages/candidato/Profile";
import CandidateJobDetails from "./pages/candidato/JobDetails";
import CandidateApplications from "./pages/candidato/Applications";
import CandidateSettings from "./pages/candidato/Settings";
import CandidateCurriculums from "./pages/candidato/Curriculums";
import CandidateCurriculumEdit from "./pages/candidato/CurriculumEdit";
import CandidateSavedJobs from "./pages/candidato/SavedJobs";
import CandidateNotifications from "./pages/candidato/Notifications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={
              <RedirectIfAuthenticated>
                <Login />
              </RedirectIfAuthenticated>
            } />
            <Route path="/cadastro" element={
              <RedirectIfAuthenticated>
                <Register />
              </RedirectIfAuthenticated>
            } />
            <Route path="/como-funciona" element={<HowItWorksPage />} />
            <Route path="/planos" element={<PlansPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/empresas" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminCompanies />
              </ProtectedRoute>
            } />
            <Route path="/admin/candidatos" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminCandidates />
              </ProtectedRoute>
            } />
            <Route path="/admin/configuracoes" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Company Routes */}
            <Route path="/empresa" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CompanyDashboard />
              </ProtectedRoute>
            } />
            <Route path="/empresa/vagas" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CompanyJobs />
              </ProtectedRoute>
            } />
            <Route path="/empresa/candidaturas" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CompanyApplications />
              </ProtectedRoute>
            } />
            <Route path="/empresa/candidatos" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CompanyCandidates />
              </ProtectedRoute>
            } />
            <Route path="/empresa/candidatos/:id" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CompanyCandidateProfile />
              </ProtectedRoute>
            } />
            <Route path="/empresa/testes" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CompanyDashboard />
              </ProtectedRoute>
            } />
            <Route path="/empresa/mensagens" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CompanyMessages />
              </ProtectedRoute>
            } />
            <Route path="/empresa/configuracoes" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CompanySettings />
              </ProtectedRoute>
            } />

            {/* Candidate Routes */}
            <Route path="/candidato" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <CandidateDashboard />
              </ProtectedRoute>
            } />
            <Route path="/candidato/perfil" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <CandidateProfile />
              </ProtectedRoute>
            } />
            <Route path="/candidato/vagas" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <CandidateJobSearch />
              </ProtectedRoute>
            } />
            <Route path="/candidato/vagas/:id" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <CandidateJobDetails />
              </ProtectedRoute>
            } />
            <Route path="/candidato/vagas-salvas" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <CandidateSavedJobs />
              </ProtectedRoute>
            } />
            <Route path="/candidato/candidaturas" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <CandidateApplications />
              </ProtectedRoute>
            } />
            <Route path="/candidato/testes" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <CandidateTests />
              </ProtectedRoute>
            } />
            <Route path="/candidato/mensagens" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <CandidateMessages />
              </ProtectedRoute>
            } />
            <Route path="/candidato/configuracoes" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <CandidateSettings />
              </ProtectedRoute>
            } />
            <Route path="/candidato/curriculos" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <CandidateCurriculums />
              </ProtectedRoute>
            } />
            <Route path="/candidato/curriculos/:id" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <CandidateCurriculumEdit />
              </ProtectedRoute>
            } />
            <Route path="/candidato/notificacoes" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <CandidateNotifications />
              </ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
