import React from "react";
import EmployeeNotifications from "../employee/EmployeeNotifications";

export default function ManagerNotifications() {
  // Reuse notifications UI; backend scopes to manager/team
  return <EmployeeNotifications />;
}
