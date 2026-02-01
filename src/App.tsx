import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RedirectIfAuthenticated } from "@/components/auth/RedirectIfAuthenticated";

// Public pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HowItWorksPage from "./pages/HowItWorks";
import PlansPage from "./pages/Plans";
import QuemSomos from "./pages/QuemSomos";
import MissaoVisaoValores from "./pages/MissaoVisaoValores";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import TermosUso from "./pages/TermosUso";
import ForCompanies from "./pages/ForCompanies";
import ForCandidates from "./pages/ForCandidates";
import CorporateTests from "./pages/CorporateTests";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCompanies from "./pages/admin/Companies";
import AdminCandidates from "./pages/admin/Candidates";
import AdminSettings from "./pages/admin/Settings";
import AdminAssessmentCategories from "./pages/admin/AssessmentCategories";
import AdminAssessmentQuestions from "./pages/admin/AssessmentQuestions";

// Company pages
import CompanyDashboard from "./pages/empresa/Dashboard";
import CompanyJobs from "./pages/empresa/Jobs";
import CompanyApplications from "./pages/empresa/Applications";
import CompanyCandidates from "./pages/empresa/Candidates";
import CompanyCandidateProfile from "./pages/empresa/CandidateProfile";
import CompanySavedCandidates from "./pages/empresa/SavedCandidates";
import CompanyMessages from "./pages/empresa/Messages";
import CompanySettings from "./pages/empresa/Settings";
import CompanyNotifications from "./pages/empresa/Notifications";
import CompanyInterviews from "./pages/empresa/Interviews";
import CompanySuggestedCandidates from "./pages/empresa/SuggestedCandidates";
import CompanyPlans from "./pages/empresa/Plans";

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
import CandidateRecommendedJobs from "./pages/candidato/RecommendedJobs";
import CandidateNotifications from "./pages/candidato/Notifications";
import CandidateInterviews from "./pages/candidato/Interviews";
import CandidateImportCV from "./pages/candidato/ImportCV";
import CandidateBehavioralTest from "./pages/candidato/BehavioralTest";
import CandidateBehavioralTestResult from "./pages/candidato/BehavioralTestResult";
import CandidatePlans from "./pages/candidato/Plans";

// PRD-049 & PRD-050: Gauge-Pro Assessment
import CandidateGaugeProAssessment from "./pages/candidato/GaugeProAssessment";
import CandidateGaugeProResult from "./pages/candidato/GaugeProResult";

// PRD-048: Job Assessment pages
import CreateJobTest from "./pages/empresa/CreateJobTest";
import JobTestManager from "./pages/empresa/JobTestManager";
import CandidateTestReport from "./pages/empresa/CandidateTestReport";
import CompareCandidates from "./pages/empresa/CompareCandidates";
import MagicLinkLanding from "./pages/MagicLinkLanding";

// Help pages
import HelpPage from "./pages/Help";
import TicketDetailsPage from "./pages/TicketDetails";

// About page (PRD-044)
import AboutPage from "./pages/About";

// PRD-040: Chatbot de Suporte
import { ChatbotWidget } from "./components/chatbot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="recrutars-theme"
    >
      <AccessibilityProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <ChatbotWidget />
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
            <Route path="/quem-somos" element={<QuemSomos />} />
            <Route path="/missao-visao-valores" element={<MissaoVisaoValores />} />
            <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
            <Route path="/termos-de-uso" element={<TermosUso />} />
            <Route path="/para-empresas" element={<ForCompanies />} />
            <Route path="/para-candidatos" element={<ForCandidates />} />
            <Route path="/testes-corporativos" element={<CorporateTests />} />

            {/* PRD-048: Magic Link Route (public) */}
            <Route path="/t/:token" element={<MagicLinkLanding />} />

            {/* Help Routes */}
            <Route path="/ajuda" element={<HelpPage />} />
            <Route path="/ajuda/tickets/:ticketId" element={
              <ProtectedRoute allowedTypes={['candidate', 'company', 'admin']}>
                <TicketDetailsPage />
              </ProtectedRoute>
            } />

            {/* About Route (PRD-044) */}
            <Route path="/sobre" element={
              <ProtectedRoute allowedTypes={['candidate', 'company', 'admin']}>
                <AboutPage />
              </ProtectedRoute>
            } />

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
                <AdminSettings />
              </ProtectedRoute>
            } />
            <Route path="/admin/avaliacoes/categorias" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminAssessmentCategories />
              </ProtectedRoute>
            } />
            <Route path="/admin/avaliacoes/perguntas" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminAssessmentQuestions />
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
            <Route path="/empresa/candidatos-salvos" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CompanySavedCandidates />
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
            <Route path="/empresa/notificacoes" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CompanyNotifications />
              </ProtectedRoute>
            } />
            <Route path="/empresa/entrevistas" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CompanyInterviews />
              </ProtectedRoute>
            } />
            <Route path="/empresa/vagas/:id/candidatos-sugeridos" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CompanySuggestedCandidates />
              </ProtectedRoute>
            } />

            <Route path="/empresa/planos" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CompanyPlans />
              </ProtectedRoute>
            } />

            {/* PRD-048: Job Assessment Routes */}
            <Route path="/empresa/vagas/:jobId/criar-teste" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CreateJobTest />
              </ProtectedRoute>
            } />
            <Route path="/empresa/vagas/:jobId/teste" element={
              <ProtectedRoute allowedTypes={['company']}>
                <JobTestManager />
              </ProtectedRoute>
            } />
            <Route path="/empresa/vagas/:jobId/teste/comparar" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CompareCandidates />
              </ProtectedRoute>
            } />
            <Route path="/empresa/vagas/:jobId/teste/:candidateId" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CandidateTestReport />
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
            <Route path="/candidato/vagas-recomendadas" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <CandidateRecommendedJobs />
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
            <Route path="/candidato/entrevistas" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <CandidateInterviews />
              </ProtectedRoute>
            } />
            <Route path="/candidato/importar-cv" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <CandidateImportCV />
              </ProtectedRoute>
            } />
            <Route path="/candidato/teste-comportamental" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <CandidateBehavioralTest />
              </ProtectedRoute>
            } />
            <Route path="/candidato/teste-comportamental/resultado" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <CandidateBehavioralTestResult />
              </ProtectedRoute>
            } />

            <Route path="/candidato/planos" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <CandidatePlans />
              </ProtectedRoute>
            } />

            {/* PRD-049 & PRD-050: Gauge-Pro */}
            <Route path="/candidato/gauge-pro" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <CandidateGaugeProAssessment />
              </ProtectedRoute>
            } />
            <Route path="/candidato/gauge-pro/resultado" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <CandidateGaugeProResult />
              </ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
      </AccessibilityProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
