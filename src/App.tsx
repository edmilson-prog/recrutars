import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { RBACProvider } from "@/contexts/RBACContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RedirectIfAuthenticated } from "@/components/auth/RedirectIfAuthenticated";
import { OnboardingGuard } from "@/components/auth/OnboardingGuard";

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
import LGPD from "./pages/LGPD";
import ForCompanies from "./pages/ForCompanies";
import ForCandidates from "./pages/ForCandidates";
import CorporateTests from "./pages/CorporateTests";
import AceitarConvite from "./pages/AceitarConvite";
import CollaboratorTestSession from "./pages/CollaboratorTestSession";
import AtivarConta from "./pages/AtivarConta";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCompanies from "./pages/admin/Companies";
import AdminCompanyDetail from "./pages/admin/CompanyDetail";
import AdminCandidates from "./pages/admin/Candidates";
import AdminCandidateDetail from "./pages/admin/CandidateDetail";
import AdminSettings from "./pages/admin/Settings";
import AdminAssessmentCategories from "./pages/admin/AssessmentCategories";
import AdminAssessmentQuestions from "./pages/admin/AssessmentQuestions";

// PRD-061: Admin Users & RBAC pages
import AdminUsers from "./pages/admin/Users";
import AdminUserDetail from "./pages/admin/UserDetail";
import AdminPermissionGroups from "./pages/admin/PermissionGroups";
import AdminRolesPermissions from "./pages/admin/RolesPermissions";
import AdminAuditLogs from "./pages/admin/AuditLogs";

// PRD-059: Admin Reports & Analytics "Radar"
import AdminReportsFinancial from "./pages/admin/ReportsFinancial";
import AdminReportsGrowth from "./pages/admin/ReportsGrowth";
import AdminReportsOperational from "./pages/admin/ReportsOperational";
import AdminActivityFeed from "./pages/admin/ActivityFeed";
import AdminReportsExport from "./pages/admin/ReportsExport";

// PRD-060: Admin Plans & Subscriptions "Commerce"
import AdminPlansManagement from "./pages/admin/PlansManagement";
import AdminPlanCapabilities from "./pages/admin/PlanCapabilities";
import AdminPlanDetail from "./pages/admin/PlanDetail";
import AdminSubscriptions from "./pages/admin/Subscriptions";
import AdminSubscriptionDashboard from "./pages/admin/SubscriptionDashboard";

// PRD-075/076: Stripe Integration & Billing
import AdminWebhookLog from "./pages/admin/WebhookLog";
import AdminBillingDashboard from "./pages/admin/BillingDashboard";
// Test Packages
import AdminPackagesManagement from "./pages/admin/PackagesManagement";
import AdminTests from "./pages/admin/AdminTests";
import AdminPackageDetail from "./pages/admin/PackageDetail";
import CompanyCheckoutSuccess from "./pages/empresa/CheckoutSuccess";
import CompanyCheckoutCancel from "./pages/empresa/CheckoutCancel";
import CompanyMyPlan from "./pages/empresa/MyPlan";
import CompanyPackages from "./pages/empresa/Packages";
import CandidateMyPlan from "./pages/candidato/MyPlan";
import CandidateCheckoutSuccess from "./pages/candidato/CheckoutSuccess";
import CandidateCheckoutCancel from "./pages/candidato/CheckoutCancel";

// PRD-058: Admin Jobs & Moderation "Sentinel"
import AdminJobsDashboard from "./pages/admin/JobsDashboard";
import AdminJobsList from "./pages/admin/JobsList";
import AdminJobDetail from "./pages/admin/JobDetail";
import AdminModerationQueue from "./pages/admin/ModerationQueue";
import AdminFinalizedJobs from "./pages/admin/FinalizedJobs";
import AdminHiresPage from "./pages/admin/AdminHires";
import AdminInterviewsPage from "./pages/admin/AdminInterviews";
import AdminModerationConfig from "./pages/admin/ModerationConfig";

// PRD-082: Admin Helpdesk Intelligence
import AdminHelpdesk from "./pages/admin/Helpdesk";
import AdminHelpdeskTicketDetail from "./pages/admin/HelpdeskTicketDetail";
import AdminNotifications from "./pages/admin/Notifications";
import AdminNotificationCenter from "./pages/admin/NotificationCenter";
import AdminWhatsAppCenter from "./pages/admin/WhatsAppCenter";

