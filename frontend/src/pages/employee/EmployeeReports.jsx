import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReports, submitReport } from "../../store/reportsSlice";
import api from "../../api/client";

export default function EmployeeReports() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.reports);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", client: "" });
  const [clients, setClients] = useState([]);

  useEffect(() => {
    dispatch(fetchReports());
  }, [dispatch]);
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/clients");
        setClients(data || []);
      } catch {}
    })();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Reports</h2>
        <button
          onClick={() => setShow(true)}
          className="px-3 py-1 rounded bg-indigo-600 text-white"
        >
          Submit Report
        </button>
      </div>
      <div className="bg-white rounded-lg shadow divide-y">
        {loading && <div className="p-4 text-gray-500">Loading...</div>}
        {!loading &&
          items.map((r) => (
            <div key={r._id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-gray-900">{r.title}</div>
                <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                  {r.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">{r.content}</div>
              {r.rejectionReason && (
                <div className="text-xs text-red-600">
                  Reason: {r.rejectionReason}
                </div>
              )}
            </div>
          ))}
      </div>

      {show && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow space-y-4">
            <h3 className="text-lg font-semibold">Submit Report</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await dispatch(submitReport(form));
                setShow(false);
              }}
              className="space-y-3"
            >
              <Text
                label="Title"
                value={form.title}
                onChange={(v) => setForm((s) => ({ ...s, title: v }))}
                required
              />
              <TextArea
                label="Content"
                value={form.content}
                onChange={(v) => setForm((s) => ({ ...s, content: v }))}
                required
              />
              <Select
                label="Client"
                value={form.client}
                onChange={(v) => setForm((s) => ({ ...s, client: v }))}
                options={clients.map((c) => ({
                  label: c.companyName,
                  value: c._id,
                }))}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShow(false)}
                  className="px-4 py-2 rounded border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-600 text-white"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Text({ label, value, onChange, type = "text", required = false }) {
  return (
    <div>
      <label className="block text-sm text-gray-700 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        required={required}
        className="w-full border rounded px-3 py-2"
      />
    </div>
  );
}

function TextArea({ label, value, onChange, required = false }) {
  return (
    <div>
      <label className="block text-sm text-gray-700 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        rows={4}
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
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
