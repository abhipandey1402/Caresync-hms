import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

export const Can = ({ resource, action, children, fallback = null }) => {
  const { can } = usePermissions();
  return can(resource, action) ? <>{children}</> : fallback;
};
