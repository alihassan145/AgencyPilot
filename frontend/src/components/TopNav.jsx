import {
  FaChartLine,
  FaBuilding,
  FaTasks,
  FaUsers,
  FaCalendarAlt,
  FaClipboardList,
  FaClock,
  FaLeaf,
  FaMoneyBill,
  FaBell,
  FaAddressBook,
  FaShieldAlt,
} from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications } from "../store/notificationsSlice";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../hooks/usePermissions";

// Centralized navigation config: define tabs once and assign per role
const TABS = {
  dashboard: { key: "dashboard", label: "Dashboard", icon: <FaChartLine /> },
  clients: { key: "clients", label: "Clients", icon: <FaBuilding /> },
  tasks: { key: "tasks", label: "Tasks", icon: <FaTasks /> },
  team: { key: "team", label: "Team", icon: <FaUsers /> },
  calendar: { key: "calendar", label: "Calendar", icon: <FaCalendarAlt /> },
  reports: { key: "reports", label: "Reports", icon: <FaClipboardList /> },
  attendance: { key: "attendance", label: "Attendance", icon: <FaClock /> },
  leaves: { key: "leaves", label: "Leaves", icon: <FaLeaf /> },
  leads: { key: "leads", label: "Leads", icon: <FaAddressBook /> },
  payroll: { key: "payroll", label: "Payroll", icon: <FaMoneyBill /> },
  notifications: {
    key: "notifications",
    label: "Notifications",
    icon: <FaBell />,
  },
  "access-control": {
    key: "access-control",
    label: "Access Control",
    icon: <FaShieldAlt />,
  },
};

// Fallback role-based nav (aligned with backend PERMISSIONS matrix)
const ROLE_NAV_ITEMS = {
  admin: [
    "dashboard",
    "clients",
    "leads",
    "tasks",
    "team",
    "calendar",
    "attendance",
    "leaves",
    "payroll",
    "reports",
    "notifications",
    "access-control",
  ],
  manager: [
    "dashboard",
    "clients", // manager has clients-view-self
    "leads", // manager has leads-view-self
    "tasks", // manager has tasks-view-self
    "calendar", // manager has calendar-view-self
    "reports", // manager has reports-view-self
    "attendance", // manager has attendance-view-self
    "leaves", // manager has leaves-view-self
    "payroll", // manager has payroll-view-self
    "notifications", // manager has notifications-view-team/self
  ],
  employee: [
    "dashboard", // employee has dashboard-view-self
    "clients", // employee has clients-view-self
    "leads", // employee has leads-view-self
    "tasks", // employee has tasks-view-self
    "calendar", // employee has calendar-view-self
    "reports", // employee has reports-view-self
    "attendance", // employee has attendance-view-self
    "leaves", // employee has leaves-view-self
    "payroll", // employee has payroll-view-self
    "notifications", // employee has notifications-view-self
  ],
  client: [
    "dashboard", // client has dashboard-view-self
    "tasks", // client has tasks-view-self
    "calendar", // client has calendar-view-self
    "reports", // client has reports-view-self
    "notifications", // client has notifications-view-self
  ],
};

// Map each tab to the minimum permission keys that grant visibility
const TAB_PERMISSIONS = {
  dashboard: ["dashboard-view-self", "dashboard-view-team", "dashboard-view-all"],
  clients: ["clients-view-self", "clients-view-team", "clients-view-all"],
  leads: ["leads-view-self", "leads-view-team", "leads-view-all"],
  tasks: ["tasks-view-self", "tasks-view-team", "tasks-view-all"],
  team: ["team-view-self", "team-view-team", "team-view-all"],
  calendar: ["calendar-view-self", "calendar-view-team", "calendar-view-all"],
  reports: ["reports-view-self", "reports-view-team", "reports-view-all"],
  attendance: ["attendance-view-self", "attendance-view-team", "attendance-view-all"],
  leaves: ["leaves-view-self", "leaves-view-team", "leaves-view-all"],
  payroll: ["payroll-view-self", "payroll-view-team", "payroll-view-all"],
  notifications: ["notifications-view-self", "notifications-view-team", "notifications-view-all"],
  // access-control handled explicitly below
};

