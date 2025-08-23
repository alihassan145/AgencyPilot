import React from "react";
import EmployeeCalendar from "../employee/EmployeeCalendar";

export default function ManagerCalendar() {
  // Reuse the same calendar UI; backend will scope to manager team
  return (
    <div className="mx-24">
      <EmployeeCalendar />
    </div>
  );
}
