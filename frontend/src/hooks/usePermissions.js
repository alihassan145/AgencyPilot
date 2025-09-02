import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import api from '../api/client';

// Permissions mapping based on role management matrix (legacy client-side fallback for notifications)
const LEGACY_PERMISSIONS = {
  admin: {
    notifications: { view: ['All', 'Team', 'Self'], add: true, edit: true, delete: true, export: true }
  },
  manager: {
    notifications: { view: ['Team', 'Self'], add: true, edit: true, delete: false, export: false }
  },
  employee: {
    notifications: { view: ['Self'], add: true, edit: false, delete: false, export: false }
  },
  client: {
    notifications: { view: ['Self'], add: false, edit: false, delete: false, export: false }
  }
};

export function usePermissions() {
  const user = useSelector(state => state.auth?.user);
  const userRole = user?.role || 'client';

  // Fetch server-provided permission booleans map, e.g., { 'tasks-view-self': true, ... }
  const [serverPerms, setServerPerms] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get('/permissions/my')
      .then(({ data }) => {
        if (!mounted) return;
        setServerPerms(data || {});
      })
      .catch(() => {
        if (!mounted) return;
        setServerPerms(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  // Generic permission checks against server flags
  const hasPerm = (key) => Boolean(serverPerms && serverPerms[key] === true);
  const anyPerm = (keys = []) => keys.some((k) => hasPerm(k));

  // Legacy notification helpers (kept for backward compatibility in components)
  const rolePermissions = LEGACY_PERMISSIONS[userRole] || {};
  const hasPermission = (feature, action) => {
    const featurePerms = rolePermissions[feature];
    if (!featurePerms) return false;
    return featurePerms[action] === true;
  };
  const getViewScope = (feature) => {
    const featurePerms = rolePermissions[feature];
    if (!featurePerms) return [];
    return featurePerms.view || [];
  };
  const canViewScope = (feature, scope) => getViewScope(feature).includes(scope);

  return {
    user,
    userRole,
    loading,
    serverPerms,
    hasPerm,
    anyPerm,
    // Legacy helpers for notifications
    hasPermission,
    getViewScope,
    canViewScope,
    canCreateNotification: () => hasPermission('notifications', 'add'),
    canEditNotification: () => hasPermission('notifications', 'edit'),
    canDeleteNotification: () => hasPermission('notifications', 'delete'),
    canExportNotifications: () => hasPermission('notifications', 'export'),
    notificationViewScopes: () => getViewScope('notifications')
  };
}