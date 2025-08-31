import React, { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import { FaUser, FaShieldAlt, FaEnvelope, FaIdBadge } from "react-icons/fa";

export default function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [cpCurrent, setCpCurrent] = useState("");
  const [cpNew, setCpNew] = useState("");
  const [cpMsg, setCpMsg] = useState("");
  const [cpConfirm, setCpConfirm] = useState("");

  const roleLabel = (user?.role || "user").replace(/\b\w/g, (c) =>
    c.toUpperCase()
  );

  const saveProfile = async () => {
    if (user?.role !== "admin") return;
    try {
      setSaving(true);
      await api.patch(`/users/${user.id}`, { name });
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        u.name = name;
        localStorage.setItem("user", JSON.stringify(u));
      }
      setMessage("Saved successfully");
      setTimeout(() => setMessage(""), 2000);
    } catch (e) {
      setMessage("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setCpMsg("");
    try {
      await api.post("/auth/change-password", {
        currentPassword: cpCurrent,
        newPassword: cpNew,
      });
      setCpMsg("Password updated successfully");
      setCpCurrent("");
      setCpNew("");
    } catch (err) {
      setCpMsg(err?.response?.data?.message || "Failed to change password");
    }
  };

  const initials = useMemo(() => {
    const display = (user?.name || "U").replace(/^System\s+/i, "");
    return display.slice(0, 1).toUpperCase();
  }, [user]);

  return (
    <div className="py-6 space-y-8 bg-gray-50 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 shadow text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
            {initials}
          </div>
          <div className="flex-1">
            <div className="text-xl font-semibold">
              {(user?.name || "User").replace(/^System\s+/i, "").trim()}
            </div>
            <div className="text-white/90 text-sm flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-white/15 px-2 py-1 rounded-md">
                <FaIdBadge /> {roleLabel}
              </span>
              <span className="inline-flex items-center gap-1 bg-white/15 px-2 py-1 rounded-md">
                <FaEnvelope /> {user?.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Profile Details */}
        <section className="xl:col-span-2 bg-white rounded-2xl shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FaUser />
            </div>
            <h2 className="font-semibold text-lg text-gray-800">
              Profile Details
            </h2>
          </div>
          {message && (
            <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
              {message}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="col-span-1">
              <label className="block text-sm text-gray-700 mb-1">
                Full Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={user?.role !== "admin"}
              />
              {user?.role !== "admin" && (
                <p className="text-xs text-gray-500 mt-1">
                  Contact admin to update your profile details.
                </p>
              )}
            </div>
            <div className="col-span-1">
              <label className="block text-sm text-gray-700 mb-1">
                Email Address
              </label>
              <input
                value={user?.email || ""}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50"
                disabled
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm text-gray-700 mb-1">Role</label>
              <input
                value={roleLabel}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50"
                disabled
              />
            </div>
          </div>
          {user?.role === "admin" && (
            <div className="flex justify-end mt-6">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </section>

        {/* Security */}
        <section className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FaShieldAlt />
            </div>
            <h2 className="font-semibold text-lg text-gray-800">Security</h2>
          </div>
          {cpMsg && (
            <div className="mb-4 text-sm text-indigo-700 bg-indigo-50 border border-indigo-200 rounded px-3 py-2">
              {cpMsg}
            </div>
          )}
          <form
            onSubmit={(e) => {
              if (cpNew !== cpConfirm) {
                e.preventDefault();
                setCpMsg("New password and confirmation do not match");
                return;
              }
              changePassword(e);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={cpCurrent}
                onChange={(e) => setCpCurrent(e.target.value)}
                placeholder="Enter current password"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={cpNew}
                onChange={(e) => setCpNew(e.target.value)}
                placeholder="Enter new password"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={cpConfirm}
                onChange={(e) => setCpConfirm(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Update Password
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
