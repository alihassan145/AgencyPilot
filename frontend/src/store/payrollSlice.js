import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/client";

export const fetchPayrollConfig = createAsyncThunk(
  "payroll/fetchConfig",
  async () => {
    const { data } = await api.get("/payroll/config");
    return data || {};
  }
);

export const updatePayrollConfig = createAsyncThunk(
  "payroll/updateConfig",
  async (payload) => {
    const { data } = await api.post("/payroll/config", payload);
    return data;
  }
);

export const fetchMyEarnings = createAsyncThunk(
  "payroll/fetchMyEarnings",
  async (params = {}) => {
    const { data } = await api.get("/payroll/me", { params });
    return data || {};
  }
);

const payrollSlice = createSlice({
  name: "payroll",
  initialState: { config: {}, myEarnings: {}, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayrollConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayrollConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload;
      })
      .addCase(fetchPayrollConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed";
      })
      .addCase(updatePayrollConfig.fulfilled, (state, action) => {
        state.config = action.payload;
      })
      .addCase(fetchMyEarnings.fulfilled, (state, action) => {
        state.myEarnings = action.payload;
      });
  },
});

export default payrollSlice.reducer;
