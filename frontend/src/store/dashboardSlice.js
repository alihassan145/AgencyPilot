import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/client";

export const fetchAdminStats = createAsyncThunk(
  "dashboard/fetchAdminStats",
  async () => {
    const [clientsRes, tasksRes] = await Promise.all([
      api.get("/clients"),
      api.get("/tasks"),
    ]);
    const clients = clientsRes.data || [];
    const tasks = tasksRes.data || [];
    const activeTasks = tasks.filter((t) => t.status !== "done").length;
    const completedTasks = tasks.filter((t) => t.status === "done").length;
    return { clients: clients.length, activeTasks, completedTasks };
  }
);

export const fetchManagerStats = createAsyncThunk(
  "dashboard/fetchManagerStats",
  async () => {
    const [tasksRes, attendanceRes] = await Promise.all([
      api.get("/tasks"),
      api.get("/attendance"),
    ]);
    const tasks = tasksRes.data || [];
    const activeTasks = tasks.filter((t) => t.status !== "done").length;
    const completedTasks = tasks.filter((t) => t.status === "done").length;

    const attendance = attendanceRes.data || [];
    const todayKey = new Date().toISOString().substring(0, 10);
    const presentToday = attendance.filter((a) => {
      const d = a.date ? a.date.substring(0, 10) : null;
      return d === todayKey && Boolean(a.checkIn);
    }).length;

    return { clients: 0, activeTasks, completedTasks, presentToday };
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    stats: { clients: 0, activeTasks: 0, completedTasks: 0, presentToday: 0 },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to load";
      })
      .addCase(fetchManagerStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagerStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchManagerStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to load";
      });
  },
});

export default dashboardSlice.reducer;
