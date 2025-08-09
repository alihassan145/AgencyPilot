import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/client";

export const fetchClients = createAsyncThunk("clients/fetchAll", async () => {
  const { data } = await api.get("/clients");
  return data || [];
});

export const createClient = createAsyncThunk(
  "clients/create",
  async (payload) => {
    const { data } = await api.post("/clients", payload);
    return data;
  }
);

export const updateClient = createAsyncThunk(
  "clients/update",
  async ({ id, updates }) => {
    const { data } = await api.patch(`/clients/${id}`, updates);
    return data;
  }
);

export const deleteClient = createAsyncThunk("clients/delete", async (id) => {
  await api.delete(`/clients/${id}`);
  return id;
});

const clientsSlice = createSlice({
  name: "clients",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to load clients";
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        const idx = state.items.findIndex((c) => c._id === action.payload._id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c._id !== action.payload);
      });
  },
});

export default clientsSlice.reducer;
