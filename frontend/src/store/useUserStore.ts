import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { create } from 'zustand';

import { supabase } from '@/lib/supabase';
import { userApi } from '@/lib/api';
import type { AuthState, User } from '@/types/user';

interface SessionToken {
  access_token: string;
  refresh_token: string;
}

interface UserStore {
  user: User | null;
  session: SessionToken | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  initAuth: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        signInWithGoogle: async () => {
          await supabase.auth.signInWithOAuth({ provider: 'google' });
        },
        signInWithEmail: async (email, password) => {
          set((state) => {
            state.isLoading = true;
          });
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) {
            throw error;
          }
          set((state) => {
            state.session = data.session
              ? { access_token: data.session.access_token, refresh_token: data.session.refresh_token }
              : null;
            state.isAuthenticated = Boolean(data.session);
            state.isLoading = false;
          });
        },
        signUp: async (email, password, name) => {
          set((state) => {
            state.isLoading = true;
          });
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } },
          });
          if (error) {
            throw error;
          }
          set((state) => {
            state.session = data.session
              ? { access_token: data.session.access_token, refresh_token: data.session.refresh_token }
              : null;
            state.isAuthenticated = Boolean(data.session);
            state.isLoading = false;
          });
        },
        signOut: async () => {
          await supabase.auth.signOut();
          set((state) => {
            state.user = null;
            state.session = null;
            state.isAuthenticated = false;
          });
        },
        initAuth: async () => {
          set((state) => {
            state.isLoading = true;
          });
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            set((state) => {
              state.session = {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
              };
              state.isAuthenticated = true;
            });
            try {
              const profile = await userApi.getProfile();
              set((state) => {
                state.user = profile;
              });
            } catch {
              // If the profile endpoint is unavailable, keep the auth session active.
            }
          }
          set((state) => {
            state.isLoading = false;
          });
        },
        updateProfile: async (data) => {
          const updated = await userApi.updateProfile(data);
          set((state) => {
            state.user = updated;
          });
        },
      })),
      {
        name: 'dressmesh-user-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ user: state.user, session: state.session, isAuthenticated: state.isAuthenticated }),
      },
    ),
    { name: 'dressmesh-user-store' },
  ),
);
