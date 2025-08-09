import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/client";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async () => {
    const { data } = await api.get("/notifications");
    return data || [];
  }
);

export const markAllRead = createAsyncThunk(
  "notifications/markRead",
  async () => {
    await api.post("/notifications/mark-read");
    return true;
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed";
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.items = state.items.map((n) => ({ ...n, read: true }));
      });
  },
});

export default notificationsSlice.reducer;
