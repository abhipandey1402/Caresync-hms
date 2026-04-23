import { create } from 'zustand';

const parseJwtPayload = (token) => {
  if (!token) {
    return null;
  }

  try {
    const [, payload] = token.split('.');

    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4 || 4)) % 4),
      '='
    );

    return JSON.parse(atob(paddedPayload));
  } catch {
    return null;
  }
};

export const useAuthStore = create((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  setToken: (token) =>
    set({
      accessToken: token,
      user: parseJwtPayload(token),
      isAuthenticated: !!token,
    }),
  logout: () => set({ accessToken: null, user: null, isAuthenticated: false }),
}));
