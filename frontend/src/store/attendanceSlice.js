import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/client";

export const fetchAttendance = createAsyncThunk(
  "attendance/fetchAll",
  async (params = {}) => {
    const { data } = await api.get("/attendance", { params });
    return data || [];
  }
);

const attendanceSlice = createSlice({
  name: "attendance",
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to load attendance";
      });
  },
});

export default attendanceSlice.reducer;
