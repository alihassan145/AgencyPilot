import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/client";

export const fetchLeads = createAsyncThunk(
  "leads/fetchAll",
  async (params = {}) => {
    const { data } = await api.get("/leads", { params });
    return data || [];
  }
);

export const createLead = createAsyncThunk("leads/create", async (payload) => {
  const { data } = await api.post("/leads", payload);
  return data;
});

export const updateLead = createAsyncThunk(
  "leads/update",
  async ({ id, updates }) => {
    const { data } = await api.patch(`/leads/${id}`, updates);
    return data;
  }
);

export const deleteLead = createAsyncThunk("leads/delete", async (id) => {
  await api.delete(`/leads/${id}`);
  return id;
});

const leadsSlice = createSlice({
  name: "leads",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to load leads";
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        const idx = state.items.findIndex((l) => l._id === action.payload._id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.items = state.items.filter((l) => l._id !== action.payload);
      });
  },
});

export default leadsSlice.reducer;