// Gauge-Pro Admin pages
import GaugeProAdjectives from "./pages/admin/GaugeProAdjectives";
import GaugeProScenarios from "./pages/admin/GaugeProScenarios";
import GaugeProArchetypes from "./pages/admin/GaugeProArchetypes";

// PRD-062: Feature Flags "Switch"
import AdminFeatureFlags from "./pages/admin/FeatureFlags";
import AdminFeatureFlagEditor from "./pages/admin/FeatureFlagEditor";
import AdminPlanSimulator from "./pages/admin/PlanSimulator";
import AdminFlagAuditLog from "./pages/admin/FlagAuditLog";
import { SimulationProvider } from "./contexts/SimulationContext";

// Company pages
import CompanyDashboard from "./pages/empresa/Dashboard";
import CompanyJobs from "./pages/empresa/Jobs";
import CompanyJobForm from "./pages/empresa/JobForm";
import CompanyApplications from "./pages/empresa/Applications";
import CompanyCandidates from "./pages/empresa/Candidates";
import CompanyCandidateProfile from "./pages/empresa/CandidateProfile";
import CompanySavedCandidates from "./pages/empresa/SavedCandidates";
import CompanyMessages from "./pages/empresa/Messages";
import CompanySettings from "./pages/empresa/Settings";
import CompanyNotifications from "./pages/empresa/Notifications";
import CompanyInterviews from "./pages/empresa/Interviews";
import CompanySuggestedCandidates from "./pages/empresa/SuggestedCandidates";


// Candidate pages
import CandidateDashboard from "./pages/candidato/Dashboard";
import CandidateJobSearch from "./pages/candidato/JobSearch";
import CandidateTests from "./pages/candidato/Tests";
import CandidateMessages from "./pages/candidato/Messages";
import CandidateAccount from "./pages/candidato/Profile";
import CandidateJobDetails from "./pages/candidato/JobDetails";
import CandidateApplications from "./pages/candidato/Applications";
import CandidateSettings from "./pages/candidato/Settings";
import CandidateProfessionalProfile from "./pages/candidato/ProfessionalProfile";
import CandidateSavedJobs from "./pages/candidato/SavedJobs";
import CandidateRecommendedJobs from "./pages/candidato/RecommendedJobs";
import CandidateNotifications from "./pages/candidato/Notifications";
import CandidateInterviews from "./pages/candidato/Interviews";
import CandidateImportCV from "./pages/candidato/ImportCV";
import CandidateBehavioralTest from "./pages/candidato/BehavioralTest";
import CandidateBehavioralTestResult from "./pages/candidato/BehavioralTestResult";

// PRD-049 & PRD-050: Gauge-Pro Assessment
import CandidateGaugeProAssessment from "./pages/candidato/GaugeProAssessment";
import CandidateGaugeProResult from "./pages/candidato/GaugeProResult";

// PRD-083-086: Candidate Onboarding
import OnboardingPersonalProfile from "./pages/candidato/OnboardingPersonalProfile";
import OnboardingProfessionalProfile from "./pages/candidato/OnboardingProfessionalProfile";
import OnboardingGaugeProTest from "./pages/candidato/OnboardingGaugeProTest";

// PRD-048: Job Assessment pages
import CreateJobTest from "./pages/empresa/CreateJobTest";
import JobTestManager from "./pages/empresa/JobTestManager";
import CandidateTestReport from "./pages/empresa/CandidateTestReport";
import CompareCandidates from "./pages/empresa/CompareCandidates";
import MagicLinkLanding from "./pages/MagicLinkLanding";
import PublicTestLanding from "./pages/PublicTestLanding";

// PRD-052, 053, 054: Corporate Tests Hub
import CorporateTestsHub from "./pages/empresa/CorporateTestsHub";
import CorporateTestDetail from "./pages/empresa/CorporateTestDetail";
import CorporateTestResult from "./pages/empresa/CorporateTestResult";
import CorporateTestCompare from "./pages/empresa/CorporateTestCompare";
import CorporateTestReports from "./pages/empresa/CorporateTestReports";
import CorporateTestMetrics from "./pages/empresa/CorporateTestMetrics";
import CorporateTestAudit from "./pages/empresa/CorporateTestAudit";

