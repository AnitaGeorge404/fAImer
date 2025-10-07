import React, { useEffect, useState } from "react";
import { getRecent } from "@/lib/todoService";

const Notifications: React.FC = () => {
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRecent(getRecent());
    }, 1500);
    setRecent(getRecent());
    return () => clearInterval(interval);
  }, []);

  if (!recent || recent.length === 0) return null;

  return (
    <div className="fixed right-4 bottom-24 z-50 space-y-2">
      {recent.map((r, idx) => (
        <div key={idx} className="bg-white dark:bg-gray-800 shadow rounded p-3 w-72">
          <div className="text-sm">Added: {r.text}</div>
          <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
