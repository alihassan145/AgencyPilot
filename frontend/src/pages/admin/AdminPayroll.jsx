import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPayrollConfig, updatePayrollConfig, fetchMyEarnings } from "../../store/payrollSlice";
import { usePermissions } from "../../hooks/usePermissions";

export default function AdminPayroll() {
  const dispatch = useDispatch();
  const { config, myEarnings, loading } = useSelector((s) => s.payroll || { config: {}, myEarnings: {}, loading: false });
  const { anyPerm, hasPerm } = usePermissions();

  const canViewPayroll = anyPerm([
    "payroll-view-all",
    "payroll-view-team",
    "payroll-view-self",
  ]);
  const canEditPayroll = hasPerm("payroll-edit") || hasPerm("payroll-add");
  const canExportPayroll = hasPerm("payroll-export");

  const [form, setForm] = useState({
    basicSalary: "",
    hra: "",
    bonusPercent: "",
  });

  // Load data depending on permissions
  useEffect(() => {
    if (!canViewPayroll) return;
    if (canEditPayroll) {
      dispatch(fetchPayrollConfig());
    } else {
      dispatch(fetchMyEarnings());
    }
  }, [dispatch, canViewPayroll, canEditPayroll]);

  // Initialize the form when config changes
  useEffect(() => {
    if (config && Object.keys(config).length > 0) {
      setForm({
        basicSalary: String(config.basicSalary ?? ""),
        hra: String(config.hra ?? ""),
        bonusPercent: String(config.bonusPercent ?? ""),
      });
    }
  }, [config]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSave = async () => {
    const payload = {
      basicSalary: Number(form.basicSalary) || 0,
      hra: Number(form.hra) || 0,
      bonusPercent: Number(form.bonusPercent) || 0,
    };
    await dispatch(updatePayrollConfig(payload));
  };

  const exportData = () => {
    const data = canEditPayroll ? { type: "config", ...config } : { type: "myEarnings", ...myEarnings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = canEditPayroll ? "payroll-config.json" : "my-earnings.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (!canViewPayroll) {
    return (
      <div className="py-6 space-y-4 bg-gray-50 min-h-screen max-w-5xl mx-auto px-4">
        <div className="bg-white border rounded-xl p-6 text-center">
          <div className="text-5xl mb-2">🔒</div>
          <div className="text-lg font-semibold">You do not have access to the Payroll section.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6 bg-gray-50 min-h-screen max-w-5xl mx-auto px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Payroll</h1>
        {canExportPayroll && (
          <button
            onClick={exportData}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium"
          >
            Export
          </button>
        )}
      </div>

      {canEditPayroll ? (
        <div className="bg-white rounded-2xl shadow p-6 border">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Payroll Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Basic Salary</label>
              <input
                type="number"
                name="basicSalary"
                value={form.basicSalary}
                onChange={onChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. 50000"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">HRA</label>
              <input
                type="number"
                name="hra"
                value={form.hra}
                onChange={onChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. 10000"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Bonus %</label>
              <input
                type="number"
                name="bonusPercent"
                value={form.bonusPercent}
                onChange={onChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. 10"
                step="0.01"
              />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={onSave}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 disabled:bg-green-300 text-white text-sm font-medium"
            >
              {loading ? "Saving..." : "Save Configuration"}
            </button>
          </div>
          <div className="mt-6 text-xs text-gray-500">
            <div>Current config (read-only preview):</div>
            <pre className="bg-gray-50 border rounded-lg p-3 overflow-auto max-h-64">{JSON.stringify(config, null, 2)}</pre>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow p-6 border">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">My Earnings</h2>
          {loading ? (
            <div className="text-gray-600">Loading...</div>
          ) : myEarnings && Object.keys(myEarnings || {}).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 border rounded-xl p-4">
                <div className="text-sm text-gray-500">Gross</div>
                <div className="text-xl font-semibold">{myEarnings.gross ?? "-"}</div>
              </div>
              <div className="bg-gray-50 border rounded-xl p-4">
                <div className="text-sm text-gray-500">Net</div>
                <div className="text-xl font-semibold">{myEarnings.net ?? "-"}</div>
              </div>
              <div className="bg-gray-50 border rounded-xl p-4">
                <div className="text-sm text-gray-500">Deductions</div>
                <div className="text-xl font-semibold">{myEarnings.deductions ?? "-"}</div>
              </div>
              <div className="bg-gray-50 border rounded-xl p-4">
                <div className="text-sm text-gray-500">Period</div>
                <div className="text-xl font-semibold">
                  {(myEarnings.periodStart || "").toString().substring(0, 10)} - {(myEarnings.periodEnd || "").toString().substring(0, 10)}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-600">No earnings data available.</div>
          )}
          <div className="mt-6 text-xs text-gray-500">
            <div>Raw data (debug):</div>
            <pre className="bg-gray-50 border rounded-lg p-3 overflow-auto max-h-64">{JSON.stringify(myEarnings, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}