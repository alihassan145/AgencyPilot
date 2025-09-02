import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markAllRead,
  markSingleRead,
  createNotification,
  updateNotification,
} from "../../store/notificationsSlice";
import { usePermissions } from "../../hooks/usePermissions";

export default function ManagerNotifications() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.notifications);
  const { canCreateNotification, canEditNotification } = usePermissions();
  
  const [showModal, setShowModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [formData, setFormData] = useState({ title: '', message: '', priority: 'medium' });

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleCreate = () => {
    setEditingNotification(null);
    setFormData({ title: '', message: '', priority: 'medium' });
    setShowModal(true);
  };

  const handleEdit = (notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
      priority: notification.priority || 'medium'
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingNotification) {
      dispatch(updateNotification({ id: editingNotification._id, ...formData }));
    } else {
      dispatch(createNotification(formData));
    }
    setShowModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Team Notifications</h2>
          <div className="flex space-x-3">
            {canCreateNotification() && (
              <button
                onClick={handleCreate}
                className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Create
              </button>
            )}
            <button
              onClick={() => dispatch(markAllRead())}
              className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Mark all read
            </button>
          </div>
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
                <div className="flex-1">
                  <div className="text-sm text-gray-500">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                  <div className="font-semibold text-gray-900">{n.title}</div>
                  <div className="text-sm text-gray-700">{n.message}</div>
                  {n.priority && (
                    <span className={`text-xs px-2 py-1 rounded mt-2 inline-block ${
                      n.priority === 'high' ? 'bg-red-100 text-red-800' :
                      n.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {n.priority}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {!n.read && (
                    <>
                      <span className="text-xs text-indigo-700 bg-indigo-100 px-2 py-1 rounded">
                        New
                      </span>
                      <button
                        onClick={() => dispatch(markSingleRead(n._id))}
                        className="text-xs text-gray-600 hover:text-indigo-600"
                      >
                        Mark read
                      </button>
                    </>
                  )}
                  {canEditNotification() && (
                    <button
                      onClick={() => handleEdit(n)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* Modal for Create/Edit */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">
                {editingNotification ? 'Edit Notification' : 'Create Notification'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md h-24"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingNotification ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
