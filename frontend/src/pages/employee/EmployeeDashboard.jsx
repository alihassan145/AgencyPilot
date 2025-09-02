import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks } from "../../store/tasksSlice";
import { fetchAttendance } from "../../store/attendanceSlice";
import { fetchNotifications } from "../../store/notificationsSlice";
import { usePermissions } from "../../hooks/usePermissions";

export default function EmployeeDashboard() {
  const dispatch = useDispatch();
  const { items: tasks } = useSelector((s) => s.tasks);
  const { items: attendance } = useSelector((s) => s.attendance);
  const { items: notifications } = useSelector((s) => s.notifications);

  const { anyPerm } = usePermissions();
  const canViewTasks = anyPerm([
    "tasks-view-all",
    "tasks-view-team",
    "tasks-view-self",
  ]);
  const canViewAttendance = anyPerm([
    "attendance-view-all",
    "attendance-view-team",
    "attendance-view-self",
  ]);
  const canViewNotifications = anyPerm([
    "notifications-view-all",
    "notifications-view-team",
    "notifications-view-self",
  ]);

  useEffect(() => {
    if (canViewTasks) dispatch(fetchTasks());
    if (canViewAttendance) dispatch(fetchAttendance());
    if (canViewNotifications) dispatch(fetchNotifications());
  }, [dispatch, canViewTasks, canViewAttendance, canViewNotifications]);

  const {
    activeTasks,
    completedTasks,
    presentToday,
    unreadNotifications,
    nextTasks,
  } = useMemo(() => {
    const todayKey = new Date().toISOString().substring(0, 10);

    const taskItems = canViewTasks ? tasks : [];
    const active = taskItems.filter((t) => t.status !== "done");
    const completed = taskItems.filter((t) => t.status === "done");

    const attendanceItems = canViewAttendance ? attendance : [];
    const present = attendanceItems.filter(
      (a) =>
        (a.date ? a.date.substring(0, 10) : null) === todayKey &&
        Boolean(a.checkIn)
    ).length;

    const notificationItems = canViewNotifications ? notifications : [];
    const unread = notificationItems.filter((n) => !n.read).length;

    const upcoming = taskItems
      .filter((t) => t.dueDate && t.status !== "done")
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    return {
      activeTasks: active.length,
      completedTasks: completed.length,
      presentToday: present,
      unreadNotifications: unread,
      nextTasks: upcoming,
    };
  }, [tasks, attendance, notifications, canViewTasks, canViewAttendance, canViewNotifications]);

  return (
    <div className="py-6 space-y-8 bg-gray-50 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Welcome!</h1>
        <p className="text-gray-500 mt-1">Your personal overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {canViewTasks && (
          <Card
            title="My Active Tasks"
            value={String(activeTasks)}
            subtitle="In progress"
            color="from-green-600 to-teal-600"
            icon="📝"
          />
        )}
        {canViewTasks && (
          <Card
            title="Completed"
            value={String(completedTasks)}
            subtitle="All time"
            color="from-orange-600 to-amber-600"
            icon="✔️"
          />
        )}
        {canViewAttendance && (
          <Card
            title="Present Today"
            value={String(presentToday)}
            subtitle="Attendance"
            color="from-blue-600 to-sky-600"
            icon="🕒"
          />
        )}
        {canViewNotifications && (
          <Card
            title="Unread Alerts"
            value={String(unreadNotifications)}
            subtitle="Notifications"
            color="from-purple-600 to-indigo-600"
            icon="🔔"
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {canViewTasks && (
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="font-semibold text-lg text-gray-800 mb-4">Next Up</h2>
            <ul className="space-y-3 text-sm text-gray-700">
              {nextTasks.length === 0 && (
                <li className="text-gray-500">No upcoming tasks</li>
              )}
              {nextTasks.map((t) => (
                <li key={t._id} className="flex items-center justify-between">
                  <div>
                    <div className="text-gray-900 font-medium">{t.title}</div>
                    <div className="text-gray-500 text-xs">
                      Due {new Date(t.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">
                    {t.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {canViewNotifications && (
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="font-semibold text-lg text-gray-800 mb-4">
              Recent Notifications
            </h2>
            <ul className="space-y-3 text-sm text-gray-700">
              {notifications.slice(0, 5).map((n) => (
                <li key={n._id} className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-gray-500">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                    <div className="font-semibold text-gray-900">{n.title}</div>
                    <div className="text-sm text-gray-700">{n.message}</div>
                  </div>
                  {!n.read && (
                    <span className="text-xs text-indigo-700 bg-indigo-100 px-2 py-1 rounded">
                      New
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
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
