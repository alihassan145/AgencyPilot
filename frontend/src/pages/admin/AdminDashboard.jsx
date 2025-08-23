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

const COLORS = ["#3B82F6", "#FACC15", "#10B981"];

function useAdminStats() {
  const dispatch = useDispatch();
  const { stats } = useSelector((s) => s.dashboard);
  useEffect(() => {
    dispatch(fetchAdminStats());
  }, [dispatch]);
  return stats;
}

export default function AdminDashboard() {
  const { clients, activeTasks, completedTasks } = useAdminStats();
  const [clientGrowthData, setClientGrowthData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [teamPerformance, setTeamPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch client growth data
  useEffect(() => {
    const fetchClientGrowthData = async () => {
      try {
        const { data } = await api.get('/clients');
        const clients = data || [];
        
        // Group clients by month for the last 6 months
        const monthlyData = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Initialize last 6 months with 0 clients
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthName = months[date.getMonth()];
          monthlyData[monthName] = 0;
        }
        
        // Count clients by creation month
        clients.forEach(client => {
          if (client.createdAt) {
            const clientDate = new Date(client.createdAt);
            const monthName = months[clientDate.getMonth()];
            if (monthlyData.hasOwnProperty(monthName)) {
              monthlyData[monthName]++;
            }
          }
        });
        
        // Convert to chart format
        const chartData = Object.entries(monthlyData).map(([name, clients]) => ({
          name,
          clients
        }));
        
        setClientGrowthData(chartData);
      } catch (error) {
        console.error('Error fetching client growth data:', error);
        // Fallback to dummy data
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
  }, []);

  // Fetch recent activities
  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        const { data } = await api.get('/recent-activities?limit=4');
        setRecentActivities(data.data || []);
      } catch (error) {
        console.error('Error fetching recent activities:', error);
        // Fallback to dummy data
        setRecentActivities([
          {
            _id: '1',
            action: 'logout',
            description: 'Admin User logged out',
            createdAt: new Date().toISOString(),
            user: { name: 'Admin User' }
          },
          {
            _id: '2',
            action: 'task_assigned',
            description: 'New task assigned to John Smith',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            user: { name: 'Admin User' }
          },
          {
            _id: '3',
            action: 'task_completed',
            description: 'Website redesign completed',
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            user: { name: 'John Smith' }
          },
          {
            _id: '4',
            action: 'client_created',
            description: 'New client TechCorp Inc. added',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            user: { name: 'Admin User' }
          }
        ]);
      }
    };

    fetchRecentActivities();
  }, []);

  // Fetch team performance data
  useEffect(() => {
    const fetchTeamPerformance = async () => {
      try {
        const { data } = await api.get('/users');
        const users = data || [];
        const { data: tasksData } = await api.get('/tasks');
        const tasks = tasksData || [];
        
        // Calculate performance for each team member
        const performanceData = users
          .filter(user => user.role !== 'admin')
          .map(user => {
            const userTasks = tasks.filter(task => task.assignee?._id === user._id);
            const completedTasks = userTasks.filter(task => task.status === 'completed');
            const progress = userTasks.length > 0 ? Math.round((completedTasks.length / userTasks.length) * 100) : 0;
            
            return {
              name: user.name,
              role: user.department || 'General',
              progress,
              tasks: `${completedTasks.length}/${userTasks.length}`,
              avatar: user.name.charAt(0).toUpperCase()
            };
          });
        
        setTeamPerformance(performanceData);
      } catch (error) {
        console.error('Error fetching team performance:', error);
        // Fallback to dummy data
        setTeamPerformance([
          {
            name: "John Smith",
            role: "Design",
            progress: 0,
            tasks: "0/1",
            avatar: "J"
          },
          {
            name: "Sarah Johnson",
            role: "SEO",
            progress: 0,
            tasks: "0/1",
            avatar: "S"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamPerformance();
  }, []);

  const pieData = [
    {
      name: "To Do",
      value: Math.max(0, activeTasks - Math.floor(activeTasks / 2)),
    },
    { name: "In Progress", value: Math.floor(activeTasks / 2) },
    { name: "Completed", value: completedTasks },
  ];

  // Helper function to format time ago
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  // Helper function to get activity icon
  const getActivityIcon = (action) => {
    const iconMap = {
      login: '🔐',
      logout: '↪️',
      task_created: '📋',
      task_assigned: '📋',
      task_completed: '✅',
      task_updated: '📝',
      client_created: '🏢',
      client_updated: '🏢',
      report_submitted: '📄',
      report_approved: '✅',
      leave_requested: '🏖️',
      team_member_added: '👥'
    };
    return iconMap[action] || '📄';
  };
  return (
    <div className="py-6 space-y-8 bg-gray-50 min-h-screen mx-24">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, Admin!
        </h1>
        <p className="text-gray-500 mt-1">
          Here's what's happening with your agency today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          title="Total Clients"
          value={String(clients)}
          subtitle="Active clients"
          color="from-purple-600 to-indigo-600"
          icon="🏢"
        />
        <Card
          title="Active Tasks"
          value={String(activeTasks)}
          subtitle="In progress"
          color="from-green-600 to-teal-600"
          icon="📝"
        />
        <Card
          title="Team Members"
          value="2"
          subtitle="Total employees"
          color="from-blue-600 to-sky-600"
          icon="👥"
        />
        <Card
          title="Completed"
          value={String(completedTasks)}
          subtitle="All time"
          color="from-orange-600 to-amber-600"
          icon="✔️"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="font-semibold text-lg text-gray-800 mb-4">
            Task Progress Overview
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" outerRadius={70}>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-6 mt-4">
            <Legend label="To Do" color={COLORS[0]} />
            <Legend label="In Progress" color={COLORS[1]} />
            <Legend label="Completed" color={COLORS[2]} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="font-semibold text-lg text-gray-800 mb-4">
            Recent Activity
          </h2>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ul className="space-y-3 text-sm text-gray-700">
              {recentActivities.map((activity) => (
                <li key={activity._id} className="flex items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-gray-600 text-sm">{getActivityIcon(activity.action)}</span>
                  </div>
                  <div>
                    <span className="text-gray-900">{activity.description}</span>
                    <div className="text-gray-400 text-xs">{formatTimeAgo(activity.createdAt)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="font-semibold text-lg text-gray-800 mb-4">
            Client Growth
          </h2>
          {loading ? (
            <div className="flex items-center justify-center h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={clientGrowthData}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="clients"
                  stroke="#6366F1"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="font-semibold text-lg text-gray-800 mb-4">
            Team Performance
          </h2>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {teamPerformance.map((member) => (
                <TeamMember
                  key={member.name}
                  name={member.name}
                  role={member.role}
                  progress={member.progress}
                  tasks={member.tasks}
                  avatar={member.avatar}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, subtitle, color, icon }) {
  return (
    <div
      className={`p-4 rounded-2xl shadow text-white bg-gradient-to-br ${color}`}
    >
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
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
      ></div>
      <span className="text-xs text-gray-600">{label}</span>
    </div>
  );
}

function TeamMember({ name, role, progress, tasks, avatar }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
          {avatar}
        </div>
        <div>
          <div className="font-semibold text-sm text-gray-900">{name}</div>
          <div className="text-xs text-gray-500">{role}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm text-gray-900 font-semibold">{progress}%</div>
        <div className="text-xs text-gray-500">{tasks} tasks</div>
      </div>
    </div>
  );
}
