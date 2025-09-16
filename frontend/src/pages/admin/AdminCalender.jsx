import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks } from "../../store/tasksSlice";
import api from "../../api/client";
import { usePermissions } from "../../hooks/usePermissions";

const PRIORITY_COLOR = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
};

export default function AdminCalendar() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.tasks);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Get permissions for calendar operations using generic hasPerm function
  const { hasPerm } = usePermissions();
  const canViewCalendar = hasPerm('calendar-view');
  const canAddEvents = hasPerm('calendar-add');
  const canEditEvents = hasPerm('calendar-edit');
  const canDeleteEvents = hasPerm('calendar-delete');
  const canExportCalendar = hasPerm('calendar-export');


  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedClient, setSelectedClient] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [fromDate, setFromDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .substring(0, 10)
  );
  const [toDate, setToDate] = useState(
    new Date(today.getFullYear(), today.getMonth() + 1, 0)
      .toISOString()
      .substring(0, 10)
  );
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskPopup, setShowTaskPopup] = useState(false);

  useEffect(() => {
    if (!canViewCalendar) return;
    (async () => {
      try {
        const [clientsRes, usersRes] = await Promise.all([
          api.get("/clients"),
          api.get("/users"), // admin
        ]);
        setClients(clientsRes.data || []);
        setUsers(usersRes.data || []);
      } catch {}
    })();
  }, [canViewCalendar]);

  useEffect(() => {
    if (!canViewCalendar) return;
    const params = {
      from: fromDate,
      to: toDate,
    };
    if (selectedClient !== "all") params.client = selectedClient;
    if (selectedEmployee !== "all") params.employee = selectedEmployee;
    dispatch(fetchTasks(params));
  }, [dispatch, fromDate, toDate, selectedClient, selectedEmployee, canViewCalendar]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const getTasksForDate = (date) => {
    const dateString = date.toISOString().split("T")[0];
    return items.filter(
      (task) => task.dueDate && task.dueDate.substring(0, 10) === dateString
    );
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isSelectedDate = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const days = getDaysInMonth(currentDate);

  // Gate UI after all hooks to keep Hooks order consistent
  if (!canViewCalendar) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to view the calendar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Calendar</h1>
          <p className="text-gray-600">View and manage tasks by date</p>
        </div>
        <div className="space-x-2">
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors flex items-center space-x-2"
          >
            <span>📅</span>
            <span>Today</span>
          </button>
          {canAddEvents && (
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors flex items-center space-x-2">
              <span>+</span>
              <span>Add Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
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
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.companyName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Employee
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Employees</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="absolute right-3 top-2.5">📅</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="absolute right-3 top-2.5">📅</span>
            </div>
          </div>
          <div>
            <button className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors flex items-center justify-center space-x-2">
              <span>✕</span>
              <span>Clear Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPreviousMonth}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            ← Previous
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {getMonthName(currentDate)}
          </h2>
          <button
            onClick={goToNextMonth}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            Next →
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day Headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-gray-500"
            >
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {days.map((date, index) => {
            const tasks = getTasksForDate(date);
            const isCurrentMonthDay = isCurrentMonth(date);
            const isSelected = isSelectedDate(date);

            return (
              <div
                key={index}
                onClick={() => setSelectedDate(date)}
                className={`min-h-[100px] p-2 border border-gray-200 cursor-pointer transition-colors ${
                  isCurrentMonthDay ? "bg-white" : "bg-gray-50"
                } ${isSelected ? "ring-2 ring-blue-500" : ""} ${
                  !isCurrentMonthDay ? "text-gray-400" : "text-gray-900"
                }`}
              >
                <div className="text-sm font-medium mb-1">{date.getDate()}</div>
                <div className="space-y-1">
                  {tasks.map((task) => (
                    <div
                      key={task._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTask(task);
                        setShowTaskPopup(true);
                      }}
                      className={`bg-yellow-100 p-1 rounded text-xs flex items-center space-x-1 cursor-pointer hover:bg-yellow-200 transition-colors`}
                    >
                      <div
                        className={`w-2 h-2 ${
                          PRIORITY_COLOR[task.priority] || "bg-gray-400"
                        } rounded-full`}
                      ></div>
                      <span className="truncate">{task.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Details Popup */}
      {showTaskPopup && selectedTask && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Task Details
                </h3>
                <button
                  onClick={() => {
                    setShowTaskPopup(false);
                    setSelectedTask(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <p className="text-gray-900">{selectedTask.title}</p>
                </div>
                
                {selectedTask.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <p className="text-gray-900">{selectedTask.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 ${
                          PRIORITY_COLOR[selectedTask.priority] || "bg-gray-400"
                        } rounded-full`}
                      ></div>
                      <span className="capitalize text-gray-900">
                        {selectedTask.priority}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <span className="capitalize text-gray-900">
                      {selectedTask.status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                {selectedTask.dueDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <p className="text-gray-900">
                      {new Date(selectedTask.dueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                
                {selectedTask.assignedTo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned To
                    </label>
                    <p className="text-gray-900">
                      {selectedTask.assignedTo.name || selectedTask.assignedTo}
                    </p>
                  </div>
                )}
                
                {selectedTask.client && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client
                    </label>
                    <p className="text-gray-900">
                      {selectedTask.client.companyName || selectedTask.client}
                    </p>
                  </div>
                )}
                
                {selectedTask.completedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Completed At
                    </label>
                    <p className="text-gray-900">
                      {new Date(selectedTask.completedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowTaskPopup(false);
                    setSelectedTask(null);
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
