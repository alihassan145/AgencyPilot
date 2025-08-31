import React from "react";
import EmployeeCalendar from "../employee/EmployeeCalendar";

export default function ManagerCalendar() {
  // Reuse the same calendar UI; backend will scope to manager team
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <EmployeeCalendar />
    </div>
  );
}
