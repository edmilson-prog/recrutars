import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Public pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HowItWorksPage from "./pages/HowItWorks";
import PlansPage from "./pages/Plans";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";

// Company pages
import CompanyDashboard from "./pages/empresa/Dashboard";
import CompanyJobs from "./pages/empresa/Jobs";

// Candidate pages
import CandidateDashboard from "./pages/candidato/Dashboard";
import CandidateJobSearch from "./pages/candidato/JobSearch";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Register />} />
            <Route path="/como-funciona" element={<HowItWorksPage />} />
            <Route path="/planos" element={<PlansPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/empresas" element={<AdminDashboard />} />
            <Route path="/admin/candidatos" element={<AdminDashboard />} />
            <Route path="/admin/configuracoes" element={<AdminDashboard />} />

            {/* Company Routes */}
            <Route path="/empresa" element={<CompanyDashboard />} />
            <Route path="/empresa/vagas" element={<CompanyJobs />} />
            <Route path="/empresa/candidatos" element={<CompanyDashboard />} />
            <Route path="/empresa/testes" element={<CompanyDashboard />} />
            <Route path="/empresa/mensagens" element={<CompanyDashboard />} />
            <Route path="/empresa/configuracoes" element={<CompanyDashboard />} />

            {/* Candidate Routes */}
            <Route path="/candidato" element={<CandidateDashboard />} />
            <Route path="/candidato/perfil" element={<CandidateDashboard />} />
            <Route path="/candidato/vagas" element={<CandidateJobSearch />} />
            <Route path="/candidato/candidaturas" element={<CandidateDashboard />} />
            <Route path="/candidato/testes" element={<CandidateDashboard />} />
            <Route path="/candidato/mensagens" element={<CandidateDashboard />} />
            <Route path="/candidato/configuracoes" element={<CandidateDashboard />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
