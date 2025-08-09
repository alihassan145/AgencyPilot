import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/client";

export const fetchLeaves = createAsyncThunk(
  "leaves/fetchAll",
  async (params = {}) => {
    const { data } = await api.get("/leaves", { params });
    return data || [];
  }
);

export const decideLeave = createAsyncThunk(
  "leaves/decide",
  async ({ id, action, reason }) => {
    const { data } = await api.post(`/leaves/${id}/decide`, { action, reason });
    return data;
  }
);

export const createLeave = createAsyncThunk(
  "leaves/create",
  async (payload) => {
    const { data } = await api.post(`/leaves`, payload);
    return data;
  }
);

const leavesSlice = createSlice({
  name: "leaves",
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaves.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaves.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to load leaves";
      })
      .addCase(createLeave.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(decideLeave.fulfilled, (state, action) => {
        const idx = state.items.findIndex((l) => l._id === action.payload._id);
        if (idx >= 0) state.items[idx] = action.payload;
      });
  },
});

export default leavesSlice.reducer;
