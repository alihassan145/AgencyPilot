import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FaBuilding, FaArrowRight, FaSignInAlt } from "react-icons/fa";

export default function Login({ onSuccess }) {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("admin@digitali.local");
  const [password, setPassword] = useState("Admin@123456");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const u = await login(email, password);
      if (onSuccess) onSuccess(u);
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    }
  };

  const fillDemo = (role) => {
    if (role === "admin") {
      setEmail("admin@digitali.local");
      setPassword("Admin@123456");
    } else if (role === "manager") {
      setEmail("manager@digitali.local");
      setPassword("Manager@123456");
    } else if (role === "employee") {
      setEmail("employee@digitali.local");
      setPassword("Employee@123456");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 via-purple-200 to-blue-200 p-6">
      <div className="w-full max-w-xl bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center text-2xl mb-4 shadow">
            <FaBuilding />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Agency Pro
          </h1>
          <p className="text-gray-500 mt-2">Complete Management Solution</p>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Enter your email"
              autoComplete="username"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            disabled={loading}
            className="w-full text-white py-3 rounded-lg disabled:opacity-50 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center gap-2"
          >
            <FaSignInAlt /> {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-5">
          <div className="text-gray-700 font-semibold mb-3">Demo Accounts:</div>
          <div className="space-y-3">
            <DemoRow
              label="Admin"
              email="admin@digitali.local"
              onPick={() => fillDemo("admin")}
            />
            <DemoRow
              label="Manager"
              email="manager@digitali.local"
              onPick={() => fillDemo("manager")}
            />
            <DemoRow
              label="Employee"
              email="employee@digitali.local"
              onPick={() => fillDemo("employee")}
            />
          </div>
        </div> */}
      </div>
    </div>
  );
}

function DemoRow({ label, email, onPick }) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-50"
    >
      <span>
        <span className="font-semibold">{label}:</span> {email}
      </span>
      <FaArrowRight className="text-gray-400" />
    </button>
  );
}
