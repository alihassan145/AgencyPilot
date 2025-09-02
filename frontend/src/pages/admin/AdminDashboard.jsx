import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminStats } from "../../store/dashboardSlice";
import api from "../../api/client";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { usePermissions } from "../../hooks/usePermissions";

const COLORS = ["#3B82F6", "#FACC15", "#10B981"];

function useAdminStats(canViewDashboard) {
  const dispatch = useDispatch();
  const { stats } = useSelector((s) => s.dashboard);
  useEffect(() => {
    if (canViewDashboard) {
      dispatch(fetchAdminStats());
    }
  }, [dispatch, canViewDashboard]);
  return stats;
}

export default function AdminDashboard() {
  const { anyPerm } = usePermissions();
  const canViewDashboard = anyPerm([
    "dashboard-view-all",
    "dashboard-view-team",
    "dashboard-view-self",
  ]);
  const canViewClients = anyPerm([
    "clients-view-all",
    "clients-view-team",
    "clients-view-self",
  ]);
  const canViewTasks = anyPerm([
    "tasks-view-all",
    "tasks-view-team",
    "tasks-view-self",
  ]);

  const { clients, activeTasks, completedTasks } = useAdminStats(canViewDashboard);
  const [clientGrowthData, setClientGrowthData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [teamPerformance, setTeamPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch client growth data (only if clients visible)
  useEffect(() => {
    if (!canViewClients) {
      setClientGrowthData([]);
      return;
    }
    const fetchClientGrowthData = async () => {
      try {
        const { data } = await api.get("/clients");
        const clients = data || [];
        const monthlyData = {};
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthName = months[date.getMonth()];
          monthlyData[monthName] = 0;
        }
        clients.forEach((client) => {
          if (client.createdAt) {
            const clientDate = new Date(client.createdAt);
            const monthName = months[clientDate.getMonth()];
            if (monthlyData.hasOwnProperty(monthName)) {
              monthlyData[monthName]++;
            }
          }
        });
        const chartData = Object.entries(monthlyData).map(
          ([name, clients]) => ({
            name,
            clients,
          })
        );
        setClientGrowthData(chartData);
      } catch (error) {
        console.error("Error fetching client growth data:", error);
        setClientGrowthData([
          { name: "Jan", clients: 1 },
          { name: "Feb", clients: 2 },
          { name: "Mar", clients: 3 },
          { name: "Apr", clients: 4 },
          { name: "May", clients: 5 },
          { name: "Jun", clients: 1 },
        ]);
      }
    };
    fetchClientGrowthData();
  }, [canViewClients]);

  // Fetch recent activities (only if dashboard visible)
  useEffect(() => {
    if (!canViewDashboard) {
      setRecentActivities([]);
      return;
    }
    const fetchRecentActivities = async () => {
      try {
        const { data } = await api.get("/recent-activities?limit=4");
        setRecentActivities(data.data || []);
      } catch (error) {
        console.error("Error fetching recent activities:", error);
        setRecentActivities([
          {
            _id: "1",
            action: "logout",
            description: "Admin User logged out",
            createdAt: new Date().toISOString(),
            user: { name: "Admin User" },
          },
        ]);
      }
    };
    fetchRecentActivities();
  }, [canViewDashboard]);

  // Fetch team performance data (only if tasks visible)
  useEffect(() => {
    const fetchTeamPerformance = async () => {
      try {
        if (!canViewTasks) {
          setTeamPerformance([]);
          return;
        }
        const { data } = await api.get("/users");
        const users = data || [];
        const { data: tasksData } = await api.get("/tasks");
        const tasks = tasksData || [];
        const performanceData = users
          .filter((user) => user.role !== "admin")
          .map((user) => {
            const userTasks = tasks.filter(
              (task) => task.assignee?._id === user._id
            );
            const completedTasks = userTasks.filter(
              (task) => task.status === "completed"
            );
            const progress =
              userTasks.length > 0
                ? Math.round((completedTasks.length / userTasks.length) * 100)
                : 0;
            return {
              name: user.name,
              role: user.department?.name || "General",
              progress,
              tasks: `${completedTasks.length}/${userTasks.length}`,
              avatar: user.name.charAt(0).toUpperCase(),
            };
          });
        setTeamPerformance(performanceData);
      } catch (error) {
        console.error("Error fetching team performance:", error);
        setTeamPerformance([
          { name: "John Smith", role: "Design", progress: 0, tasks: "0/1", avatar: "J" },
          { name: "Sarah Johnson", role: "SEO", progress: 0, tasks: "0/1", avatar: "S" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchTeamPerformance();
  }, [canViewTasks]);

  const pieData = [
    { name: "To Do", value: Math.max(0, activeTasks - Math.floor(activeTasks / 2)) },
    { name: "In Progress", value: Math.floor(activeTasks / 2) },
    { name: "Completed", value: completedTasks },
  ];

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  const getActivityIcon = (action) => {
    const iconMap = {
      login: "🔐",
      logout: "↪️",
      task_created: "📋",
      task_assigned: "📋",
      task_completed: "✅",
      task_updated: "📝",
      client_created: "🏢",
      client_updated: "🏢",
      report_submitted: "📄",
      report_approved: "✅",
      leave_requested: "🏖️",
      team_member_added: "👥",
    };
    return iconMap[action] || "📄";
  };
  return (
    <div className="py-6  bg-gray-50 min-h-screen mx-28">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, Admin!
        </h1>
        <p className="text-gray-500 mt-1">
          Here's what's happening with your agency today.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-6">
        {canViewTasks && (
          <Card
            title="Active Tasks"
            value={String(activeTasks)}
            subtitle="Currently in progress"
            color="from-green-600 to-teal-600"
            icon="📝"
          />
        )}
        {canViewTasks && (
          <Card
            title="Completed"
            value={String(completedTasks)}
            subtitle="Total completed"
            color="from-orange-600 to-amber-600"
            icon="✔️"
          />
        )}
        {canViewClients && (
          <Card
            title="Clients"
            value={String(clients || 0)}
            subtitle="Total"
            color="from-blue-600 to-sky-600"
            icon="🏢"
          />
        )}
        {canViewDashboard && (
          <Card
            title="Overview"
            value={String((activeTasks || 0) + (completedTasks || 0))}
            subtitle="Tasks overall"
            color="from-purple-600 to-indigo-600"
            icon="📊"
          />
        )}
      </div>
      {canViewClients && (
        <div className="bg-white p-6 rounded-2xl shadow mb-6">
          <h2 className="font-semibold text-lg text-gray-800 mb-4">Client Growth</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={clientGrowthData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="clients" stroke="#3B82F6" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {canViewDashboard && (
        <div className="bg-white p-6 rounded-2xl shadow mb-6">
          <h2 className="font-semibold text-lg text-gray-800 mb-4">Recent Activities</h2>
          <ul className="space-y-3 text-sm text-gray-700">
            {recentActivities.map((a) => (
              <li key={a._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getActivityIcon(a.action)}</span>
                  <div>
                    <div className="text-gray-900 font-medium">{a.description}</div>
                    <div className="text-gray-500 text-xs">{formatTimeAgo(a.createdAt)}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">{a.user?.name || "System"}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {canViewTasks && (
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="font-semibold text-lg text-gray-800 mb-4">Team Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamPerformance.map((m, idx) => (
              <TeamMember key={idx} {...m} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, value, subtitle, color, icon }) {
  return (
    <div className={`p-4 rounded-2xl shadow text-white bg-gradient-to-br ${color}`}>
      <div className="text-sm font-medium">{title}</div>
      <div className="text-3xl font-bold flex items-center justify-between mt-1">
        {value} <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-xs opacity-80 mt-1">{subtitle}</div>
    </div>
  );
}

function Legend({ label, color }) {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
      <span className="text-xs text-gray-600">{label}</span>
    </div>
  );
}

function TeamMember({ name, role, progress, tasks, avatar }) {
  return (
    <div className="p-4 border rounded-xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-semibold">
          {avatar}
        </div>
        <div>
          <div className="font-medium text-gray-900">{name}</div>
          <div className="text-xs text-gray-500">{role}</div>
        </div>
      </div>
      <div className="mt-3">
        <div className="h-2 bg-gray-100 rounded">
          <div className="h-2 bg-emerald-500 rounded" style={{ width: `${progress}%` }} />
        </div>
        <div className="text-xs text-gray-500 mt-1">{tasks} tasks</div>
      </div>
    </div>
  );
}
