import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createLeave, fetchLeaves } from "../../store/leavesSlice";

export default function EmployeeLeaves() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.leaves);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ from: "", to: "", reason: "" });

  useEffect(() => {
    dispatch(fetchLeaves());
  }, [dispatch]);

  return (
    <div className="p-6 space-y-4 mx-24">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Leaves</h2>
        <button
          onClick={() => setShow(true)}
          className="px-3 py-1 rounded bg-indigo-600 text-white"
        >
          Apply Leave
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-500">
              <th className="px-4 py-3">From</th>
              <th className="px-4 py-3">To</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && (
              <tr>
                <td className="p-4 text-gray-500" colSpan={4}>
                  Loading...
                </td>
              </tr>
            )}
            {!loading &&
              items.map((l) => (
                <tr key={l._id} className="text-sm">
                  <td className="px-4 py-3">
                    {l.from ? new Date(l.from).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {l.to ? new Date(l.to).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-3 max-w-md truncate">{l.reason}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {show && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow space-y-4">
            <h3 className="text-lg font-semibold">Apply for Leave</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await dispatch(createLeave(form));
                setShow(false);
              }}
              className="grid grid-cols-2 gap-4"
            >
              <Text
                label="From"
                type="date"
                value={form.from}
                onChange={(v) => setForm((s) => ({ ...s, from: v }))}
                required
              />
              <Text
                label="To"
                type="date"
                value={form.to}
                onChange={(v) => setForm((s) => ({ ...s, to: v }))}
                required
              />
              <div className="col-span-2">
                <TextArea
                  label="Reason"
                  value={form.reason}
                  onChange={(v) => setForm((s) => ({ ...s, reason: v }))}
                  required
                />
              </div>
              <div className="col-span-2 flex justify-end gap-2 pt-2">
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
