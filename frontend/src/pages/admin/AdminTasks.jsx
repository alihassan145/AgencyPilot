import React, { useState } from "react";

const tasksData = {
  todo: [
    {
      id: 1,
      title: "Website Redesign",
      description: "Update company website with new branding",
      assignee: "John Smith",
      dueDate: "02/08/2025",
      priority: "HIGH",
      priorityColor: "bg-red-100 text-red-700",
      cardColor: "bg-red-50",
      borderColor: "border-l-red-500",
    },
  ],
  inProgress: [
    {
      id: 2,
      title: "SEO Optimization",
      description: "Improve search engine rankings",
      assignee: "Sarah Johnson",
      dueDate: "08/08/2025",
      priority: "MEDIUM",
      priorityColor: "bg-yellow-100 text-yellow-700",
      cardColor: "bg-yellow-50",
      borderColor: "border-l-yellow-500",
    },
  ],
  completed: [],
};

export default function AdminTasks() {
  const [tasks, setTasks] = useState(tasksData);
  const [selectedAssignee, setSelectedAssignee] = useState("all");
  const [selectedClient, setSelectedClient] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");

  const moveTask = (taskId, fromStatus, toStatus) => {
    const task = tasks[fromStatus].find((t) => t.id === taskId);
    if (task) {
      setTasks((prev) => ({
        ...prev,
        [fromStatus]: prev[fromStatus].filter((t) => t.id !== taskId),
        [toStatus]: [...prev[toStatus], task],
      }));
    }
  };

  const deleteTask = (taskId, status) => {
    setTasks((prev) => ({
      ...prev,
      [status]: prev[status].filter((t) => t.id !== taskId),
    }));
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600">Organize and track your projects.</p>
        </div>
        <div className="space-x-2">
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors flex items-center space-x-2">
            <span>⬇️</span>
            <span>Export</span>
          </button>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors flex items-center space-x-2">
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
            <button className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors flex items-center justify-center space-x-2">
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
                key={task.id}
                task={task}
                onMoveRight={() => moveTask(task.id, "todo", "inProgress")}
                onDelete={() => deleteTask(task.id, "todo")}
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
              {tasks.inProgress.length}
            </span>
          </div>
          <div className="space-y-3">
            {tasks.inProgress.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onMoveRight={() => moveTask(task.id, "inProgress", "completed")}
                onDelete={() => deleteTask(task.id, "inProgress")}
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
              {tasks.completed.length}
            </span>
          </div>
          <div className="space-y-3">
            {tasks.completed.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={() => deleteTask(task.id, "completed")}
                isCompleted={true}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, onMoveRight, onDelete, isCompleted = false }) {
  return (
    <div
      className={`${task.cardColor} rounded-lg border-l-4 ${task.borderColor} p-4 shadow-sm`}
    >
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900">{task.title}</h3>
        <p className="text-sm text-gray-600">{task.description}</p>
        <div className="text-xs text-gray-500 space-y-1">
          <p>Assigned to: {task.assignee}</p>
          <p>Due: {task.dueDate}</p>
        </div>
        <div className="flex items-center justify-between pt-2">
          <span
            className={`${task.priorityColor} px-2 py-1 rounded text-xs font-medium`}
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
