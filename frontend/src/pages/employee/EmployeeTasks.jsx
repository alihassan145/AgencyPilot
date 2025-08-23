import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks, updateTask } from "../../store/tasksSlice";

export default function EmployeeTasks() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.tasks);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const markDone = (id) =>
    dispatch(updateTask({ id, updates: { status: "done" } }));

  return (
    <div className="p-6 space-y-4 mx-24">
      <h2 className="text-xl font-semibold">My Tasks</h2>
      <div className="bg-white rounded-lg shadow divide-y">
        {loading && <div className="p-4 text-gray-500">Loading...</div>}
        {!loading &&
          items.map((t) => (
            <div key={t._id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">{t.title}</div>
                <div className="text-sm text-gray-600">{t.description}</div>
                <div className="text-xs text-gray-500">
                  Due:{" "}
                  {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "-"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">
                  {t.status}
                </span>
                {t.status !== "done" && (
                  <button
                    onClick={() => markDone(t._id)}
                    className="px-3 py-1 rounded bg-green-600 text-white text-sm"
                  >
                    Mark Done
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
