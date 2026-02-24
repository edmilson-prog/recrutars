/**
 * AuthContext - Supabase Auth Provider
 * PRD-063: Fundacao Supabase + Autenticacao
 * PRD-061: Impersonation overlay support
 *
 * Replaces the mock AuthContext with real Supabase Auth.
 * Maintains backward compatibility with all existing consumers.
 * Supports impersonation overlay: during impersonation, `user`, `currentCompany`,
 * and `currentCandidate` return the target user's data. Use `realUser` for the admin.
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { profileRowToUser, candidateRowToCandidate, companyRowToCompany } from '@/lib/supabaseConverters';
import type { User } from '@/types/user';
import type { Candidate } from '@/types/candidate';
import type { Company, TeamMemberRole } from '@/types/company';
import type { Session } from '@supabase/supabase-js';

// ── Sign Up Parameters ──

interface CnpjSignUpData {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  city: string;
  state: string;
  address: string;
  situacaoCadastral: string;
  industry: string;
  size: string;
}

interface SignUpParams {
  email: string;
  password: string;
  name: string;
  phone?: string;
  type: 'candidate' | 'company';
  cnpjData?: CnpjSignUpData;
  // PRD-083: Candidate onboarding
  cpf?: string;
  termsAcceptedAt?: string;
  privacyAcceptedAt?: string;
  lgpdConsentAt?: string;
}

// ── Context Interface ──
// Existing fields preserved for backward compatibility.

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithMagicLink: (email: string) => Promise<void>;
  logout: () => void;
  currentCompany: Company | null;
  currentCandidate: Candidate | null;
  companyRole: TeamMemberRole | null;
  loading: boolean;
  signUp: (params: SignUpParams) => Promise<{ needsEmailConfirmation: boolean }>;
  resetPassword: (email: string) => Promise<void>;
  refreshCurrentCandidate: () => Promise<void>;
  refreshCurrentCompany: () => Promise<void>;
  // PRD-061: Impersonation overlay
  realUser: User | null;
  isImpersonationActive: boolean;
  activateImpersonation: (targetUserId: string) => Promise<void>;
  deactivateImpersonation: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const IMPERSONATION_STORAGE_KEY = 'recrutars-impersonation-target';

// ── Provider ──

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [currentCandidate, setCurrentCandidate] = useState<Candidate | null>(null);
  const [companyRole, setCompanyRole] = useState<TeamMemberRole | null>(null);
  const [loading, setLoading] = useState(true);

  // PRD-061: Impersonation overlay state
  const [impersonatingUser, setImpersonatingUser] = useState<User | null>(null);
  const [impersonatingCandidate, setImpersonatingCandidate] = useState<Candidate | null>(null);
  const [impersonatingCompany, setImpersonatingCompany] = useState<Company | null>(null);
  const [impersonatingCompanyRole, setImpersonatingCompanyRole] = useState<TeamMemberRole | null>(null);
  const [isImpersonationActive, setIsImpersonationActive] = useState(false);

  // Load profile + type-specific data from Supabase
  const loadUserData = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      setUser(null);
      setCurrentCompany(null);
      setCurrentCandidate(null);
      setCompanyRole(null);
      setLoading(false);
      return;
    }

    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profileData) {
        console.error('Failed to load profile:', profileError?.message);
        setUser(null);
        setCurrentCompany(null);
        setCurrentCandidate(null);
        setCompanyRole(null);
        setLoading(false);
        return;
      }

      const userProfile = profileRowToUser(profileData);
      setUser(userProfile);

      // Update last_access_at (fire-and-forget)
      supabase
        .from('profiles')
        .update({ last_access_at: new Date().toISOString() })
        .eq('id', session.user.id)
        .then();

      // Load type-specific data
      if (userProfile.type === 'candidate') {
        const { data: candidateData } = await supabase
          .from('candidates')
          .select('*')
          .eq('profile_id', session.user.id)
          .single();

        setCurrentCandidate(candidateData ? candidateRowToCandidate(candidateData) : null);
        setCurrentCompany(null);
      } else if (userProfile.type === 'company') {
        // Try as owner first
        let { data: companyData } = await supabase
          .from('companies')
          .select('*')
          .eq('profile_id', session.user.id)
          .single();

        let role: TeamMemberRole = 'admin';

        if (!companyData) {
          // Not an owner — check company_users (invited member)
          const { data: memberData } = await supabase
            .from('company_users')
            .select('company_id, role')
            .eq('profile_id', session.user.id)
            .single();

          if (memberData) {
            role = memberData.role as TeamMemberRole;
            const { data: memberCompanyData } = await supabase
              .from('companies')
              .select('*')
              .eq('id', memberData.company_id)
              .single();
            companyData = memberCompanyData;
          }
        } else {
          // Owner — get role from company_users
          const { data: ownerRole } = await supabase
            .from('company_users')
            .select('role')
            .eq('profile_id', session.user.id)
            .single();
          if (ownerRole) role = ownerRole.role as TeamMemberRole;
        }

        setCurrentCompany(companyData ? companyRowToCompany(companyData) : null);
        setCompanyRole(companyData ? role : null);
        setCurrentCandidate(null);
      } else {
        // Admin: no additional data
        setCurrentCompany(null);
        setCurrentCandidate(null);
        setCompanyRole(null);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setUser(null);
      setCurrentCompany(null);
      setCurrentCandidate(null);
      setCompanyRole(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh currentCandidate without re-authenticating (for use after mutations)
  const refreshCurrentCandidate = useCallback(async () => {
    if (!user || user.type !== 'candidate') return;

    const { data: candidateData } = await supabase
      .from('candidates')
      .select('*')
      .eq('profile_id', user.id)
      .single();

    setCurrentCandidate(candidateData ? candidateRowToCandidate(candidateData) : null);
  }, [user]);

  // Refresh currentCompany without re-authenticating (for use after mutations)
  const refreshCurrentCompany = useCallback(async () => {
    if (!user || user.type !== 'company') return;

    // Try as owner first
    let { data: companyData } = await supabase
      .from('companies')
      .select('*')
      .eq('profile_id', user.id)
      .single();

    let role: TeamMemberRole = 'admin';

    if (!companyData) {
      const { data: memberData } = await supabase
        .from('company_users')
        .select('company_id, role')
        .eq('profile_id', user.id)
        .single();

      if (memberData) {
        role = memberData.role as TeamMemberRole;
        const { data: memberCompanyData } = await supabase
          .from('companies')
          .select('*')
          .eq('id', memberData.company_id)
          .single();
        companyData = memberCompanyData;
      }
    } else {
      const { data: ownerRole } = await supabase
        .from('company_users')
        .select('role')
        .eq('profile_id', user.id)
        .single();
      if (ownerRole) role = ownerRole.role as TeamMemberRole;
    }

    setCurrentCompany(companyData ? companyRowToCompany(companyData) : null);
    setCompanyRole(companyData ? role : null);
  }, [user]);

  // ── PRD-061: Impersonation Overlay ──

  const activateImpersonation = useCallback(async (targetUserId: string) => {
    // Fetch target profile (admin has SELECT on all profiles)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetUserId)
      .single();

    if (profileError || !profileData) {
      throw new Error('Falha ao carregar perfil do usuario alvo');
    }

    const targetUser = profileRowToUser(profileData);
    setImpersonatingUser(targetUser);

    // Load type-specific data
    if (targetUser.type === 'candidate') {
      const { data: candidateData } = await supabase
        .from('candidates')
        .select('*')
        .eq('profile_id', targetUserId)
        .single();

      setImpersonatingCandidate(candidateData ? candidateRowToCandidate(candidateData) : null);
      setImpersonatingCompany(null);
      setImpersonatingCompanyRole(null);
    } else if (targetUser.type === 'company') {
      let { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('profile_id', targetUserId)
        .single();

      let role: TeamMemberRole = 'admin';

      if (!companyData) {
        const { data: memberData } = await supabase
          .from('company_users')
          .select('company_id, role')
          .eq('profile_id', targetUserId)
          .single();

        if (memberData) {
          role = memberData.role as TeamMemberRole;
          const { data: memberCompanyData } = await supabase
            .from('companies')
            .select('*')
            .eq('id', memberData.company_id)
            .single();
          companyData = memberCompanyData;
        }
      } else {
        const { data: ownerRole } = await supabase
          .from('company_users')
          .select('role')
          .eq('profile_id', targetUserId)
          .single();
        if (ownerRole) role = ownerRole.role as TeamMemberRole;
      }

      setImpersonatingCompany(companyData ? companyRowToCompany(companyData) : null);
      setImpersonatingCompanyRole(companyData ? role : null);
      setImpersonatingCandidate(null);
    } else {
      setImpersonatingCompany(null);
      setImpersonatingCandidate(null);
      setImpersonatingCompanyRole(null);
    }

    // Persist for refresh survival
    localStorage.setItem(IMPERSONATION_STORAGE_KEY, targetUserId);
    setIsImpersonationActive(true);
  }, []);

  const deactivateImpersonation = useCallback(() => {
    setImpersonatingUser(null);
    setImpersonatingCandidate(null);
    setImpersonatingCompany(null);
    setImpersonatingCompanyRole(null);
    setIsImpersonationActive(false);
    localStorage.removeItem(IMPERSONATION_STORAGE_KEY);
  }, []);

  // Initialize: check existing session + listen for changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUserData(session).then(() => {
        // Restore impersonation if it was active before refresh
        const storedTargetId = localStorage.getItem(IMPERSONATION_STORAGE_KEY);
        if (storedTargetId && session) {
          activateImpersonation(storedTargetId).catch(() => {
            localStorage.removeItem(IMPERSONATION_STORAGE_KEY);
          });
        }
      });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        loadUserData(session);
      }
    );

    return () => subscription.unsubscribe();
  }, [loadUserData, activateImpersonation]);

  // ── Auth Operations ──

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // loadUserData is called automatically by onAuthStateChange
  };

  const logout = async () => {
    deactivateImpersonation();
    await supabase.auth.signOut();
    // State is cleared automatically by onAuthStateChange
  };

  const signUp = async ({ email, password, name, phone, type, cnpjData, cpf, termsAcceptedAt, privacyAcceptedAt, lgpdConsentAt }: SignUpParams) => {
    // The handle_new_user() trigger creates profiles + candidates/companies
    // atomically on auth.users INSERT — no manual INSERT needed here.
    // For companies with CNPJ data, all fields are passed via metadata to the trigger.
    const normalizedName = type === 'candidate' ? name.toUpperCase().trim() : name;
    const metadata: Record<string, unknown> = { name: normalizedName, type, phone: phone || null };

    // PRD-083: Pass CPF for candidates
    if (type === 'candidate' && cpf) {
      metadata.cpf = cpf;
    }

    if (type === 'company' && cnpjData) {
      metadata.name = cnpjData.nomeFantasia || cnpjData.razaoSocial;
      metadata.cnpj = cnpjData.cnpj;
      metadata.razao_social = cnpjData.razaoSocial;
      metadata.nome_fantasia = cnpjData.nomeFantasia;
      metadata.cep = cnpjData.cep;
      metadata.logradouro = cnpjData.logradouro;
      metadata.numero = cnpjData.numero;
      metadata.complemento = cnpjData.complemento;
      metadata.bairro = cnpjData.bairro;
      metadata.city = cnpjData.city;
      metadata.state = cnpjData.state;
      metadata.address = cnpjData.address;
      metadata.situacao_cadastral = cnpjData.situacaoCadastral;
      metadata.industry = cnpjData.industry;
      metadata.size = cnpjData.size;
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Falha ao criar conta');

    // Detect repeated signup — Supabase returns empty identities instead of error
    if (!authData.user.identities || authData.user.identities.length === 0) {
      throw new Error('already registered');
    }

    // If session is null, email confirmation is required
    const needsEmailConfirmation = authData.session === null;
    return { needsEmailConfirmation };
  };

  const loginWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        shouldCreateUser: false,
      },
    });
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) throw error;
  };

  // ── Render ──

  return (
    <AuthContext.Provider
      value={{
        user: isImpersonationActive ? impersonatingUser : user,
        realUser: user,
        isAuthenticated: !!user,
        login,
        loginWithMagicLink,
        logout,
        currentCompany: isImpersonationActive ? impersonatingCompany : currentCompany,
        currentCandidate: isImpersonationActive ? impersonatingCandidate : currentCandidate,
        companyRole: isImpersonationActive ? impersonatingCompanyRole : companyRole,
        loading,
        signUp,
        resetPassword,
        refreshCurrentCandidate,
        refreshCurrentCompany,
        isImpersonationActive,
        activateImpersonation,
        deactivateImpersonation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
