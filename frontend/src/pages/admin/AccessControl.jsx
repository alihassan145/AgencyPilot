import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "../../api/client";
import {
  FaUsers,
  FaTasks,
  FaRegCalendarAlt,
  FaCalendarCheck,
  FaLeaf,
  FaMoneyBillWave,
  FaFileAlt,
  FaBell,
  FaCheck,
  FaEye,
  FaPen,
  FaLock,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";

// Admin Access Control page redesigned to match the provided UI
export default function AccessControl() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState(["admin", "manager", "employee", "client"]);
  const [currentRole, setCurrentRole] = useState("admin");
  const [perms, setPerms] = useState({});
  const [message, setMessage] = useMessage();
  const [showRolesModal, setShowRolesModal] = useState(false);
  const matrixRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/permissions");
        setPerms(data.permissions || {});
        setRoles(data.roles || roles);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groups = useMemo(() => groupPermissions(perms[currentRole] || {}), [perms, currentRole]);

  const summary = useMemo(() => {
    const values = perms[currentRole] || {};
    const keys = groups.flatMap((g) => g.items.map((i) => i.key));
    let onCount = 0;
    let offCount = 0;
    keys.forEach((k) => {
      if (values[k]) onCount += 1; else offCount += 1;
    });
    return { onCount, offCount };
  }, [groups, perms, currentRole]);

  const toggle = (permKey) => {
    setPerms((p) => ({
      ...p,
      [currentRole]: {
        ...p[currentRole],
        [permKey]: !p[currentRole]?.[permKey],
      },
    }));
  };

  const handleViewRole = (roleKey) => {
    setCurrentRole(roleKey);
    setShowRolesModal(false);
    // Smooth scroll to matrix
    setTimeout(() => matrixRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  const handleEditRole = (roleKey) => {
    // Same behavior as View for now; later can open an edit-specific flow
    handleViewRole(roleKey);
  };

  const save = async () => {
    try {
      setSaving(true);
      const updates = perms[currentRole];
      await api.put(`/permissions/${currentRole}`, { updates });
      setMessage({ type: "success", text: "Permissions saved" });
    } catch (e) {
      setMessage({ type: "error", text: e?.response?.data?.message || "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-0">
      {/* Role Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Select Role to View Permissions</h2>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white shadow"
            onClick={() => setShowRolesModal(true)}
          >
            Manage Roles
          </button>
        </div>

        {loading ? (
          <div className="p-6">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROLES_META.filter((r) => roles.includes(r.key)).map((role) => (
              <RoleCard
                key={role.key}
                role={role}
                selected={currentRole === role.key}
                onClick={() => setCurrentRole(role.key)}
              />)
            )}
          </div>
        )}
      </div>

      {!loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Role Permission Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 justify-center sm:justify-start">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold">
                  {summary.onCount}
                </div>
                <div>
                  <div className="text-emerald-700 font-semibold">{summary.onCount} Permissions ON</div>
                  <div className="text-sm text-gray-500">Allowed Permissions</div>
                </div>
              </div>
              <div className="flex items-center gap-4 justify-center sm:justify-start">
                <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-2xl font-bold">
                  {summary.offCount}
                </div>
                <div>
                  <div className="text-rose-700 font-semibold">{summary.offCount} Permissions OFF</div>
                  <div className="text-sm text-gray-500">Denied Permissions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permission Matrix */}
      <div ref={matrixRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl overflow-hidden shadow border border-gray-200">
          <div className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 p-6">
            <h3 className="text-white text-xl sm:text-2xl font-semibold flex items-center gap-2">
              <span role="img" aria-label="chart">📊</span>
              Priority-Based Permission Matrix
            </h3>
            <p className="text-white/90 text-sm">Complete access control for all Agency Pro features</p>
          </div>

          <div className="bg-white">
            {groups.map((group, idx) => (
              <GroupBlock
                key={group.name}
                index={idx + 1}
                group={group}
                values={perms[currentRole] || {}}
                onToggle={toggle}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end py-5">
          <button
            onClick={save}
            disabled={saving}
            className={`px-5 py-2 rounded-md text-white font-medium ${saving ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"}`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {message && (
          <div className={`mt-2 p-3 rounded ${message.type==='success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}
      </div>

      {/* Manage Roles Modal */}
      <ManageRolesModal
        open={showRolesModal}
        onClose={() => setShowRolesModal(false)}
        rolesMeta={ROLES_META}
        roles={roles}
        onView={handleViewRole}
        onEdit={handleEditRole}
      />
    </div>
  );
}

function ManageRolesModal({ open, onClose, rolesMeta, roles, onView, onEdit }) {
  if (!open) return null;
  const visible = rolesMeta.filter((r) => roles.includes(r.key));
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-0 flex items-start justify-center p-4 sm:p-8">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="text-xl font-semibold text-gray-900">Manage Roles</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">×</button>
          </div>

          <div className="divide-y">
            {visible.map((r) => (
              <div key={r.key} className="px-6 py-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${r.badgeBg}`}>{r.badge}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-gray-900">{r.title}</div>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">System</span>
                  </div>
                  <div className="text-sm text-gray-600">{r.description}</div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => onView(r.key)} className="text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 text-sm font-medium">
                    <FaEye className="opacity-80" /> View
                  </button>
                  <button onClick={() => onEdit(r.key)} className="text-purple-600 hover:text-purple-700 inline-flex items-center gap-1 text-sm font-medium">
                    <FaPen className="opacity-80" /> Edit
                  </button>
                  {r.key === "admin" ? (
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                      <FaLock /> Permanently Protected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full">
                      <FaLock /> Protected
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RoleCard({ role, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`text-left w-full rounded-xl border transition-all bg-white hover:shadow-md ${selected ? "ring-2 ring-indigo-500 border-indigo-300 shadow" : "border-gray-200"}`}
    >
      <div className="p-5 flex items-start gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${role.badgeBg}`}>{role.badge}</div>
        <div className="flex-1">
          <div className="text-base sm:text-lg font-semibold text-gray-900">{role.title}</div>
          <div className={`${role.textColor} text-sm leading-snug`}>{role.description}</div>
        </div>
      </div>
    </button>
  );
}

function GroupBlock({ index, group, values, onToggle }) {
  const isFullAccess = group.items.every((it) => !!values[it.key]);
  const Icon = group.icon;
  return (
    <div className="border-b border-gray-200">
      <div className="px-5 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
            {Icon ? <Icon /> : <FaFileAlt />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-500">{index}.</span>
              <h4 className="text-lg font-semibold text-gray-900">{group.label}</h4>
            </div>
            <p className="text-xs text-gray-500">{group.description}</p>
          </div>
        </div>
        <div className={`text-xs px-3 py-1 rounded-full font-medium ${isFullAccess ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-50 text-gray-600 border border-gray-200"}`}>
          {isFullAccess ? "Full Access" : "Partial Access"}
        </div>
      </div>

      <div className="px-5 sm:px-6 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {group.items.map((item) => (
            <PermChip key={item.key} label={item.label} checked={!!values[item.key]} onClick={() => onToggle(item.key)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PermChip({ label, checked, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left border rounded-lg px-4 py-3 flex items-center justify-between transition ${
        checked
          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
          : "bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100"
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${checked ? "text-emerald-700" : "text-gray-500"}`}>
        {checked ? <FaCheck /> : null}
        {checked ? "ON" : "OFF"}
      </span>
    </button>
  );
}

function useMessage() {
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3000);
    return () => clearTimeout(t);
  }, [msg]);
  return [msg, setMsg];
}

// Metadata for role selector cards
const ROLES_META = [
  {
    key: "admin",
    title: "Admin",
    badge: "A",
    badgeBg: "bg-rose-500",
    textColor: "text-rose-600",
    description: "Full control over all system features and data",
  },
  {
    key: "manager",
    title: "Manager",
    badge: "M",
    badgeBg: "bg-amber-500",
    textColor: "text-amber-600",
    description: "Self-access only by default – Admin must enable team permissions",
  },
  {
    key: "employee",
    title: "Employee",
    badge: "E",
    badgeBg: "bg-sky-500",
    textColor: "text-sky-600",
    description: "Control over self only – limited access",
  },
  {
    key: "client",
    title: "Client",
    badge: "C",
    badgeBg: "bg-green-500",
    textColor: "text-green-600",
    description: "Access only to Dashboard, Tasks, Calendar, Reports, Notifications related to their own projects",
  },
];

// Helpers: group permissions with icons per menu
function groupPermissions(rolePerms) {
  const menus = [
    {
      name: "dashboard",
      label: "Dashboard",
      icon: MdDashboard,
      description: "Main dashboard access and overview",
      items: [
        { key: 'dashboard-view-all', label: 'View Dashboard (All)' },
        { key: 'dashboard-view-team', label: 'View Dashboard (Team)' },
        { key: 'dashboard-view-self', label: 'View Dashboard (Self)' },
      ]
    },
    {
      name: "clients",
      label: "Clients",
      icon: FaUsers,
      description: "Client management and administration",
      items: [
        { key: 'clients-view-all', label: 'View Clients (All)' },
        { key: 'clients-view-team', label: 'View Clients (Team)' },
        { key: 'clients-view-self', label: 'View Clients (Self)' },
        { key: 'clients-add', label: 'Add Client' },
        { key: 'clients-edit', label: 'Edit Client' },
        { key: 'clients-delete', label: 'Delete Client' },
        { key: 'clients-export', label: 'Export / Download Clients' },
      ]
    },
    {
      name: "leads",
      label: "Leads",
      icon: FaUsers,
      description: "Lead generation and conversion management",
      items: [
        { key: 'leads-view-all', label: 'View Leads (All)' },
        { key: 'leads-view-team', label: 'View Leads (Team)' },
        { key: 'leads-view-self', label: 'View Leads (Self)' },
        { key: 'leads-add', label: 'Add Lead' },
        { key: 'leads-edit', label: 'Edit Lead' },
        { key: 'leads-delete', label: 'Delete Lead' },
        { key: 'leads-followup', label: 'Follow up status update' },
        { key: 'leads-export', label: 'Import/Export / Download Leads' },
      ]
    },
    {
      name: "tasks",
      label: "Projects & Tasks",
      icon: FaTasks,
      description: "Project and task management system",
      items: [
        { key: 'tasks-view-all', label: 'View Tasks (All)' },
        { key: 'tasks-view-team', label: 'View Tasks (Team)' },
        { key: 'tasks-view-self', label: 'View Tasks (Self)' },
        { key: 'tasks-add', label: 'Add Task' },
        { key: 'tasks-edit', label: 'Edit Task' },
        { key: 'tasks-delete', label: 'Delete Task' },
        { key: 'tasks-export', label: 'Export / Download Tasks' },
      ]
    },
    {
      name: "calendar",
      label: "Calendar",
      icon: FaRegCalendarAlt,
      description: "Calendar and event management",
      items: [
        { key: 'calendar-view-all', label: 'View Events (All)' },
        { key: 'calendar-view-team', label: 'View Events (Team)' },
        { key: 'calendar-view-self', label: 'View Events (Self)' },
        { key: 'calendar-add', label: 'Add Event' },
        { key: 'calendar-edit', label: 'Edit Event' },
        { key: 'calendar-delete', label: 'Delete Event' },
        { key: 'calendar-export', label: 'Export / Download Events' },
      ]
    },
    {
      name: "team",
      label: "Team",
      icon: FaUsers,
      description: "Team management",
      items: [
        { key: 'team-view-all', label: 'View Team (All)' },
        { key: 'team-view-team', label: 'View Team (Team)' },
        { key: 'team-view-self', label: 'View Team (Self)' },
        { key: 'team-add', label: 'Add Team Member' },
        { key: 'team-edit', label: 'Edit Team Member' },
        { key: 'team-delete', label: 'Delete Team Member' },
        { key: 'team-export', label: 'Export / Download Team' },
      ]
    },
    {
      name: "attendance",
      label: "Attendance",
      icon: FaCalendarCheck,
      description: "Attendance management",
      items: [
        { key: 'attendance-view-all', label: 'View Attendance (All)' },
        { key: 'attendance-view-team', label: 'View Attendance (Team)' },
        { key: 'attendance-view-self', label: 'View Attendance (Self)' },
        { key: 'attendance-add', label: 'Add Attendance' },
        { key: 'attendance-edit', label: 'Edit Attendance' },
        { key: 'attendance-delete', label: 'Delete Attendance' },
        { key: 'attendance-export', label: 'Export / Download Attendance' },
      ]
    },
    {
      name: "leaves",
      label: "Leaves",
      icon: FaLeaf,
      description: "Leave management",
      items: [
        { key: 'leaves-view-all', label: 'View Leaves (All)' },
        { key: 'leaves-view-team', label: 'View Leaves (Team)' },
        { key: 'leaves-view-self', label: 'View Leaves (Self)' },
        { key: 'leaves-add', label: 'Add Leave' },
        { key: 'leaves-edit', label: 'Edit Leave' },
        { key: 'leaves-delete', label: 'Delete Leave' },
        { key: 'leaves-approve', label: 'Approve/Reject Leave' },
        { key: 'leaves-export', label: 'Export / Download Leaves' },
      ]
    },
    {
      name: "payroll",
      label: "Payroll",
      icon: FaMoneyBillWave,
      description: "Payroll configuration and calculations",
      items: [
        { key: 'payroll-view-all', label: 'View Payroll (All)' },
        { key: 'payroll-view-team', label: 'View Payroll (Team)' },
        { key: 'payroll-view-self', label: 'View Payroll (Self)' },
        { key: 'payroll-add', label: 'Set Payroll Config' },
        { key: 'payroll-edit', label: 'Edit Payroll Config' },
        { key: 'payroll-delete', label: 'Delete Payroll Config' },
        { key: 'payroll-export', label: 'Export / Download Payroll' },
      ]
    },
    {
      name: "reports",
      label: "Reports",
      icon: FaFileAlt,
      description: "Work reports submission and approvals",
      items: [
        { key: 'reports-view-all', label: 'View Reports (All)' },
        { key: 'reports-view-team', label: 'View Reports (Team)' },
        { key: 'reports-view-self', label: 'View Reports (Self)' },
        { key: 'reports-add', label: 'Submit Report' },
        { key: 'reports-approve', label: 'Approve/Reject Report' },
        { key: 'reports-edit', label: 'Edit Report' },
        { key: 'reports-delete', label: 'Delete Report' },
        { key: 'reports-export', label: 'Export / Download Reports' },
      ]
    },
    {
      name: "notifications",
      label: "Notifications",
      icon: FaBell,
      description: "System notifications",
      items: [
        { key: 'notifications-view-all', label: 'View Notifications (All)' },
        { key: 'notifications-view-team', label: 'View Notifications (Team)' },
        { key: 'notifications-view-self', label: 'View Notifications (Self)' },
        { key: 'notifications-add', label: 'Add Notification' },
        { key: 'notifications-edit', label: 'Edit Notification' },
        { key: 'notifications-delete', label: 'Delete Notification' },
        { key: 'notifications-export', label: 'Export / Download Notifications' },
      ]
    },
  ];

  // Backfill missing keys to ensure all chips render consistently
  const roleKeys = Object.keys(rolePerms || {});
  menus.forEach((m) => {
    m.items.forEach((it) => {
      if (!roleKeys.includes(it.key)) rolePerms[it.key] = false;
    });
  });

  return menus;
}