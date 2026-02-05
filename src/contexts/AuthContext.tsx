/**
 * AuthContext - Supabase Auth Provider
 * PRD-063: Fundacao Supabase + Autenticacao
 *
 * Replaces the mock AuthContext with real Supabase Auth.
 * Maintains backward compatibility with all existing consumers.
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { profileRowToUser, candidateRowToCandidate, companyRowToCompany } from '@/lib/supabaseConverters';
import type { User } from '@/types/user';
import type { Candidate } from '@/types/candidate';
import type { Company } from '@/types/company';
import type { Session } from '@supabase/supabase-js';

// ── Sign Up Parameters ──

interface SignUpParams {
  email: string;
  password: string;
  name: string;
  phone?: string;
  type: 'candidate' | 'company';
}

// ── Context Interface ──
// Existing fields preserved for backward compatibility.
// New fields: loading, signUp, resetPassword.

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithMagicLink: (email: string) => Promise<void>;
  logout: () => void;
  currentCompany: Company | null;
  currentCandidate: Candidate | null;
  loading: boolean;
  signUp: (params: SignUpParams) => Promise<{ needsEmailConfirmation: boolean }>;
  resetPassword: (email: string) => Promise<void>;
  refreshCurrentCandidate: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ──

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [currentCandidate, setCurrentCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

  // Load profile + type-specific data from Supabase
  const loadUserData = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      setUser(null);
      setCurrentCompany(null);
      setCurrentCandidate(null);
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
        const { data: companyData } = await supabase
          .from('companies')
          .select('*')
          .eq('profile_id', session.user.id)
          .single();

        setCurrentCompany(companyData ? companyRowToCompany(companyData) : null);
        setCurrentCandidate(null);
      } else {
        // Admin: no additional data
        setCurrentCompany(null);
        setCurrentCandidate(null);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setUser(null);
      setCurrentCompany(null);
      setCurrentCandidate(null);
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

  // Initialize: check existing session + listen for changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUserData(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        loadUserData(session);
      }
    );

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  // ── Auth Operations ──

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // loadUserData is called automatically by onAuthStateChange
  };

  const logout = async () => {
    await supabase.auth.signOut();
    // State is cleared automatically by onAuthStateChange
  };

  const signUp = async ({ email, password, name, phone, type }: SignUpParams) => {
    // The handle_new_user() trigger creates profiles + candidates/companies
    // atomically on auth.users INSERT — no manual INSERT needed here.
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, type, phone: phone || null },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Falha ao criar conta');

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
        user,
        isAuthenticated: !!user,
        login,
        loginWithMagicLink,
        logout,
        currentCompany,
        currentCandidate,
        loading,
        signUp,
        resetPassword,
        refreshCurrentCandidate,
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
