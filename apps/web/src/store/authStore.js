import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  accessToken: null,
  isAuthenticated: false,
  setToken: (token) => set({ accessToken: token, isAuthenticated: !!token }),
  logout: () => set({ accessToken: null, isAuthenticated: false }),
}));
