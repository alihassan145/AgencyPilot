import {
  FaChartLine,
  FaBuilding,
  FaTasks,
  FaUsers,
  FaCalendarAlt,
  FaClipboardList,
} from "react-icons/fa";
import { useState, useEffect, useRef } from "react";

export default function TopNavbar({ onTabChange }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    if (onTabChange) {
      onTabChange(tabName);
    }
  };
  return (
    <div className="bg-white shadow-sm border-b">
      {/* Top Row: Logo + Title and User Avatar */}
      <div className="flex justify-between items-center px-6 py-4 mx-24">
        {/* Logo + Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
            <FaBuilding />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Agency Pro</h1>
            <p className="text-xs text-gray-500">
              Administrator • 01 Aug 2025, 02:43 am IST
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
              A
            </div>
            <span className="text-sm font-medium text-gray-700">
              Admin User
            </span>
            <span className="text-gray-400">▼</span>
          </button>

          {/* Dropdown Menu */}
          {isUserDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="py-1">
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                  <span className="text-gray-600">👤⚙️</span>
                  <span>Profile Settings</span>
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-gray-50 flex items-center space-x-2">
                  <span>🔑</span>
                  <span>Change Password</span>
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center space-x-2">
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
          <NavTab
            active={activeTab === "dashboard"}
            icon={<FaChartLine />}
            label="Dashboard"
            onClick={() => handleTabClick("dashboard")}
          />
          <NavTab
            active={activeTab === "clients"}
            icon={<FaBuilding />}
            label="Clients"
            onClick={() => handleTabClick("clients")}
          />
          <NavTab
            active={activeTab === "tasks"}
            icon={<FaTasks />}
            label="Tasks"
            onClick={() => handleTabClick("tasks")}
          />
          <NavTab
            active={activeTab === "team"}
            icon={<FaUsers />}
            label="Team"
            onClick={() => handleTabClick("team")}
          />
          <NavTab
            active={activeTab === "calendar"}
            icon={<FaCalendarAlt />}
            label="Calendar"
            onClick={() => handleTabClick("calendar")}
          />
          <NavTab
            active={activeTab === "reports"}
            icon={<FaClipboardList />}
            label="Reports"
            onClick={() => handleTabClick("reports")}
          />
        </div>
      </div>
    </div>
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
