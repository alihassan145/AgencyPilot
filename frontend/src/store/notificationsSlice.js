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

export const markSingleRead = createAsyncThunk(
  "notifications/markSingleRead",
  async (notificationId) => {
    await api.post(`/notifications/${notificationId}/mark-read`);
    return notificationId;
  }
);

export const createNotification = createAsyncThunk(
  "notifications/create",
  async (notificationData) => {
    const { data } = await api.post("/notifications", notificationData);
    return data;
  }
);

export const updateNotification = createAsyncThunk(
  "notifications/update",
  async ({ id, ...updateData }) => {
    const { data } = await api.put(`/notifications/${id}`, updateData);
    return data;
  }
);

export const deleteNotification = createAsyncThunk(
  "notifications/delete",
  async (notificationId) => {
    await api.delete(`/notifications/${notificationId}`);
    return notificationId;
  }
);

export const exportNotifications = createAsyncThunk(
  "notifications/export",
  async () => {
    const response = await api.get("/notifications/export", {
      responseType: 'blob'
    });
    return response.data;
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: { items: [], loading: false, error: null, exporting: false },
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
      })
      .addCase(markSingleRead.fulfilled, (state, action) => {
        state.items = state.items.map((n) =>
          n._id === action.payload ? { ...n, read: true } : n
        );
      })
      .addCase(createNotification.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateNotification.fulfilled, (state, action) => {
        state.items = state.items.map((n) =>
          n._id === action.payload._id ? action.payload : n
        );
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.items = state.items.filter((n) => n._id !== action.payload);
      })
      .addCase(exportNotifications.pending, (state) => {
        state.exporting = true;
      })
      .addCase(exportNotifications.fulfilled, (state) => {
        state.exporting = false;
      })
      .addCase(exportNotifications.rejected, (state, action) => {
        state.exporting = false;
        state.error = action.error?.message || "Export failed";
      });
  },
});

export default notificationsSlice.reducer;
