import AdminDashboard from "./admin/AdminDashboard";
import ManagerDashboard from "./manager/ManagerDashboard";
import EmployeeDashboard from "./employee/EmployeeDashboard";
import ManagerTasks from "./manager/ManagerTasks";
import ManagerCalendar from "./manager/ManagerCalendar";
import ManagerReports from "./manager/ManagerReports";
import ManagerAttendance from "./manager/ManagerAttendance";
import ManagerLeaves from "./manager/ManagerLeaves";
import ManagerNotifications from "./manager/ManagerNotifications";
import EmployeeTasks from "./employee/EmployeeTasks";
import EmployeeCalendar from "./employee/EmployeeCalendar";
import EmployeeReports from "./employee/EmployeeReports";
import EmployeeAttendance from "./employee/EmployeeAttendance";
import EmployeeLeaves from "./employee/EmployeeLeaves";
import EmployeeNotifications from "./employee/EmployeeNotifications";
import Layout from "./Layout";
import { useEffect, useMemo, useState } from "react";
import ClientManagement from "./admin/ClientManagement";
import AdminTasks from "./admin/AdminTasks";
import AdminTeam from "./admin/AdminTeam";
import AdminCalendar from "./admin/AdminCalender";
import AdminReports from "./admin/AdminReports";
import AdminAttendance from "./admin/AdminAttendance";
import AdminLeaves from "./admin/AdminLeaves";
import AdminPayroll from "./admin/AdminPayroll";
import AdminLeads from "./admin/AdminLeads";
import AdminNotifications from "./admin/AdminNotifications";
import Profile from "./Profile";
import AccessControl from "./admin/AccessControl";
import api from "../api/client";

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
  // access-control handled explicitly by role (admin only)
};

const ALL_TABS = [
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
];

// Fallback role-based nav (used until permissions are fetched)
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
    "access-control",
  ],
  manager: [
    "dashboard",
    "leads",
    "tasks",
    "calendar",
    "reports",
    "attendance",
    "leaves",
  ],
  employee: [
    "dashboard",
    "tasks",
    "calendar",
    "reports",
    "attendance",
    "leaves",
  ],
  client: ["dashboard", "calendar", "reports"],
};

function canSeeTab(perms, role, tabKey) {
  if (tabKey === "access-control") return role === "admin";
  const required = TAB_PERMISSIONS[tabKey] || [];
  return required.some((key) => perms && perms[key] === true);
}

export default function Dashboard({ userRole = "admin" }) {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [deniedTab, setDeniedTab] = useState(null);

  // Fetch user permissions to guard access to pages
  const [myPerms, setMyPerms] = useState(null);
  useEffect(() => {
    let mounted = true;
    api
      .get("/permissions/my")
      .then(({ data }) => {
        if (mounted) setMyPerms(data || {});
      })
      .catch(() => {
        if (mounted) setMyPerms(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const visibleTabKeys = useMemo(() => {
    if (myPerms) {
      return ALL_TABS.filter((k) => canSeeTab(myPerms, userRole, k));
    }
    return ROLE_NAV_ITEMS[userRole] || ROLE_NAV_ITEMS.admin;
  }, [myPerms, userRole]);

  // Guard: if currentPage becomes disallowed (after permissions load or change), redirect only for initial/unknown states
  useEffect(() => {
    if (currentPage === "profile" || currentPage === "forbidden") return; // let forbidden show
    const isAllowed = visibleTabKeys.includes(currentPage);
    if (!isAllowed) {
      const fallback = visibleTabKeys.includes("dashboard")
        ? "dashboard"
        : (visibleTabKeys[0] || "dashboard");
      if (fallback && fallback !== currentPage) {
        setCurrentPage(fallback);
      }
    }
  }, [visibleTabKeys, currentPage]);

  const handleTabChange = (tabName) => {
    if (tabName === "profile") {
      setDeniedTab(null);
      setCurrentPage(tabName);
      return;
    }
    // Only allow navigation to permitted tabs
    const isAllowed = visibleTabKeys.includes(tabName);
    if (isAllowed) {
      setDeniedTab(null);
      setCurrentPage(tabName);
    } else {
      // Show access denied screen instead of silently redirecting
      setDeniedTab(tabName);
      setCurrentPage("forbidden");
    }
  };

  const ForbiddenPanel = () => (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white border border-gray-200 rounded-xl shadow p-8 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">
          You do not have permission to view this section{deniedTab ? ` (${deniedTab})` : ""}. If you believe this is a mistake, please contact your administrator.
        </p>
      </div>
    </div>
  );

  const renderPageContent = () => {
    if (currentPage === "forbidden") return <ForbiddenPanel />;

    if (userRole === "admin") {
      switch (currentPage) {
        case "dashboard":
          return renderDashboardContent();
        case "clients":
          return <ClientManagement />;
        case "tasks":
          return <AdminTasks />;
        case "team":
          return <AdminTeam />;
        case "calendar":
          return <AdminCalendar />;
        case "attendance":
          return <AdminAttendance />;
        case "leaves":
          return <AdminLeaves />;
        case "payroll":
          return <AdminPayroll />;
        case "leads":
          return <AdminLeads />;
        case "reports":
          return <AdminReports />;
        case "notifications":
          return <AdminNotifications />;
        case "access-control":
          return <AccessControl />;
        case "profile":
          return <Profile />;
        default:
          return renderDashboardContent();
      }
    }
    // Non-admin: defer to role-specific renderer
    if (currentPage === "profile") return <Profile />;
    return renderDashboardContent();
  };

  const renderDashboardContent = () => {
    switch (userRole) {
      case "admin":
        return <AdminDashboard />;

      case "manager":
        switch (currentPage) {
          case "dashboard":
            return <ManagerDashboard />;
          case "tasks":
            return <ManagerTasks />;
          case "leads":
            return <AdminLeads />;
          case "calendar":
            return <ManagerCalendar />;
          case "reports":
            return <ManagerReports />;
          case "attendance":
            return <ManagerAttendance />;
          case "leaves":
            return <ManagerLeaves />;
          case "notifications":
            return <ManagerNotifications />;
          default:
            return <ManagerDashboard />;
        }

      case "employee":
        switch (currentPage) {
          case "dashboard":
            return <EmployeeDashboard />;
          case "tasks":
            return <EmployeeTasks />;
          case "leads":
            return <AdminLeads />;
          case "calendar":
            return <EmployeeCalendar />;
          case "reports":
            return <EmployeeReports />;
          case "attendance":
            return <EmployeeAttendance />;
          case "leaves":
            return <EmployeeLeaves />;
          case "notifications":
            return <EmployeeNotifications />;
          default:
            return <EmployeeDashboard />;
        }

      case "client":
        // Client users have a limited set of pages; reuse employee views with server-side scoping
        switch (currentPage) {
          case "dashboard":
            return <EmployeeDashboard />;
          case "calendar":
            return <EmployeeCalendar />;
          case "reports":
            return <EmployeeReports />;
          case "notifications":
            return <EmployeeNotifications />;
          default:
            return <EmployeeDashboard />;
        }

      default:
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome!</h2>
            <p className="text-gray-600">
              Please select a role to view your dashboard.
            </p>
          </div>
        );
    }
  };

  return <Layout onTabChange={handleTabChange}>{renderPageContent()}</Layout>;
}
