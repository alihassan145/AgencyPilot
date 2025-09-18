const { User } = require("../models/User");
const { Role } = require("../models/Role");

// Role-based permissions matrix based on rolemanagement.txt
const PERMISSIONS = {
  admin: {
    // Dashboard permissions
    'dashboard-view-all': true,
    'dashboard-view-team': true,
    'dashboard-view-self': true,
    
    // Clients permissions
    'clients-view-all': true,
    'clients-view-team': true,
    'clients-view-self': true,
    'clients-add': true,
    'clients-edit': true,
    'clients-delete': true,
    'clients-export': true,
    
    // Leads permissions
    'leads-view-all': true,
    'leads-view-team': true,
    'leads-view-self': true,
    'leads-add': true,
    'leads-edit': true,
    'leads-delete': true,
    'leads-followup': true,
    'leads-export': true,
    
    // Tasks permissions
    'tasks-view-all': true,
    'tasks-view-team': true,
    'tasks-view-self': true,
    'tasks-add': true,
    'tasks-edit': true,
    'tasks-delete': true,
    'tasks-export': true,
    
    // Calendar permissions
    'calendar-view-all': true,
    'calendar-view-team': true,
    'calendar-view-self': true,
    'calendar-add': true,
    'calendar-edit': true,
    'calendar-delete': true,
    'calendar-export': true,
    
    // Team/Employee permissions
    'team-view-all': true,
    'team-view-team': true,
    'team-view-self': true,
    'team-add': true,
    'team-edit': true,
    'team-delete': true,
    'team-export': true,
    // Simplified frontend keys
    'employees-view': true,
    'employees-add': true,
    'employees-edit': true,
    'employees-delete': true,
    'team-view': true,
    
    // Attendance permissions
    'attendance-view-all': true,
    'attendance-view-team': true,
    'attendance-view-self': true,
    'attendance-add': true,
    'attendance-edit': true,
    'attendance-delete': true,
    'attendance-export': true,
    // Simplified frontend keys
    'attendance-view': true,
    
    // Leaves permissions
    'leaves-view-all': true,
    'leaves-view-team': true,
    'leaves-view-self': true,
    'leaves-add': true,
    'leaves-edit': true,
    'leaves-delete': true,
    'leaves-approve': true,
    'leaves-export': true,
    // Simplified frontend keys
    'leaves-view': true,
    
    // Payroll permissions
    'payroll-view-all': true,
    'payroll-view-team': true,
    'payroll-view-self': true,
    'payroll-add': true,
    'payroll-edit': true,
    'payroll-delete': true,
    'payroll-export': true,
    'payroll-download': true,
    // Simplified frontend keys
    'payroll-view': true,
    
    // Reports permissions
    'reports-view-all': true,
    'reports-view-team': true,
    'reports-view-self': true,
    'reports-add': true,
    'reports-edit': true,
    'reports-delete': true,
    'reports-approve': true,
    'reports-export': true,
    // Simplified frontend keys
    'reports-view': true,
    
    // Settings permissions
    'settings-view': true,
    'settings-edit': true,
    'settings-manage-roles': true,
    'settings-manage-permissions': true,
    
    // Notifications permissions
    'notifications-view-all': true,
    'notifications-view-team': true,
    'notifications-view-self': true,
    'notifications-add': true,
    'notifications-edit': true,
    'notifications-delete': true,
    'notifications-export': true,
  },
  
  manager: {
    // Dashboard permissions
    'dashboard-view-all': false,
    'dashboard-view-team': true,
    'dashboard-view-self': true,
    
    // Clients permissions
    'clients-view-all': false,
    'clients-view-team': true,
    'clients-view-self': true,
    'clients-add': true,
    'clients-edit': true,
    'clients-delete': false,
    'clients-export': true,
    
    // Leads permissions
    'leads-view-all': false,
    'leads-view-team': true,
    'leads-view-self': true,
    'leads-add': true,
    'leads-edit': true,
    'leads-delete': false,
    'leads-followup': true,
    'leads-export': true,
    
    // Tasks permissions
    'tasks-view-all': false,
    'tasks-view-team': true,
    'tasks-view-self': true,
    'tasks-add': true,
    'tasks-edit': true,
    'tasks-delete': false,
    'tasks-export': true,
    
    // Calendar permissions
    'calendar-view-all': false,
    'calendar-view-team': true,
    'calendar-view-self': true,
    'calendar-add': true,
    'calendar-edit': true,
    'calendar-delete': false,
    'calendar-export': true,
    
    // Team/Employee permissions
    'team-view-all': false,
    'team-view-team': true,
    'team-view-self': true,
    'team-add': true,
    'team-edit': true,
    'team-delete': false,
    'team-export': true,
    // Simplified frontend keys
    'employees-view': true,
    'employees-add': true,
    'employees-edit': true,
    'employees-delete': false,
    'team-view': true,
    
    // Attendance permissions
    'attendance-view-all': false,
    'attendance-view-team': true,
    'attendance-view-self': true,
    'attendance-add': true,
    'attendance-edit': true,
    'attendance-delete': false,
    'attendance-export': true,
    // Simplified frontend keys
    'attendance-view': true,
    
    // Leaves permissions
    'leaves-view-all': false,
    'leaves-view-team': true,
    'leaves-view-self': true,
    'leaves-add': true,
    'leaves-edit': true,
    'leaves-delete': false,
    'leaves-approve': true,
    'leaves-export': true,
    // Simplified frontend keys
    'leaves-view': true,
    
    // Payroll permissions
    'payroll-view-all': false,
    'payroll-view-team': true,
    'payroll-view-self': true,
    'payroll-add': true,
    'payroll-edit': true,
    'payroll-delete': false,
    'payroll-export': true,
    'payroll-download': true,
    // Simplified frontend keys
    'payroll-view': true,
    
    // Reports permissions
    'reports-view-all': false,
    'reports-view-team': true,
    'reports-view-self': true,
    'reports-add': true,
    'reports-edit': true,
    'reports-delete': false,
    'reports-approve': true,
    'reports-export': true,
    // Simplified frontend keys
    'reports-view': true,
    
    // Settings permissions (limited for managers)
    'settings-view': true,
    'settings-edit': false,
    'settings-manage-roles': false,
    'settings-manage-permissions': false,
    
    // Notifications permissions
    'notifications-view-all': false,
    'notifications-view-team': true,
    'notifications-view-self': true,
    'notifications-add': true,
    'notifications-edit': true,
    'notifications-delete': false,
    'notifications-export': true,
  },
  
  employee: {
    // Dashboard permissions - self only
    'dashboard-view-all': false,
    'dashboard-view-team': false,
    'dashboard-view-self': true,
    
    // Clients permissions - self only
    'clients-view-all': false,
    'clients-view-team': false,
    'clients-view-self': true,
    'clients-add': false,
    'clients-edit': false,
    'clients-delete': false,
    'clients-export': false,
    
    // Leads permissions - self with limited actions
    'leads-view-all': false,
    'leads-view-team': false,
    'leads-view-self': true,
    'leads-add': true,
    'leads-edit': false,
    'leads-delete': false,
    'leads-followup': true,
    'leads-export': false,
    
    // Tasks permissions - self with limited actions
    'tasks-view-all': false,
    'tasks-view-team': false,
    'tasks-view-self': true,
    'tasks-add': false,
    'tasks-edit': false,
    'tasks-delete': false,
    'tasks-export': false,
    
    // Calendar permissions - self with limited actions
    'calendar-view-all': false,
    'calendar-view-team': false,
    'calendar-view-self': true,
    'calendar-add': true,
    'calendar-edit': false,
    'calendar-delete': false,
    'calendar-export': false,
    
    // Team/Employee permissions - self only
    'team-view-all': false,
    'team-view-team': false,
    'team-view-self': true,
    'team-add': false,
    'team-edit': false,
    'team-delete': false,
    'team-export': false,
    // Simplified frontend keys (limited for employees)
    'employees-view': false,
    'employees-add': false,
    'employees-edit': false,
    'employees-delete': false,
    'team-view': false,
    
    // Attendance permissions - self with actions
    'attendance-view-all': false,
    'attendance-view-team': false,
    'attendance-view-self': true,
    'attendance-add': true,
    'attendance-edit': true,
    'attendance-delete': false,
    'attendance-export': false,
    // Simplified frontend keys
    'attendance-view': true,
    
    // Leaves permissions - self with actions
    'leaves-view-all': false,
    'leaves-view-team': false,
    'leaves-view-self': true,
    'leaves-add': true,
    'leaves-edit': false,
    'leaves-delete': false,
    'leaves-approve': false,
    'leaves-export': false,
    // Simplified frontend keys
    'leaves-view': true,
    
    // Payroll permissions - self view only
    'payroll-view-all': false,
    'payroll-view-team': false,
    'payroll-view-self': true,
    'payroll-add': false,
    'payroll-edit': false,
    'payroll-delete': false,
    'payroll-export': false,
    'payroll-download': false,
    // Simplified frontend keys
    'payroll-view': true,
    
    // Reports permissions - self only
    'reports-view-all': false,
    'reports-view-team': false,
    'reports-view-self': true,
    'reports-add': false,
    'reports-edit': false,
    'reports-delete': false,
    'reports-approve': false,
    'reports-export': false,
    // Simplified frontend keys
    'reports-view': true,
    
    // Settings permissions (no access for employees)
    'settings-view': false,
    'settings-edit': false,
    'settings-manage-roles': false,
    'settings-manage-permissions': false,
    
    // Notifications permissions - self only
    'notifications-view-all': false,
    'notifications-view-team': false,
    'notifications-view-self': true,
    'notifications-add': false,
    'notifications-edit': false,
    'notifications-delete': false,
    'notifications-export': false,
  },
  
  client: {
    // Dashboard permissions - self only
    'dashboard-view-all': false,
    'dashboard-view-team': false,
    'dashboard-view-self': true,
    
    // Clients permissions - none
    'clients-view-all': false,
    'clients-view-team': false,
    'clients-view-self': false,
    'clients-add': false,
    'clients-edit': false,
    'clients-delete': false,
    'clients-export': false,
    
    // Leads permissions - none
    'leads-view-all': false,
    'leads-view-team': false,
    'leads-view-self': false,
    'leads-add': false,
    'leads-edit': false,
    'leads-delete': false,
    'leads-followup': false,
    'leads-export': false,
    
    // Tasks permissions - self only (project-related)
    'tasks-view-all': false,
    'tasks-view-team': false,
    'tasks-view-self': true,
    'tasks-add': false,
    'tasks-edit': false,
    'tasks-delete': false,
    'tasks-export': false,
    
    // Calendar permissions - self only (project-related)
    'calendar-view-all': false,
    'calendar-view-team': false,
    'calendar-view-self': true,
    'calendar-add': false,
    'calendar-edit': false,
    'calendar-delete': false,
    'calendar-export': false,
    
    // Team permissions - none
    'team-view-all': false,
    'team-view-team': false,
    'team-view-self': false,
    'team-add': false,
    'team-edit': false,
    'team-delete': false,
    'team-export': false,
    
    // Attendance permissions - none
    'attendance-view-all': false,
    'attendance-view-team': false,
    'attendance-view-self': false,
    'attendance-add': false,
    'attendance-edit': false,
    'attendance-delete': false,
    'attendance-export': false,
    
    // Leaves permissions - none
    'leaves-view-all': false,
    'leaves-view-team': false,
    'leaves-view-self': false,
    'leaves-add': false,
    'leaves-edit': false,
    'leaves-delete': false,
    'leaves-approve': false,
    'leaves-export': false,
    
    // Payroll permissions - none
    'payroll-view-all': false,
    'payroll-view-team': false,
    'payroll-view-self': false,
    'payroll-add': false,
    'payroll-edit': false,
    'payroll-delete': false,
    'payroll-export': false,
    
    // Reports permissions - self only (project-related)
    'reports-view-all': false,
    'reports-view-team': false,
    'reports-view-self': true,
    'reports-add': false,
    'reports-edit': false,
    'reports-delete': false,
    'reports-export': false,
    
    // Notifications permissions - self only (project-related)
    'notifications-view-all': false,
    'notifications-view-team': false,
    'notifications-view-self': true,
    'notifications-add': false,
    'notifications-edit': false,
    'notifications-delete': false,
    'notifications-export': false,
  }
};

