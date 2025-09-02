import { useSelector } from 'react-redux';

// Permissions mapping based on role management matrix
const PERMISSIONS = {
  admin: {
    notifications: {
      view: ['All', 'Team', 'Self'],
      add: true,
      edit: true,
      delete: true,
      export: true
    }
  },
  manager: {
    notifications: {
      view: ['Team', 'Self'],
      add: true,
      edit: true,
      delete: false,
      export: false
    }
  },
  employee: {
    notifications: {
      view: ['Self'],
      add: true,
      edit: false,
      delete: false,
      export: false
    }
  },
  client: {
    notifications: {
      view: ['Self'],
      add: false,
      edit: false,
      delete: false,
      export: false
    }
  }
};

export function usePermissions() {
  const user = useSelector(state => state.auth?.user);
  const userRole = user?.role || 'client';

  const hasPermission = (feature, action) => {
    const rolePermissions = PERMISSIONS[userRole];
    if (!rolePermissions || !rolePermissions[feature]) return false;
    
    return rolePermissions[feature][action] === true;
  };

  const getViewScope = (feature) => {
    const rolePermissions = PERMISSIONS[userRole];
    if (!rolePermissions || !rolePermissions[feature]) return [];
    
    return rolePermissions[feature].view || [];
  };

  const canViewScope = (feature, scope) => {
    const allowedScopes = getViewScope(feature);
    return allowedScopes.includes(scope);
  };

  return {
    user,
    userRole,
    hasPermission,
    getViewScope,
    canViewScope,
    // Convenience methods for notifications
    canCreateNotification: () => hasPermission('notifications', 'add'),
    canEditNotification: () => hasPermission('notifications', 'edit'),
    canDeleteNotification: () => hasPermission('notifications', 'delete'),
    canExportNotifications: () => hasPermission('notifications', 'export'),
    notificationViewScopes: () => getViewScope('notifications')
  };
}