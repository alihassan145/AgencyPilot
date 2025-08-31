import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { decideLeave, fetchLeaves } from "../../store/leavesSlice";

export default function ManagerLeaves() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.leaves);
  useEffect(() => {
    dispatch(fetchLeaves());
  }, [dispatch]);

  const act = (id, action) => dispatch(decideLeave({ id, action }));

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-xl font-semibold">Team Leave Requests</h2>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-500">
              <th className="px-4 py-3">User</th>
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
                    {l.status === "pending" && (
                      <>
                        <button
                          onClick={() => act(l._id, "approve")}
                          className="px-3 py-1 text-xs rounded bg-green-600 text-white"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => act(l._id, "reject")}
                          className="px-3 py-1 text-xs rounded bg-red-600 text-white"
                        >
                          Reject
                        </button>
                      </>
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