function canSeeTab(permsOrPredicate, role, tabKey) {
  if (tabKey === "access-control") return role === "admin";
  // Support either a predicate (hasPerm) or a permissions map
  if (typeof permsOrPredicate === "function") {
    return permsOrPredicate(`${tabKey}-view`);
  }
  const required = TAB_PERMISSIONS[tabKey] || [];
  return required.some((key) => permsOrPredicate && permsOrPredicate[key] === true);
}

export default function TopNavbar({ onTabChange }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const dispatch = useDispatch();
  const { items: notifications } = useSelector((s) => s.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const [now, setNow] = useState(new Date());
  // Profile modal removed; now routed to Profile page

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    dispatch(fetchNotifications());
    const id = setInterval(() => dispatch(fetchNotifications()), 30000);
    return () => clearInterval(id);
  }, [dispatch]);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    if (onTabChange) {
      onTabChange(tabName);
    }
  };
  const roleLabel = (user?.role || "user").replace(/\b\w/g, (c) =>
    c.toUpperCase()
  );
  const formattedTime = now.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const rawName = user?.name || "User";
  const displayName = rawName.replace(/^System\s+/i, "").trim();
  const avatarLetter = (displayName || "U").slice(0, 1).toUpperCase();

  // Build visible tabs by permission via centralized hook
  const userRole = user?.role || "client";
  const { hasPerm, loading: permsLoading } = usePermissions();

  const visibleTabKeys = permsLoading
    ? (ROLE_NAV_ITEMS[userRole] || ROLE_NAV_ITEMS.admin)
    : Object.keys(TABS).filter((k) => canSeeTab(hasPerm, userRole, k));

  const canSeeNotifications = permsLoading
    ? ((ROLE_NAV_ITEMS[userRole] || []).includes("notifications"))
    : canSeeTab(hasPerm, userRole, "notifications");

  // Change password is on the Profile page
  return (
    <>
      <div className="bg-white shadow-sm border-b">
        {/* Top Row: Logo + Title and User Avatar */}
        <div className="flex justify-between items-center py-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo + Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
              <FaBuilding />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Agency Pro
              </h1>
              <p className="text-xs text-gray-500">
                {roleLabel} • {formattedTime}
              </p>
            </div>
          </div>

          {/* User Avatar */}
          {canSeeNotifications && (
            <button
              onClick={() => handleTabClick("notifications")}
              className="relative p-2 rounded-md hover:bg-gray-100 mr-4"
            >
              <FaBell className="text-xl text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          )}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md border transition-colors ${
                isUserDropdownOpen
                  ? "border-blue-500 bg-blue-50"
                  : "border-transparent hover:bg-gray-50"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                {avatarLetter}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {displayName}
              </span>
              <span className="text-gray-400">▼</span>
            </button>

            {/* Dropdown Menu */}
            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsUserDropdownOpen(false);
                      handleTabClick("profile");
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <span className="text-gray-600">👤⚙️</span>
                    <span>Profile Settings</span>
                  </button>

                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={logout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <span>↪️</span>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row: Navigation Tabs */}
        <div className="py-3 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
              {visibleTabKeys.map((key) => (
                <NavTab
                  key={key}
                  active={activeTab === key}
                  icon={TABS[key].icon}
                  label={TABS[key].label}
                  onClick={() => handleTabClick(key)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Profile/Change Password modals removed in favor of dedicated Profile page */}
    </>
  );
}

function NavTab({ icon, label, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`nav-tab px-4 py-2 rounded-lg font-medium transition duration-200 whitespace-nowrap flex items-center space-x-2 ${
        active
          ? "bg-[#5465E5] text-white"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      }`}
    >
      <span className="text-md">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
