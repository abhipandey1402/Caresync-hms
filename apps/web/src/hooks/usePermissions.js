import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/config/permissions';

export const usePermissions = (resource, action) => {
  const role = useAuthStore((state) => state.user?.role);
  return hasPermission(role, resource, action);
};
