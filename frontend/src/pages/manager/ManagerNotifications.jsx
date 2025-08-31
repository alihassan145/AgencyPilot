import React from "react";
import EmployeeNotifications from "../employee/EmployeeNotifications";

export default function ManagerNotifications() {
  // Reuse notifications UI; backend scopes to manager/team
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <EmployeeNotifications />
    </div>
  );
}
