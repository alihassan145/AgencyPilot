import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchManagerStats } from "../../store/dashboardSlice";

export default function ManagerDashboard() {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((s) => s.dashboard);

  useEffect(() => {
    dispatch(fetchManagerStats());
  }, [dispatch]);

  const pie = [
    {
      name: "To Do",
      value: Math.max(0, stats.activeTasks - Math.floor(stats.activeTasks / 2)),
    },
    { name: "In Progress", value: Math.floor(stats.activeTasks / 2) },
    { name: "Completed", value: stats.completedTasks },
  ];

  return (
    <div className="py-6 space-y-8 bg-gray-50 min-h-screen mx-24">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, Manager!
        </h1>
        <p className="text-gray-500 mt-1">Team overview and activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          title="Active Tasks"
          value={String(stats.activeTasks)}
          subtitle="Team in progress"
          color="from-green-600 to-teal-600"
          icon="📝"
        />
        <Card
          title="Completed"
          value={String(stats.completedTasks)}
          subtitle="This scope"
          color="from-orange-600 to-amber-600"
          icon="✔️"
        />
        <Card
          title="Present Today"
          value={String(stats.presentToday)}
          subtitle="Team attendance"
          color="from-blue-600 to-sky-600"
          icon="🕒"
        />
        <Card
          title="Clients (team)"
          value={"-"}
          subtitle="Scoped"
          color="from-purple-600 to-indigo-600"
          icon="🏢"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="font-semibold text-lg text-gray-800 mb-4">
            Task Progress
          </h2>
          <div className="flex items-center gap-4">
            {pie.map((p) => (
              <Legend
                key={p.name}
                label={`${p.name}: ${p.value}`}
                color="#6366F1"
              />
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="font-semibold text-lg text-gray-800 mb-4">
            Recent Activity
          </h2>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-center">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 text-sm">📋</span>
              </div>
              <div>
                <span className="text-gray-900">Team task updates</span>
                <div className="text-gray-400 text-xs">Live</div>
              </div>
            </li>
          </ul>
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
