import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { decideLeave, fetchLeaves } from "../../store/leavesSlice";
import api from "../../api/client";

export default function AdminLeaves() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.leaves);
  const [employees, setEmployees] = useState([]);
  const [employee, setEmployee] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/users");
        setEmployees(data || []);
      } catch {}
    })();
  }, []);
  useEffect(() => {
    const params = {};
    if (employee) params.employee = employee;
    if (from) params.from = from;
    if (to) params.to = to;
    if (status) params.status = status;
    dispatch(fetchLeaves(params));
  }, [dispatch, employee, from, to, status]);

  const act = (id, action) => dispatch(decideLeave({ id, action }));

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600">Approve or reject leave applications</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Employee</label>
          <select
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">All</option>
            {employees.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => {
              setEmployee("");
              setFrom("");
              setTo("");
              setStatus("");
            }}
            className="px-4 py-2 rounded border w-full"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-500">
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">From</th>
              <th className="px-4 py-3">To</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && (
              <tr>
                <td className="p-4 text-gray-500" colSpan={6}>
                  Loading...
                </td>
              </tr>
            )}
            {!loading &&
              items.map((l) => (
                <tr key={l._id} className="text-sm">
                  <td className="px-4 py-3">{l.user?.name || "-"}</td>
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
                  <td className="px-4 py-3 space-x-2">
                    {l.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => act(l._id, "approve")}
                          className="text-green-600 hover:text-green-800"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => act(l._id, "reject")}
                          className="text-red-600 hover:text-red-800"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-500 text-sm">No actions available</span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
