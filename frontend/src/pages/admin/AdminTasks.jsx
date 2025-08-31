import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTasks,
  updateTask,
  deleteTask,
  createTask,
} from "../../store/tasksSlice";
import api from "../../api/client";

export default function AdminTasks() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.tasks);
  const [selectedAssignee, setSelectedAssignee] = useState("all");
  const [selectedClient, setSelectedClient] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const initialForm = {
    title: "",
    description: "",
    assignedTo: "",
    reportingManager: "",
    client: "",
    dueDate: "",
    priority: "medium",
  };
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);
  useEffect(() => {
    (async () => {
      try {
        const [usersRes, clientsRes] = await Promise.all([
          api.get("/users", {
            /* admin only */
          }),
          api.get("/clients"),
        ]);
        setUsers(usersRes.data || []);
        setClients(clientsRes.data || []);
      } catch {}
    })();
  }, []);

  const tasks = useMemo(() => {
    // First apply filters to items
    let filteredItems = items;

    // Apply search filter
    if (searchTerm) {
      filteredItems = filteredItems.filter(
        (task) =>
          task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply assignee filter
    if (selectedAssignee !== "all") {
      filteredItems = filteredItems.filter((task) => {
        // Match by assignedTo field or user name
        const assignedUser = users.find((u) => u._id === task.assignedTo);
        return (
          assignedUser?.name
            ?.toLowerCase()
            .includes(selectedAssignee.toLowerCase()) ||
          task.assignedTo === selectedAssignee
        );
      });
    }

    // Apply client filter
    if (selectedClient !== "all") {
      filteredItems = filteredItems.filter((task) => {
        // Match by client field or client name
        const taskClient = clients.find((c) => c._id === task.client);
        return (
          taskClient?.companyName
            ?.toLowerCase()
            .includes(selectedClient.toLowerCase()) ||
          task.client === selectedClient
        );
      });
    }

    // Apply priority filter
    if (selectedPriority !== "all") {
      filteredItems = filteredItems.filter(
        (task) => task.priority === selectedPriority
      );
    }

    // Group filtered items by status
    const byStatus = { todo: [], in_progress: [], done: [] };
    filteredItems.forEach((t) => {
      byStatus[t.status]?.push(t);
    });
    return byStatus;
  }, [
    items,
    searchTerm,
    selectedAssignee,
    selectedClient,
    selectedPriority,
    users,
    clients,
  ]);

  const moveTask = (taskId, toStatus) => {
    dispatch(updateTask({ id: taskId, updates: { status: toStatus } }));
  };

  const handleDelete = (taskId) => dispatch(deleteTask(taskId));

  const handleEdit = (task) => {
    setEditingTask(task);
    setForm({
      ...initialForm,
      title: task.title || "",
      description: task.description || "",
      assignedTo: task.assignedTo?._id || task.assignedTo || "",
      reportingManager:
        task.reportingManager?._id || task.reportingManager || "",
      client: task.client?._id || task.client || "",
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
      priority: task.priority || "medium",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingTask) {
      await dispatch(updateTask({ id: editingTask._id, updates: form }));
    } else {
      await dispatch(createTask(form));
    }
    setShowModal(false);
    setEditingTask(null);
    setForm(initialForm);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedAssignee("all");
    setSelectedClient("all");
    setSelectedPriority("all");
  };

  // CSV Export utility function
  const exportToCSV = (data, filename) => {
    const csvContent = data
      .map((row) =>
        Object.values(row)
          .map((value) =>
            typeof value === "string" && value.includes(",")
              ? `"${value}"`
              : value
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    // Get all tasks from current filtered view
    const allTasks = [...tasks.todo, ...tasks.in_progress, ...tasks.done];

    if (allTasks.length === 0) {
      alert("No tasks to export");
      return;
    }

    // Prepare CSV data with headers
    const csvData = [
      [
        "Title",
        "Description",
        "Assigned To",
        "Client",
        "Priority",
        "Status",
        "Due Date",
        "Created At",
      ],
      ...allTasks.map((task) => {
        const assignedUser = users.find((u) => u._id === task.assignedTo);
        const taskClient = clients.find((c) => c._id === task.client);

        return [
          task.title || "",
          task.description || "",
          assignedUser?.name || task.assignedTo || "",
          taskClient?.companyName || task.client || "",
          task.priority || "",
          task.status || "",
          task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "",
          task.createdAt ? new Date(task.createdAt).toLocaleDateString() : "",
        ];
      }),
    ];

    const timestamp = new Date().toISOString().split("T")[0];
    exportToCSV(csvData, `tasks-export-${timestamp}.csv`);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600">Organize and track your projects.</p>
        </div>
        <div className="space-x-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors flex items-center space-x-2"
          >
            <span>⬇️</span>
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors flex items-center space-x-2"
          >
            <span>+</span>
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Tasks
            </label>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Assignee
            </label>
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Assignees</option>
              <option value="john">John Smith</option>
              <option value="sarah">Sarah Johnson</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Client
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Clients</option>
              <option value="techcorp">TechCorp Inc.</option>
              <option value="healthplus">HealthPlus Medical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Priority
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <span>✕</span>
              <span>Clear Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* To Do Column */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-900">To Do</h2>
            </div>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm font-medium">
              {tasks.todo.length}
            </span>
          </div>
          <div className="space-y-3">
            {tasks.todo.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onMoveRight={() => moveTask(task._id, "in_progress")}
                onDelete={() => handleDelete(task._id)}
                onEdit={() => handleEdit(task)}
              />
            ))}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-900">
                In Progress
              </h2>
            </div>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm font-medium">
              {tasks.in_progress.length}
            </span>
          </div>
          <div className="space-y-3">
            {tasks.in_progress.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onMoveRight={() => moveTask(task._id, "done")}
                onDelete={() => handleDelete(task._id)}
                onEdit={() => handleEdit(task)}
              />
            ))}
          </div>
        </div>

        {/* Completed Column */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-900">Completed</h2>
            </div>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm font-medium">
              {tasks.done.length}
            </span>
          </div>
          <div className="space-y-3">
            {tasks.done.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onDelete={() => handleDelete(task._id)}
                onEdit={() => handleEdit(task)}
                isCompleted={true}
              />
            ))}
          </div>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold">
              {editingTask ? "Edit Task" : "Create Task"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Text
                label="Title"
                value={form.title}
                onChange={(v) => setForm((s) => ({ ...s, title: v }))}
                required
              />
              <Text
                label="Description"
                value={form.description}
                onChange={(v) => setForm((s) => ({ ...s, description: v }))}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Assigned To"
                  value={form.assignedTo}
                  onChange={(v) => setForm((s) => ({ ...s, assignedTo: v }))}
                  options={users.map((u) => ({ label: u.name, value: u._id }))}
                  required
                />
                <Select
                  label="Reporting Manager"
                  value={form.reportingManager}
                  onChange={(v) =>
                    setForm((s) => ({ ...s, reportingManager: v }))
                  }
                  options={users.map((u) => ({ label: u.name, value: u._id }))}
                  required
                />
                <Select
                  label="Client"
                  value={form.client}
                  onChange={(v) => setForm((s) => ({ ...s, client: v }))}
                  options={clients.map((c) => ({
                    label: c.companyName,
                    value: c._id,
                  }))}
                />
                <Text
                  label="Due Date"
                  type="date"
                  value={form.dueDate}
                  onChange={(v) => setForm((s) => ({ ...s, dueDate: v }))}
                />
                <Select
                  label="Priority"
                  value={form.priority}
                  onChange={(v) => setForm((s) => ({ ...s, priority: v }))}
                  options={[
                    { label: "Low", value: "low" },
                    { label: "Medium", value: "medium" },
                    { label: "High", value: "high" },
                  ]}
                />
              </div>
              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded border w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-600 text-white w-full sm:w-auto"
                >
                  {editingTask ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({
  task,
  onMoveRight,
  onDelete,
  onEdit,
  isCompleted = false,
}) {
  return (
    <div className={`bg-white rounded-lg border p-4 shadow-sm`}>
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900">{task.title}</h3>
        <p className="text-sm text-gray-600">{task.description}</p>
        <div className="text-xs text-gray-500 space-y-1">
          <p>Assigned to: {task.assignedTo?.name || "-"}</p>
          <p>
            Due:{" "}
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
          </p>
        </div>
        <div className="flex items-center justify-between pt-2">
          <span
            className={`px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700`}
          >
            {task.priority}
          </span>
          <div className="flex space-x-2">
            {!isCompleted && onMoveRight && (
              <button
                onClick={onMoveRight}
                className="text-green-600 hover:text-green-800 hover:bg-green-50 p-1 rounded transition-colors"
                title="Move to next stage"
              >
                ➡️
              </button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 rounded transition-colors"
                title="Edit task"
              >
                ✏️
              </button>
            )}
            <button
              onClick={onDelete}
              className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors"
              title="Delete task"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Text({ label, value, onChange, type = "text", required = false }) {
  return (
    <div>
      <label className="block text-sm text-gray-700 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        required={required}
        className="w-full border rounded px-3 py-2"
      />
    </div>
  );
}

function Select({ label, value, onChange, options = [], required = false }) {
  return (
    <div>
      <label className="block text-sm text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full border rounded px-3 py-2"
      >
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
