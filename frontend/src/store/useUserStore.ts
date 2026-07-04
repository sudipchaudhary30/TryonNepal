import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { create } from 'zustand';

import { userApi } from '@/lib/api';
import type { User } from '@/types/user';

interface SessionToken {
  access_token: string;
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
      immer((set) => ({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        signInWithGoogle: async () => {
          throw new Error('Google sign-in is unavailable in the custom auth flow.');
        },
        signInWithEmail: async (email, password) => {
          set((state) => {
            state.isLoading = true;
          });
          try {
            const profile = await userApi.login(email, password);
            set((state) => {
              state.user = profile;
              state.session = { access_token: 'cookie-session' };
              state.isAuthenticated = true;
            });
          } finally {
            set((state) => {
              state.isLoading = false;
            });
          }
        },
        signUp: async (email, password, name) => {
          set((state) => {
            state.isLoading = true;
          });
          try {
            const profile = await userApi.register(email, password, name);
            set((state) => {
              state.user = profile;
              state.session = { access_token: 'cookie-session' };
              state.isAuthenticated = true;
            });
          } finally {
            set((state) => {
              state.isLoading = false;
            });
          }
        },
        signOut: async () => {
          await userApi.logout();
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
          try {
            const profile = await userApi.getProfile();
            set((state) => {
              state.user = profile;
              state.session = { access_token: 'cookie-session' };
              state.isAuthenticated = true;
            });
          } catch {
            set((state) => {
              state.user = null;
              state.session = null;
              state.isAuthenticated = false;
            });
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
        name: 'ar-tryon-nepal-user-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ user: state.user, session: state.session, isAuthenticated: state.isAuthenticated }),
      },
    ),
    { name: 'ar-tryon-nepal-user-store' },
  ),
);
