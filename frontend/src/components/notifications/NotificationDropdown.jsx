import React, { useState, useEffect, useCallback } from "react";
import { FiBell } from "react-icons/fi";
import NotificationListener from "./NotificationListener";
import axios from "../../utils/axios";

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  // Fetch notifications on mount
  useEffect(() => {
    axios.get("/api/notifications").then((res) => {
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.read).length);
    });
  }, []);

  // Handle real-time notification
  const handleNotification = useCallback((notif) => {
    setNotifications((prev) => [notif, ...prev]);
    setUnreadCount((count) => count + 1);
    // Optionally show a toast or browser notification here
  }, []);

  // Mark notification as read
  const markAsRead = async (id) => {
    await axios.patch(`/api/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((count) => count - 1);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
      >
        {/* Use react-icons for consistent bell icon rendering */}
        <FiBell className="w-6 h-6 text-gray-500" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-2 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-gray-500 text-center">No notifications</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id || notif.timestamp}
                  className={`flex items-start px-2 py-2 border-b last:border-b-0 cursor-pointer ${notif.read ? 'bg-gray-50' : 'bg-blue-50'}`}
                  onClick={() => !notif.read && markAsRead(notif._id)}
                >
                  <span className="material-icons text-blue-500 mr-2">notifications</span>
                  <div>
                    <div className="font-medium">{notif.message}</div>
                    <div className="text-xs text-gray-400">{new Date(notif.createdAt || notif.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      <NotificationListener onNotification={handleNotification} />
    </div>
  );
};

export default NotificationDropdown;
