import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markAllRead,
} from "../../store/notificationsSlice";

export default function EmployeeNotifications() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.notifications);
  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Notifications</h2>
        <button
          onClick={() => dispatch(markAllRead())}
          className="px-3 py-1 rounded bg-indigo-600 text-white"
        >
          Mark all read
        </button>
      </div>
      <div className="bg-white rounded-lg shadow divide-y">
        {loading && <div className="p-4 text-gray-500">Loading...</div>}
        {!loading &&
          items.map((n) => (
            <div
              key={n._id}
              className={`p-4 flex items-start justify-between ${
                n.read ? "bg-white" : "bg-indigo-50"
              }`}
            >
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
            </div>
          ))}
      </div>
    </div>
  );
}
