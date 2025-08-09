import React from "react";
import EmployeeReports from "../employee/EmployeeReports";

export default function ManagerReports() {
  // Manager can submit own reports too; approvals handled in admin view
  return <EmployeeReports />;
}
