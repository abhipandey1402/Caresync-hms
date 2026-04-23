import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { usePermissions } from '../../hooks/usePermissions';

export const ProtectedRoute = ({ resource, action, children }) => {
  const { can } = usePermissions();
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated() || !user) {
    return <Navigate to="/login" replace />;
  }

  if (resource && action && !can(resource, action)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};
