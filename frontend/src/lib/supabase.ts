import { createClient } from '@supabase/supabase-js';

type SessionResponse = {
  data: {
    session: {
      access_token: string;
      refresh_token: string;
    } | null;
  };
};

type AuthResponse = {
  data: {
    session: {
      access_token: string;
      refresh_token: string;
    } | null;
  };
  error: null;
};

type SupabaseAuthLike = {
  getSession: () => Promise<SessionResponse>;
  signInWithOAuth: (options: { provider: 'google' }) => Promise<{ error: null }>;
  signInWithPassword: (options: { email: string; password: string }) => Promise<AuthResponse>;
  signUp: (options: { email: string; password: string; options?: { data?: { name?: string } } }) => Promise<AuthResponse>;
  signOut: () => Promise<{ error: null }>;
};

type SupabaseLike = {
  auth: SupabaseAuthLike;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

const createFallbackClient = (): SupabaseLike => ({
  auth: {
    getSession: async () => ({ data: { session: null } }),
    signInWithOAuth: async () => ({ error: null }),
    signInWithPassword: async () => ({ data: { session: null }, error: null }),
    signUp: async () => ({ data: { session: null }, error: null }),
    signOut: async () => ({ error: null }),
  },
});

export const supabase: SupabaseLike = supabaseUrl && supabaseKey
  ? (createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }) as unknown as SupabaseLike)
  : createFallbackClient();
