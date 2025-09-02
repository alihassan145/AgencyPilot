import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAttendance } from "../../store/attendanceSlice";
import api from "../../api/client";

export default function AdminAttendance() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.attendance);
  const [employees, setEmployees] = useState([]);
  const [employee, setEmployee] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

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
    dispatch(fetchAttendance(params));
  }, [dispatch, employee, from, to]);

  return (
    <div className="p-8 space-y-6 mx-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Attendance Center
          </h1>
          <p className="text-gray-600">Track check-in/out and hours</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
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
        <div className="flex items-end">
          <button
            onClick={() => {
              setEmployee("");
              setFrom("");
              setTo("");
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
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Check In</th>
              <th className="px-4 py-3">Check Out</th>
              <th className="px-4 py-3">Hours</th>
              <th className="px-4 py-3">Late</th>
              <th className="px-4 py-3">Late Minutes</th>
              <th className="px-4 py-3">Left Early</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && (
              <tr>
                <td className="p-4 text-gray-500" colSpan={8}>
                  Loading...
                </td>
              </tr>
            )}
            {!loading &&
              items.map((a) => (
                <tr key={a._id} className="text-sm">
                  <td className="px-4 py-3">{a.user?.name || "-"}</td>
                  <td className="px-4 py-3">
                    {a.date ? new Date(a.date).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {a.checkOut
                      ? new Date(a.checkOut).toLocaleTimeString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {a.totalHours?.toFixed
                      ? a.totalHours.toFixed(2)
                      : a.totalHours}
                  </td>
                  <td className="px-4 py-3">{a.wasLate ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">{typeof a.lateMinutes === "number" ? a.lateMinutes : "-"}</td>
                  <td className="px-4 py-3">{a.leftEarly ? "Yes" : "No"}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
