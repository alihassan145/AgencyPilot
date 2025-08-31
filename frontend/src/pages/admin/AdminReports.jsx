import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  approveReport,
  fetchReports,
  rejectReport,
  submitReport,
} from "../../store/reportsSlice";
import api from "../../api/client";

export default function AdminReports() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.reports);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", client: "" });
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    client: "",
    employee: "",
    from: "",
    to: "",
  });

  useEffect(() => {
    dispatch(fetchReports(filters));
  }, [dispatch, filters]);
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/clients");
        setClients(data || []);
      } catch {}
    })();
  }, []);

  // Fetch employees for filter options
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/users");
        setEmployees(data || []);
      } catch {}
    })();
  }, []);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Work Reports</h1>
          <p className="text-gray-600">Submit and view work reports</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors flex items-center space-x-2"
        >
          <span>+</span>
          <span>Submit Report</span>
        </button>
      </div>

      {/* Filters Section */}
      <div className="flex flex-wrap items-end gap-4 mb-4">
        <Select
          label="Client"
          value={filters.client}
          onChange={(v) => setFilters((s) => ({ ...s, client: v }))}
          options={[
            { label: "All", value: "" },
            ...clients.map((c) => ({ label: c.companyName, value: c._id })),
          ]}
        />
        <Select
          label="Employee"
          value={filters.employee}
          onChange={(v) => setFilters((s) => ({ ...s, employee: v }))}
          options={[
            { label: "All", value: "" },
            ...employees.map((e) => ({ label: e.name, value: e._id })),
          ]}
        />
        <Text
          type="date"
          label="From"
          value={filters.from}
          onChange={(v) => setFilters((s) => ({ ...s, from: v }))}
        />
        <Text
          type="date"
          label="To"
          value={filters.to}
          onChange={(v) => setFilters((s) => ({ ...s, to: v }))}
        />
        <button
          onClick={() => dispatch(fetchReports(filters))}
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Apply
        </button>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Reports Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-3xl font-bold text-blue-600">3</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl">📄</span>
            </div>
          </div>
        </div>

        {/* This Month Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-3xl font-bold text-green-600">2</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">📅</span>
            </div>
          </div>
        </div>

        {/* Pending Review Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pending Review
              </p>
              <p className="text-3xl font-bold text-orange-600">1</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 text-xl">⏰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Reports
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm font-medium text-gray-500 uppercase tracking-wide">
                <th className="px-6 py-3">Author</th>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((report) => (
                <tr
                  key={report._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Employee Column */}
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">
                      {report.author?.name || "-"}
                    </div>
                  </td>

                  {/* Client Column */}
                  <td className="px-6 py-4">
                    <span className="text-gray-900 font-medium">
                      {report.client?.companyName || "-"}
                    </span>
                  </td>

                  {/* Task Column */}
                  <td className="px-6 py-4">
                    <div className="max-w-md font-semibold text-gray-900">
                      {report.title}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm px-2 py-1 rounded bg-gray-100 text-gray-700">
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    {report.status === "pending" ? (
                      <>
                        <button
                          onClick={() => dispatch(approveReport(report._id))}
                          className="text-green-600 hover:text-green-800"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            dispatch(rejectReport({ id: report._id }))
                          }
                          className="text-red-600 hover:text-red-800"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-500 text-sm">
                        No actions available
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold">Submit Report</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await dispatch(submitReport(form));
                setShowModal(false);
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
              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded border w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-600 text-white w-full sm:w-auto"
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

function Select({ label, value, onChange, options = [], required = false }) {
  return (
    <div>
      <label className="block text-sm text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
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
