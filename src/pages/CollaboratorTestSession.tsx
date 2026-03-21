/**
 * CollaboratorTestSession
 * PRD-081: Standalone test page for invited collaborators
 * Route: /convite/teste/:token (public, no DashboardLayout)
 *
 * State machine: loading → identify → test → analyzing → complete
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Loader2, AlertCircle, ArrowRight, ArrowLeft, Clock, LogIn,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

import { ForceLightTheme } from '@/components/theme/ForceLightTheme';
import { TestCompletionActivation } from '@/components/invite/TestCompletionActivation';

// Gauge-Pro components (reused)
import { GaugeProIntro } from '@/components/gaugePro/GaugeProIntro';
import { WordGrid } from '@/components/gaugePro/WordGrid';
import { Part1Complete } from '@/components/gaugePro/Part1Complete';
import { ScenarioIntro } from '@/components/gaugePro/ScenarioIntro';
import { ScenarioCard } from '@/components/gaugePro/ScenarioCard';
import { AnalyzingScreen } from '@/components/gaugePro/AnalyzingScreen';
import { BlockCompleteDivider } from '@/components/gaugePro/BlockCompleteDivider';

import { useGaugeProAssessment } from '@/hooks/useGaugeProAssessment';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

type SessionStep = 'loading' | 'cpf_confirm' | 'identify' | 'login_prompt' | 'test' | 'complete' | 'error';

interface InvitationData {
  id: string;
  token: string;
  testId: string;
  candidateId: string | null;
  candidateName: string;
  candidateEmail: string;
  method: string;
  departmentId: string | null;
  inviteOrigin: string | null;
  teamMemberId: string | null;
}

interface TestInfo {
  id: string;
  name: string;
  description: string | null;
  instructions: string | null;
}

interface Department {
  id: string;
  name: string;
}

interface TeamMemberInfo {
  id: string;
  name: string;
  email: string;
  maskedCpf: string | null;
  hasCpf: boolean;
}

export default function CollaboratorTestSession() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  // Read isNewUser from navigation state (passed by PublicTestLanding)
  const navState = location.state as { isNewUser?: boolean } | null;

  // Session state
  const [step, setStep] = useState<SessionStep>('loading');
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [testInfo, setTestInfo] = useState<TestInfo | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Identify form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDepartmentId, setFormDepartmentId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Flags for completion screen — default false (safe); true only when explicitly set
  const [isNewUser, setIsNewUser] = useState(navState?.isNewUser ?? false);
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [invitationId, setInvitationId] = useState<string | null>(null);

  // Team member CPF confirmation
  const [teamMemberInfo, setTeamMemberInfo] = useState<TeamMemberInfo | null>(null);
  const [cpfLast4, setCpfLast4] = useState('');
  const [cpfError, setCpfError] = useState('');
  const [verifyingCpf, setVerifyingCpf] = useState(false);

  // Consent state
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [lgpdAccepted, setLgpdAccepted] = useState(false);
  const consentComplete = termsAccepted && privacyAccepted && lgpdAccepted;

  // Login form
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Load invitation data
  useEffect(() => {
    if (!token) {
      setStep('error');
      setErrorMessage('Token invalido.');
      return;
    }

    async function loadInvitation() {
      try {
        const { data, error } = await supabase.functions.invoke('process-collaborator-invite', {
          body: { action: 'get_invitation', token },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        const inv = data.invitation;
        const invData: InvitationData = {
          id: inv.id,
          token: inv.token,
          testId: inv.test_id,
          candidateId: inv.candidate_id,
          candidateName: inv.candidate_name,
          candidateEmail: inv.candidate_email,
          method: inv.method,
          departmentId: inv.department_id,
          inviteOrigin: inv.invite_origin,
          teamMemberId: inv.team_member_id,
        };

        setInvitation(invData);
        setTestInfo(data.test);
        setCompanyName(data.companyName || '');
        setDepartments(data.departments || []);
        setInvitationId(inv.id);

        // Pre-fill form fields
        setFormName(inv.candidate_name || '');
        setFormEmail(inv.candidate_email || '');

        // Store team member info if available
        if (data.teamMember) {
          setTeamMemberInfo(data.teamMember);
        }

        // Determine initial step
        if (inv.status === 'completed') {
          setStep('complete');
          setIsNewUser(false);
          return;
        }

        // Pre-registered team member with CPF: show CPF confirmation
        if (inv.team_member_id && data.teamMember?.hasCpf) {
          setStep('cpf_confirm');
          return;
        }

        // Internal invite with existing candidate: skip identify
        if (inv.invite_origin === 'invite_base' && inv.candidate_id) {
          setIsNewUser(false);
          setStep('login_prompt');
          return;
        }

        // Email invite: pre-fill but still show identify
        setStep('identify');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Link invalido ou expirado.';
        setStep('error');
        setErrorMessage(msg);
      }
    }

    loadInvitation();
  }, [token]);

  // Auto-proceed if user is already authenticated
  useEffect(() => {
    if (authLoading) return;
    if (!user || !invitation) return;

    if (step === 'login_prompt' || step === 'identify') {
      // Already logged in — skip identification/login and proceed to test (but NOT cpf_confirm)
      proceedToTest();
    }
  }, [user, authLoading, invitation, step]);

  const proceedToTest = useCallback(async () => {
    if (!invitation) return;

    // Get candidate ID for the authenticated user (legacy flow)
    let resolvedCandidateId = invitation.candidateId;

    if (user && !resolvedCandidateId) {
      const { data: cand } = await supabase
        .from('candidates')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle();
      resolvedCandidateId = cand?.id || null;
    }

    if (resolvedCandidateId) {
      setCandidateId(resolvedCandidateId);
    }
    // If no candidateId and we have teamMemberId, that's OK (unified flow PRD-088)

    // Mark invitation as started
    await supabase.functions.invoke('process-collaborator-invite', {
      body: { action: 'mark_started', invitation_id: invitation.id },
    });

    setStep('test');
  }, [invitation, user]);

  // Handle identify form submission
  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation || !formName.trim() || !formEmail.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formEmail)) {
      toast({ title: 'Email invalido', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-collaborator-invite', {
        body: {
          action: 'identify',
          test_id: invitation.testId,
          name: formName.trim().toUpperCase(),
          email: formEmail.trim(),
          department_id: formDepartmentId || null,
          method: invitation.method || 'public_link',
          consent_timestamps: {
            terms_accepted_at: new Date().toISOString(),
            privacy_accepted_at: new Date().toISOString(),
            lgpd_consent_at: new Date().toISOString(),
          },
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setInvitationId(data.invitationId || invitation.id);
      setCandidateId(data.candidateId || null);

      if (data.isNewUser) {
        setIsNewUser(true);

        // Silent auth via magic link
        if (data.tokenHash) {
          const { error: otpError } = await supabase.auth.verifyOtp({
            token_hash: data.tokenHash,
            type: 'magiclink',
          });
          if (otpError) {
            console.error('Silent auth failed:', otpError.message);
          }
        }

        // Update local invitation token if we got a new one
        if (data.invitationToken) {
          setInvitation((prev) => prev ? { ...prev, token: data.invitationToken, id: data.invitationId || prev.id } : prev);
        }

        proceedToTest();
      } else if (data.needsLogin) {
        setIsNewUser(false);
        if (data.invitationToken) {
          setInvitation((prev) => prev ? { ...prev, token: data.invitationToken, id: data.invitationId || prev.id } : prev);
        }
        setStep('login_prompt');
      }
    } catch (err) {
      toast({
        title: 'Erro ao processar',
        description: err instanceof Error ? err.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle login for existing users
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formEmail || invitation?.candidateEmail || '',
        password: loginPassword,
      });

      if (error) throw error;
      setIsNewUser(false); // User logged in — already has password
      proceedToTest();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Credenciais invalidas.');
    } finally {
      setLoggingIn(false);
    }
  };

  // Handle CPF verification for pre-registered team members
  const handleCpfVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation?.teamMemberId || cpfLast4.length !== 4) return;

    setCpfError('');
    setVerifyingCpf(true);

    try {
      const { data, error } = await supabase.functions.invoke('process-collaborator-invite', {
        body: {
          action: 'verify_cpf',
          team_member_id: invitation.teamMemberId,
          cpf_last4: cpfLast4,
          consent_timestamps: {
            terms_accepted_at: new Date().toISOString(),
            privacy_accepted_at: new Date().toISOString(),
            lgpd_consent_at: new Date().toISOString(),
          },
        },
      });

      if (error) throw error;
      if (data?.error) {
        setCpfError(data.error);
        if (!data.valid) return;
        throw new Error(data.error);
      }

      // Unified flow (PRD-088): skipAuth means no shadow candidate, no auth needed
      if (data.skipAuth) {
        setIsNewUser(false);
        // candidateId stays null — unified flow uses team_member_id only
        proceedToTest();
        return;
      }

      // Legacy flow: set candidate info from shadow candidate
      if (data.candidateId) {
        setCandidateId(data.candidateId);
      }
      setIsNewUser(data.isNewUser ?? false);

      // Silent auth if new user
      if (data.tokenHash) {
        await supabase.auth.verifyOtp({
          token_hash: data.tokenHash,
          type: 'magiclink',
        });
      }

      proceedToTest();
    } catch (err) {
      if (!cpfError) {
        setCpfError(err instanceof Error ? err.message : 'Erro ao verificar CPF.');
      }
    } finally {
      setVerifyingCpf(false);
    }
  };

  // Gauge-Pro assessment hook
  // Use team_member_id as key for unified flow (no candidateId available)
  const gaugeProKey = candidateId || (invitation?.teamMemberId ? `tm-${invitation.teamMemberId}` : user?.id || 'temp');
  const gaugePro = useGaugeProAssessment({
    candidateId: gaugeProKey,
    forceNew: !!invitationId,
    onComplete: async (gaugeResult) => {
      // Mark invitation as completed and persist result via service role
      if (invitationId) {
        await supabase.functions.invoke('process-collaborator-invite', {
          body: {
            action: 'mark_completed',
            invitation_id: invitationId,
            team_member_id: invitation?.teamMemberId || null,
            archetype: gaugeResult?.archetype?.id,
            gauge_scores: gaugeResult?.finalScores,
            result_data: {
              candidate_id: candidateId || null,
              team_member_id: invitation?.teamMemberId || null,
              final_scores: gaugeResult.finalScores,
              part1_scores: gaugeResult.part1Scores,
              part2_scores: gaugeResult.part2Scores,
              archetype_id: gaugeResult.archetype?.id,
              primary_dimension: gaugeResult.primaryDimension,
              secondary_dimension: gaugeResult.secondaryDimension,
              strengths: gaugeResult.strengths,
              development_areas: gaugeResult.developmentAreas,
              career_recommendations: gaugeResult.careerRecommendations,
              xp_awarded: gaugeResult.xpAwarded,
              badge_awarded: gaugeResult.badgeAwarded,
              generated_at: gaugeResult.generatedAt,
              // PRD-089: Include test responses for Respostas tab
              word_step_responses: gaugePro.wordStepResponses,
              scenario_responses: gaugePro.scenarioResponses,
              // Actual assessment start time for total duration calculation
              started_at: gaugePro.assessment?.startedAt || null,
              // Part timestamps for duration calculation
              part1_started_at: gaugePro.assessment?.part1StartedAt || null,
              part1_completed_at: gaugePro.assessment?.part1CompletedAt || null,
              part2_started_at: gaugePro.assessment?.part2StartedAt || null,
              // Fix: use current time — saveSession sets part2CompletedAt via async
              // setAssessment, so gaugePro.assessment still has the stale value here
              part2_completed_at: new Date().toISOString(),
            },
          },
        });
      }

      // Fire-and-forget: gerar análises IA em background
      // PRD-089 fix: trigger IA for collaborators too (team_member_id as fallback owner)
      const aiOwnerId = candidateId || invitation?.teamMemberId;
      if (aiOwnerId && gaugeResult) {
        import('@/lib/aiAgent').then(({ loadAgentSettingsAsync, generateBothAnalyses, saveAnalysisResult }) => {
          loadAgentSettingsAsync().then((agentSettings) => {
            if (agentSettings.agentEnabled && agentSettings.apiKey) {
              const memberName = invitation?.candidateName || 'Colaborador';
              generateBothAnalyses(gaugeResult, memberName, agentSettings)
                .then((analysisResult) => {
                  const hasValidAnalysis =
                    (analysisResult.practical && analysisResult.practical.status !== 'error') ||
                    (analysisResult.technical && analysisResult.technical.status !== 'error');
                  if (hasValidAnalysis) {
                    // For collaborators without candidateId, tag with teamMemberId
                    if (!candidateId && invitation?.teamMemberId) {
                      analysisResult.teamMemberId = invitation.teamMemberId;
                    }
                    saveAnalysisResult(analysisResult);
                  }
                })
                .catch(() => { /* fallback: relatório básico sem IA */ });
            }
          });
        }).catch(() => { /* módulo IA indisponível */ });
      }

      setStep('complete');
    },
  });

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ─────────────────────────────────────────────────────────────
  // Render functions
  // ─────────────────────────────────────────────────────────────

  const renderConsent = () => (
    <div className="pt-4 border-t border-border/50 space-y-2">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Termos e Consentimentos
      </span>
      <div className="rounded-lg border bg-muted/30 p-3 space-y-2.5">
        <div className="flex items-start gap-2">
          <Checkbox
            id="consent-terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            className="mt-0.5"
          />
          <label htmlFor="consent-terms" className="text-xs leading-relaxed text-foreground/80 cursor-pointer">
            Li e aceito os{' '}
            <Link to="/termos-de-uso" target="_blank" className="text-primary underline underline-offset-2">
              Termos de Uso
            </Link>
          </label>
        </div>
        <div className="flex items-start gap-2">
          <Checkbox
            id="consent-privacy"
            checked={privacyAccepted}
            onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
            className="mt-0.5"
          />
          <label htmlFor="consent-privacy" className="text-xs leading-relaxed text-foreground/80 cursor-pointer">
            Li e aceito a{' '}
            <Link to="/politica-de-privacidade" target="_blank" className="text-primary underline underline-offset-2">
              Politica de Privacidade
            </Link>
          </label>
        </div>
        <div className="flex items-start gap-2">
          <Checkbox
            id="consent-lgpd"
            checked={lgpdAccepted}
            onCheckedChange={(checked) => setLgpdAccepted(checked === true)}
            className="mt-0.5"
          />
          <label htmlFor="consent-lgpd" className="text-xs leading-relaxed text-foreground/80 cursor-pointer">
            Autorizo o tratamento dos meus dados conforme a{' '}
            <Link to="/lgpd" target="_blank" className="text-primary underline underline-offset-2">
              LGPD (Lei 13.709/2018)
            </Link>
          </label>
        </div>
      </div>
    </div>
  );

  const renderHeader = () => (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <img
          src="/images/logo-horizontal.png"
          alt="RecrutaRS"
          className="h-8 w-auto"
        />
        {companyName && (
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {companyName}
          </span>
        )}
      </div>
    </header>
  );

  const renderLoading = () => (
    <div className="text-center py-16">
      <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
      <h2 className="text-lg font-semibold text-foreground">Carregando...</h2>
      <p className="text-sm text-muted-foreground mt-1">Validando seu acesso ao teste.</p>
    </div>
  );

  const renderError = () => (
    <div className="text-center py-16">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">Link indisponivel</h2>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
        {errorMessage || 'Este link de teste nao esta mais ativo ou expirou.'}
      </p>
      <Button variant="outline" onClick={() => navigate('/')}>
        Voltar ao inicio
      </Button>
    </div>
  );

  const renderCpfConfirm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto"
    >
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground">
              {testInfo?.name || 'Teste Comportamental'}
            </h2>
            {companyName && (
              <p className="text-sm text-muted-foreground mt-1">{companyName}</p>
            )}
            <p className="text-sm text-muted-foreground mt-3">
              Confirme sua identidade para iniciar o teste.
            </p>
          </div>

          <div className="space-y-3 bg-muted/50 rounded-lg p-4">
            <div>
              <span className="text-xs text-muted-foreground">Nome</span>
              <p className="font-medium">{teamMemberInfo?.name}</p>
            </div>
            {teamMemberInfo?.maskedCpf && (
              <div>
                <span className="text-xs text-muted-foreground">CPF</span>
                <p className="font-mono">{teamMemberInfo.maskedCpf}</p>
              </div>
            )}
          </div>

          <form onSubmit={handleCpfVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cpf-last4">
                Digite os 4 ultimos digitos do seu CPF
              </Label>
              <Input
                id="cpf-last4"
                value={cpfLast4}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setCpfLast4(v);
                  setCpfError('');
                }}
                placeholder="0000"
                maxLength={4}
                className="text-center text-2xl font-mono tracking-widest"
                autoFocus
                disabled={verifyingCpf}
              />
              {cpfError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{cpfError}</AlertDescription>
                </Alert>
              )}
            </div>

            {renderConsent()}

            <Button
              type="submit"
              className="w-full"
              disabled={verifyingCpf || cpfLast4.length !== 4 || !consentComplete}
            >
              {verifyingCpf ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Confirmar e Iniciar
              {!verifyingCpf && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderIdentify = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto"
    >
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground">
              {testInfo?.name || 'Avaliacao Comportamental'}
            </h2>
            {testInfo?.description && (
              <p className="text-sm text-muted-foreground mt-2">{testInfo.description}</p>
            )}
            {testInfo?.instructions && (
              <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground text-left">
                <Clock className="h-4 w-4 inline mr-1.5" />
                {testInfo.instructions}
              </div>
            )}
          </div>

          <form onSubmit={handleIdentify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                className="uppercase"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="DIGITE SEU NOME COMPLETO"
                required
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="Digite seu email"
                required
                disabled={submitting}
              />
            </div>

            {departments.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <Select
                  value={formDepartmentId}
                  onValueChange={setFormDepartmentId}
                  disabled={submitting}
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {renderConsent()}

            <Button
              type="submit"
              className="w-full"
              disabled={submitting || !formName.trim() || !formEmail.trim() || !consentComplete}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Iniciar Avaliacao
              {!submitting && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderLoginPrompt = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto"
    >
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="text-center">
            <LogIn className="w-10 h-10 text-primary mx-auto mb-3" />
            <h2 className="text-xl font-bold text-foreground">Conta encontrada</h2>
            <p className="text-sm text-muted-foreground mt-2">
              O email <strong>{formEmail || invitation?.candidateEmail}</strong> ja possui uma conta no RecrutaRS.
              Faca login para continuar.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <Alert variant="destructive">
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="loginPassword">Senha</Label>
              <Input
                id="loginPassword"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
                autoComplete="current-password"
                autoFocus
              />
            </div>

            <Button type="submit" className="w-full" disabled={loggingIn}>
              {loggingIn ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Fazer login e continuar
              {!loggingIn && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderTest = () => {
    switch (gaugePro.phase) {
      case 'intro':
        return (
          <GaugeProIntro
            onStart={gaugePro.startAssessment}
            hasExistingResult={false}
          />
        );

      case 'part1_words': {
        const canSubmit = gaugePro.currentStepSelections.length === gaugePro.selectionLimit;
        const isLastStep = gaugePro.currentWordStep === gaugePro.totalWordSteps - 1;

        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTime(gaugePro.elapsedSeconds)}
              </span>
              <span>Parte 1 de 2</span>
            </div>

            <WordGrid
              words={gaugePro.currentDimensionWords}
              shuffledOrder={gaugePro.currentShuffledOrder}
              selectedIds={gaugePro.currentStepSelections}
              maxSelections={gaugePro.selectionLimit}
              dimensionName={gaugePro.currentDimensionName}
              perspectiveLabel={gaugePro.currentPerspectiveLabel}
              stepNumber={gaugePro.currentWordStep + 1}
              totalSteps={gaugePro.totalWordSteps}
              onToggle={gaugePro.toggleWord}
            />

            <div className="flex justify-between">
              {gaugePro.currentWordStep > 0 ? (
                <Button variant="outline" onClick={gaugePro.goToPreviousStep} className="gap-1">
                  <ArrowLeft className="w-4 h-4" /> Anterior
                </Button>
              ) : (
                <div />
              )}
              <Button
                onClick={gaugePro.submitCurrentStep}
                disabled={!canSubmit}
                className="gap-1"
              >
                {isLastStep ? 'Concluir Parte 1' : 'Proxima Etapa'} <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );
      }

      case 'part1_block_transition':
        return gaugePro.blockTransitionInfo ? (
          <BlockCompleteDivider
            completedDimension={gaugePro.blockTransitionInfo.completedDimension}
            nextDimension={gaugePro.blockTransitionInfo.nextDimension}
            completedBlockNumber={gaugePro.blockTransitionInfo.completedBlockNumber}
            totalBlocks={5}
          />
        ) : null;

      case 'part1_complete':
        return <Part1Complete onContinue={gaugePro.startPart2} />;

      case 'part2_intro':
        return <ScenarioIntro onStart={gaugePro.startPart2Scenarios} />;

      case 'part2_scenarios': {
        const allAnswered = gaugePro.scenarioResponses.length >= gaugePro.totalScenarios;
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTime(gaugePro.elapsedSeconds)}
              </span>
              <span>Parte 2 de 2</span>
            </div>

            <ScenarioCard
              scenario={gaugePro.currentScenario}
              currentIndex={gaugePro.currentScenarioIndex}
              totalScenarios={gaugePro.totalScenarios}
              selectedOption={gaugePro.currentScenarioResponse?.selectedOption}
              onSelectOption={gaugePro.submitScenarioResponse}
              onNext={gaugePro.goNextScenario}
              onPrevious={gaugePro.goPreviousScenario}
              onFinish={gaugePro.finishAssessment}
              canGoNext={!!gaugePro.currentScenarioResponse}
              canGoPrevious={gaugePro.currentScenarioIndex > 0}
              isLast={gaugePro.currentScenarioIndex === gaugePro.totalScenarios - 1}
              allAnswered={allAnswered}
            />
          </div>
        );
      }

      case 'analyzing':
        return <AnalyzingScreen />;

      case 'completed':
        // Transition handled by onComplete callback
        return <AnalyzingScreen />;

      default:
        return null;
    }
  };

  const renderComplete = () => {
    // Unified flow (PRD-088): simplified completion — no account activation
    const isUnifiedFlow = !candidateId && !!invitation?.teamMemberId;

    if (isUnifiedFlow) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto text-center space-y-6 py-12"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Teste Concluido!</h2>
          <p className="text-muted-foreground">
            Obrigado, {formName || invitation?.candidateName}! Seus resultados foram registrados com sucesso.
          </p>
          {companyName && (
            <p className="text-sm text-muted-foreground">
              A equipe de {companyName} podera visualizar seu perfil comportamental.
            </p>
          )}
        </motion.div>
      );
    }

    // Legacy flow: full activation screen
    return (
      <TestCompletionActivation
        isNewUser={isNewUser}
        candidateName={formName || invitation?.candidateName || ''}
        candidateEmail={formEmail || invitation?.candidateEmail || ''}
        companyName={companyName}
        userId={user?.id}
        invitationId={invitationId || undefined}
      />
    );
  };

  const renderStep = () => {
    switch (step) {
      case 'loading': return renderLoading();
      case 'cpf_confirm': return renderCpfConfirm();
      case 'identify': return renderIdentify();
      case 'login_prompt': return renderLoginPrompt();
      case 'test': return renderTest();
      case 'complete': return renderComplete();
      case 'error': return renderError();
      default: return null;
    }
  };

  return (
    <>
      <ForceLightTheme />
      <div className="min-h-screen bg-background">
        {renderHeader()}
        <main className="max-w-4xl mx-auto px-4 py-8">
          {renderStep()}
        </main>
      </div>
    </>
  );
}
