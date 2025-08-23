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
import { useState } from "react";
import ClientManagement from "./admin/ClientManagement";
import AdminTasks from "./admin/AdminTasks";
import AdminTeam from "./admin/AdminTeam";
import AdminCalendar from "./admin/AdminCalender";
import AdminReports from "./admin/AdminReports";
import AdminAttendance from "./admin/AdminAttendance";
import AdminLeaves from "./admin/AdminLeaves";
import AdminPayroll from "./admin/AdminPayroll";
import AdminNotifications from "./admin/AdminNotifications";
import Profile from "./Profile";

export default function Dashboard({ userRole = "admin" }) {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const handleTabChange = (tabName) => {
    setCurrentPage(tabName);
  };

  const renderPageContent = () => {
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
        case "reports":
          return <AdminReports />;
        case "notifications":
          return <AdminNotifications />;
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
