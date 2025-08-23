import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks, updateTask } from "../../store/tasksSlice";

export default function ManagerTasks() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.tasks);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const moveTo = (taskId, status) =>
    dispatch(updateTask({ id: taskId, updates: { status } }));

  const grouped = {
    todo: items.filter((t) => t.status === "todo"),
    in_progress: items.filter((t) => t.status === "in_progress"),
    done: items.filter((t) => t.status === "done"),
  };

  return (
    <div className="p-6 space-y-4 mx-24">
      <h2 className="text-xl font-semibold">Team Tasks</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { key: "todo", title: "To Do" },
          { key: "in_progress", title: "In Progress" },
          { key: "done", title: "Completed" },
        ].map((col) => (
          <div key={col.key} className="bg-white rounded-lg shadow">
            <div className="px-4 py-3 border-b font-semibold flex items-center justify-between">
              <span>{col.title}</span>
              <span className="text-xs text-gray-500">
                {grouped[col.key].length}
              </span>
            </div>
            <div className="divide-y">
              {loading && <div className="p-4 text-gray-500">Loading...</div>}
              {!loading &&
                grouped[col.key].map((t) => (
                  <div key={t._id} className="p-4">
                    <div className="font-semibold text-gray-900">{t.title}</div>
                    <div className="text-sm text-gray-600">{t.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Due:{" "}
                      {t.dueDate
                        ? new Date(t.dueDate).toLocaleDateString()
                        : "-"}
                    </div>
                    <div className="flex gap-2 mt-2">
                      {col.key !== "todo" && (
                        <button
                          onClick={() => moveTo(t._id, "todo")}
                          className="px-2 py-1 text-xs rounded border"
                        >
                          To Do
                        </button>
                      )}
                      {col.key !== "in_progress" && (
                        <button
                          onClick={() => moveTo(t._id, "in_progress")}
                          className="px-2 py-1 text-xs rounded border"
                        >
                          In Progress
                        </button>
                      )}
                      {col.key !== "done" && (
                        <button
                          onClick={() => moveTo(t._id, "done")}
                          className="px-2 py-1 text-xs rounded bg-green-600 text-white"
                        >
                          Mark Done
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
