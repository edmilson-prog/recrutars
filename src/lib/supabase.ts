/**
 * Supabase Client Singleton
 * PRD-063: Fundacao Supabase + Autenticacao
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. ' +
    'See .env.example for reference.'
  );
}

// Custom storage: delegates to localStorage or sessionStorage based on "rememberMe" flag.
// Default is localStorage (remember), preserving existing behavior.
const rememberMeStorage = {
  getItem: (key: string) => {
    const value = localStorage.getItem(key);
    if (value !== null) return value;
    return sessionStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    const remember = localStorage.getItem('rememberMe') !== 'false';
    if (remember) {
      localStorage.setItem(key, value);
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, value);
      localStorage.removeItem(key);
    }
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: rememberMeStorage,
  },
});
