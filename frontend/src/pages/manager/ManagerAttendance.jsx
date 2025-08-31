import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAttendance } from "../../store/attendanceSlice";

export default function ManagerAttendance() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.attendance);
  useEffect(() => {
    dispatch(fetchAttendance());
  }, [dispatch]);
  return (
    <div className="p-6 space-y-4 mx-24">
      <h2 className="text-xl font-semibold">Team Attendance</h2>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-500">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Check In</th>
              <th className="px-4 py-3">Check Out</th>
              <th className="px-4 py-3">Hours</th>
              <th className="px-4 py-3">Late</th>
              <th className="px-4 py-3">Late Minutes</th>
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
                  <td className="px-4 py-3">
                    {typeof a.lateMinutes === "number" ? a.lateMinutes : "-"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
