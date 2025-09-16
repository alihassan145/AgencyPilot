import React, { useState, useEffect } from "react";
import api from "../../api/client";
import { usePermissions } from "../../hooks/usePermissions";

export default function AdminTeam() {
  const { hasPerm } = usePermissions();
  
  // Permission checks for team operations
  const canViewTeam = hasPerm('team-view');
  const canAddTeam = hasPerm('team-add');
  const canEditTeam = hasPerm('team-edit');
  const canDeleteTeam = hasPerm('team-delete');
  const canExportTeam = hasPerm('team-export');
  
  const [teamMembers, setTeamMembers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [notification, setNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    accessLevel: "Employee",
    reportingTo: [], // allow multiple managers/admins
    status: "Active",
  });

  // Fetch team members and managers on component mount
  useEffect(() => {
    if (!canViewTeam) return;
    fetchTeamMembers();
    fetchManagers();
    fetchDepartments();
  }, [canViewTeam]);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users");
      setTeamMembers(response.data || []);
    } catch (error) {
      console.error("Error fetching team members:", error);
      // Fallback to empty array if API fails
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await api.get("/users");
      const users = response.data || [];
      // Filter users who can be managers (admin or manager role)
      const availableManagers = users.filter(
        (user) => user.role === "admin" || user.role === "manager"
      );
      setManagers(availableManagers);
    } catch (error) {
      console.error("Error fetching managers:", error);
      setManagers([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get("/departments");
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setForm({
      name: member.name || "",
      email: member.email || "",
      department: member.department || "",
      accessLevel: member.accessLevel || "Employee",
      reportingTo:
        member.reportingManagers && member.reportingManagers.length > 0
          ? member.reportingManagers.map((m) =>
              typeof m === "object" ? m._id : m
            )
          : [],
      status: member.status || "Active",
    });
    setShowModal(true);
  };

  const handleReset = async (id) => {
    setConfirmDialog({
      title: "Reset Password",
      message: "Are you sure you want to reset this team member's password?",
      onConfirm: async () => {
        try {
          await api.post(`/users/${id}/reset-password`, {
            userId: id,
            newPassword: "defaultPassword123",
          });
          setNotification({
            type: "success",
            message:
              "Password reset successfully! New password: defaultPassword123",
          });
        } catch (error) {
          console.error("Error resetting password:", error);
          setNotification({
            type: "error",
            message: "Failed to reset password. Please try again.",
          });
        }
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null),
    });
  };

  const handleDelete = async (id) => {
    setConfirmDialog({
      title: "Delete Team Member",
      message:
        "Are you sure you want to delete this team member? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await api.delete(`/users/${id}`);
          await fetchTeamMembers(); // Refresh the list
          setNotification({
            type: "success",
            message: "Team member deleted successfully!",
          });
        } catch (error) {
          console.error("Error deleting team member:", error);
          setNotification({
            type: "error",
            message: "Failed to delete team member. Please try again.",
          });
        }
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        ...form,
        reportingManagers:
          form.reportingTo && form.reportingTo.length > 0
            ? form.reportingTo
            : [],
      };
      delete formData.reportingTo; // Remove the old field

      if (editingMember) {
        // Update existing member
        await api.patch(`/users/${editingMember._id}`, formData);
        setNotification({
          type: "success",
          message: "Team member updated successfully!",
        });
      } else {
        // Create new member
        await api.post("/users", formData);
        setNotification({
          type: "success",
          message: "Team member created successfully!",
        });
      }
      await fetchTeamMembers(); // Refresh the list
      setShowModal(false);
      setEditingMember(null);
      setForm({
        name: "",
        email: "",
        department: "",
        accessLevel: "Employee",
        reportingTo: "",
        status: "Active",
      });
    } catch (error) {
      console.error("Error saving team member:", error);
      setNotification({
        type: "error",
        message: "Failed to save team member. Please try again.",
      });
    }
  };

  const getAccessLevelColor = (level) => {
    switch (level) {
      case "Manager":
        return "bg-blue-100 text-blue-700";
      case "Admin":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-green-100 text-green-700";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Inactive":
        return "bg-red-100 text-red-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-green-100 text-green-700";
    }
  };

  const getInitials = (name) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "?";
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">
            Manage your team members and hierarchy
          </p>
        </div>
        {canAddTeam && (
          <button
            onClick={() => {
              setEditingMember(null);
              setForm({
                name: "",
                email: "",
                department: "",
                accessLevel: "Employee",
                reportingTo: "",
                status: "Active",
              });
              setShowModal(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors flex items-center space-x-2"
          >
            <span>+</span>
            <span>Add Team Member</span>
          </button>
        )}
      </div>

      {/* Team Members Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm font-medium text-gray-500 uppercase tracking-wide">
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Access Level</th>
                <th className="px-6 py-3">Reporting To</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Loading team members...
                  </td>
                </tr>
              ) : teamMembers.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No team members found. Add your first team member to get
                    started.
                  </td>
                </tr>
              ) : (
                teamMembers.map((member) => (
                  <tr
                    key={member._id || member.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Employee Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                          {getInitials(member.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {member.name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member.email || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department Column */}
                    <td className="px-6 py-4">
                      <span className="text-gray-900">
                        {member.department?.name || "N/A"}
                      </span>
                    </td>

                    {/* Access Level Column */}
                    <td className="px-6 py-4">
                      <span
                        className={`${getAccessLevelColor(
                          member.accessLevel
                        )} px-3 py-1 rounded-full text-xs font-medium`}
                      >
                        {member.accessLevel || "Employee"}
                      </span>
                    </td>

                    {/* Reporting To Column */}
                    <td className="px-6 py-4">
                      <span className="text-gray-900">
                        {member.reportingManagers &&
                        member.reportingManagers.length > 0
                          ? typeof member.reportingManagers[0] === "object"
                            ? member.reportingManagers[0].name
                            : "Manager ID: " + member.reportingManagers[0]
                          : "No manager"}
                      </span>
                    </td>

                    {/* Status Column */}
                    <td className="px-6 py-4">
                      <span
                        className={`${getStatusColor(
                          member.status
                        )} px-3 py-1 rounded-full text-xs font-medium`}
                      >
                        {member.status || "Active"}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {canEditTeam && (
                          <button
                            onClick={() => handleEdit(member)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                          >
                            <span>✏️</span>
                            <span>Edit</span>
                          </button>
                        )}
                        {canEditTeam && (
                          <button
                            onClick={() => handleReset(member._id || member.id)}
                            className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 px-2 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                          >
                            <span>🔑</span>
                            <span>Reset</span>
                          </button>
                        )}
                        {canDeleteTeam && (
                          <button
                            onClick={() => handleDelete(member._id || member.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                          >
                            <span>🗑️</span>
                            <span>Delete</span>
                          </button>
                        )}
                        {!canEditTeam && !canDeleteTeam && (
                          <span className="text-gray-500 text-sm italic">View Only</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add/Edit Team Member */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingMember ? "Edit Team Member" : "Add New Team Member"}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingMember(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  value={form.department}
                  onChange={(e) =>
                    setForm({ ...form, department: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Access Level
                </label>
                <select
                  value={form.accessLevel}
                  onChange={(e) =>
                    setForm({ ...form, accessLevel: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div>
                {form.accessLevel !== "Admin" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reporting To
                    </label>
                    <select
                      multiple
                      value={form.reportingTo}
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions).map(
                          (o) => o.value
                        );
                        setForm({ ...form, reportingTo: values });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                    >
                      {managers
                        .filter((m) =>
                          form.accessLevel === "Manager"
                            ? m.role === "admin"
                            : ["admin", "manager"].includes(m.role)
                        )
                        .map((manager) => (
                        <option key={manager._id} value={manager._id}>
                          {manager.name} ({manager.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div className="flex flex-wrap space-x-0 sm:space-x-3 space-y-2 sm:space-y-0 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingMember(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors w-full sm:w-auto"
                >
                  {editingMember ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Popup */}
      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`px-6 py-4 rounded-lg shadow-lg max-w-sm ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                className="ml-4 text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {confirmDialog.title}
              </h3>
              <p className="text-gray-600">{confirmDialog.message}</p>
            </div>
            <div className="flex flex-wrap space-x-0 sm:space-x-3 space-y-2 sm:space-y-0">
              <button
                onClick={confirmDialog.onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors w-full sm:w-auto"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
