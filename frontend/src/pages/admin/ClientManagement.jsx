import React, { useState } from "react";

const clientsData = [
  {
    company: "TechCorp Inc.",
    email: "john@techcorp.com",
    contact: "John Doe",
    description:
      "Complete digital marketing services including SEO, SEM, and social media",
    status: "Active",
  },
  {
    company: "HealthPlus Medical",
    email: "sarah@healthplus.com",
    contact: "Dr. Sarah Wilson",
    description:
      "Advanced SEO optimization and content marketing for medical services",
    status: "Active",
  },
];

export default function ClientManagement() {
  const [clients] = useState(clientsData);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [bulkSelect, setBulkSelect] = useState(false);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Client Management
          </h1>
          <p className="text-gray-600">Manage your client relationships</p>
        </div>
        <div className="space-x-2">
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors">
            Export
          </button>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors">
            + Add New Client
          </button>
        </div>
      </div>

      {/* Search and Filter Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Clients
            </label>
            <input
              type="text"
              placeholder="Search by name, email, or company"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Description
            </label>
            <input
              type="text"
              placeholder="Search in descriptions..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-medium transition-colors">
              Clear
            </button>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="bulk"
                checked={bulkSelect}
                onChange={(e) => setBulkSelect(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="bulk"
                className="text-sm font-medium text-gray-700"
              >
                Bulk
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead className="bg-gray-50">
            <tr className="text-gray-500 text-sm">
              <th className="pl-4 py-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </th>
              <th className="py-3 uppercase tracking-wide font-medium">
                Company
              </th>
              <th className="py-3 uppercase tracking-wide font-medium">
                Contact
              </th>
              <th className="py-3 uppercase tracking-wide font-medium">
                Description
              </th>
              <th className="py-3 uppercase tracking-wide font-medium">
                Status
              </th>
              <th className="py-3 uppercase tracking-wide font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client, idx) => (
              <tr
                key={idx}
                className="bg-white rounded-lg shadow-sm text-sm align-top hover:bg-gray-50 transition-colors"
              >
                <td className="pl-4 py-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </td>
                <td className="py-3">
                  <div className="font-medium text-gray-900">
                    {client.company}
                  </div>
                  <div className="text-gray-500 text-sm">{client.email}</div>
                </td>
                <td className="py-3 text-gray-700">{client.contact}</td>
                <td className="py-3 max-w-sm truncate text-gray-700">
                  {client.description}
                </td>
                <td className="py-3">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                    {client.status}
                  </span>
                </td>
                <td className="py-3 space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded text-sm font-medium transition-colors">
                    ✏️ Edit
                  </button>
                  <button className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded text-sm font-medium transition-colors">
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
