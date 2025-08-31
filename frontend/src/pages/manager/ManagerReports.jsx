import React from "react";
import EmployeeReports from "../employee/EmployeeReports";

export default function ManagerReports() {
  // Manager can submit own reports too; approvals handled in admin view
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <EmployeeReports />
    </div>
  );
}
