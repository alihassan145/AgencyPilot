import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

// Permissions mapping based on role management matrix (legacy client-side fallback for notifications)
const LEGACY_PERMISSIONS = {
  admin: {
    notifications: {
      view: ["All", "Team", "Self"],
      add: true,
      edit: true,
      delete: true,
      export: true,
    },
  },
  manager: {
    notifications: {
      view: ["Team", "Self"],
      add: true,
      edit: true,
      delete: false,
      export: false,
    },
  },
  employee: {
    notifications: {
      view: ["Self"],
      add: true,
      edit: false,
      delete: false,
      export: false,
    },
  },
  client: {
    notifications: {
      view: ["Self"],
      add: false,
      edit: false,
      delete: false,
      export: false,
    },
  },
};

export function usePermissions() {
  const { user } = useAuth();
  const userRole = user?.role || "client";

  // Fetch server-provided permission booleans map, e.g., { 'tasks-view-self': true, ... }
  const [serverPerms, setServerPerms] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get("/permissions/my")
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
    return () => {
      mounted = false;
    };
  }, []);

  // Internal helpers for alias expansion
  const hasServerFlag = (key) => Boolean(serverPerms && serverPerms[key] === true);

  // Generic alias: '<feature>-view' maps to any of '<feature>-view-all|team|self'
  const expandViewAlias = (key) => {
    const m = /^([a-z0-9-]+)-view$/i.exec(key);
    if (!m) return [];
    const base = m[1];
    return [
      `${base}-view-all`,
      `${base}-view-team`,
      `${base}-view-self`,
    ];
  };

  // Special-case aliases (extend as needed)
  const expandSpecialAliases = (key) => {
    if (key === "settings-view") {
      // any settings capability implies basic view access
      return [
        "settings-view",
        "settings-edit",
        "settings-manage-roles",
        "settings-manage-permissions",
      ];
    }
    return [];
  };

  // Generic permission checks against server flags with alias support
  const hasPerm = (key) => {
    if (hasServerFlag(key)) return true;
    const aliases = [...expandViewAlias(key), ...expandSpecialAliases(key)];
    if (aliases.length) return aliases.some((k) => hasServerFlag(k));
    return false;
  };
  const anyPerm = (keys = []) => keys.some((k) => hasPerm(k));

  // Optional: derive available view scopes from server for a feature
  const getServerViewScopes = (feature) => {
    const scopes = [];
    if (hasServerFlag(`${feature}-view-all`)) scopes.push("All");
    if (hasServerFlag(`${feature}-view-team`)) scopes.push("Team");
    if (hasServerFlag(`${feature}-view-self`)) scopes.push("Self");
    return scopes;
  };

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
  const canViewScope = (feature, scope) =>
    getViewScope(feature).includes(scope);

  return {
    user,
    userRole,
    loading,
    serverPerms,
    hasPerm,
    anyPerm,
    // Server-derived helpers
    getServerViewScopes,
    // Legacy helpers for notifications
    hasPermission,
    getViewScope,
    canViewScope,
    canCreateNotification: () => hasPermission("notifications", "add"),
    canEditNotification: () => hasPermission("notifications", "edit"),
    canDeleteNotification: () => hasPermission("notifications", "delete"),
    canExportNotifications: () => hasPermission("notifications", "export"),
    notificationViewScopes: () => getViewScope("notifications"),
  };
}
