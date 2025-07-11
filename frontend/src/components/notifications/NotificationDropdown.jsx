import React, { useState, useEffect, useCallback } from "react";
import { FiBell, FiCheckCircle, FiAlertCircle, FiDollarSign, FiFileText, FiTrendingUp, FiUser, FiCreditCard } from "react-icons/fi";
import NotificationListener from "./NotificationListener";
import axios from "../../utils/axios";
import { useNavigate } from "react-router-dom";

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch notifications on mount
  useEffect(() => {
    axios.get("/api/notifications").then((res) => {
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.read).length);
    });
  }, []);

  // Helper to get icon and color by notification type
  const getNotifIcon = (type) => {
    switch (type) {
      case 'expense':
        return <FiDollarSign className="text-red-500 mr-2" />;
      case 'bill':
        return <FiFileText className="text-blue-500 mr-2" />;
      case 'payment':
        return <FiCheckCircle className="text-green-500 mr-2" />;
      case 'advance':
        return <FiTrendingUp className="text-purple-500 mr-2" />;
      case 'project':
        return <FiUser className="text-yellow-500 mr-2" />;
      case 'bank':
        return <FiCreditCard className="text-blue-700 mr-2" />;
      case 'error':
        return <FiAlertCircle className="text-red-700 mr-2" />;
      default:
        return <FiBell className="text-gray-500 mr-2" />;
    }
  };

  // Handle real-time notification
  const handleNotification = useCallback((notif) => {
    setNotifications((prev) => [notif, ...prev]);
    setUnreadCount((count) => count + 1);
    // Show a simple toast for new notifications
    window.alert(`[${notif.type?.toUpperCase() || 'NOTIFICATION'}] ${notif.message}`);
  }, []);

  // Mark notification as read
  const markAsRead = async (id) => {
    await axios.patch(`/api/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((count) => count - 1);
  };

  // Handle notification click: navigate based on type/data
  const handleNotificationClick = (notif) => {
    if (!notif.read && notif._id) markAsRead(notif._id);
    // Navigation logic
    switch (notif.type) {
      case 'bill':
        if (notif.data?.billId) navigate(`/finance/bills/${notif.data.billId}`);
        break;
      case 'vendor':
        if (notif.data?.vendorId) navigate(`/finance/vendors/${notif.data.vendorId}`);
        break;
      case 'employee':
        if (notif.data?.employeeId) navigate(`/finance/employees/${notif.data.employeeId}`);
        break;
      case 'project':
        if (notif.data?.projectId) navigate(`/finance/projects/${notif.data.projectId}`);
        break;
      default:
        // Optionally handle other types
        break;
    }
    setOpen(false);
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
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-xl shadow-2xl bg-white ring-1 ring-black ring-opacity-5 z-50 animate-fade-in">
          <div className="p-2 max-h-96 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="text-gray-500 text-center py-6">No notifications</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id || notif.timestamp}
                  className={`flex items-start gap-3 px-3 py-3 cursor-pointer transition-colors rounded-lg group hover:bg-blue-50 focus:bg-blue-100 active:bg-blue-200 ${notif.read ? 'bg-white' : 'bg-blue-50 font-semibold shadow-sm'}`}
                  onClick={() => handleNotificationClick(notif)}
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter') handleNotificationClick(notif); }}
                >
                  {/* Icon by type */}
                  <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 group-hover:bg-blue-100">
                    {getNotifIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{notif.message}</div>
                    <div className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt || notif.timestamp).toLocaleString()}</div>
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
