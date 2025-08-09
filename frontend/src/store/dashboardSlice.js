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

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    stats: { clients: 0, activeTasks: 0, completedTasks: 0 },
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
      });
  },
});

export default dashboardSlice.reducer;
