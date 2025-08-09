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
} from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

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
  payroll: { key: "payroll", label: "Payroll", icon: <FaMoneyBill /> },
  notifications: {
    key: "notifications",
    label: "Notifications",
    icon: <FaBell />,
  },
};

export const ROLE_NAV_ITEMS = {
  admin: [
    "dashboard",
    "clients",
    "tasks",
    "team",
    "calendar",
    "attendance",
    "leaves",
    "payroll",
    "reports",
    "notifications",
  ],
  manager: [
    "dashboard",
    "tasks",
    "calendar",
    "reports",
    "attendance",
    "leaves",
    "notifications",
  ],
  employee: [
    "dashboard",
    "tasks",
    "calendar",
    "reports",
    "attendance",
    "leaves",
    "notifications",
  ],
  client: ["dashboard", "calendar", "reports"],
};

export default function TopNavbar({ onTabChange }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const [now, setNow] = useState(new Date());
  const [showProfile, setShowProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [cpCurrent, setCpCurrent] = useState("");
  const [cpNew, setCpNew] = useState("");
  const [cpMessage, setCpMessage] = useState("");

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

  const handleSaveProfile = async () => {
    if (user?.role !== "admin") {
      setShowProfile(false);
      return;
    }
    try {
      setSavingProfile(true);
      await api.patch(`/users/${user.id}`, { name: profileName });
      // optimistically update local user name in storage
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        u.name = profileName;
        localStorage.setItem("user", JSON.stringify(u));
      }
      setShowProfile(false);
    } catch (e) {
      // ignore
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setCpMessage("");
    try {
      await api.post("/auth/change-password", {
        currentPassword: cpCurrent,
        newPassword: cpNew,
      });
      setCpMessage("Password updated successfully");
      setCpCurrent("");
      setCpNew("");
    } catch (err) {
      setCpMessage(err?.response?.data?.message || "Failed to change password");
    }
  };
  return (
    <>
      <div className="bg-white shadow-sm border-b">
        {/* Top Row: Logo + Title and User Avatar */}
        <div className="flex justify-between items-center px-6 py-4 mx-24">
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
                {(user?.name || "U").slice(0, 1).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user?.name || "User"}
              </span>
              <span className="text-gray-400">▼</span>
            </button>

            {/* Dropdown Menu */}
            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowProfile(true);
                      setIsUserDropdownOpen(false);
                      setProfileName(user?.name || "");
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <span className="text-gray-600">👤⚙️</span>
                    <span>Profile Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowChangePassword(true);
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <span>🔑</span>
                    <span>Change Password</span>
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
        <div className="px-6 py-3 border-t border-gray-100 mx-20">
          <div className="flex space-x-6 text-sm font-medium">
            {(ROLE_NAV_ITEMS[user?.role] || ROLE_NAV_ITEMS.admin).map((key) => (
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
      {showProfile && (
        <Modal onClose={() => setShowProfile(false)} title="Profile Settings">
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Name</label>
              <input
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full border rounded px-3 py-2"
                disabled={user?.role !== "admin"}
              />
              {user?.role !== "admin" && (
                <p className="text-xs text-gray-500 mt-1">
                  Contact admin to update your profile details.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email</label>
              <input
                value={user?.email || ""}
                className="w-full border rounded px-3 py-2"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Role</label>
              <input
                value={roleLabel}
                className="w-full border rounded px-3 py-2"
                disabled
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowProfile(false)}
                className="px-4 py-2 rounded border"
              >
                Close
              </button>
              {user?.role === "admin" && (
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50"
                >
                  {savingProfile ? "Saving..." : "Save"}
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
      {showChangePassword && (
        <Modal
          onClose={() => setShowChangePassword(false)}
          title="Change Password"
        >
          <form onSubmit={handleChangePassword} className="space-y-3">
            {cpMessage && (
              <div className="text-sm text-indigo-700 bg-indigo-50 border border-indigo-200 rounded px-3 py-2">
                {cpMessage}
              </div>
            )}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={cpCurrent}
                onChange={(e) => setCpCurrent(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={cpNew}
                onChange={(e) => setCpNew(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowChangePassword(false)}
                className="px-4 py-2 rounded border"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-indigo-600 text-white"
              >
                Update
              </button>
            </div>
          </form>
        </Modal>
      )}
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
