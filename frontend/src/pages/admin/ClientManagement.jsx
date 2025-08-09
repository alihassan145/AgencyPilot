import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchClients,
  createClient as createClientThunk,
  updateClient as updateClientThunk,
  deleteClient as deleteClientThunk,
} from "../../store/clientsSlice";

export default function ClientManagement() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.clients);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [bulkSelect, setBulkSelect] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    mobile: "",
    address: "",
    plan: "",
    price: "",
    expiryDate: "",
  });

  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  const clients = useMemo(() => {
    if (selectedStatus === "all") return items;
    return items.filter((c) => (selectedStatus === "active" ? true : true));
  }, [items, selectedStatus]);

  const openAdd = () => {
    setEditing(null);
    setForm({
      companyName: "",
      contactPerson: "",
      email: "",
      mobile: "",
      address: "",
      plan: "",
      price: "",
      expiryDate: "",
    });
    setShowModal(true);
  };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      companyName: c.companyName || "",
      contactPerson: c.contactPerson || "",
      email: c.email || "",
      mobile: c.mobile || "",
      address: c.address || "",
      plan: c.plan || "",
      price: c.price ?? "",
      expiryDate: c.expiryDate ? c.expiryDate.substring(0, 10) : "",
    });
    setShowModal(true);
  };
  const handleDelete = (id) => dispatch(deleteClientThunk(id));
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: form.price ? Number(form.price) : undefined,
    };
    if (editing) {
      await dispatch(updateClientThunk({ id: editing._id, updates: payload }));
    } else {
      await dispatch(createClientThunk(payload));
    }
    setShowModal(false);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Client Management
          </h1>
          <p className="text-gray-600">Manage your client relationships</p>
        </div>
        <div className="space-x-2">
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors">
            Export
          </button>
          <button
            onClick={openAdd}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors"
          >
            + Add New Client
          </button>
        </div>
      </div>

      {/* Search and Filter Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Clients
            </label>
            <input
              type="text"
              placeholder="Search by name, email, or company"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Description
            </label>
            <input
              type="text"
              placeholder="Search in descriptions..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-medium transition-colors">
              Clear
            </button>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="bulk"
                checked={bulkSelect}
                onChange={(e) => setBulkSelect(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="bulk"
                className="text-sm font-medium text-gray-700"
              >
                Bulk
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead className="bg-gray-50">
            <tr className="text-gray-500 text-sm">
              <th className="pl-4 py-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </th>
              <th className="py-3 uppercase tracking-wide font-medium">
                Company
              </th>
              <th className="py-3 uppercase tracking-wide font-medium">
                Contact
              </th>
              <th className="py-3 uppercase tracking-wide font-medium">
                Description
              </th>
              <th className="py-3 uppercase tracking-wide font-medium">
                Status
              </th>
              <th className="py-3 uppercase tracking-wide font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="p-4 text-gray-500" colSpan={6}>
                  Loading...
                </td>
              </tr>
            )}
            {!loading &&
              clients.map((client, idx) => (
                <tr
                  key={idx}
                  className="bg-white rounded-lg shadow-sm text-sm align-top hover:bg-gray-50 transition-colors"
                >
                  <td className="pl-4 py-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-3">
                    <div className="font-medium text-gray-900">
                      {client.companyName}
                    </div>
                    <div className="text-gray-500 text-sm">{client.email}</div>
                  </td>
                  <td className="py-3 text-gray-700">{client.contactPerson}</td>
                  <td className="py-3 max-w-sm truncate text-gray-700">
                    {client.plan || "-"}
                  </td>
                  <td className="py-3">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                      Active
                    </span>
                  </td>
                  <td className="py-3 space-x-2">
                    <button
                      onClick={() => openEdit(client)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded text-sm font-medium transition-colors"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(client._id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded text-sm font-medium transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow space-y-4">
            <h3 className="text-lg font-semibold">
              {editing ? "Edit Client" : "Add New Client"}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <Text
                label="Company Name"
                value={form.companyName}
                onChange={(v) => setForm((s) => ({ ...s, companyName: v }))}
                required
              />
              <Text
                label="Contact Person"
                value={form.contactPerson}
                onChange={(v) => setForm((s) => ({ ...s, contactPerson: v }))}
                required
              />
              <Text
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => setForm((s) => ({ ...s, email: v }))}
                required
              />
              <Text
                label="Mobile"
                value={form.mobile}
                onChange={(v) => setForm((s) => ({ ...s, mobile: v }))}
                required
              />
              <Text
                label="Address"
                value={form.address}
                onChange={(v) => setForm((s) => ({ ...s, address: v }))}
              />
              <Text
                label="Plan"
                value={form.plan}
                onChange={(v) => setForm((s) => ({ ...s, plan: v }))}
              />
              <Text
                label="Price"
                type="number"
                value={form.price}
                onChange={(v) => setForm((s) => ({ ...s, price: v }))}
              />
              <Text
                label="Expiry Date"
                type="date"
                value={form.expiryDate}
                onChange={(v) => setForm((s) => ({ ...s, expiryDate: v }))}
              />
              <div className="col-span-2 flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-600 text-white"
                >
                  Save
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
