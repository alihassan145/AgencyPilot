import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/client";

export const fetchReports = createAsyncThunk(
  "reports/fetchAll",
  async (params = {}) => {
    const { data } = await api.get("/reports", { params });
    return data || [];
  }
);

export const submitReport = createAsyncThunk(
  "reports/submit",
  async (payload) => {
    const { data } = await api.post("/reports", payload);
    return data;
  }
);

export const approveReport = createAsyncThunk("reports/approve", async (id) => {
  const { data } = await api.post(`/reports/${id}/approve`);
  return data;
});

export const rejectReport = createAsyncThunk(
  "reports/reject",
  async ({ id, reason }) => {
    const { data } = await api.post(`/reports/${id}/reject`, { reason });
    return data;
  }
);

const reportsSlice = createSlice({
  name: "reports",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to load reports";
      })
      .addCase(submitReport.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(approveReport.fulfilled, (state, action) => {
        const idx = state.items.findIndex((r) => r._id === action.payload._id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(rejectReport.fulfilled, (state, action) => {
        const idx = state.items.findIndex((r) => r._id === action.payload._id);
        if (idx >= 0) state.items[idx] = action.payload;
      });
  },
});

export default reportsSlice.reducer;
