import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLeads,
  createLead,
  updateLead,
  deleteLead,
} from "../../store/leadsSlice";
import { usePermissions } from "../../hooks/usePermissions";

export default function AdminLeads() {
  const dispatch = useDispatch();
  const { items: leads, loading } = useSelector((s) => s.leads);
  
  // Get permissions for leads operations using generic hasPerm function
  const { hasPerm } = usePermissions();
  const canViewLeads = hasPerm('leads-view');
  const canAddLeads = hasPerm('leads-add');
  const canEditLeads = hasPerm('leads-edit');
  const canDeleteLeads = hasPerm('leads-delete');
  const canExportLeads = hasPerm('leads-export');

  // States must be declared before any conditional return to keep Hooks order stable
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "Referral",
    status: "new",
    notes: "",
  });

  useEffect(() => {
    if (!canViewLeads) return;
    dispatch(fetchLeads());
  }, [dispatch, canViewLeads]);

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      company: "",
      source: "Referral",
      status: "new",
      notes: "",
    });
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (lead) => {
    setEditing(lead);
    setForm({ ...lead });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) {
      dispatch(updateLead({ id: editing._id, updates: form }));
    } else {
      dispatch(createLead(form));
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this lead?")) dispatch(deleteLead(id));
  };

  const input = (label, key, type = "text") => (
    <div>
      <label className="block text-sm text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[key] || ""}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full border rounded px-3 py-2"
      />
    </div>
  );

  // Conditional rendering AFTER all hooks are declared to comply with Rules of Hooks
  if (!canViewLeads) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to view leads management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Leads</h2>
        {canAddLeads && (
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            + New Lead
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-auto">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead className="bg-gray-50 text-gray-500 text-sm">
            <tr>
              <th className="pl-4 py-3">Name</th>
              <th className="py-3">Email</th>
              <th className="py-3">Phone</th>
              <th className="py-3">Company</th>
              <th className="py-3">Status</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && leads.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-500">
                  No leads found
                </td>
              </tr>
            )}
            {!loading &&
              leads.map((l) => (
                <tr key={l._id} className="bg-white rounded-lg shadow-sm">
                  <td className="pl-4 py-3 font-medium text-gray-900">
                    {l.name}
                  </td>
                  <td className="py-3">{l.email}</td>
                  <td className="py-3">{l.phone}</td>
                  <td className="py-3">{l.company}</td>
                  <td className="py-3 capitalize">{l.status}</td>
                  <td className="py-3 space-x-2">
                    {canEditLeads && (
                      <button
                        onClick={() => openEdit(l)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded text-sm font-medium transition-colors"
                      >
                        ✏️ Edit
                      </button>
                    )}
                    {canDeleteLeads && (
                      <button
                        onClick={() => handleDelete(l._id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded text-sm font-medium transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    )}
                    {!canEditLeads && !canDeleteLeads && (
                      <span className="text-gray-400 text-sm">View Only</span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white w-full max-w-lg p-6 rounded-xl shadow space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-semibold">
              {editing ? "Edit Lead" : "New Lead"}
            </h3>
            {input("Name", "name")}
            {input("Email", "email")}
            {input("Phone", "phone")}
            {input("Company", "company")}
            {input("Source", "source")}
            {input("Status", "status")}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Notes</label>
              <textarea
                value={form.notes || ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex flex-wrap justify-end space-x-2 space-y-2 sm:space-y-0 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="px-4 py-2 rounded-md border w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md w-full sm:w-auto"
              >
                {editing ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}