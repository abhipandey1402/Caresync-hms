import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,          // { _id, name, role, phone, tenantId, speciality }
      tenant: null,        // { _id, name, slug, plan, settings }
      accessToken: null,   // never persisted to localStorage — memory only

      setAuth: (user, tenant, accessToken) => set({ user, tenant, accessToken }),
      setToken: (accessToken) => set({ accessToken }),
      logout: () => set({ user: null, tenant: null, accessToken: null }),

      isAuthenticated: () => !!get().user && !!get().accessToken,
      isAdmin: () => get().user?.role === 'admin',
      isTrial: () => get().tenant?.isTrialActive,
      trialDaysLeft: () => {
        const end = get().tenant?.trialEndsAt;
        if (!end) return 0;
        return Math.max(0, Math.ceil((new Date(end) - new Date()) / 86400000));
      },
    }),
    {
      name: 'cura-auth',
      // IMPORTANT: only persist user + tenant — NEVER persist accessToken
      partialize: (state) => ({ user: state.user, tenant: state.tenant }),
    }
  )
);
