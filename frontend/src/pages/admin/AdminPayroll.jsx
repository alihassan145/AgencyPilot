import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPayrollConfig,
  fetchMyEarnings,
  updatePayrollConfig,
} from "../../store/payrollSlice";

export default function AdminPayroll() {
  const dispatch = useDispatch();
  const { config, myEarnings, loading } = useSelector((s) => s.payroll);
  const [form, setForm] = useState({});
  const [month, setMonth] = useState("");
  const [baseSalary, setBaseSalary] = useState("");

  useEffect(() => {
    dispatch(fetchPayrollConfig());
  }, [dispatch]);
  useEffect(() => {
    setForm(config || {});
  }, [config]);

  const save = async (e) => {
    e.preventDefault();
    await dispatch(updatePayrollConfig(form));
  };
  const calc = () => dispatch(fetchMyEarnings({ month, baseSalary }));

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Payroll Management
          </h1>
          <p className="text-gray-600">
            Configure rules and calculate earnings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Configuration</h2>
          <form onSubmit={save} className="grid grid-cols-2 gap-4">
            <Text
              label="Grace Minutes"
              type="number"
              value={form.graceMinutes ?? ""}
              onChange={(v) =>
                setForm((s) => ({ ...s, graceMinutes: Number(v) }))
              }
            />
            <Text
              label="Late Penalty"
              type="number"
              value={form.latePenalty ?? ""}
              onChange={(v) =>
                setForm((s) => ({ ...s, latePenalty: Number(v) }))
              }
            />
            <Select
              label="Overtime Enabled"
              value={String(form.overtimeEnabled ?? false)}
              onChange={(v) =>
                setForm((s) => ({ ...s, overtimeEnabled: v === "true" }))
              }
              options={[
                { label: "No", value: "false" },
                { label: "Yes", value: "true" },
              ]}
            />
            <Text
              label="Overtime Bonus/Hour"
              type="number"
              value={form.overtimeBonusPerHour ?? ""}
              onChange={(v) =>
                setForm((s) => ({ ...s, overtimeBonusPerHour: Number(v) }))
              }
            />
            <Text
              label="Official Start (HH:mm)"
              value={form.officialStart ?? ""}
              onChange={(v) => setForm((s) => ({ ...s, officialStart: v }))}
            />
            <Text
              label="Official End (HH:mm)"
              value={form.officialEnd ?? ""}
              onChange={(v) => setForm((s) => ({ ...s, officialEnd: v }))}
            />
            <Text
              label="Default Base Salary"
              type="number"
              value={form.defaultBaseSalary ?? ""}
              onChange={(v) =>
                setForm((s) => ({ ...s, defaultBaseSalary: Number(v) }))
              }
            />
            <div className="col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded bg-indigo-600 text-white"
              >
                Save
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Earnings Preview</h2>
          <div className="grid grid-cols-2 gap-4">
            <Text label="Month (YYYY-MM)" value={month} onChange={setMonth} />
            <Text
              label="Base Salary"
              type="number"
              value={baseSalary}
              onChange={setBaseSalary}
            />
            <div className="col-span-2 flex justify-end">
              <button
                onClick={calc}
                className="px-4 py-2 rounded bg-green-600 text-white"
              >
                Calculate
              </button>
            </div>
          </div>
          {myEarnings?.month && (
            <div className="text-sm text-gray-800 space-y-1">
              <div>
                <b>Month:</b> {myEarnings.month}
              </div>
              <div>
                <b>Base:</b> {myEarnings.baseSalary}
              </div>
              <div>
                <b>Deductions:</b> {myEarnings.deductions}
              </div>
              <div>
                <b>Overtime Hours:</b> {myEarnings.overtimeHours}
              </div>
              <div>
                <b>Bonus:</b> {myEarnings.bonus}
              </div>
              <div>
                <b>Total:</b> {myEarnings.totalEarnings}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Text({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-sm text-gray-700 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        className="w-full border rounded px-3 py-2"
      />
    </div>
  );
}

function Select({ label, value, onChange, options = [] }) {
  return (
    <div>
      <label className="block text-sm text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded px-3 py-2"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
