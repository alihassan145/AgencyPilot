import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminStats } from "../../store/dashboardSlice";
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

const lineData = [
  { name: "Jan", clients: 1 },
  { name: "Feb", clients: 2 },
  { name: "Mar", clients: 3 },
  { name: "Apr", clients: 4 },
  { name: "May", clients: 5 },
  { name: "Jun", clients: 1 },
];

export default function AdminDashboard() {
  const { clients, activeTasks, completedTasks } = useAdminStats();
  const pieData = [
    {
      name: "To Do",
      value: Math.max(0, activeTasks - Math.floor(activeTasks / 2)),
    },
    { name: "In Progress", value: Math.floor(activeTasks / 2) },
    { name: "Completed", value: completedTasks },
  ];
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
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-center">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-gray-600 text-sm">↪️</span>
              </div>
              <div>
                <span className="text-gray-900">Admin User logged out</span>
                <div className="text-gray-400 text-xs">Just now</div>
              </div>
            </li>
            <li className="flex items-center">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 text-sm">📋</span>
              </div>
              <div>
                <span className="text-gray-900">
                  New task assigned to John Smith
                </span>
                <div className="text-gray-400 text-xs">2 hours ago</div>
              </div>
            </li>
            <li className="flex items-center">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600 text-sm">✅</span>
              </div>
              <div>
                <span className="text-gray-900">
                  Website redesign completed
                </span>
                <div className="text-gray-400 text-xs">4 hours ago</div>
              </div>
            </li>
            <li className="flex items-center">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-purple-600 text-sm">🏢</span>
              </div>
              <div>
                <span className="text-gray-900">
                  New client TechCorp Inc. added
                </span>
                <div className="text-gray-400 text-xs">1 day ago</div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="font-semibold text-lg text-gray-800 mb-4">
            Client Growth
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData}>
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
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="font-semibold text-lg text-gray-800 mb-4">
            Team Performance
          </h2>
          <div className="space-y-4">
            <TeamMember
              name="John Smith"
              role="Design"
              progress={0}
              tasks="0/1"
              avatar="J"
            />
            <TeamMember
              name="Sarah Johnson"
              role="SEO"
              progress={0}
              tasks="0/1"
              avatar="S"
            />
          </div>
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