// PRD-055, 056, 057: Team Management
import TeamManagement from "./pages/empresa/TeamManagement";
import TeamMemberProfile from "./pages/empresa/TeamMemberProfile";
import TeamCompatibility from "./pages/empresa/TeamCompatibility";
import TeamGapAnalysis from "./pages/empresa/TeamGapAnalysis";
import TeamBuilder from "./pages/empresa/TeamBuilder";
import TeamDevelopment from "./pages/empresa/TeamDevelopment";
import TeamTalents from "./pages/empresa/TeamTalents";
import TeamCulture from "./pages/empresa/TeamCulture";
import TeamEvolution from "./pages/empresa/TeamEvolution";
import TeamReports from "./pages/empresa/TeamReports";

// Auth confirmation (email verify link handler)
import AuthConfirm from "./pages/AuthConfirm";

// Help pages
import HelpPage from "./pages/Help";
import TicketDetailsPage from "./pages/TicketDetails";

// About page (PRD-044)
import AboutPage from "./pages/About";

// PRD-040: Chatbot de Suporte
import { ChatbotWidget } from "./components/chatbot";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      gcTime: 1000 * 60 * 5,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

// Redirect /empresa/testes/:testId/resultado → /empresa/testes/:testId
// Fixes breadcrumb 404: the "resultado" segment generates a link to this non-existent route
function RedirectToTestDetail() {
  const { testId } = useParams<{ testId: string }>();
  return <Navigate to={`/empresa/testes/${testId}`} replace />;
}

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
            <RBACProvider>
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
            <Route path="/lgpd" element={<LGPD />} />
            <Route path="/para-empresas" element={<ForCompanies />} />
            <Route path="/para-candidatos" element={<ForCandidates />} />
            <Route path="/testes-corporativos" element={<CorporateTests />} />

            {/* Email confirmation link handler (public — no wrappers) */}
            <Route path="/auth/confirm" element={<AuthConfirm />} />

            {/* Team invite acceptance (public — no wrappers) */}
            <Route path="/aceitar-convite" element={<AceitarConvite />} />

            {/* PRD-048: Magic Link Route (public) */}
            <Route path="/t/:token" element={<MagicLinkLanding />} />

            {/* Public Test Landing (via company public link) */}
            <Route path="/teste/:slug" element={<PublicTestLanding />} />

            {/* PRD-081: Collaborator Test Session (standalone, no sidebar) */}
            <Route path="/convite/teste/:token" element={<CollaboratorTestSession />} />

            {/* PRD-081: Account Activation (fallback email link) */}
            <Route path="/ativar-conta" element={<AtivarConta />} />

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
            <Route path="/admin/empresas/:id" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminCompanyDetail />
              </ProtectedRoute>
            } />
            <Route path="/admin/candidatos" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminCandidates />
              </ProtectedRoute>
            } />
            <Route path="/admin/candidatos/:id" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminCandidateDetail />
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

            {/* PRD-061: Admin Users & RBAC Routes */}
            <Route path="/admin/usuarios" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/usuarios/:id" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminUserDetail />
              </ProtectedRoute>
            } />
            <Route path="/admin/grupos-permissao" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminPermissionGroups />
              </ProtectedRoute>
            } />
            <Route path="/admin/papeis-permissoes" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminRolesPermissions />
              </ProtectedRoute>
            } />
            <Route path="/admin/auditoria" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminAuditLogs />
              </ProtectedRoute>
            } />

            {/* PRD-059: Admin Reports & Analytics Routes */}
            <Route path="/admin/relatorios/financeiro" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminReportsFinancial />
              </ProtectedRoute>
            } />
            <Route path="/admin/relatorios/crescimento" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminReportsGrowth />
              </ProtectedRoute>
            } />
            <Route path="/admin/relatorios/operacional" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminReportsOperational />
              </ProtectedRoute>
            } />
            <Route path="/admin/relatorios/activity-feed" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminActivityFeed />
              </ProtectedRoute>
            } />
            <Route path="/admin/relatorios/exportar" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminReportsExport />
              </ProtectedRoute>
            } />

            {/* PRD-060: Admin Plans & Subscriptions Routes */}
            <Route path="/admin/planos" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminPlansManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/planos/capabilities" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminPlanCapabilities />
              </ProtectedRoute>
            } />
            <Route path="/admin/planos/novo" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminPlanDetail />
              </ProtectedRoute>
            } />
            <Route path="/admin/planos/:id" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminPlanDetail />
              </ProtectedRoute>
            } />
            <Route path="/admin/assinaturas" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminSubscriptions />
              </ProtectedRoute>
            } />
            <Route path="/admin/assinaturas/dashboard" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminSubscriptionDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/assinaturas/webhooks" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminWebhookLog />
              </ProtectedRoute>
            } />
            <Route path="/admin/assinaturas/billing" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminBillingDashboard />
              </ProtectedRoute>
            } />

            {/* Admin Tests Overview */}
            <Route path="/admin/testes" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminTests />
              </ProtectedRoute>
            } />

            {/* Test Packages Routes */}
            <Route path="/admin/pacotes" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminPackagesManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/pacotes/novo" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminPackageDetail />
              </ProtectedRoute>
            } />
            <Route path="/admin/pacotes/:id" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminPackageDetail />
              </ProtectedRoute>
            } />

            {/* PRD-058: Admin Jobs & Moderation "Sentinel" Routes */}
            <Route path="/admin/vagas" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminJobsDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/vagas/lista" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminJobsList />
              </ProtectedRoute>
            } />
            <Route path="/admin/vagas/moderacao" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminModerationQueue />
              </ProtectedRoute>
            } />
            <Route path="/admin/vagas/finalizadas" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminFinalizedJobs />
              </ProtectedRoute>
            } />
            <Route path="/admin/vagas/contratacoes" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminHiresPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/vagas/entrevistas" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminInterviewsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/vagas/configuracoes" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminModerationConfig />
              </ProtectedRoute>
            } />
            <Route path="/admin/vagas/:id" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminJobDetail />
              </ProtectedRoute>
            } />

            {/* Notificações Admin */}
            <Route path="/admin/notificacoes" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminNotifications />
              </ProtectedRoute>
            } />
            <Route path="/admin/notificacoes/central" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminNotificationCenter />
              </ProtectedRoute>
            } />
            <Route path="/admin/notificacoes/whatsapp" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminWhatsAppCenter />
              </ProtectedRoute>
            } />

            {/* PRD-082: Admin Helpdesk Intelligence Routes */}
            <Route path="/admin/helpdesk" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminHelpdesk />
              </ProtectedRoute>
            } />
            <Route path="/admin/helpdesk/tickets/:id" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminHelpdeskTicketDetail />
              </ProtectedRoute>
            } />

            {/* PRD-062: Feature Flags "Switch" Routes */}
            <Route path="/admin/feature-flags" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminFeatureFlags />
              </ProtectedRoute>
            } />
            <Route path="/admin/feature-flags/simulador" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <SimulationProvider>
                  <AdminPlanSimulator />
                </SimulationProvider>
              </ProtectedRoute>
            } />
            <Route path="/admin/feature-flags/auditoria" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminFlagAuditLog />
              </ProtectedRoute>
            } />
            <Route path="/admin/feature-flags/:id" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminFeatureFlagEditor />
              </ProtectedRoute>
            } />

            {/* Gauge-Pro Admin Routes */}
            <Route path="/admin/gauge-pro/adjetivos" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <GaugeProAdjectives />
              </ProtectedRoute>
            } />
            <Route path="/admin/gauge-pro/cenarios" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <GaugeProScenarios />
              </ProtectedRoute>
            } />
            <Route path="/admin/gauge-pro/arquetipos" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <GaugeProArchetypes />
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
            <Route path="/empresa/vagas/nova" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CompanyJobForm />
              </ProtectedRoute>
            } />
            <Route path="/empresa/vagas/:id/editar" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CompanyJobForm />
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
            {/* PRD-052, 053, 054: Corporate Tests Hub */}
            <Route path="/empresa/testes" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CorporateTestsHub />
              </ProtectedRoute>
            } />
            <Route path="/empresa/testes/metricas" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CorporateTestMetrics />
              </ProtectedRoute>
            } />
            <Route path="/empresa/testes/auditoria" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CorporateTestAudit />
              </ProtectedRoute>
            } />
            <Route path="/empresa/testes/:testId" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CorporateTestDetail />
              </ProtectedRoute>
            } />
            <Route path="/empresa/testes/:testId/resultado/:candidateId" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CorporateTestResult />
              </ProtectedRoute>
            } />
            <Route path="/empresa/testes/:testId/resultado" element={<RedirectToTestDetail />} />
            <Route path="/empresa/testes/:testId/comparar" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CorporateTestCompare />
              </ProtectedRoute>
            } />
            <Route path="/empresa/testes/:testId/relatorios" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CorporateTestReports />
              </ProtectedRoute>
            } />
            {/* Test Packages */}
            <Route path="/empresa/pacotes" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CompanyPackages />
              </ProtectedRoute>
            } />

            {/* PRD-055, 056, 057: Team Management Routes */}
            <Route path="/empresa/equipes" element={
              <ProtectedRoute allowedTypes={['company']}>
                <TeamManagement />
              </ProtectedRoute>
            } />
            <Route path="/empresa/equipes/membro" element={<Navigate to="/empresa/equipes?tab=members" replace />} />
            <Route path="/empresa/equipes/membro/:id" element={
              <ProtectedRoute allowedTypes={['company']}>
                <TeamMemberProfile />
              </ProtectedRoute>
            } />
            <Route path="/empresa/equipes/compatibilidade" element={
              <ProtectedRoute allowedTypes={['company']}>
                <TeamCompatibility />
              </ProtectedRoute>
            } />
            <Route path="/empresa/equipes/gap-analysis" element={
              <ProtectedRoute allowedTypes={['company']}>
                <TeamGapAnalysis />
              </ProtectedRoute>
            } />
            <Route path="/empresa/equipes/team-builder" element={
              <ProtectedRoute allowedTypes={['company']}>
                <TeamBuilder />
              </ProtectedRoute>
            } />
            <Route path="/empresa/equipes/desenvolvimento" element={<Navigate to="/empresa/equipes?tab=members" replace />} />
            <Route path="/empresa/equipes/desenvolvimento/:id" element={
              <ProtectedRoute allowedTypes={['company']}>
                <TeamDevelopment />
              </ProtectedRoute>
            } />
            <Route path="/empresa/equipes/talentos" element={
              <ProtectedRoute allowedTypes={['company']}>
                <TeamTalents />
              </ProtectedRoute>
            } />
            <Route path="/empresa/equipes/cultura" element={
              <ProtectedRoute allowedTypes={['company']}>
                <TeamCulture />
              </ProtectedRoute>
            } />
            <Route path="/empresa/equipes/evolucao" element={<Navigate to="/empresa/equipes?tab=members" replace />} />
            <Route path="/empresa/equipes/evolucao/:id" element={
              <ProtectedRoute allowedTypes={['company']}>
                <TeamEvolution />
              </ProtectedRoute>
            } />
            <Route path="/empresa/equipes/relatorios" element={
              <ProtectedRoute allowedTypes={['company']}>
                <TeamReports />
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
            <Route path="/empresa/checkout/sucesso" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CompanyCheckoutSuccess />
              </ProtectedRoute>
            } />
            <Route path="/empresa/checkout/cancelado" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CompanyCheckoutCancel />
              </ProtectedRoute>
            } />
            <Route path="/empresa/meu-plano" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CompanyMyPlan />
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

            {/* PRD-083-086: Candidate Onboarding Routes (outside OnboardingGuard to avoid loops) */}
            <Route path="/candidato/onboarding/perfil-pessoal" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <OnboardingPersonalProfile />
              </ProtectedRoute>
            } />
            <Route path="/candidato/onboarding/perfil-profissional" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <OnboardingProfessionalProfile />
              </ProtectedRoute>
            } />
            <Route path="/candidato/onboarding/teste-gauge-pro" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <OnboardingGaugeProTest />
              </ProtectedRoute>
            } />

            {/* Candidate Routes (wrapped with OnboardingGuard) */}
            <Route path="/candidato" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <OnboardingGuard>
                  <CandidateDashboard />
                </OnboardingGuard>
              </ProtectedRoute>
            } />
            <Route path="/candidato/perfil" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <OnboardingGuard>
                  <CandidateProfessionalProfile />
                </OnboardingGuard>
              </ProtectedRoute>
            } />
            <Route path="/candidato/conta" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <OnboardingGuard>
                  <CandidateAccount />
                </OnboardingGuard>
              </ProtectedRoute>
            } />
            <Route path="/candidato/vagas" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <OnboardingGuard>
                  <CandidateJobSearch />
                </OnboardingGuard>
              </ProtectedRoute>
            } />
            <Route path="/candidato/vagas/:id" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <OnboardingGuard>
                  <CandidateJobDetails />
                </OnboardingGuard>
              </ProtectedRoute>
            } />
            <Route path="/candidato/vagas-salvas" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <OnboardingGuard>
                  <CandidateSavedJobs />
                </OnboardingGuard>
              </ProtectedRoute>
            } />
            <Route path="/candidato/vagas-recomendadas" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <OnboardingGuard>
                  <CandidateRecommendedJobs />
                </OnboardingGuard>
              </ProtectedRoute>
            } />
            <Route path="/candidato/candidaturas" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <OnboardingGuard>
                  <CandidateApplications />
                </OnboardingGuard>
              </ProtectedRoute>
            } />
            <Route path="/candidato/testes" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <OnboardingGuard>
                  <CandidateTests />
                </OnboardingGuard>
              </ProtectedRoute>
            } />
            <Route path="/candidato/mensagens" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <CandidateMessages />
              </ProtectedRoute>
            } />
            <Route path="/candidato/configuracoes" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <OnboardingGuard>
                  <CandidateSettings />
                </OnboardingGuard>
              </ProtectedRoute>
            } />
            <Route path="/candidato/meu-plano" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <OnboardingGuard>
                  <CandidateMyPlan />
                </OnboardingGuard>
              </ProtectedRoute>
            } />
            <Route path="/candidato/checkout/sucesso" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <CandidateCheckoutSuccess />
              </ProtectedRoute>
            } />
            <Route path="/candidato/checkout/cancelado" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <CandidateCheckoutCancel />
              </ProtectedRoute>
            } />
            <Route path="/candidato/curriculos" element={<Navigate to="/candidato/perfil" replace />} />
            <Route path="/candidato/curriculos/:id" element={<Navigate to="/candidato/perfil" replace />} />
            <Route path="/candidato/notificacoes" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <OnboardingGuard>
                  <CandidateNotifications />
                </OnboardingGuard>
              </ProtectedRoute>
            } />
            <Route path="/candidato/entrevistas" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <OnboardingGuard>
                  <CandidateInterviews />
                </OnboardingGuard>
              </ProtectedRoute>
            } />
            <Route path="/candidato/importar-cv" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <OnboardingGuard>
                  <CandidateImportCV />
                </OnboardingGuard>
              </ProtectedRoute>
            } />
            <Route path="/candidato/teste-comportamental" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <OnboardingGuard>
                  <CandidateBehavioralTest />
                </OnboardingGuard>
              </ProtectedRoute>
            } />
            <Route path="/candidato/teste-comportamental/resultado" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <OnboardingGuard>
                  <CandidateBehavioralTestResult />
                </OnboardingGuard>
              </ProtectedRoute>
            } />

            {/* PRD-049 & PRD-050: Gauge-Pro */}
            <Route path="/candidato/gauge-pro" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <OnboardingGuard>
                  <CandidateGaugeProAssessment />
                </OnboardingGuard>
              </ProtectedRoute>
            } />
            <Route path="/candidato/gauge-pro/resultado" element={
              <ProtectedRoute allowedTypes={['candidate']}>
                <OnboardingGuard>
                  <CandidateGaugeProResult />
                </OnboardingGuard>
              </ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </TooltipProvider>
            </RBACProvider>
        </AuthProvider>
      </BrowserRouter>
      </AccessibilityProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
