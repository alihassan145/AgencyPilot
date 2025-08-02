import React, { useState } from "react";

const reportsData = [
  {
    id: 1,
    employee: {
      name: "John Smith",
      avatar: "J",
      department: "Design",
    },
    client: "TechCorp Inc.",
    task: {
      title: "Website design mockups",
      description:
        "Created initial wireframes and design mockups for the homepage and product pages. Focused on user experience and modern design principles. Completed responsive design layouts and prepared design specifications for development team.",
    },
  },
  {
    id: 2,
    employee: {
      name: "Sarah Johnson",
      avatar: "S",
      department: "SEO",
    },
    client: "HealthPlus Medical",
    task: {
      title: "SEO keyword research",
      description:
        "Conducted comprehensive keyword research for medical services. Analyzed competitor keywords and identified high-value opportunities. Prepared keyword strategy document and content recommendations for better search visibility.",
    },
  },
  {
    id: 3,
    employee: {
      name: "John Smith",
      avatar: "J",
      department: "Design",
    },
    client: "TechCorp Inc.",
    task: {
      title: "Frontend development",
      description:
        "Implemented responsive navigation and hero section. Fixed cross-browser compatibility issues and optimized loading performance. Integrated design mockups into functional components and ensured mobile responsiveness.",
    },
  },
];

export default function AdminReports() {
  const [reports] = useState(reportsData);

  return (
    <div className="p-8 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Work Reports</h1>
          <p className="text-gray-600">Submit and view work reports</p>
        </div>
        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors flex items-center space-x-2">
          <span>+</span>
          <span>Submit Report</span>
        </button>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Reports Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-3xl font-bold text-blue-600">3</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl">📄</span>
            </div>
          </div>
        </div>

        {/* This Month Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-3xl font-bold text-green-600">2</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">📅</span>
            </div>
          </div>
        </div>

        {/* Pending Review Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pending Review
              </p>
              <p className="text-3xl font-bold text-orange-600">1</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 text-xl">⏰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Reports
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm font-medium text-gray-500 uppercase tracking-wide">
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Task</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.map((report) => (
                <tr
                  key={report.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Employee Column */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        {report.employee.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {report.employee.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {report.employee.department}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Client Column */}
                  <td className="px-6 py-4">
                    <span className="text-gray-900 font-medium">
                      {report.client}
                    </span>
                  </td>

                  {/* Task Column */}
                  <td className="px-6 py-4">
                    <div className="max-w-md">
                      <div className="font-semibold text-gray-900 mb-1">
                        {report.task.title}
                      </div>
                      <div className="text-sm text-gray-600 leading-relaxed">
                        {report.task.description.length > 150
                          ? `${report.task.description.substring(0, 150)}...`
                          : report.task.description}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
