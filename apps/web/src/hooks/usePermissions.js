import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/config/permissions';

export const usePermissions = () => {
  const role = useAuthStore((state) => state.user?.role);

  const can = (resource, action) => {
    return hasPermission(role, resource, action);
  };

  return { can, role };
};
