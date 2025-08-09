import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks } from "../../store/tasksSlice";

export default function EmployeeCalendar() {
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.tasks);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const days = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const start = new Date(first);
    start.setDate(start.getDate() - first.getDay());
    const res = [];
    const cur = new Date(start);
    while (cur <= last || cur.getDay() !== 0) {
      res.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return res;
  }, [currentDate]);

  const tasksByDate = useMemo(() => {
    const map = new Map();
    items.forEach((t) => {
      if (!t.dueDate) return;
      const d = t.dueDate.substring(0, 10);
      if (!map.has(d)) map.set(d, []);
      map.get(d).push(t);
    });
    return map;
  }, [items]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Calendar</h2>
        <div className="space-x-2">
          <button
            onClick={() =>
              setCurrentDate(
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() - 1,
                  1
                )
              )
            }
            className="px-3 py-1 rounded border"
          >
            Prev
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 rounded border"
          >
            Today
          </button>
          <button
            onClick={() =>
              setCurrentDate(
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() + 1,
                  1
                )
              )
            }
            className="px-3 py-1 rounded border"
          >
            Next
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="p-2 text-center text-sm text-gray-500">
            {d}
          </div>
        ))}
        {days.map((d, i) => {
          const key = d.toISOString().substring(0, 10);
          const list = tasksByDate.get(key) || [];
          const sameMonth = d.getMonth() === currentDate.getMonth();
          return (
            <div
              key={i}
              className={`min-h-[100px] p-2 border ${
                sameMonth ? "bg-white" : "bg-gray-50"
              } ${!sameMonth ? "text-gray-400" : ""}`}
            >
              <div className="text-sm font-medium mb-1">{d.getDate()}</div>
              <div className="space-y-1">
                {list.map((t) => (
                  <div
                    key={t._id}
                    className="bg-yellow-100 p-1 rounded text-xs truncate"
                  >
                    {t.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
