import { configureStore } from "@reduxjs/toolkit";
import dashboardReducer from "./dashboardSlice";
import clientsReducer from "./clientsSlice";
import tasksReducer from "./tasksSlice";
import reportsReducer from "./reportsSlice";
import attendanceReducer from "./attendanceSlice";
import leavesReducer from "./leavesSlice";
import payrollReducer from "./payrollSlice";
import notificationsReducer from "./notificationsSlice";
import leadsReducer from "./leadsSlice";

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    clients: clientsReducer,
    tasks: tasksReducer,
    reports: reportsReducer,
    attendance: attendanceReducer,
    leaves: leavesReducer,
    payroll: payrollReducer,
    leads: leadsReducer,
    notifications: notificationsReducer,
  },
});
