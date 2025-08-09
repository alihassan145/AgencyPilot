import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAttendance } from "../../store/attendanceSlice";
import api from "../../api/client";

export default function EmployeeAttendance() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.attendance);

  useEffect(() => {
    dispatch(fetchAttendance());
  }, [dispatch]);

  const checkIn = async () => {
    try {
      await api.post("/attendance/check-in");
      dispatch(fetchAttendance());
    } catch {}
  };
  const checkOut = async () => {
    try {
      await api.post("/attendance/check-out");
      dispatch(fetchAttendance());
    } catch {}
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Attendance</h2>
        <div className="space-x-2">
          <button
            onClick={checkIn}
            className="px-3 py-1 rounded bg-indigo-600 text-white"
          >
            Check In
          </button>
          <button
            onClick={checkOut}
            className="px-3 py-1 rounded bg-gray-700 text-white"
          >
            Check Out
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-500">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Check In</th>
              <th className="px-4 py-3">Check Out</th>
              <th className="px-4 py-3">Hours</th>
              <th className="px-4 py-3">Late</th>
              <th className="px-4 py-3">Left Early</th>
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
                  <td className="px-4 py-3">{a.leftEarly ? "Yes" : "No"}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
