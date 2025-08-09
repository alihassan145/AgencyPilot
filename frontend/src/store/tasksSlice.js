import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/client";

export const fetchTasks = createAsyncThunk(
  "tasks/fetchAll",
  async (params = {}) => {
    const { data } = await api.get("/tasks", { params });
    return data || [];
  }
);

export const createTask = createAsyncThunk("tasks/create", async (payload) => {
  const { data } = await api.post("/tasks", payload);
  return data;
});

export const updateTask = createAsyncThunk(
  "tasks/update",
  async ({ id, updates }) => {
    const { data } = await api.patch(`/tasks/${id}`, updates);
    return data;
  }
);

export const deleteTask = createAsyncThunk("tasks/delete", async (id) => {
  await api.delete(`/tasks/${id}`);
  return id;
});

const tasksSlice = createSlice({
  name: "tasks",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to load tasks";
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t._id === action.payload._id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t._id !== action.payload);
      });
  },
});

export default tasksSlice.reducer;