function mapToObject(maybeMap) {
  if (!maybeMap) return {};
  // Detect Mongoose Map (has get/set) and convert reliably, preserving false values
  if (typeof maybeMap.get === 'function' && typeof maybeMap.set === 'function') {
    const obj = {};
    if (typeof maybeMap.forEach === 'function') {
      maybeMap.forEach((v, k) => {
        obj[k] = v;
      });
      return obj;
    }
    if (typeof maybeMap.keys === 'function') {
      for (const k of maybeMap.keys()) obj[k] = maybeMap.get(k);
      return obj;
    }
  }
  // Mongoose subdoc or other objects that expose toObject
  if (typeof maybeMap.toObject === 'function') return maybeMap.toObject();
  // Native Map
  if (maybeMap instanceof Map) return Object.fromEntries(maybeMap);
  // Plain object
  if (typeof maybeMap === 'object') return { ...maybeMap };
  return {};
}

/**
 * Middleware to check if user has specific permission
 * @param {string} permission - Permission to check (e.g., 'notifications-view-self')
 * @returns {Function} Express middleware
 */
const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user.role;
      const perms = await getUserPermissions(userRole);
      if (!perms || perms[permission] !== true) {
        return res.status(403).json({
          error: "Access denied",
          message: `Insufficient permissions for ${permission}`,
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Get all permissions for a role (DB first, fallback to in-memory)
 * @param {string} role - User role
 * @returns {Object} Permissions object
 */
const getUserPermissions = async (role) => {
  const base = PERMISSIONS[role] || {};
  const roleDoc = await Role.findOne({ name: role }).select('permissions');
  if (roleDoc) {
    const fromDb = mapToObject(roleDoc.permissions);
    return { ...base, ...fromDb };
  }
  return base;
};

/**
 * Check if user has specific permission
 * @param {string} role - User role
 * @param {string} permission - Permission to check
 * @returns {Promise<boolean>} Has permission
 */
const hasPermission = async (role, permission) => {
  const perms = await getUserPermissions(role);
  return perms && perms[permission] === true;
};

/**
 * Get scoping level for a resource based on user role
 * @param {string} role - User role
 * @param {string} resource - Resource name (e.g., 'notifications')
 * @returns {Promise<'all'|'team'|'self'|'none'>}
 */
const getScopeLevel = async (role, resource) => {
  const permissions = await getUserPermissions(role);
  if (permissions[`${resource}-view-all`]) return 'all';
  if (permissions[`${resource}-view-team`]) return 'team';
  if (permissions[`${resource}-view-self`]) return 'self';
  return 'none';
};

/**
 * Build MongoDB query filter based on user permissions and scope
 * @param {Object} user - User object with id, role, client, etc.
 * @param {string} resource - Resource name
 * @param {Object} baseQuery - Base query to extend
 * @returns {Object} MongoDB query object
 */
const buildScopeQuery = async (user, resource, baseQuery = {}) => {
  const scope = await getScopeLevel(user.role, resource);
  
  switch (scope) {
    case 'all':
      return baseQuery;
      
    case 'team':
      // For managers, show their team members' data (users who have this manager in reportingManagers)
      if (user.role === 'manager') {
        const teamMembers = await User.find({ reportingManagers: { $in: [user.id] } }).select('_id');
        const teamIds = teamMembers.map((m) => m._id);
        teamIds.push(user.id);
        return {
          ...baseQuery,
          $or: [
            { user: { $in: teamIds } },
            { assignedTo: { $in: teamIds } },
            { createdBy: { $in: teamIds } },
          ],
        };
      }
      return { ...baseQuery, user: user.id };
      
    case 'self':
      if (user.role === 'client' && user.clientId) {
        return {
          ...baseQuery,
          $or: [
            { user: user.id },
            { client: user.clientId },
            { assignedTo: user.id },
          ],
        };
      }
      return { ...baseQuery, user: user.id };
      
    case 'none':
    default:
      return { ...baseQuery, _id: null };
  }
};

async function ensureDefaultRolesSeeded() {
  const names = Object.keys(PERMISSIONS);
  for (const name of names) {
    const exists = await Role.findOne({ name }).select('_id');
    if (!exists) {
      await Role.create({ name, permissions: PERMISSIONS[name] });
    }
  }
}

module.exports = {
  requirePermission,
  getUserPermissions,
  hasPermission,
  getScopeLevel,
  buildScopeQuery,
  PERMISSIONS,
  ensureDefaultRolesSeeded,
};