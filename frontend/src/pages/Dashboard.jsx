import AdminDashboard from "./admin/AdminDashboard";
import Layout from "./Layout";
import { useState } from "react";
import ClientManagement from "./admin/ClientManagement";
import AdminTasks from "./admin/AdminTasks";
import AdminTeam from "./admin/AdminTeam";
import AdminCalendar from "./admin/AdminCalender";
import AdminReports from "./admin/AdminReports";

export default function Dashboard({ userRole = "admin" }) {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const handleTabChange = (tabName) => {
    setCurrentPage(tabName);
  };

  const renderPageContent = () => {
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
      case "reports":
        return <AdminReports />;
      default:
        return renderDashboardContent();
    }
  };
  const renderDashboardContent = () => {
    switch (userRole) {
      case "admin":
        return <AdminDashboard />;

      case "manager":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Manager Dashboard
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-900">My Projects</h3>
                  <p className="text-2xl font-bold text-orange-600">6</p>
                </div>
                <div className="bg-teal-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-teal-900">Team Tasks</h3>
                  <p className="text-2xl font-bold text-teal-600">18</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-indigo-900">
                    Pending Reviews
                  </h3>
                  <p className="text-2xl font-bold text-indigo-600">3</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                My Team
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 border rounded">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-sm text-gray-500">Designer</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className="font-medium">Jane Smith</p>
                    <p className="text-sm text-gray-500">Developer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "employee":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Employee Dashboard
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900">My Tasks</h3>
                  <p className="text-2xl font-bold text-blue-600">5</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900">Completed</h3>
                  <p className="text-2xl font-bold text-green-600">12</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-900">
                    Hours This Week
                  </h3>
                  <p className="text-2xl font-bold text-yellow-600">32</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                My Tasks
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Design homepage mockup</p>
                    <p className="text-sm text-gray-500">Due: Tomorrow</p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                    In Progress
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Review client feedback</p>
                    <p className="text-sm text-gray-500">Due: Friday</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    Pending
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

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
