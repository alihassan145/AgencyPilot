import React, { useState } from "react";

const teamMembersData = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@agency.com",
    avatar: "J",
    department: "Design",
    accessLevel: "Employee",
    accessLevelColor: "bg-green-100 text-green-700",
    reportingTo: "Sarah Johnson",
    reportingToAvatar: "S",
    status: "Active",
    statusColor: "bg-green-100 text-green-700",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.johnson@agency.com",
    avatar: "S",
    department: "SEO",
    accessLevel: "Manager",
    accessLevelColor: "bg-blue-100 text-blue-700",
    reportingTo: "No manager",
    reportingToAvatar: null,
    status: "Active",
    statusColor: "bg-green-100 text-green-700",
  },
];

export default function AdminTeam() {
  const [teamMembers] = useState(teamMembersData);

  const handleEdit = (id) => {
    console.log("Edit team member:", id);
  };

  const handleReset = (id) => {
    console.log("Reset team member:", id);
  };

  const handleDelete = (id) => {
    console.log("Delete team member:", id);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">
            Manage your team members and hierarchy
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors flex items-center space-x-2">
          <span>+</span>
          <span>Add Team Member</span>
        </button>
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
              {teamMembers.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Employee Column */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        {member.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {member.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Department Column */}
                  <td className="px-6 py-4">
                    <span className="text-gray-900">{member.department}</span>
                  </td>

                  {/* Access Level Column */}
                  <td className="px-6 py-4">
                    <span
                      className={`${member.accessLevelColor} px-3 py-1 rounded-full text-xs font-medium`}
                    >
                      {member.accessLevel}
                    </span>
                  </td>

                  {/* Reporting To Column */}
                  <td className="px-6 py-4">
                    {member.reportingToAvatar ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-sm">
                          {member.reportingToAvatar}
                        </div>
                        <span className="text-gray-900">
                          {member.reportingTo}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500">
                        {member.reportingTo}
                      </span>
                    )}
                  </td>

                  {/* Status Column */}
                  <td className="px-6 py-4">
                    <span
                      className={`${member.statusColor} px-3 py-1 rounded-full text-xs font-medium`}
                    >
                      {member.status}
                    </span>
                  </td>

                  {/* Actions Column */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleEdit(member.id)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                      >
                        <span>✏️</span>
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleReset(member.id)}
                        className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 px-2 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                      >
                        <span>🔑</span>
                        <span>Reset</span>
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                      >
                        <span>🗑️</span>
                        <span>Delete</span>
                      </button>
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
