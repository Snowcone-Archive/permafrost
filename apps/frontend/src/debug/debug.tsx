import { useNotifications } from "@/contexts/NotificationContext";
import { useState } from "react";

export default function DebugMenu() {
  const notifications = useNotifications();

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="fixed right-0 bottom-0 p-2 z-50">
      <button
        onClick={() => setMenuOpen((prev) => !prev)}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Debug
      </button>
      {menuOpen && (
        <div className="bg-white p-2 rounded border shadow-lg text-black">
          <h1 className="text-xl font-bold">Debug Menu</h1>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="bg-red-500 text-white p-2 rounded mt-2"
          >
            Clear Local Storage
          </button>{" "}
          <button
            onClick={() => {
              notifications.create({
                type: "info",
                text: "This is a test notification",
                persistent: true,
              });
            }}
            className="bg-blue-500 text-white p-2 rounded mt-2"
          >
            Test notification
          </button>
        </div>
      )}
    </div>
  );
}
