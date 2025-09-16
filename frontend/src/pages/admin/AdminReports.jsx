import React from "react";
import { usePermissions } from "../../hooks/usePermissions";

export default function AdminReports() {
  const { anyPerm } = usePermissions();
  const canView = anyPerm([
    "reports-view-all",
    "reports-view-team",
    "reports-view-self",
  ]);

  if (!canView) {
    return (
      <div className="py-6 space-y-4 bg-gray-50 min-h-screen max-w-5xl mx-auto px-4">
        <div className="bg-white border rounded-xl p-6 text-center">
          <div className="text-5xl mb-2">🔒</div>
          <div className="text-lg font-semibold">You do not have access to Reports.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6 bg-gray-50 min-h-screen max-w-5xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
      <div className="bg-white rounded-2xl shadow p-6 border text-gray-600">
        Coming soon.
      </div>
    </div>
  );
}