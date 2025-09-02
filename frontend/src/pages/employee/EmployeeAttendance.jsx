import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAttendance } from "../../store/attendanceSlice";
import api from "../../api/client";

export default function EmployeeAttendance() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.attendance);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    dispatch(fetchAttendance());
  }, [dispatch]);

  const todayKey = new Date().toISOString().substring(0, 10);
  const todayOpen = useMemo(() => {
    const todays = items.filter(
      (a) => (a.date ? a.date.substring(0, 10) : null) === todayKey
    );
    if (todays.length === 0) return null;
    // assume last is latest
    return todays[todays.length - 1];
  }, [items, todayKey]);

  const isCheckedIn = Boolean(todayOpen?.checkIn) && !todayOpen?.checkOut;

  const checkIn = async () => {
    try {
      await api.post("/attendance/check-in");
      dispatch(fetchAttendance());
      setMsg("Checked in successfully");
    } catch {}
  };
  const checkOut = async () => {
    try {
      await api.post("/attendance/check-out");
      dispatch(fetchAttendance());
      setMsg("Checked out successfully");
    } catch {}
  };

  return (
    <div className="p-6 space-y-4 mx-24">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Attendance</h2>
        <div className="space-x-2">
          <button
            onClick={checkIn}
            disabled={isCheckedIn}
            className={`px-3 py-1 rounded text-white ${
              isCheckedIn ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600"
            }`}
          >
            Check In
          </button>
          <button
            onClick={checkOut}
            disabled={!isCheckedIn}
            className={`px-3 py-1 rounded text-white ${
              !isCheckedIn ? "bg-gray-400 cursor-not-allowed" : "bg-gray-700"
            }`}
          >
            Check Out
          </button>
        </div>
      </div>

      {msg && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
          {msg}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-500">
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
                <td className="p-4 text-gray-500" colSpan={7}>
                  Loading...
                </td>
              </tr>
            )}
            {!loading &&
              items.map((a) => (
                <tr key={a._id} className="text-sm">
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
